# Reference Solution — Support Ticket Intelligence Pipeline

A worked solution to the **Lumen Commerce** take-home. It classifies support tickets
(`category`, `priority`, `needs_human`, `order_id`) with an LLM using structured
tool-calling, scores itself against held-out gold labels, and projects cost at scale.

> This is **one** good answer, not the only one. Read [REPORT.md](REPORT.md) for the
> design rationale and results discussion — that write-up is the part a hiring team
> actually grades.

## Run it

**No API key needed** — the rule-based baseline runs the full pipeline + eval offline:

```bash
python run.py
```

**The real LLM classifier** (needs an Anthropic API key):

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...        # Windows: set ANTHROPIC_API_KEY=...
python run.py --provider anthropic --model claude-haiku-4-5   # recommended tier
python run.py --provider anthropic --limit 20                 # cheap subset while iterating
```

## Files

| File | What it is |
|------|------------|
| `run.py` | Orchestrator: load → classify → evaluate → cost projection |
| `classify.py` | `AnthropicClassifier` (forced tool + strict schema + prompt caching) and the offline `BaselineClassifier` |
| `evaluate.py` | Per-class P/R/F1, accuracy, binary P/R/F1, confusion — pure stdlib |
| `taxonomy.md` | The label definitions (from the assignment) |
| `data/` | `tickets_labeled.jsonl` (60), `tickets_test.jsonl` (140), `labels_test.jsonl` (140 gold) |
| `sample_output.txt` | Captured output of `python run.py` (the baseline), so you can see it works |
| `REPORT.md` | The write-up: architecture, results, error analysis, cost recommendation |

## What it demonstrates

- **Structured output done right** — a forced tool with `strict: true` and `enum`
  fields, so every response is schema-valid by construction. No JSON parsing, no
  "please return JSON" fragility.
- **Honest evaluation** — per-class metrics, not just accuracy, with `needs_human`
  recall called out as the metric that matters most.
- **Cost engineering** — prompt caching on the stable system prompt, and a
  measured-token cost projection across model tiers.
