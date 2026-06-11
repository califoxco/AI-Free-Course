# Data Retention & Deletion Policy

| Data type | Retention |
|-----------|-----------|
| PHI (patient records processed for customers) | **7 years** per HIPAA |
| Application audit logs | **2 years** |
| Database backups | **35 days** rolling |
| Sandbox data | Reset nightly |

## Deletion requests
Customer data-deletion requests are fulfilled within **30 days**. Deletion cascades to backups as backup snapshots age out (max 35 additional days). Legal holds suspend deletion for affected records.
