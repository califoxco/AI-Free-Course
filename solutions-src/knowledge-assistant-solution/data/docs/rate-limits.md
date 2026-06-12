# API Rate Limits

| Plan | Sustained limit | Burst |
|------|----------------|-------|
| Standard | **100 requests/min** | 2x for up to 30 seconds |
| Enterprise | **1,000 requests/min** | 2x for up to 30 seconds |

When you exceed a limit the API returns **HTTP 429** with a `Retry-After` header (seconds). Implement exponential backoff with jitter; do not retry immediately.

Rate limits are applied per client ID. Webhook deliveries and sandbox traffic do not count toward production limits. To request a higher limit, contact your account manager with expected peak QPS.
