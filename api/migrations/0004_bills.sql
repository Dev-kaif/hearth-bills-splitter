
CREATE TABLE bills (
    id TEXT PRIMARY KEY NOT NULL,
    home_id TEXT NOT NULL,
    title TEXT NOT NULL,
    total_cents INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bills_home_fk
        FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE,
    CONSTRAINT bills_total_positive CHECK (total_cents > 0),
    CONSTRAINT bills_title_not_empty CHECK (length(trim(title)) > 0)
);
