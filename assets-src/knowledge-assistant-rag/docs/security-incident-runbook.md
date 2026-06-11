# Security Incident Response Runbook

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
A written postmortem is due within **5 business days** of incident resolution for SEV1 and SEV2 incidents.
