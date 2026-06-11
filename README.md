# AILearn — From Software Engineer to AI Engineer

**Live: [aihero.online](https://aihero.online)** · free, no signup, no account.

A NeetCode-style interactive course that takes a working software engineer to AI-engineer
competence: a structured roadmap of the best public learning materials (Karpathy, 3Blue1Brown,
StatQuest, Stanford courses, original papers, provider docs) paired with interactive practice —
quizzes with explanations and Python coding challenges that run **entirely in your browser**
(via Pyodide/WebAssembly) against real test suites.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## The curriculum

| # | Module | Lessons | Coding challenges |
|---|--------|---------|-------------------|
| 1 | Foundations: Math & Python for ML | 4 | dot/matmul, numerical gradient, stable softmax |
| 2 | Machine Learning Fundamentals | 4 | linear regression by gradient descent, precision/recall/F1 |
| 3 | Neural Networks & Deep Learning | 4 | a working autograd engine (micrograd-style) |
| 4 | Transformers & LLM Internals | 5 | BPE merges, scaled dot-product attention, temperature/top-k sampling |
| 5 | Working with LLMs: APIs, Prompting & Tool Use | 4 | tool-call dispatcher |
| 6 | RAG & Embeddings | 4 | top-k semantic search, text chunker, a mini RAG pipeline |
| 7 | AI Agents | 4 | a complete agent loop |
| 8 | Fine-tuning & Model Customization | 3 | LoRA forward pass |
| 9 | Evaluation, Safety & Production | 5 | QA eval metrics (exact match, token F1) |

**37 lessons · ~120 quiz questions · 16 coding challenges (93 browser-run tests) · 3 take-home projects.**

Each lesson has three tabs:

- **Learn** — curated videos, papers, articles, and docs with checkboxes to track what you've done.
- **Quiz** — multiple choice with explanations for every answer; pass at ≥70%.
- **Practice** — a CodeMirror editor with starter code, hints, a reference solution, and a test
  suite executed by Pyodide in the browser (NumPy supported). Nothing is uploaded anywhere.

Progress (resources checked, best quiz scores, solved challenges, code drafts) is stored in
`localStorage`. A lesson is complete when its quiz is passed and its challenge (if any) is solved.

## Take-home projects

The **Projects** page (`/projects`) contains three enterprise-style take-home assignments with
downloadable asset packs (served from `public/projects/`):

1. **Knowledge Assistant with Citations** — RAG over 15 internal docs, 26-question eval set with
   unanswerable traps (`knowledge-assistant-rag.zip`)
2. **Support Ticket Intelligence Pipeline** — structured-output classification over 200 tickets
   with held-out gold labels (`ticket-triage-pipeline.zip`)
3. **Self-Serve Analytics Agent** — tool-using agent over a 5-table commerce dataset, 12 gold
   questions computed from the data (`analytics-agent.zip`)

The datasets are synthetic but internally consistent. Regenerate them deterministically with
`node scripts/generate-project-assets.mjs` (output in `assets-src/`), then re-zip into
`public/projects/`.

## Stack

Vite + React + TypeScript · react-router · CodeMirror 6 · Pyodide (loaded from CDN on first use).

Curriculum content lives in `src/data/m*-*.ts` — each module is a typed data file, so adding a
lesson, question, or challenge is a data change, not a code change.

## Deploying

`npm run build` produces a static `dist/`. The repo is configured for Vercel (`vercel.json` handles
SPA routing and zip downloads), but any static host works.

## Contributing & feedback

Suggestions for lessons, corrections, and "this challenge doesn't match real interviews" feedback
are very welcome — open an issue. The curriculum links to external resources (videos, papers, docs)
that remain the property of their respective creators; this project just organizes and adds practice
around them.
