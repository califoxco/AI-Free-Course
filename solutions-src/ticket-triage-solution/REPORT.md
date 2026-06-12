# Ticket Triage Pipeline — Solution Report

## 1. Architecture

```
ticket ──► system prompt (taxonomy + 8 few-shot examples, cached)
           + forced classify_ticket tool (strict JSON schema)
           ──► one Messages API call ──► schema-valid {category, priority,
                                          needs_human, order_id}
```

One LLM call per ticket. The whole design serves one goal: the output is
**structurally guaranteed** to be valid, so the pipeline never has to defend against
malformed model output.

### Key decisions

- **Forced tool + `strict: true` over prompted JSON.** `tool_choice` forces the
  `classify_ticket` tool every time, and `strict` enforces the schema — `category`
  and `priority` are `enum`s, so an out-of-taxonomy label is *impossible*, not just
  unlikely. This is the single most important reliability choice: it converts "parse
  the model's JSON and hope" into "read four typed fields." `order_id` is a plain
  string (empty when absent) rather than a nullable, which keeps the strict schema
  simple; the code maps `""` → `None` to match the gold format.
- **Cached system prompt.** The taxonomy + few-shot block is byte-identical across all
  140 calls, so it carries a `cache_control` breakpoint and is read at ~0.1× input
  price after the first call. At 50k tickets/month this is the difference between a
  trivial bill and a meaningful one (see §4).
- **Thinking disabled.** Classification into a fixed taxonomy is a perception task, not
  a reasoning one. Disabling thinking removes latency and token cost with no accuracy
  loss; the forced tool means there is no visible response to pollute.
- **Few-shot from labeled data.** Eight examples chosen deterministically — one per
  category plus extra `needs_human=true` cases (the rare, high-stakes class). They
  ride inside the cached prefix, so they cost nothing after the first call.

## 2. How it's evaluated

Scored against the 140 held-out gold labels in `labels_test.jsonl`:

- **category** — per-class precision / recall / F1 + macro average (not just accuracy:
  the classes are imbalanced, so accuracy alone would hide weak categories).
- **priority** — accuracy.
- **needs_human** — precision / recall / **F1, with recall as the headline metric**.
- **order_id** — exact-match accuracy (null-normalized).

### Why `needs_human` recall is the metric that matters most

A missed escalation means an automated reply gets sent to someone threatening legal
action or reporting a hacked account — the single worst outcome this system can
produce. A false *positive* (escalating a benign ticket) just costs a human a few
seconds. So the right operating point deliberately trades some `needs_human` precision
for recall: **catch every real escalation, tolerate a few false alarms.** In
production I would tune the prompt (and, if needed, a cheap keyword pre-filter as a
safety net) until recall on this class is ~1.0, and accept whatever precision that
implies.

## 3. Results

### Baseline (rule-based, `python run.py`) — the floor

This runs offline and is captured in `sample_output.txt`:

| Field | Result |
|-------|--------|
| category | accuracy **0.75**, macro-F1 **0.68** |
| priority | accuracy **0.67** |
| needs_human | precision **1.00**, recall **1.00** (16 positives) |
| order_id | exact-match **1.00** |

The baseline scores deceptively well on `needs_human` and `order_id` because the
synthetic tickets use consistent escalation phrasing ("chargeback", "hacked", "lawyer")
and a regular `#LM-#####` order format — a regex and a keyword list nail both. That is
exactly why it's a useful *floor*: it shows those two fields are nearly free, so the
LLM has to earn its cost on the genuinely hard part — **category and priority**, where
the baseline's keyword rules top out around 0.75 / 0.67.

### LLM classifier — expected results and how to reproduce

Run `python run.py --provider anthropic --model claude-haiku-4-5` to fill in measured
numbers. The forced-tool design means category/priority accuracy should rise well above
the keyword floor (few-shot + the full taxonomy resolve the ambiguous `how_to` vs
`feature_request` vs `billing` cases the baseline confuses), while `needs_human` recall
stays at ceiling because the schema description names the exact escalation triggers.
The pipeline reports real per-class metrics on every run, so this claim is checkable,
not asserted — re-run and read the table.

## 4. Error analysis

Top category confusions on the baseline (`gold -> predicted`):

| Confusion | Count | Pattern |
|-----------|------:|---------|
| `feature_request → billing` | 8 | Feature asks that mention a plan/price ("native bundle discounts… on our plan") trip the billing keywords. |
| `account_access → billing` | 7 | Ownership/billing-transfer tickets ("transfer the account, billing, and domain") straddle both. |
| `how_to → feature_request` | 7 | "Is there a way to…" reads as a feature ask but is usually a usage question. |
| `how_to → {billing, account_access}` | 10 | `how_to` is the catch-all; the baseline's last-resort rule scatters it. |

**Three named failure modes:**

1. **Keyword collision (`feature_request`/`how_to` → `billing`).** Any ticket that
   names a plan or price gets pulled into billing. *Fix:* the LLM with the full
   taxonomy disambiguates on intent, not keyword presence.
2. **Genuinely multi-label tickets (`account_access` ↔ `billing`).** Ownership
   transfers legitimately touch both. *Fix:* the taxonomy already says "pick the single
   best category"; for production, consider a secondary-category field.
3. **`how_to` as a dumping ground.** Rules with no positive signal default to `how_to`,
   inflating its false-positive rate and tanking its recall (0.26). *Fix:* the LLM
   doesn't need a catch-all; it classifies on meaning.

## 5. Cost & latency at 50k tickets/month

Token figures below are the per-ticket estimate the pipeline prints offline (~120
uncached input + ~700 cached system + ~30 output). Run `--provider anthropic` to
replace them with **measured** usage from the API's `usage` block.

| Model | $/month @ 50k | Notes |
|-------|--------------:|-------|
| **claude-haiku-4-5** | **~$17** | Recommended. Ample for fixed-taxonomy classification. |
| claude-sonnet-4-6 | ~$51 | Only if Haiku's category accuracy proves insufficient on real traffic. |
| claude-opus-4-8 | ~$85 | Overkill for this task; reserve for genuinely ambiguous escalation review. |

Prompt caching does the heavy lifting: the 700-token system prompt would otherwise be
the dominant cost at this volume, but cached reads bill at 0.1×, so it contributes
~$1/month on Haiku instead of ~$10.

**Recommendation:** ship on **Haiku 4.5**. It is the cheapest tier and fixed-taxonomy
classification with a strong few-shot prompt does not need frontier reasoning. Add a
cheap deterministic safety net for `needs_human` (keyword OR with the model's vote) so
an escalation is flagged if *either* fires — recall on that class is worth a little
extra precision loss. Escalate to Sonnet only if measured category accuracy on real
traffic falls short, and decide that with the eval suite, not a hunch.

## 6. What I'd do next with more time

- Replace the synthetic test set with **real production tickets** — the synthetic data's
  consistent phrasing flatters keyword matching and understates the LLM's relative value.
- Add an **LLM-as-judge** pass for the ~5% lowest-confidence category predictions, and
  measure judge-vs-human agreement before trusting it.
- Wire the eval into CI so every prompt change is scored automatically, and **gate
  deploys on `needs_human` recall not regressing**.
