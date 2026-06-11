# Production Deployment Runbook

## Deploy windows
Deploys are allowed **Monday–Thursday, 10:00–16:00 US Eastern**. No production deploys on Fridays. A full deploy freeze applies during the **last week of each quarter**.

## Procedure
1. Merge to `main` triggers the pipeline (build, tests, staging deploy).
2. Production rollout starts as a **canary to 5% of traffic for 30 minutes**.
3. Auto-promote if error rate and p99 latency stay within thresholds.

## Rollback
`meridian deploy rollback <service>` reverts to the previous release in under 5 minutes. Database migrations require a Change Advisory Board (CAB) ticket and must be backward-compatible one release back.
