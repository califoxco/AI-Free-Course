/**
 * Generates the downloadable asset packs for the three take-home projects.
 * Deterministic (seeded PRNG) so re-running produces identical data.
 *
 * Usage: node scripts/generate-project-assets.mjs
 * Output: assets-src/<project>/ (inspectable files) — zip step is done separately.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'assets-src');

// ---------- seeded PRNG ----------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260610);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1)); // inclusive
const round2 = (x) => Math.round(x * 100) / 100;

function writeFile(dir, name, content) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), content, 'utf8');
}

rmSync(OUT, { recursive: true, force: true });

/* ============================================================
   PROJECT 1 — Knowledge Assistant with Citations (RAG)
   ============================================================ */
const P1 = join(OUT, 'knowledge-assistant-rag');
const DOCS = {
  'pto-policy.md': `# Paid Time Off (PTO) Policy

Meridian Health provides all full-time employees with **20 days of PTO** and **8 sick days** per calendar year. PTO accrues at a rate of 1.67 days per month of employment.

## Carryover
Up to **5 unused PTO days** may be carried into the next calendar year. Carryover days must be used by March 31 or they are forfeited. Sick days do not carry over.

## Requesting time off
Submit requests in Workday. Requests for **more than 3 consecutive days** require at least **2 weeks notice** and manager approval. Requests of 3 days or fewer require 48 hours notice.

## Negative balances
Employees may borrow up to 3 days against future accrual with manager approval. Borrowed days are deducted from the final paycheck if employment ends before they accrue.`,

  'remote-work-policy.md': `# Remote & Hybrid Work Policy

Meridian Health operates on a hybrid schedule: employees work from the office **Tuesday through Thursday** (3 days) and may work remotely Monday and Friday.

## Full-remote arrangements
Permanent full-remote status requires **VP-level approval** and is reviewed annually. Engineers on the on-call rotation must be within 2 time zones of US Eastern.

## Stipends
- One-time **$500 home office stipend** for all new hires.
- Coworking space reimbursement up to **$200 per month** for approved full-remote employees, submitted through Expensify.

Equipment (laptop, monitor) is provided by IT and remains company property.`,

  'expense-policy.md': `# Travel & Expense Policy

## Meals
Meal expenses are reimbursable up to **$75 per day** for domestic travel and **$110 per day** for international travel. Alcohol is not reimbursable.

## Flights and hotels
Book economy class for flights under 6 hours; premium economy is allowed for longer flights. Hotels should not exceed $250/night domestic or $350/night international without prior approval.

## Receipts and submission
Itemized receipts are required for any expense **over $25**. All expenses must be submitted in **Expensify within 30 days** of the expense date. Any single expense over **$500** requires manager pre-approval.

Mileage is reimbursed at the current IRS rate. Rideshare for commuting is not reimbursable.`,

  'security-incident-runbook.md': `# Security Incident Response Runbook

## Reporting
Suspected security incidents must be reported to **security@meridianhealth.example** within **1 hour** of discovery. Do not discuss incidents in public Slack channels.

## Severity levels
- **SEV1** — confirmed exposure of customer data (PHI/PII), production credential compromise, or active attacker. Page security on-call via PagerDuty immediately.
- **SEV2** — vulnerability with plausible exploitation path, malware on a corporate device.
- **SEV3** — policy violations, phishing reports with no compromise.
- **SEV4** — informational findings.

## SEV1 obligations
For incidents involving PHI, customer notification must occur within **24 hours** per our HIPAA Business Associate Agreements. Legal and the CISO must approve all external communications.

## Postmortems
A written postmortem is due within **5 business days** of incident resolution for SEV1 and SEV2 incidents.`,

  'access-control-policy.md': `# Access Control Policy

Access follows the principle of **least privilege**. Access to production systems requires:

1. Hardware-key MFA enrolled with IT.
2. An approved access request ticket from your manager.
3. Completion of the annual security training.

## Reviews and expiry
- Access reviews run **quarterly**; managers must recertify each report's access.
- **Contractor accounts expire automatically after 90 days** and require sponsor renewal.
- Access is revoked within 4 hours of employment termination.

Shared accounts are prohibited. Service accounts must be owned by a team, not an individual.`,

  'api-authentication.md': `# API Authentication Guide

The Meridian API uses **OAuth 2.0 client credentials** flow.

## Tokens
- Access tokens are valid for **60 minutes**.
- Request new tokens from \`https://auth.meridianapi.example/oauth/token\`.
- Tokens are JWTs signed with RS256; validate the \`aud\` claim is \`meridian-api\`.

## API keys
Client secrets must be rotated **every 90 days**. Secrets are shown once at creation; store them in your secret manager, never in source control.

## Environments
- Sandbox: \`https://sandbox.meridianapi.example/v2\`
- Production: \`https://api.meridianapi.example/v2\`

Sandbox data resets nightly at 04:00 UTC.`,

  'webhooks-guide.md': `# Webhooks Guide

Meridian sends webhooks for events such as \`patient.updated\`, \`claim.submitted\`, \`claim.adjudicated\`, and \`appointment.cancelled\`.

## Verifying signatures
Every delivery includes an \`X-Meridian-Signature\` header: an **HMAC-SHA256** of the raw request body using your webhook signing secret. Reject any request whose signature does not match.

## Delivery and retries
Your endpoint must respond with a 2xx status within **10 seconds**. Failed deliveries are retried **5 times with exponential backoff** over a maximum of 24 hours, after which the event is dropped and visible in the dashboard's dead-letter view.

Webhook endpoints must use HTTPS. Payloads are at-least-once delivery; deduplicate using the \`event_id\` field.`,

  'rate-limits.md': `# API Rate Limits

| Plan | Sustained limit | Burst |
|------|----------------|-------|
| Standard | **100 requests/min** | 2x for up to 30 seconds |
| Enterprise | **1,000 requests/min** | 2x for up to 30 seconds |

When you exceed a limit the API returns **HTTP 429** with a \`Retry-After\` header (seconds). Implement exponential backoff with jitter; do not retry immediately.

Rate limits are applied per client ID. Webhook deliveries and sandbox traffic do not count toward production limits. To request a higher limit, contact your account manager with expected peak QPS.`,

  'sla-policy.md': `# Service Level Agreement (SLA)

## Uptime
Meridian commits to **99.9% monthly uptime** for the production API, excluding scheduled maintenance (announced 72 hours in advance).

## Support response times
- **P1** (production down, no workaround): first response within **30 minutes**, 24/7.
- **P2** (major feature degraded): first response within **4 business hours**.
- **P3** (minor issue or question): first response within **2 business days**.

## Service credits
If monthly uptime falls below target: 99.0–99.9% → **5%** credit; 95.0–98.99% → **10%** credit; below 95% → **25%** credit. Credits are applied to the next invoice and must be claimed within 30 days of the affected month.`,

  'escalation-matrix.md': `# Support Escalation Matrix

## L1 → L2
Escalate to L2 when a ticket reaches **2 unresolved exchanges**, or immediately for anything triaged P2 or higher.

## L2 → Engineering
Engineering escalations require: reproduction steps, affected account IDs, timestamps, and relevant request IDs. File via the \`#support-eng\` escalation form. Tickets without repro steps will be bounced back.

## Executive escalation
Reserved for enterprise accounts with **>$100k ARR**. Route through the account's CSM, who engages the VP of Customer Success. Never promise specific engineering timelines to customers.`,

  'billing-refund-policy.md': `# Billing & Refund Policy

## Monthly plans
Monthly subscriptions are **not refundable**, including partial months after cancellation. Service continues until the end of the paid period.

## Annual plans
Annual subscriptions may be refunded **pro-rata within the first 60 days**. After 60 days, no refunds; the plan converts to monthly at renewal if not renewed.

## SLA credits
SLA credits (see SLA policy) are applied **to the next invoice** — they are never paid out as cash refunds.

## Disputed charges
Customers disputing a charge should be routed to billing@meridianhealth.example before initiating a chargeback. Chargebacks freeze API access automatically until resolved.`,

  'deployment-runbook.md': `# Production Deployment Runbook

## Deploy windows
Deploys are allowed **Monday–Thursday, 10:00–16:00 US Eastern**. No production deploys on Fridays. A full deploy freeze applies during the **last week of each quarter**.

## Procedure
1. Merge to \`main\` triggers the pipeline (build, tests, staging deploy).
2. Production rollout starts as a **canary to 5% of traffic for 30 minutes**.
3. Auto-promote if error rate and p99 latency stay within thresholds.

## Rollback
\`meridian deploy rollback <service>\` reverts to the previous release in under 5 minutes. Database migrations require a Change Advisory Board (CAB) ticket and must be backward-compatible one release back.`,

  'oncall-guide.md': `# On-Call Guide

Rotations are **weekly, handing off Tuesdays at 12:00 ET**, with a primary and a secondary per service.

## Response expectations
- **SEV1 pages: acknowledge within 5 minutes.**
- SEV2 pages: acknowledge within 15 minutes.
- Secondary is paged automatically if primary does not acknowledge in time.

## Compensation
On-call carries a weekly stipend. If you handle **more than 2 hours of overnight pages** (22:00–07:00), you may take a **recovery day** the following week — coordinate with your manager, no formal PTO request needed.`,

  'data-retention-policy.md': `# Data Retention & Deletion Policy

| Data type | Retention |
|-----------|-----------|
| PHI (patient records processed for customers) | **7 years** per HIPAA |
| Application audit logs | **2 years** |
| Database backups | **35 days** rolling |
| Sandbox data | Reset nightly |

## Deletion requests
Customer data-deletion requests are fulfilled within **30 days**. Deletion cascades to backups as backup snapshots age out (max 35 additional days). Legal holds suspend deletion for affected records.`,

  'product-overview.md': `# Meridian Health — Product Overview

Meridian Health provides a claims-processing and patient-data API platform for healthcare software companies. Roughly 240 customers integrate our API to submit insurance claims, check eligibility, and sync patient records.

## Products
- **Claims API** — submit and track insurance claims through adjudication.
- **Eligibility API** — real-time insurance eligibility checks.
- **Patient Sync** — webhook-driven patient record synchronization.

## Compliance
Meridian is HIPAA-compliant and signs Business Associate Agreements (BAAs) with all customers. SOC 2 Type II reports are available under NDA via your account manager.`,
};

const EVAL_SET = [
  { id: 1, question: 'How many PTO days do full-time employees get per year?', answer: '20 days of PTO per calendar year (plus 8 sick days).', source: 'pto-policy.md', answerable: true },
  { id: 2, question: 'How many unused PTO days can I carry over into next year, and when must I use them by?', answer: 'Up to 5 days, which must be used by March 31.', source: 'pto-policy.md', answerable: true },
  { id: 3, question: 'How much notice do I need to give for a week-long vacation?', answer: 'At least 2 weeks notice with manager approval (requests over 3 consecutive days).', source: 'pto-policy.md', answerable: true },
  { id: 4, question: 'Which days are employees expected to be in the office?', answer: 'Tuesday through Thursday.', source: 'remote-work-policy.md', answerable: true },
  { id: 5, question: 'Who has to approve a permanent full-remote arrangement?', answer: 'A VP (VP-level approval, reviewed annually).', source: 'remote-work-policy.md', answerable: true },
  { id: 6, question: 'What is the daily meal reimbursement limit for international travel?', answer: '$110 per day.', source: 'expense-policy.md', answerable: true },
  { id: 7, question: 'Within how many days must expenses be submitted in Expensify?', answer: 'Within 30 days of the expense date.', source: 'expense-policy.md', answerable: true },
  { id: 8, question: 'How quickly must a suspected security incident be reported, and to whom?', answer: 'Within 1 hour, to security@meridianhealth.example.', source: 'security-incident-runbook.md', answerable: true },
  { id: 9, question: 'For a SEV1 incident involving PHI, how fast must customers be notified?', answer: 'Within 24 hours, per the HIPAA Business Associate Agreements.', source: 'security-incident-runbook.md', answerable: true },
  { id: 10, question: 'When do contractor accounts expire?', answer: 'Automatically after 90 days, requiring sponsor renewal.', source: 'access-control-policy.md', answerable: true },
  { id: 11, question: 'How long are API access tokens valid?', answer: '60 minutes.', source: 'api-authentication.md', answerable: true },
  { id: 12, question: 'How often must API client secrets be rotated?', answer: 'Every 90 days.', source: 'api-authentication.md', answerable: true },
  { id: 13, question: 'How do I verify that a webhook actually came from Meridian?', answer: 'Compute an HMAC-SHA256 of the raw body with your signing secret and compare it to the X-Meridian-Signature header.', source: 'webhooks-guide.md', answerable: true },
  { id: 14, question: 'How many times are failed webhook deliveries retried?', answer: '5 times with exponential backoff over a maximum of 24 hours.', source: 'webhooks-guide.md', answerable: true },
  { id: 15, question: 'What is the rate limit on the Standard plan and what happens if I exceed it?', answer: '100 requests/min sustained (2x burst up to 30s); exceeding it returns HTTP 429 with a Retry-After header.', source: 'rate-limits.md', answerable: true },
  { id: 16, question: 'What is the committed monthly uptime for the production API?', answer: '99.9%, excluding scheduled maintenance announced 72 hours in advance.', source: 'sla-policy.md', answerable: true },
  { id: 17, question: 'What is the first-response time for a P1 support ticket?', answer: '30 minutes, 24/7.', source: 'sla-policy.md', answerable: true },
  { id: 18, question: 'A customer wants a refund on their annual plan after 30 days. What applies?', answer: 'Annual plans are refundable pro-rata within the first 60 days, so a pro-rated refund applies.', source: 'billing-refund-policy.md', answerable: true },
  { id: 19, question: 'Are SLA credits paid out in cash?', answer: 'No — they are applied to the next invoice, never paid as cash.', source: 'billing-refund-policy.md', answerable: true },
  { id: 20, question: 'Can I deploy to production on a Friday?', answer: 'No. Deploys are Monday–Thursday 10:00–16:00 ET only, and there is a freeze in the last week of each quarter.', source: 'deployment-runbook.md', answerable: true },
  { id: 21, question: 'How quickly must the on-call engineer acknowledge a SEV1 page?', answer: 'Within 5 minutes (secondary is paged automatically otherwise).', source: 'oncall-guide.md', answerable: true },
  { id: 22, question: 'How long are database backups retained?', answer: '35 days rolling.', source: 'data-retention-policy.md', answerable: true },
  { id: 23, question: 'What is the parental leave policy?', answer: 'NOT_ANSWERABLE — parental leave is not covered in the provided documents.', source: null, answerable: false },
  { id: 24, question: 'How much does the Enterprise plan cost per month?', answer: 'NOT_ANSWERABLE — pricing is not covered in the provided documents.', source: null, answerable: false },
  { id: 25, question: 'How do I configure SSO with Okta?', answer: 'NOT_ANSWERABLE — SSO configuration is not covered in the provided documents.', source: null, answerable: false },
  { id: 26, question: 'Who is the CEO of Meridian Health?', answer: 'NOT_ANSWERABLE — company leadership is not covered in the provided documents.', source: null, answerable: false },
];

for (const [name, content] of Object.entries(DOCS)) writeFile(join(P1, 'docs'), name, content + '\n');
writeFile(P1, 'eval_set.jsonl', EVAL_SET.map((q) => JSON.stringify(q)).join('\n') + '\n');
writeFile(
  P1,
  'README.md',
  `# Take-home: Knowledge Assistant with Citations

You are interviewing for an AI Engineer role at **Meridian Health**, a healthcare API platform.
The support team wastes hours answering internal policy and API questions. Build them an assistant.

## Your task
Build a question-answering service over the 14 documents in \`docs/\`:

1. **Ingest** the documents (chunking strategy is yours to choose and justify).
2. **Answer questions with citations** — every claim must cite the source document.
3. **Refuse cleanly** when the answer is not in the docs (no hallucinated policies — this is healthcare).
4. **Evaluate yourself** on \`eval_set.jsonl\` (26 questions; 4 are deliberately not answerable):
   - Retrieval: does the right document appear in your top-k? (recall@k)
   - Answers: grade with exact-match/F1, an LLM judge, or both — your call, justify it.
5. Write a short **report** (~1 page): architecture, chunking choice, eval results, what you would do next with more time.

## Constraints
- Any language, any model API, any vector store (in-memory is fine at this scale).
- Spend roughly 4–8 hours. A small, measured system beats a large, unmeasured one.

## What we look at
Retrieval metrics before vibes · citation faithfulness · refusal behavior on the 4 trap questions ·
code clarity · the report's honesty about limitations.
`,
);

/* ============================================================
   PROJECT 2 — Support Ticket Intelligence (classification pipeline)
   ============================================================ */
const P2 = join(OUT, 'ticket-triage-pipeline');

const PRODUCTS2 = ['Lumen Checkout', 'Lumen Payments', 'Lumen Analytics', 'Lumen Shipping', 'storefront editor', 'mobile app'];
const ERRORS = ['ERR_PAYMENT_4012', 'ERR_WEBHOOK_TIMEOUT', 'CSV_IMPORT_311', 'AUTH_429', 'SYNC_FAILED_88'];
const NAMES = ['Dana', 'Marcus', 'Priya', 'Tomás', 'Aisha', 'Kenji', 'Olga', 'Sam', 'Renee', 'Dmitri', 'Fatima', 'Jordan'];
const SHOPS = ['glowbeauty.shop', 'peakgearco.com', 'thecandlebarn.com', 'urbanpetsupply.net', 'maplecraftgoods.com', 'fitfuelnutrition.com'];

// Each template: fixed gold labels. Slots: {order} {product} {error} {shop} {days} {amount}
const TICKET_TEMPLATES = [
  // billing
  { cat: 'billing', pri: 'normal', human: false, sub: 'Charged twice this month?', body: "Hi, I'm looking at my statement and I see two charges of ${amount} for my subscription this month. Can you check what's going on? My store is {shop}." },
  { cat: 'billing', pri: 'normal', human: false, sub: 'Invoice needed for accounting', body: 'Hello, our finance team needs a proper invoice (with VAT number) for the last billing cycle for {shop}. Where can I download those?' },
  { cat: 'billing', pri: 'high', human: false, sub: 'Plan upgraded but still on old limits', body: 'We upgraded to the Growth plan {days} days ago but {product} still shows the old plan limits. We are blocked on launching. Order ref {order}.' },
  { cat: 'billing', pri: 'urgent', human: true, sub: 'Initiating chargeback', body: "This is the third time I've been overcharged and support hasn't replied in {days} days. I'm initiating a chargeback with my bank today unless this is resolved. {shop}" },
  { cat: 'billing', pri: 'low', human: false, sub: 'Question about annual discount', body: 'Hey there — if we switch to annual billing do we keep the launch discount we currently have? No rush on this one.' },
  // bug
  { cat: 'bug', pri: 'urgent', human: false, sub: 'Checkout is down — losing sales', body: 'URGENT: customers on {shop} get {error} at payment since about an hour ago. Nothing changed on our side. Every checkout fails. Please escalate immediately.' },
  { cat: 'bug', pri: 'high', human: false, sub: '{product} dashboard shows wrong numbers', body: "Since yesterday {product} is reporting revenue that's about 3x what our bank shows. Last correct day was {days} days ago. Is there a known sync issue? We rely on this for reordering." },
  { cat: 'bug', pri: 'high', human: false, sub: 'Webhooks failing with {error}', body: 'Our integration stopped receiving order webhooks. Logs show {error} on your side. Retry queue seems stuck. Affected store: {shop}, example order {order}.' },
  { cat: 'bug', pri: 'normal', human: false, sub: 'CSV import keeps failing', body: 'Trying to import our product catalog (about 1,200 rows) and it fails at row 400-ish with {error}. The same file worked last month. Happy to share the file.' },
  { cat: 'bug', pri: 'normal', human: false, sub: 'Images not loading in {product}', body: 'Product images in the {product} preview show broken thumbnails since the update {days} days ago. Live site looks fine, only the editor is affected.' },
  // how_to
  { cat: 'how_to', pri: 'low', human: false, sub: 'How do I set up tax zones for the EU?', body: "We're expanding to Germany and France. I can't figure out where VAT settings live in {product}. Is there a guide for EU tax zones?" },
  { cat: 'how_to', pri: 'low', human: false, sub: 'Connecting {product} to Google Sheets', body: 'Is there a native way to export {product} reports to Google Sheets on a schedule, or do I need Zapier? What do you recommend?' },
  { cat: 'how_to', pri: 'normal', human: false, sub: 'Migrating from Shopify — best path?', body: "We're moving {shop} over from Shopify next month. What's the recommended migration path for products, customers, and gift cards? Anything that doesn't transfer?" },
  { cat: 'how_to', pri: 'low', human: false, sub: 'Custom domain setup', body: 'Bought a domain via Namecheap and want it on our store. The DNS instructions in the docs mention an A record but not the IP value. What should it point to?' },
  // account_access
  { cat: 'account_access', pri: 'high', human: false, sub: 'Locked out after enabling 2FA', body: 'I enabled 2FA yesterday, lost my phone today, and the recovery codes were on the phone. Classic. How do I regain access to the {shop} admin? I can verify ownership.' },
  { cat: 'account_access', pri: 'normal', human: false, sub: 'Add a staff account with limited permissions', body: 'I want to add our bookkeeper ({name}) with access to orders and payouts but NOT product editing or settings. Which role does that?' },
  { cat: 'account_access', pri: 'urgent', human: true, sub: 'I think my account was hacked', body: 'I got a password-change email I did not request, and there is a new staff account ({name}) I never created on {shop}. Payout details may have been viewed. Please lock the account NOW and call me.' },
  { cat: 'account_access', pri: 'normal', human: false, sub: 'Transfer store ownership', body: 'I sold {shop} to a new owner and need to transfer the account, billing, and domain to them. What is the process and does the plan transfer too?' },
  // refund_request
  { cat: 'refund_request', pri: 'normal', human: false, sub: 'Refund for unused add-on', body: 'We bought the {product} add-on {days} days ago but never activated it — turns out our plan already includes it. Could we get that ${amount} refunded? Ref {order}.' },
  { cat: 'refund_request', pri: 'normal', human: false, sub: 'Double charge on order {order}', body: 'A customer of ours was charged twice for order {order} (${amount} each). We refunded one charge from our side — can you confirm the duplicate fee will be returned to us too?' },
  { cat: 'refund_request', pri: 'high', human: true, sub: 'Demanding full refund — legal mention', body: "Your outage last week cost us real money on {shop}. We want the full month (${amount}) refunded, not credits. If this isn't resolved I'll have our lawyer look at the SLA. Ref {order}." },
  // feature_request
  { cat: 'feature_request', pri: 'low', human: false, sub: 'Feature request: bundle discounts', body: 'Would love native product-bundle discounts in {product} (buy X+Y get 15% off). We currently hack it with draft orders and it is painful. Is this on the roadmap?' },
  { cat: 'feature_request', pri: 'low', human: false, sub: 'Dark mode for the admin', body: 'Small one: the admin is blinding during late-night inventory sessions. Dark mode please! Everyone in our team ({name} especially) would be thrilled.' },
  { cat: 'feature_request', pri: 'normal', human: false, sub: 'API endpoint for gift card balances', body: 'We are building a kiosk integration and need to query gift card balances programmatically. The REST API has cards but not balances. Any chance this lands soon? It blocks our {days}-day launch plan.' },
];

function fillTicket(tpl, i) {
  const slots = {
    '{order}': `#LM-${randInt(10000, 99999)}`,
    '{product}': pick(PRODUCTS2),
    '{error}': pick(ERRORS),
    '{shop}': pick(SHOPS),
    '{days}': String(randInt(2, 21)),
    '{amount}': String(pick([19, 29, 49, 79, 99, 149, 299])),
    '{name}': pick(NAMES),
  };
  let sub = tpl.sub;
  let body = tpl.body;
  for (const [k, v] of Object.entries(slots)) {
    sub = sub.split(k).join(v);
    body = body.split(k).join(v);
  }
  const orderMatch = body.match(/#LM-\d{5}/);
  return {
    ticket: { id: `T-${String(i).padStart(4, '0')}`, subject: sub, body, channel: pick(['email', 'chat', 'web_form']), created_at: `2026-0${randInt(1, 5)}-${String(randInt(1, 28)).padStart(2, '0')}T${String(randInt(0, 23)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}:00Z` },
    label: { id: `T-${String(i).padStart(4, '0')}`, category: tpl.cat, priority: tpl.pri, needs_human: tpl.human, order_id: orderMatch ? orderMatch[0] : null },
  };
}

const allTickets = [];
let tid = 1;
for (let round = 0; round < 9; round++) {
  for (const tpl of TICKET_TEMPLATES) {
    allTickets.push(fillTicket(tpl, tid++));
  }
}
// shuffle deterministically
for (let i = allTickets.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [allTickets[i], allTickets[j]] = [allTickets[j], allTickets[i]];
}
const labeled = allTickets.slice(0, 60);
const test = allTickets.slice(60, 200);

writeFile(P2, 'tickets_labeled.jsonl', labeled.map((t) => JSON.stringify({ ...t.ticket, ...{ category: t.label.category, priority: t.label.priority, needs_human: t.label.needs_human, order_id: t.label.order_id } })).join('\n') + '\n');
writeFile(P2, 'tickets_test.jsonl', test.map((t) => JSON.stringify(t.ticket)).join('\n') + '\n');
writeFile(P2, 'labels_test.jsonl', test.map((t) => JSON.stringify(t.label)).join('\n') + '\n');
writeFile(
  P2,
  'taxonomy.md',
  `# Classification Taxonomy

## category (exactly one)
- \`billing\` — charges, invoices, plan changes, pricing questions
- \`bug\` — something is broken or behaving incorrectly
- \`how_to\` — usage questions, configuration help, migrations
- \`account_access\` — login, 2FA, permissions, ownership, security of the account
- \`refund_request\` — explicit requests for money back
- \`feature_request\` — asking for new functionality

## priority (exactly one)
- \`urgent\` — revenue-stopping or security-critical, needs action now
- \`high\` — significant impact or blocked work
- \`normal\` — standard request
- \`low\` — no time pressure

## needs_human (boolean)
\`true\` when the ticket should bypass automation entirely: legal threats, chargebacks,
suspected account compromise, or anything where an automated reply could increase risk.

## order_id (string or null)
The order reference (\`#LM-12345\`) if one appears in the ticket, else null.
`,
);
writeFile(
  P2,
  'README.md',
  `# Take-home: Support Ticket Intelligence Pipeline

You are interviewing at **Lumen Commerce**, an e-commerce platform handling ~50,000 support
tickets/month. Build the LLM pipeline that triages them.

## Your task
For every ticket, produce a **schema-valid JSON** object: \`category\`, \`priority\`,
\`needs_human\`, \`order_id\` (see \`taxonomy.md\`).

1. Build the pipeline using **structured outputs / tool calling** — raw "please output JSON" prompting will be discussed in review.
2. Use \`tickets_labeled.jsonl\` (60 tickets) to design prompts / few-shot examples.
3. Run on \`tickets_test.jsonl\` (140 tickets) and score yourself against \`labels_test.jsonl\`:
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
`,
);

/* ============================================================
   PROJECT 3 — Analytics Agent (tools over data)
   ============================================================ */
const P3 = join(OUT, 'analytics-agent');

const STATES = ['CA', 'NY', 'TX', 'WA', 'FL', 'IL', 'MA', 'CO', 'OR', 'GA'];
const CHANNELS = ['organic', 'instagram', 'tiktok', 'referral', 'paid_search'];
const CATS = ['Apparel', 'Footwear', 'Accessories', 'Home', 'Beauty', 'Outdoor'];
const PRODUCT_NAMES = {
  Apparel: ['Everyday Tee', 'Heavy Hoodie', 'Linen Shirt', 'Track Pants', 'Rain Shell', 'Merino Crew', 'Canvas Jacket'],
  Footwear: ['Trail Runner', 'Court Classic', 'Slip-On Knit', 'Leather Boot', 'Recovery Slide'],
  Accessories: ['Canvas Tote', 'Wool Beanie', 'Leather Belt', 'Trucker Cap', 'Crew Socks 3-Pack', 'Card Wallet'],
  Home: ['Ceramic Mug', 'Throw Blanket', 'Scented Candle', 'Linen Napkin Set', 'Cutting Board'],
  Beauty: ['Daily Moisturizer', 'Vitamin C Serum', 'Lip Balm Trio', 'Clay Mask', 'Body Lotion'],
  Outdoor: ['20L Daypack', 'Insulated Bottle', 'Camp Blanket', 'Headlamp', 'Packable Hammock', 'Trekking Socks'],
};
const FIRST = ['Ava', 'Liam', 'Noah', 'Mia', 'Zoe', 'Eli', 'Ivy', 'Leo', 'Nora', 'Owen', 'Ruby', 'Theo', 'Isla', 'Max', 'Lena', 'Kai', 'June', 'Cole', 'Faye', 'Reid'];
const LAST = ['Tran', 'Garcia', 'Kim', 'Patel', 'Novak', 'Larsen', 'Okafor', 'Ramos', 'Becker', 'Silva', 'Haddad', 'Ito', 'Moreau', 'Walsh', 'Dube'];
const REFUND_REASONS = ['damaged_in_transit', 'wrong_size', 'not_as_described', 'changed_mind', 'late_delivery'];

// products
const products = [];
let pid = 1;
for (const cat of CATS) {
  for (const name of PRODUCT_NAMES[cat]) {
    products.push({ product_id: `P-${String(pid++).padStart(3, '0')}`, name, category: cat, price: pick([18, 24, 28, 32, 38, 45, 52, 58, 65, 72, 85, 98, 120, 145]) });
  }
}

// customers
const customers = [];
for (let i = 1; i <= 250; i++) {
  const fn = pick(FIRST);
  const ln = pick(LAST);
  const y = pick([2023, 2023, 2024, 2024, 2024, 2025]);
  customers.push({
    customer_id: `C-${String(i).padStart(4, '0')}`,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
    state: pick(STATES),
    signup_date: `${y}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
    acquisition_channel: pick(CHANNELS),
  });
}

// orders + items
const orders = [];
const orderItems = [];
let oid = 1;
let iid = 1;
for (let i = 0; i < 1500; i++) {
  const customer = pick(customers);
  const year = pick([2024, 2024, 2025, 2025, 2025]);
  const month = randInt(1, 12);
  const day = randInt(1, 28);
  const status = rand() < 0.07 ? 'cancelled' : 'delivered';
  const orderId = `O-${String(oid++).padStart(5, '0')}`;
  const nItems = randInt(1, 4);
  let total = 0;
  for (let k = 0; k < nItems; k++) {
    const product = pick(products);
    const qty = randInt(1, 3);
    orderItems.push({ item_id: `I-${String(iid++).padStart(6, '0')}`, order_id: orderId, product_id: product.product_id, quantity: qty, unit_price: product.price });
    total += qty * product.price;
  }
  orders.push({ order_id: orderId, customer_id: customer.customer_id, order_date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, status, total: round2(total) });
}

// refunds (~9% of delivered orders)
const refunds = [];
let rid = 1;
for (const order of orders) {
  if (order.status === 'delivered' && rand() < 0.09) {
    const frac = pick([1, 1, 0.5, 0.35]);
    const d = new Date(order.order_date + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + randInt(3, 20));
    refunds.push({
      refund_id: `R-${String(rid++).padStart(4, '0')}`,
      order_id: order.order_id,
      refund_date: d.toISOString().slice(0, 10),
      amount: round2(order.total * frac),
      reason: pick(REFUND_REASONS),
    });
  }
}

// ----- compute gold answers from the generated data -----
const byId = Object.fromEntries(products.map((p) => [p.product_id, p]));
const custById = Object.fromEntries(customers.map((c) => [c.customer_id, c]));
const delivered = orders.filter((o) => o.status === 'delivered');
const itemsByOrder = {};
for (const it of orderItems) (itemsByOrder[it.order_id] ??= []).push(it);

const rev2025 = round2(delivered.filter((o) => o.order_date.startsWith('2025')).reduce((s, o) => s + o.total, 0));

const monthRev = {};
for (const o of delivered.filter((o) => o.order_date.startsWith('2025'))) {
  const m = o.order_date.slice(0, 7);
  monthRev[m] = (monthRev[m] ?? 0) + o.total;
}
const bestMonth = Object.entries(monthRev).sort((a, b) => b[1] - a[1])[0];

const prodRev = {};
const prodUnits2025 = {};
for (const o of delivered) {
  for (const it of itemsByOrder[o.order_id] ?? []) {
    prodRev[it.product_id] = (prodRev[it.product_id] ?? 0) + it.quantity * it.unit_price;
    if (o.order_date.startsWith('2025')) prodUnits2025[it.product_id] = (prodUnits2025[it.product_id] ?? 0) + it.quantity;
  }
}
const topProdRev = Object.entries(prodRev).sort((a, b) => b[1] - a[1])[0];
const topProdUnits = Object.entries(prodUnits2025).sort((a, b) => b[1] - a[1])[0];

const del2025 = delivered.filter((o) => o.order_date.startsWith('2025'));
const aov2025 = round2(del2025.reduce((s, o) => s + o.total, 0) / del2025.length);

const refundedOrderIds = new Set(refunds.map((r) => r.order_id));
const refunded2025 = del2025.filter((o) => refundedOrderIds.has(o.order_id)).length;
const refundRate2025 = round2((refunded2025 / del2025.length) * 100);

const catRevQ4 = {};
for (const o of delivered.filter((o) => ['2025-10', '2025-11', '2025-12'].some((m) => o.order_date.startsWith(m)))) {
  for (const it of itemsByOrder[o.order_id] ?? []) {
    const cat = byId[it.product_id].category;
    catRevQ4[cat] = (catRevQ4[cat] ?? 0) + it.quantity * it.unit_price;
  }
}
const topCatQ4 = Object.entries(catRevQ4).sort((a, b) => b[1] - a[1])[0];

const ordersPerCust = {};
for (const o of delivered) ordersPerCust[o.customer_id] = (ordersPerCust[o.customer_id] ?? 0) + 1;
const repeatCustomers = Object.values(ordersPerCust).filter((n) => n >= 2).length;

const stateCounts = {};
for (const c of customers) stateCounts[c.state] = (stateCounts[c.state] ?? 0) + 1;
const topState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0];

const igRev2025 = round2(
  del2025.filter((o) => custById[o.customer_id].acquisition_channel === 'instagram').reduce((s, o) => s + o.total, 0),
);

const cancelled2025 = orders.filter((o) => o.status === 'cancelled' && o.order_date.startsWith('2025')).length;

const refundByCat = {};
for (const r of refunds) {
  const order = orders.find((o) => o.order_id === r.order_id);
  const items = itemsByOrder[order.order_id] ?? [];
  const orderTotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  for (const it of items) {
    const share = (it.quantity * it.unit_price) / orderTotal;
    const cat = byId[it.product_id].category;
    refundByCat[cat] = (refundByCat[cat] ?? 0) + r.amount * share;
  }
}
const topRefundCat = Object.entries(refundByCat).sort((a, b) => b[1] - a[1])[0];

const GOLD = [
  { id: 1, question: 'What was total revenue from delivered orders in 2025?', answer: `$${rev2025.toLocaleString('en-US')}`, concept: 'filter + sum' },
  { id: 2, question: 'Which month of 2025 had the highest delivered revenue, and how much?', answer: `${bestMonth[0]} with $${round2(bestMonth[1]).toLocaleString('en-US')}`, concept: 'group by month' },
  { id: 3, question: 'Which product has generated the most revenue all-time (delivered orders)?', answer: `${byId[topProdRev[0]].name} (${topProdRev[0]}) with $${round2(topProdRev[1]).toLocaleString('en-US')}`, concept: 'join + group by product' },
  { id: 4, question: 'What was the average order value (AOV) for delivered orders in 2025?', answer: `$${aov2025}`, concept: 'aggregate' },
  { id: 5, question: 'What percentage of delivered 2025 orders received a refund?', answer: `${refundRate2025}% (${refunded2025} of ${del2025.length})`, concept: 'join + rate' },
  { id: 6, question: 'Which product category had the highest revenue in Q4 2025?', answer: `${topCatQ4[0]} with $${round2(topCatQ4[1]).toLocaleString('en-US')}`, concept: 'date filter + 2 joins' },
  { id: 7, question: 'How many customers have placed 2 or more delivered orders all-time?', answer: `${repeatCustomers} customers`, concept: 'group + having' },
  { id: 8, question: 'Which state has the most customers?', answer: `${topState[0]} with ${topState[1]} customers`, concept: 'simple group' },
  { id: 9, question: 'How much 2025 delivered revenue came from customers acquired via Instagram?', answer: `$${igRev2025.toLocaleString('en-US')}`, concept: 'join through customers' },
  { id: 10, question: 'How many orders were cancelled in 2025?', answer: `${cancelled2025} orders`, concept: 'filter + count' },
  { id: 11, question: 'Which product sold the most units in 2025 (delivered orders)?', answer: `${byId[topProdUnits[0]].name} (${topProdUnits[0]}) with ${topProdUnits[1]} units`, concept: 'join + sum quantity' },
  { id: 12, question: 'Which product category has the highest total refunded amount (allocate refunds across items proportionally by item value)?', answer: `${topRefundCat[0]} with ~$${round2(topRefundCat[1]).toLocaleString('en-US')}`, concept: 'multi-step allocation — hard' },
];

const toCsv = (rows) => {
  const headers = Object.keys(rows[0]);
  const esc = (v) => (typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : String(v));
  return headers.join(',') + '\n' + rows.map((r) => headers.map((h) => esc(r[h])).join(',')).join('\n') + '\n';
};

writeFile(P3, 'customers.csv', toCsv(customers));
writeFile(P3, 'products.csv', toCsv(products));
writeFile(P3, 'orders.csv', toCsv(orders));
writeFile(P3, 'order_items.csv', toCsv(orderItems));
writeFile(P3, 'refunds.csv', toCsv(refunds));
writeFile(P3, 'eval_questions.json', JSON.stringify(GOLD, null, 2) + '\n');
writeFile(
  P3,
  'data_dictionary.md',
  `# Brightcart Data Dictionary

- **customers.csv** — customer_id, name, email, state, signup_date, acquisition_channel (${CHANNELS.join(', ')})
- **products.csv** — product_id, name, category (${CATS.join(', ')}), price (USD)
- **orders.csv** — order_id, customer_id, order_date, status (delivered | cancelled), total (USD)
- **order_items.csv** — item_id, order_id, product_id, quantity, unit_price (price at purchase)
- **refunds.csv** — refund_id, order_id, refund_date, amount (may be partial), reason

Notes: revenue = delivered orders only. \`orders.total\` equals the sum of its items.
Refund \`amount\` can be less than the order total (partial refunds).
`,
);
writeFile(
  P3,
  'README.md',
  `# Take-home: Self-Serve Analytics Agent

You are interviewing at **Brightcart**, a DTC retailer. The ops team asks the data team the same
revenue questions every week. Build an agent that answers them directly from the data.

## Your task
Build a **tool-using LLM agent** that answers natural-language business questions over the five
CSVs (load them into SQLite, DuckDB, or pandas — your choice).

1. The agent must use **tools** (e.g. \`run_sql(query)\` or equivalent) — the model plans, your code executes. No hardcoded answers, no stuffing the CSVs into the prompt.
2. It must handle **multi-step questions** (question 12 in \`eval_questions.json\` requires genuine multi-hop reasoning).
3. Every answer must show its **work**: the queries/tool calls executed, visible in a trace.
4. It must **decline** questions the data cannot answer (e.g. "what will revenue be next year?") instead of guessing.
5. Score yourself against the 12 questions in \`eval_questions.json\` (gold answers computed directly from this dataset) and report accuracy.

## Constraints
- Any provider, any agent style (raw loop encouraged — you built one in the course).
- An iteration cap and basic SQL-injection hygiene on the tool are expected.
- Spend roughly 4–8 hours.

## What we look at
Agent loop design (transcript management, error feedback, iteration cap) · tool design and safety ·
trace readability · honest accuracy reporting against the gold set · refusal on unanswerable questions.
`,
);

console.log('Generated:');
console.log(`  P1 docs: ${Object.keys(DOCS).length}, eval questions: ${EVAL_SET.length}`);
console.log(`  P2 tickets: labeled ${labeled.length}, test ${test.length}`);
console.log(`  P3 customers ${customers.length}, products ${products.length}, orders ${orders.length}, items ${orderItems.length}, refunds ${refunds.length}`);
console.log('  P3 gold sample:', GOLD[0].answer, '|', GOLD[1].answer);
