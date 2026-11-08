
CREATE INDEX members_home_id_idx ON members(home_id);
CREATE INDEX bills_home_id_idx ON bills(home_id);
CREATE INDEX shares_bill_id_idx ON shares(bill_id);
CREATE INDEX shares_member_id_idx ON shares(member_id);

