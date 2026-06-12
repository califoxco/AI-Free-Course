# Reference Solution — Knowledge Assistant with Citations (RAG)

A worked solution to the **Meridian Health** take-home: a retrieval-augmented
question-answering system over 15 internal documents, with per-answer citations,
refusal on out-of-scope questions, and a measured evaluation against the
26-question gold set.

> One good answer, not the only one. [REPORT.md](REPORT.md) carries the design
> rationale and results — the part a hiring team actually grades.

## Run it

**No API key needed** — BM25 retrieval + an extractive answerer run the full
pipeline and eval offline:

```bash
python run.py
```

**The real RAG system** (Claude generates cited answers from the retrieved chunks):

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...        # Windows: set ANTHROPIC_API_KEY=...
python run.py --provider anthropic
python run.py --provider anthropic --model claude-haiku-4-5
```

**Ask it anything** (works offline too):

```bash
python run.py --ask "How many PTO days do I get?"
python run.py --ask "What is the parental leave policy?"   # -> refuses, out of scope
```

## Files

| File | What it is |
|------|------------|
| `ingest.py` | Structure-aware chunking (one chunk per markdown section, heading-prefixed) + shared tokenizer |
| `retrieve.py` | Two from-scratch retrievers: BM25 and TF-IDF cosine, same interface |
| `answer.py` | `AnthropicAnswerer` (forced strict tool; citations are an enum of real filenames) and the offline `ExtractiveAnswerer` |
| `run.py` | Orchestrator: retrieval eval (recall@k, MRR) -> answer eval (refusals, token-F1, citation accuracy) |
| `data/` | The 15 docs + `eval_set.jsonl` (26 questions, 4 unanswerable traps) |
| `sample_output.txt` | Captured offline run, so you can see it works |
| `REPORT.md` | Architecture, chunking justification, measured results, error analysis, limitations |

## What it demonstrates

- **The full RAG pipeline** — ingest → chunk → index → retrieve → augment → generate,
  with each stage measurable on its own.
- **Retrieval evaluated before generation** — recall@1/3/5 and MRR per retriever,
  so a bad answer can be attributed to the right stage.
- **Citations that can't hallucinate** — the answer tool's `sources` field is a
  strict enum of the 15 real filenames.
- **Refusal as a first-class behavior** — a retrieval-confidence gate plus the
  generator's own `answerable` flag, with both layers measured against the traps.
