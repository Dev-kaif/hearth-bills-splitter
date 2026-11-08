
ALTER TABLE members
ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

WITH ranked_members AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY home_id
            ORDER BY rowid
        ) - 1 AS new_position
    FROM members
)
UPDATE members
SET position = (
    SELECT new_position
    FROM ranked_members
    WHERE ranked_members.id = members.id
);

CREATE UNIQUE INDEX members_home_position_unique
ON members(home_id, position);
