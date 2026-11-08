-- Add archival support

ALTER TABLE homes
ADD COLUMN archived_at TEXT;

ALTER TABLE members
ADD COLUMN archived_at TEXT;


-- Enforce ownership for all new homes and owner updates.
-- Existing legacy homes with NULL owners are not automatically assigned.

CREATE TRIGGER homes_owner_required_insert
BEFORE INSERT ON homes
WHEN NEW.owner_user_id IS NULL
BEGIN
    SELECT RAISE(ABORT, 'Home must have an owner');
END;

CREATE TRIGGER homes_owner_required_update
BEFORE UPDATE OF owner_user_id ON homes
WHEN NEW.owner_user_id IS NULL
BEGIN
    SELECT RAISE(ABORT, 'Home must have an owner');
END;


-- 3. Ensure a share's member belongs to the bill's home.

CREATE TRIGGER shares_home_consistency_insert
BEFORE INSERT ON shares
WHEN NOT EXISTS (
    SELECT 1
    FROM bills b
    INNER JOIN members m ON m.home_id = b.home_id
    WHERE b.id = NEW.bill_id
      AND m.id = NEW.member_id
)
BEGIN
    SELECT RAISE(ABORT, 'Member and bill must belong to the same home');
END;

CREATE TRIGGER shares_home_consistency_update
BEFORE UPDATE OF bill_id, member_id ON shares
WHEN NOT EXISTS (
    SELECT 1
    FROM bills b
    INNER JOIN members m ON m.home_id = b.home_id
    WHERE b.id = NEW.bill_id
      AND m.id = NEW.member_id
)
BEGIN
    SELECT RAISE(ABORT, 'Member and bill must belong to the same home');
END;


-- Protect financial history from physical deletion.

CREATE TRIGGER homes_prevent_delete
BEFORE DELETE ON homes
BEGIN
    SELECT RAISE(ABORT, 'Homes must be archived, not deleted');
END;

CREATE TRIGGER members_prevent_delete
BEFORE DELETE ON members
BEGIN
    SELECT RAISE(ABORT, 'Members must be archived, not deleted');
END;

CREATE TRIGGER bills_prevent_delete
BEFORE DELETE ON bills
BEGIN
    SELECT RAISE(ABORT, 'Bills cannot be deleted');
END;

CREATE TRIGGER shares_prevent_delete
BEFORE DELETE ON shares
BEGIN
    SELECT RAISE(ABORT, 'Financial shares cannot be deleted');
END;


-- Remove redundant index.
-- members_home_position_unique already covers home_id lookups.

DROP INDEX IF EXISTS members_home_id_idx;