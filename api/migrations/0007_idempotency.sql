ALTER TABLE shares
RENAME COLUMN payment_key TO idempotency_key;

CREATE UNIQUE INDEX shares_idempotency_key_unique
ON shares(idempotency_key)
WHERE idempotency_key IS NOT NULL;