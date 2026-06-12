"""
Ticket classifiers.

Two backends:
  * AnthropicClassifier - the real solution. One Messages API call per ticket using
    a *forced tool* for structured output (schema-valid by construction), a cached
    system prompt, and thinking disabled (a classifier doesn't need it). This is the
    pattern from Module 5: native structured output beats "please return JSON".
  * BaselineClassifier - a transparent keyword rule set. No API key, runs offline,
    and gives the eval/cost harness something to execute. It is the floor the LLM
    must beat, not the deliverable.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

CATEGORIES = ["billing", "bug", "how_to", "account_access", "refund_request", "feature_request"]
PRIORITIES = ["urgent", "high", "normal", "low"]

ORDER_RE = re.compile(r"#LM-\d{5}")

# Forced-tool schema. strict=True makes the API guarantee a schema-valid call:
# the enums make an invalid category/priority impossible, so we never parse junk.
CLASSIFY_TOOL = {
    "name": "classify_ticket",
    "description": "Record the structured triage classification for one support ticket.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "category": {
                "type": "string",
                "enum": CATEGORIES,
                "description": "The single best-fitting category.",
            },
            "priority": {
                "type": "string",
                "enum": PRIORITIES,
                "description": (
                    "urgent = revenue-stopping or security-critical; high = blocked work or "
                    "major impact; normal = standard; low = no time pressure."
                ),
            },
            "needs_human": {
                "type": "boolean",
                "description": (
                    "True only when an automated reply could increase risk: explicit legal "
                    "threats, chargebacks, or suspected account compromise."
                ),
            },
            "order_id": {
                "type": "string",
                "description": "The order reference like #LM-12345 if one literally appears, else an empty string.",
            },
        },
        "required": ["category", "priority", "needs_human", "order_id"],
        "additionalProperties": False,
    },
}


@dataclass
class Prediction:
    category: str
    priority: str
    needs_human: bool
    order_id: str | None
    usage: dict  # token usage for cost accounting; empty dict for the baseline


def ticket_text(t: dict) -> str:
    return f'Subject: {t["subject"]}\nChannel: {t.get("channel", "?")}\nBody: {t["body"]}'


def pick_few_shot(labeled: list[dict], k: int = 8) -> list[dict]:
    """Deterministically choose a diverse few-shot set: one per category, then top up
    with needs_human=True examples (the rare, high-stakes class)."""
    chosen: list[dict] = []
    seen: set[str] = set()
    for row in labeled:
        if row["category"] not in seen:
            seen.add(row["category"])
            chosen.append(row)
    extra_human = [r for r in labeled if r["needs_human"] and r not in chosen]
    chosen.extend(extra_human[:2])
    return chosen[:k]


def build_system_prompt(taxonomy_md: str, few_shot: list[dict]) -> str:
    lines = [
        "You are a support-ticket triage system for Lumen Commerce, an e-commerce platform.",
        "Classify each ticket by calling the classify_ticket tool. Follow this taxonomy exactly:",
        "",
        taxonomy_md.strip(),
        "",
        "Guidance:",
        "- Pick the single best category even when a ticket touches several concerns.",
        "- needs_human is reserved for tickets where an automated reply could make things worse:",
        "  explicit legal threats, chargebacks already initiated, or suspected account compromise.",
        "- Set order_id only if a #LM-##### reference literally appears; otherwise empty string.",
        "",
        "Worked examples:",
    ]
    for ex in few_shot:
        lines.append(
            f'- Subject: "{ex["subject"]}"\n'
            f'  Body: "{ex["body"][:200]}"\n'
            f'  -> category={ex["category"]}, priority={ex["priority"]}, '
            f'needs_human={str(ex["needs_human"]).lower()}, order_id="{ex["order_id"] or ""}"'
        )
    return "\n".join(lines)


class AnthropicClassifier:
    def __init__(self, system_prompt: str, model: str = "claude-opus-4-8"):
        import anthropic

        self.client = anthropic.Anthropic()
        self.model = model
        # cache_control on the (stable) system prompt: it is byte-identical across all
        # tickets, so every call after the first reads it at ~0.1x input price.
        self.system = [
            {"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}
        ]

    def classify(self, t: dict) -> Prediction:
        resp = self.client.messages.create(
            model=self.model,
            max_tokens=300,
            system=self.system,
            tools=[CLASSIFY_TOOL],
            tool_choice={"type": "tool", "name": "classify_ticket"},
            thinking={"type": "disabled"},  # a forced-tool classifier needs no reasoning budget
            messages=[{"role": "user", "content": ticket_text(t)}],
        )
        data = next(b.input for b in resp.content if b.type == "tool_use")
        order_id = (data.get("order_id") or "").strip() or None
        u = resp.usage
        usage = {
            "input": u.input_tokens,
            "output": u.output_tokens,
            "cache_read": getattr(u, "cache_read_input_tokens", 0) or 0,
            "cache_write": getattr(u, "cache_creation_input_tokens", 0) or 0,
        }
        return Prediction(data["category"], data["priority"], bool(data["needs_human"]), order_id, usage)


class BaselineClassifier:
    """Keyword rules. The floor, and what lets the pipeline run with no API key."""

    def __init__(self, *_args, **_kwargs):
        pass

    def classify(self, t: dict) -> Prediction:
        text = f'{t["subject"]} {t["body"]}'.lower()

        def has(*kw: str) -> bool:
            return any(k in text for k in kw)

        m = ORDER_RE.search(f'{t["subject"]} {t["body"]}')
        order_id = m.group(0) if m else None

        needs_human = has(
            "chargeback", "lawyer", "legal", "hacked", "compromis", "did not request",
            "didn't request", "unauthorized", "fraud", "lock the account",
        )

        if has("refund", "money back", "reimburse", "return the duplicate"):
            category = "refund_request"
        elif has("charged", "invoice", "billing", "plan", "subscription", "discount", "vat", "annual"):
            category = "billing"
        elif has("2fa", "log in", "login", "locked out", "password", "staff account",
                 "transfer", "ownership", "permission", "hacked", "account was"):
            category = "account_access"
        elif has("feature", "would love", "roadmap", "request:", "dark mode",
                 "ability to", "native ", "endpoint for"):
            category = "feature_request"
        elif has("err_", "failed", "is down", "down -", "broken", "not loading",
                 "wrong", "stuck", "bug", "timeout", "3x"):
            category = "bug"
        elif has("how do i", "how to", "guide", "set up", "setup", "migrat",
                 "connect", "configure", "where do"):
            category = "how_to"
        else:
            category = "how_to"

        if needs_human or has("urgent", "losing sales", "is down", "immediately", "asap"):
            priority = "urgent"
        elif has("blocked", "can't launch", "cannot launch", "major", "high priority"):
            priority = "high"
        elif has("no rush", "small one", "whenever", "low priority", "not urgent"):
            priority = "low"
        else:
            priority = "normal"

        return Prediction(category, priority, needs_human, order_id, {})
