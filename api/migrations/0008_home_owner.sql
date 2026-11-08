ALTER TABLE homes
ADD COLUMN owner_user_id TEXT REFERENCES user(id) ON DELETE RESTRICT;

CREATE INDEX homes_owner_user_id_idx
ON homes(owner_user_id);