export interface TakeHomeProject {
  id: string;
  title: string;
  company: string;
  scenario: string;
  skills: string[];
  timeEstimate: string;
  difficulty: 'Medium' | 'Hard';
  tasks: string[];
  rubric: string[];
  assets: { file: string; description: string }[];
  downloadUrl: string;
  sizeKb: number;
}

export const projects: TakeHomeProject[] = [
  {
    id: 'knowledge-assistant',
    title: 'Knowledge Assistant with Citations',
    company: 'Meridian Health (healthcare API platform)',
    scenario:
      'The support team wastes hours answering internal policy and API questions. Build a question-answering assistant over 15 real-style internal documents — HR policies, security runbooks, API docs, SLAs. Because this is healthcare, a hallucinated policy is worse than no answer: every claim must cite its source, and out-of-scope questions must be refused.',
    skills: ['RAG', 'Chunking', 'Retrieval evals', 'Citations', 'Refusal design'],
    timeEstimate: '4–8 hours',
    difficulty: 'Medium',
    tasks: [
      'Ingest the 15 docs with a chunking strategy you choose and justify',
      'Answer questions with per-claim citations to source documents',
      'Refuse cleanly on the 4 deliberately unanswerable trap questions',
      'Measure retrieval (recall@k) and answer quality on the 26-question eval set',
      'Write a ~1-page report: architecture, eval results, next steps',
    ],
    rubric: [
      'Retrieval metrics measured before any prompt tuning — numbers over vibes',
      'Citations that actually point at the right document',
      'Refusal behavior on the trap questions (the #1 thing reviewers check)',
      'A report that is honest about limitations',
    ],
    assets: [
      { file: 'docs/ (15 markdown files)', description: 'Internal policies, runbooks, and API documentation with specific, checkable facts' },
      { file: 'eval_set.jsonl', description: '26 questions with gold answers and source docs — 4 are unanswerable on purpose' },
      { file: 'README.md', description: 'The full brief, exactly as a hiring team would send it' },
    ],
    downloadUrl: '/projects/knowledge-assistant-rag.zip',
    sizeKb: 11,
  },
  {
    id: 'ticket-triage',
    title: 'Support Ticket Intelligence Pipeline',
    company: 'Lumen Commerce (e-commerce platform, ~50k tickets/month)',
    scenario:
      'Every inbound support ticket needs a category, a priority, a needs-human flag, and any order ID extracted — at 50,000 tickets a month, by a pipeline, not a person. You get 60 labeled tickets to design with and 140 held-out tickets to score yourself on. The hard part is not the happy path: it is per-class metrics, the cost math, and never letting a legal threat get an automated reply.',
    skills: ['Structured output', 'Classification', 'Per-class F1', 'Error analysis', 'Cost engineering'],
    timeEstimate: '4–8 hours',
    difficulty: 'Medium',
    tasks: [
      'Build the pipeline with schema-enforced structured outputs (not "please return JSON")',
      'Classify category, priority, needs_human; extract order_id — taxonomy provided',
      'Score against held-out labels: per-class P/R/F1, prioritizing needs_human recall',
      'Write an error analysis: confusion matrix + 3 named failure patterns',
      'Estimate cost and latency at 50k tickets/month for two model tiers, and recommend one',
    ],
    rubric: [
      'Schema-valid outputs on 100% of tickets',
      'needs_human recall treated as the metric that matters most — and the trade-off argued',
      'Error analysis that names patterns, not "the model was sometimes wrong"',
      'Cost math that would survive a CFO review',
    ],
    assets: [
      { file: 'tickets_labeled.jsonl', description: '60 labeled tickets for prompt design and few-shot examples' },
      { file: 'tickets_test.jsonl + labels_test.jsonl', description: '140 held-out tickets with gold labels for self-scoring' },
      { file: 'taxonomy.md + README.md', description: 'Label definitions and the full brief' },
    ],
    downloadUrl: '/projects/ticket-triage-pipeline.zip',
    sizeKb: 12,
  },
  {
    id: 'analytics-agent',
    title: 'Self-Serve Analytics Agent',
    company: 'Brightcart (DTC retailer)',
    scenario:
      'The ops team asks the data team the same revenue questions every week. Build a tool-using agent that answers natural-language business questions directly against the company data: 250 customers, 1,500 orders, 3,700 line items, refunds. The model plans, your tools execute — and every answer must show the queries it ran. Twelve eval questions with gold answers (computed from this exact dataset) let you score yourself; one of them requires genuine multi-step reasoning.',
    skills: ['Agents', 'Tool design', 'Text-to-SQL', 'Traces', 'Guardrails'],
    timeEstimate: '6–10 hours',
    difficulty: 'Hard',
    tasks: [
      'Load the 5 CSVs into SQLite/DuckDB/pandas and expose them via tools (e.g. run_sql)',
      'Build the agent loop: plan → query → observe → answer, with an iteration cap',
      'Show a readable trace of every tool call behind each answer',
      'Decline questions the data cannot answer instead of guessing',
      'Score yourself on the 12 gold questions and report accuracy honestly',
    ],
    rubric: [
      'Loop fundamentals: transcript management, error feedback to the model, iteration cap',
      'Tool safety: read-only queries, injection hygiene',
      'Question 12 (refund allocation) — the multi-hop separator between juniors and seniors',
      'Refusals on unanswerable questions rather than confident fabrication',
    ],
    assets: [
      { file: '5 CSVs (customers, products, orders, order_items, refunds)', description: 'A coherent relational dataset: 1,500 orders across 2024–2025' },
      { file: 'eval_questions.json', description: '12 business questions with gold answers computed from this exact data' },
      { file: 'data_dictionary.md + README.md', description: 'Schema documentation and the full brief' },
    ],
    downloadUrl: '/projects/analytics-agent.zip',
    sizeKb: 45,
  },
];
