-- ============================================================================
-- V5: Simplify Relational Database Schema to Exactly 11 Tables
-- Retains Part B DBMS Mini-Project Requirements:
-- - >= 5 Tables (Exactly 11 normalized 3NF tables)
-- - Trigger: trg_mark_slot_booked_on_accept
-- - Stored Procedure/Function: fn_reject_conflicting_requests
-- - Aggregated View: vw_tutor_ratings
-- - Consolidated PDF/Notes uploads in 'study_materials' (BYTEA)
-- - Quizzes moved to client-side question bank (0 DB tables needed)
-- ============================================================================

-- 1. Create consolidated study_materials table for PDF / Notes uploads
CREATE TABLE IF NOT EXISTS study_materials (
    id BIGSERIAL PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    uploader_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    material_type VARCHAR(50) NOT NULL DEFAULT 'PDF Notes',
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(120) NOT NULL DEFAULT 'application/pdf',
    file_size BIGINT NOT NULL,
    file_data BYTEA NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Migrate existing files from learning_materials & material_attachments if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_materials'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'material_attachments'
    ) THEN
        INSERT INTO study_materials (
            skill_id, uploader_id, title, material_type, file_name, content_type, file_size, file_data, description, uploaded_at
        )
        SELECT
            lm.skill_id,
            lm.author_id,
            lm.title,
            COALESCE(lm.material_type, 'PDF Notes'),
            COALESCE(lm.attachment_name, lm.title || '.pdf'),
            COALESCE(lm.attachment_content_type, 'application/pdf'),
            COALESCE(lm.attachment_size, octet_length(ma.file_data)),
            ma.file_data,
            lm.content,
            COALESCE(ma.uploaded_at, lm.created_at)
        FROM learning_materials lm
        JOIN material_attachments ma ON lm.id = ma.material_id;
    END IF;
END $$;

-- 3. Drop obsolete triggers and functions
DROP TRIGGER IF EXISTS trg_audit_session_changes ON learning_sessions;
DROP FUNCTION IF EXISTS fn_audit_session_changes();

-- 4. Drop the 11 removed tables safely (CASCADE handles foreign keys)
DROP TABLE IF EXISTS material_verifications CASCADE;
DROP TABLE IF EXISTS material_bookmarks CASCADE;
DROP TABLE IF EXISTS material_attachments CASCADE;
DROP TABLE IF EXISTS learning_materials CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS session_audit_logs CASCADE;
DROP TABLE IF EXISTS session_request_topics CASCADE;
DROP TABLE IF EXISTS skill_curriculum_topics CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

-- 5. Indexes for remaining tables & study_materials
CREATE INDEX IF NOT EXISTS idx_study_materials_skill ON study_materials(skill_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_uploader ON study_materials(uploader_id);
