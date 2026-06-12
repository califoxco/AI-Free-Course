# Classification Taxonomy

## category (exactly one)
- `billing` — charges, invoices, plan changes, pricing questions
- `bug` — something is broken or behaving incorrectly
- `how_to` — usage questions, configuration help, migrations
- `account_access` — login, 2FA, permissions, ownership, security of the account
- `refund_request` — explicit requests for money back
- `feature_request` — asking for new functionality

## priority (exactly one)
- `urgent` — revenue-stopping or security-critical, needs action now
- `high` — significant impact or blocked work
- `normal` — standard request
- `low` — no time pressure

## needs_human (boolean)
`true` when the ticket should bypass automation entirely: legal threats, chargebacks,
suspected account compromise, or anything where an automated reply could increase risk.

## order_id (string or null)
The order reference (`#LM-12345`) if one appears in the ticket, else null.
