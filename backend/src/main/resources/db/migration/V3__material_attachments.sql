-- V3: Document & Image Attachments + Peer Tutor Material Verifications

ALTER TABLE learning_materials ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255);
ALTER TABLE learning_materials ADD COLUMN IF NOT EXISTS attachment_content_type VARCHAR(120);
ALTER TABLE learning_materials ADD COLUMN IF NOT EXISTS attachment_size BIGINT;

CREATE TABLE IF NOT EXISTS material_attachments (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL UNIQUE REFERENCES learning_materials(id) ON DELETE CASCADE,
    file_data BYTEA NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_verifications (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL REFERENCES learning_materials(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (material_id, tutor_id)
);

CREATE INDEX IF NOT EXISTS idx_mat_verifications_mat ON material_verifications(material_id);
