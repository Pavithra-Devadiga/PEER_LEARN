-- ============================================================================
-- PeerLearn Relational Database Schema (PostgreSQL 14+)
-- Normalized to 3NF with Foreign Keys, Constraints, Partial & GIN Indexes,
-- Views, Triggers & Stored Functions
-- Exactly 11 Tables for Academic & Practical Simplicity
-- ============================================================================

-- Run after creating database: CREATE DATABASE peerlearn;

-- 1. Users table (Student & Tutor dual role)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(30) DEFAULT 'LOCAL',
    provider_id VARCHAR(200),
    title VARCHAR(150),
    bio TEXT,
    avatar_url VARCHAR(500),
    learning_streak_weeks INT NOT NULL DEFAULT 0,
    teaching_streak_weeks INT NOT NULL DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    tint VARCHAR(30) NOT NULL
);

-- 3. Skills table
CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL UNIQUE,
    tags VARCHAR(255),
    base_price_inr INT NOT NULL DEFAULT 99 CHECK (base_price_inr >= 0 AND base_price_inr <= 2000)
);

-- 4. Tutor Skills table
CREATE TABLE IF NOT EXISTS tutor_skills (
    id BIGSERIAL PRIMARY KEY,
    tutor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(30) NOT NULL CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced')),
    hourly_fee_inr INT NOT NULL DEFAULT 99 CHECK (hourly_fee_inr >= 0 AND hourly_fee_inr <= 2000),
    UNIQUE (tutor_id, skill_id)
);

-- 5. Availability Slots table
CREATE TABLE IF NOT EXISTS availability_slots (
    id BIGSERIAL PRIMARY KEY,
    tutor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    slot_time VARCHAR(40) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (tutor_id, day_of_week, slot_time)
);

-- 6. Session Requests table
CREATE TABLE IF NOT EXISTS session_requests (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    slot_id BIGINT NOT NULL REFERENCES availability_slots(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    message TEXT,
    rejection_reason VARCHAR(255),
    fee_inr INT NOT NULL DEFAULT 99,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Learning Sessions table
CREATE TABLE IF NOT EXISTS learning_sessions (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT UNIQUE REFERENCES session_requests(id) ON DELETE SET NULL,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    slot_id BIGINT REFERENCES availability_slots(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'COMPLETED', 'CANCELLED')),
    scheduled_label VARCHAR(100) NOT NULL,
    scheduled_date DATE NOT NULL,
    duration_hours DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    meeting_url VARCHAR(500),
    fee_inr INT NOT NULL DEFAULT 99,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Session Topics table
CREATE TABLE IF NOT EXISTS session_topics (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    topic_name VARCHAR(200) NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    asked_by_student BOOLEAN NOT NULL DEFAULT FALSE
);

-- 9. Session Messages table
CREATE TABLE IF NOT EXISTS session_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE REFERENCES learning_sessions(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Study Materials table (PDF & Notes uploads stored as BYTEA)
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

-- ============================================================================
-- Standard, Partial & Full-Text GIN Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_req_tutor_status ON session_requests(tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_sess_student_status ON learning_sessions(student_id, status);
CREATE INDEX IF NOT EXISTS idx_sess_tutor_status ON learning_sessions(tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_rev_tutor ON reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_skill ON study_materials(skill_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_uploader ON study_materials(uploader_id);

CREATE INDEX IF NOT EXISTS idx_pending_slot_requests
ON session_requests(slot_id)
WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_skills_fts
ON skills USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(tags, '')));

-- ============================================================================
-- View: Aggregated Tutor Ratings & Review Counts
-- ============================================================================
CREATE OR REPLACE VIEW vw_tutor_ratings AS
SELECT
    u.id AS tutor_id,
    u.full_name,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 5.0) AS avg_rating,
    COUNT(r.id) AS review_count
FROM users u
LEFT JOIN reviews r ON u.id = r.tutor_id
GROUP BY u.id, u.full_name;

-- ============================================================================
-- Trigger: Mark availability slot booked when request accepted
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_mark_slot_booked_on_accept()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ACCEPTED' AND OLD.status <> 'ACCEPTED' THEN
        UPDATE availability_slots
        SET is_available = FALSE
        WHERE id = NEW.slot_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mark_slot_booked_on_accept ON session_requests;
CREATE TRIGGER trg_mark_slot_booked_on_accept
AFTER UPDATE ON session_requests
FOR EACH ROW
EXECUTE FUNCTION fn_mark_slot_booked_on_accept();

-- ============================================================================
-- Stored Function: Automatically reject competing pending requests for a booked slot
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_reject_conflicting_requests(
    p_tutor_id BIGINT,
    p_slot_id BIGINT,
    p_accepted_request_id BIGINT,
    p_reason VARCHAR
)
RETURNS INT AS $$
DECLARE
    v_rejected_count INT;
BEGIN
    UPDATE session_requests
    SET status = 'REJECTED',
        rejection_reason = p_reason
    WHERE tutor_id = p_tutor_id
      AND slot_id = p_slot_id
      AND id <> p_accepted_request_id
      AND status = 'PENDING';

    GET DIAGNOSTICS v_rejected_count = ROW_COUNT;
    RETURN v_rejected_count;
END;
$$ LANGUAGE plpgsql;
