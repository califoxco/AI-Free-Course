# Brightcart Data Dictionary

- **customers.csv** — customer_id, name, email, state, signup_date, acquisition_channel (organic, instagram, tiktok, referral, paid_search)
- **products.csv** — product_id, name, category (Apparel, Footwear, Accessories, Home, Beauty, Outdoor), price (USD)
- **orders.csv** — order_id, customer_id, order_date, status (delivered | cancelled), total (USD)
- **order_items.csv** — item_id, order_id, product_id, quantity, unit_price (price at purchase)
- **refunds.csv** — refund_id, order_id, refund_date, amount (may be partial), reason

Notes: revenue = delivered orders only. `orders.total` equals the sum of its items.
Refund `amount` can be less than the order total (partial refunds).
