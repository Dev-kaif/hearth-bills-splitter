CREATE TABLE homes (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT homes_name_not_empty CHECK (length(trim(name)) > 0)
);

