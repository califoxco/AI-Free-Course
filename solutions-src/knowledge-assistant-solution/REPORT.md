# Knowledge Assistant with Citations — Solution Report

## 1. Architecture

```
docs/*.md ──► ingest: one chunk per markdown section, prefixed with
              "Doc Title - Section" (45 chunks from 15 docs)
                 │
                 ▼
              index: BM25 (and TF-IDF cosine, for comparison)
                 │
question ──► retrieve top-5 chunks
                 │
                 ├── top score < 5.0 ──► refuse (retrieval-confidence gate)
                 ▼
              generate: one Messages call, sources numbered in the prompt,
              FORCED strict tool {answerable, answer, sources[enum of filenames]}
```

RAG, stage by stage, with every stage measurable on its own. The two failure
modes the brief cares about — wrong answers and hallucinated policies — are
handled by different layers, and the eval scores each layer separately.

### Chunking: structure-aware, not fixed-size

These are short, well-structured policy docs with meaningful `##` sections, so the
retrieval unit is *one section of one document* (45 chunks). A section is exactly
one coherent policy statement ("PTO Policy → Carryover"), so there is nothing to
cut mid-thought and no overlap bookkeeping. Each chunk is prefixed with its doc
title + section heading (contextual-retrieval-lite): the sentence "Up to 5 unused
days may be carried over" retrieves far better when the chunk also carries the
tokens "PTO Policy / Carryover".

### Retrieval: BM25, from scratch, and why not embeddings

Two from-scratch retrievers behind one interface: **BM25** (lexical ranking — what
Elasticsearch runs) and **TF-IDF cosine** (sparse vectors + cosine — mechanically
identical to embedding retrieval, just with word-count vectors instead of learned
dense ones). No neural embeddings, for two honest reasons: Anthropic's API has no
embeddings endpoint (keeping this solution single-dependency), and for a 15-doc
corpus with consistent in-house terminology, lexical retrieval is a strong
baseline — a claim the eval then *verifies* rather than assumes. The interface
makes a semantic backend (Voyage, sentence-transformers) a one-class swap if
measurement ever demands it.

### Generation: citations that cannot be hallucinated

The generator is forced to call a strict tool:

```python
"sources": {"type": "array", "items": {"type": "string", "enum": [<the 15 real filenames>]}}
```

The model is structurally incapable of citing a document that doesn't exist —
the same enum trick as the ticket-triage solution's category field. Whether the
citation is *correct* is then measured, not assumed. Refusal is a typed boolean
(`answerable: false`), not a phrase to grep out of prose. The system prompt pins
the behavior that matters in a healthcare company: "a wrong policy answer is
worse than no answer."

### Refusal: defense in depth

1. **Retrieval-confidence gate** — if the best BM25 score < 5.0, refuse without
   calling the model (free, fast, and catches the clearly-out-of-scope).
2. **The generator's own judgment** — for questions that *look* lexically
   in-scope but aren't answerable, the model sees the sources and sets
   `answerable: false`.

## 2. Measured results (offline path, `sample_output.txt`)

### Retrieval — measured before any generation

| Retriever | recall@1 | recall@3 | recall@5 | MRR |
|---|---|---|---|---|
| BM25 | **1.00** | 1.00 | 1.00 | 1.00 |
| TF-IDF cosine | **1.00** | 1.00 | 1.00 | 1.00 |

Perfect retrieval — which deserves suspicion, not celebration: 15 documents with
distinct vocabularies and questions phrased near the docs' own terminology is
easy mode for lexical matching. The honest conclusions are (a) on *this* corpus,
embeddings would add cost and no recall, validating the BM25 choice, and (b) this
says little about 10,000 docs with paraphrased queries, where hybrid lexical +
semantic retrieval earns its keep. The eval harness is what would detect that
shift.

### Refusals and answers

| Metric | Offline floor | Notes |
|---|---|---|
| Traps refused | **3/4** | Gate catches scores 0.0 / 1.4 / 4.9; q24 (5.7) passes the gate |
| Answerable falsely refused | **0/22** | Weakest answerable top score is 5.3, above the 5.0 gate |
| Mean token-F1 (extractive) | 0.44 | Single-sentence extraction vs short gold paraphrases |
| Citation accuracy | **22/22** | Gold doc cited on every attempted answer |

The one offline trap failure is instructive: *"How much does the Enterprise plan
cost per month?"* scores 5.7 against the billing docs — lexically inseparable
from a legitimate billing question. No retrieval-confidence threshold can catch
it without falsely refusing real questions (the answerable minimum is 5.3).
That is precisely the failure class the second layer exists for: the LLM sees
billing chunks that say nothing about Enterprise pricing and refuses. Run
`--provider anthropic` to verify; the offline floor cannot, by construction.

**Tuning caveat, stated plainly:** the 5.0 gate was chosen by inspecting score
distributions *on the eval set* — it did double duty as a dev set. With 26
questions there is no honest split; in production I would tune the gate on a
held-out set and re-measure.

### Where the floor shows its limits (and the LLM earns its cost)

`--ask "How many PTO days do I get and how many carry over?"` retrieves the right
document, then the extractive answerer returns *"Sick days do not carry over."* —
right chunk, wrong sentence, and a two-part question answered by single-sentence
extraction. Retrieval is solved on this corpus; **synthesis is what the generator
is for.** Expect the LLM path to raise token-F1 substantially and to push trap
refusal to 4/4; both claims are checkable by re-running, not asserted.

## 3. What I'd do next with more time

- **Paraphrase stress-test**: rewrite the 22 questions to avoid the docs'
  vocabulary ("money back" for "refund") and measure lexical recall degradation —
  that, not intuition, is the trigger for adding a semantic retriever in hybrid
  with BM25 (merged via reciprocal rank fusion).
- **Claim-level citations**: cite per sentence rather than per answer, and add an
  entailment check (does the cited chunk actually support the claim?) as an
  LLM-judge metric, spot-checked against hand labels before trusting it.
- **A held-out dev split** for the gate threshold, per the caveat above.
- **CI gate**: run this eval on every prompt/chunking change; block deploys if
  trap refusal or citation accuracy regresses — same pattern as the ticket
  solution, because the eval harness *is* the product safety net.
