# Webhooks Guide

Meridian sends webhooks for events such as `patient.updated`, `claim.submitted`, `claim.adjudicated`, and `appointment.cancelled`.

## Verifying signatures
Every delivery includes an `X-Meridian-Signature` header: an **HMAC-SHA256** of the raw request body using your webhook signing secret. Reject any request whose signature does not match.

## Delivery and retries
Your endpoint must respond with a 2xx status within **10 seconds**. Failed deliveries are retried **5 times with exponential backoff** over a maximum of 24 hours, after which the event is dropped and visible in the dashboard's dead-letter view.

Webhook endpoints must use HTTPS. Payloads are at-least-once delivery; deduplicate using the `event_id` field.
