
CREATE TABLE shares (
    id TEXT PRIMARY KEY NOT NULL,
    bill_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    paid_at TEXT,
    payment_key TEXT,
    CONSTRAINT shares_bill_fk
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT shares_member_fk
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    CONSTRAINT shares_amount_nonnegative CHECK (amount_cents >= 0),
    CONSTRAINT shares_bill_member_unique UNIQUE (bill_id, member_id)
);