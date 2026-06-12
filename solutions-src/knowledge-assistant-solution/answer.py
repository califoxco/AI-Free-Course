"""
Answerers - the G in RAG.

  * AnthropicAnswerer - the real solution. One Messages API call per question with
    the retrieved chunks as numbered sources and a FORCED, STRICT tool whose
    `sources` field is an enum of the 15 real filenames. The model is structurally
    incapable of citing a document that doesn't exist, and refusal is a typed
    boolean (`answerable: false`), not a phrase we have to grep out of prose.
  * ExtractiveAnswerer - offline floor: returns the best-overlapping sentence from
    the top retrieved chunk. No API key; lets the full eval pipeline run anywhere.
"""
from __future__ import annotations

from dataclasses import dataclass

from ingest import tokenize
from retrieve import Hit

REFUSAL_TEXT = "NOT_ANSWERABLE - the provided documents do not cover this."


@dataclass
class Answer:
    answerable: bool
    text: str
    sources: list[str]  # filenames cited
    usage: dict         # token usage; empty for the offline answerer


def _sources_block(hits: list[Hit]) -> str:
    lines = []
    for i, h in enumerate(hits, 1):
        lines.append(f"[{i}] ({h.chunk.source})\n{h.chunk.text}")
    return "\n\n".join(lines)


class AnthropicAnswerer:
    def __init__(self, all_filenames: list[str], model: str = "claude-opus-4-8"):
        import anthropic

        self.client = anthropic.Anthropic()
        self.model = model
        # `sources` is an enum of the actual corpus filenames -> hallucinated
        # citations are impossible by construction, same trick as the
        # ticket-triage solution's category enum.
        self.tool = {
            "name": "submit_answer",
            "description": "Submit the final grounded answer for the user's question.",
            "strict": True,
            "input_schema": {
                "type": "object",
                "properties": {
                    "answerable": {
                        "type": "boolean",
                        "description": "True only if the sources explicitly contain the answer.",
                    },
                    "answer": {
                        "type": "string",
                        "description": "1-3 sentence answer using ONLY the sources; empty string if not answerable.",
                    },
                    "sources": {
                        "type": "array",
                        "items": {"type": "string", "enum": all_filenames},
                        "description": "Filenames that directly support the answer; empty if not answerable.",
                    },
                },
                "required": ["answerable", "answer", "sources"],
                "additionalProperties": False,
            },
        }
        # cache_control is harmless here and pays off if the prompt grows past the
        # model's minimum cacheable prefix; with this small instruction block it
        # may simply not engage. The retrieved sources vary per question, so they
        # belong after the stable prefix regardless.
        self.system = [
            {
                "type": "text",
                "text": (
                    "You are an internal knowledge assistant for Meridian Health. Answer "
                    "questions using ONLY the numbered sources provided in the message. "
                    "Rules: (1) If the sources do not explicitly contain the answer, set "
                    "answerable=false - never answer from general knowledge; a wrong policy "
                    "answer is worse than no answer. (2) Quote concrete values (numbers, "
                    "durations, limits) exactly as written. (3) Cite every source filename "
                    "you actually used."
                ),
                "cache_control": {"type": "ephemeral"},
            }
        ]

    def answer(self, question: str, hits: list[Hit]) -> Answer:
        user = f"Sources:\n\n{_sources_block(hits)}\n\nQuestion: {question}"
        resp = self.client.messages.create(
            model=self.model,
            max_tokens=500,
            system=self.system,
            tools=[self.tool],
            tool_choice={"type": "tool", "name": "submit_answer"},
            thinking={"type": "disabled"},
            messages=[{"role": "user", "content": user}],
        )
        data = next(b.input for b in resp.content if b.type == "tool_use")
        u = resp.usage
        usage = {
            "input": u.input_tokens,
            "output": u.output_tokens,
            "cache_read": getattr(u, "cache_read_input_tokens", 0) or 0,
        }
        if not data["answerable"]:
            return Answer(False, REFUSAL_TEXT, [], usage)
        return Answer(True, data["answer"].strip(), list(dict.fromkeys(data["sources"])), usage)


class ExtractiveAnswerer:
    """Offline floor: the sentence in the top chunk with the most query-token
    overlap, cited to that chunk's document. No model, no key, no nuance."""

    def answer(self, question: str, hits: list[Hit]) -> Answer:
        top = hits[0]
        import re

        sentences = [s for s in re.split(r"(?<=[.!?])\s+|\n+", top.chunk.text) if len(s) > 20]
        if not sentences:
            sentences = [top.chunk.text]
        q = set(tokenize(question))
        best = max(sentences, key=lambda s: len(q & set(tokenize(s))))
        return Answer(True, best.strip("-# ").strip(), [top.chunk.source], {})
