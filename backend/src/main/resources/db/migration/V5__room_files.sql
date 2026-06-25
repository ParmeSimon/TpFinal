-- Fichiers rattachés à une salle : photos (galerie) et documents (consignes, plans, PDF…).
-- Le binaire est stocké sur disque ; seules les métadonnées sont en base.
CREATE TABLE room_files (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    url VARCHAR(512) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(150),
    size_bytes BIGINT NOT NULL DEFAULT 0,
    category VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_files_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
);

CREATE INDEX idx_room_files_room ON room_files (room_id);