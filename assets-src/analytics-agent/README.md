# Take-home: Self-Serve Analytics Agent

You are interviewing at **Brightcart**, a DTC retailer. The ops team asks the data team the same
revenue questions every week. Build an agent that answers them directly from the data.

## Your task
Build a **tool-using LLM agent** that answers natural-language business questions over the five
CSVs (load them into SQLite, DuckDB, or pandas — your choice).

1. The agent must use **tools** (e.g. `run_sql(query)` or equivalent) — the model plans, your code executes. No hardcoded answers, no stuffing the CSVs into the prompt.
2. It must handle **multi-step questions** (question 12 in `eval_questions.json` requires genuine multi-hop reasoning).
3. Every answer must show its **work**: the queries/tool calls executed, visible in a trace.
4. It must **decline** questions the data cannot answer (e.g. "what will revenue be next year?") instead of guessing.
5. Score yourself against the 12 questions in `eval_questions.json` (gold answers computed directly from this dataset) and report accuracy.

## Constraints
- Any provider, any agent style (raw loop encouraged — you built one in the course).
- An iteration cap and basic SQL-injection hygiene on the tool are expected.
- Spend roughly 4–8 hours.

## What we look at
Agent loop design (transcript management, error feedback, iteration cap) · tool design and safety ·
trace readability · honest accuracy reporting against the gold set · refusal on unanswerable questions.
