# Take-home: Support Ticket Intelligence Pipeline

You are interviewing at **Lumen Commerce**, an e-commerce platform handling ~50,000 support
tickets/month. Build the LLM pipeline that triages them.

## Your task
For every ticket, produce a **schema-valid JSON** object: `category`, `priority`,
`needs_human`, `order_id` (see `taxonomy.md`).

1. Build the pipeline using **structured outputs / tool calling** — raw "please output JSON" prompting will be discussed in review.
2. Use `tickets_labeled.jsonl` (60 tickets) to design prompts / few-shot examples.
3. Run on `tickets_test.jsonl` (140 tickets) and score yourself against `labels_test.jsonl`:
   per-class precision/recall/F1 for category, accuracy for priority, and — most importantly —
   **recall on needs_human=true** (missing one of those is the worst failure in this system; argue your trade-off).
4. Produce an **error analysis**: the confusion matrix and 3 concrete failure patterns with example tickets.
5. Produce a **cost & latency estimate** at 50k tickets/month for two model tiers, and a recommendation.

## Constraints
- Any provider. Budget your own API spend — the test set is deliberately small enough to iterate cheaply.
- Spend roughly 4–8 hours.

## What we look at
Schema-enforced outputs · honest metrics with per-class breakdown · needs_human recall prioritized and justified ·
error analysis that names patterns (not "model was wrong sometimes") · cost math that would survive a CFO.
