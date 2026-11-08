CREATE TABLE members (
    id TEXT PRIMARY KEY NOT NULL,
    home_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT members_home_fk
        FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE,
    CONSTRAINT members_name_not_empty CHECK (length(trim(name)) > 0)
);
