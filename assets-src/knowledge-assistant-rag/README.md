# Take-home: Knowledge Assistant with Citations

You are interviewing for an AI Engineer role at **Meridian Health**, a healthcare API platform.
The support team wastes hours answering internal policy and API questions. Build them an assistant.

## Your task
Build a question-answering service over the 14 documents in `docs/`:

1. **Ingest** the documents (chunking strategy is yours to choose and justify).
2. **Answer questions with citations** — every claim must cite the source document.
3. **Refuse cleanly** when the answer is not in the docs (no hallucinated policies — this is healthcare).
4. **Evaluate yourself** on `eval_set.jsonl` (26 questions; 4 are deliberately not answerable):
   - Retrieval: does the right document appear in your top-k? (recall@k)
   - Answers: grade with exact-match/F1, an LLM judge, or both — your call, justify it.
5. Write a short **report** (~1 page): architecture, chunking choice, eval results, what you would do next with more time.

## Constraints
- Any language, any model API, any vector store (in-memory is fine at this scale).
- Spend roughly 4–8 hours. A small, measured system beats a large, unmeasured one.

## What we look at
Retrieval metrics before vibes · citation faithfulness · refusal behavior on the 4 trap questions ·
code clarity · the report's honesty about limitations.
