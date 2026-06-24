ALTER TABLE bookings ADD COLUMN attendees INT;

-- backfill existing rows so the column is meaningful
UPDATE bookings SET attendees = 1 WHERE attendees IS NULL;

ALTER TABLE bookings
    ADD CONSTRAINT chk_bookings_attendees CHECK (attendees IS NULL OR attendees > 0);
