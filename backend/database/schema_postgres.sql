-- ============================================================================
-- PeerLearn Relational Database Schema (PostgreSQL 14+)
-- Normalized to 3NF with Foreign Keys, Constraints, Partial & GIN Indexes,
-- Views, Triggers & Stored Functions
-- ============================================================================

-- Run after creating database: CREATE DATABASE peerlearn;

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

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_id VARCHAR(100) NOT NULL UNIQUE,
    auth_method VARCHAR(30) NOT NULL,
    ip_address VARCHAR(64),
    user_agent VARCHAR(300),
    logged_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    logged_out_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(120) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    tint VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL UNIQUE,
    tags VARCHAR(255),
    base_price_inr INT NOT NULL DEFAULT 99 CHECK (base_price_inr >= 0 AND base_price_inr <= 2000)
);

CREATE TABLE IF NOT EXISTS skill_curriculum_topics (
    id BIGSERIAL PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    topic_name VARCHAR(200) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tutor_skills (
    id BIGSERIAL PRIMARY KEY,
    tutor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(30) NOT NULL CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced')),
    hourly_fee_inr INT NOT NULL DEFAULT 99 CHECK (hourly_fee_inr >= 0 AND hourly_fee_inr <= 2000),
    UNIQUE (tutor_id, skill_id)
);

CREATE TABLE IF NOT EXISTS availability_slots (
    id BIGSERIAL PRIMARY KEY,
    tutor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    slot_time VARCHAR(40) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (tutor_id, day_of_week, slot_time)
);

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

CREATE TABLE IF NOT EXISTS session_request_topics (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES session_requests(id) ON DELETE CASCADE,
    topic_name VARCHAR(200) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS session_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_topics (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    topic_name VARCHAR(200) NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    asked_by_student BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS session_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS learning_materials (
    id BIGSERIAL PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    material_type VARCHAR(30) NOT NULL,
    tint VARCHAR(30) NOT NULL DEFAULT 'violet',
    read_time VARCHAR(40) NOT NULL DEFAULT '5 min read',
    content TEXT NOT NULL,
    attachment_name VARCHAR(255),
    attachment_content_type VARCHAR(120),
    attachment_size BIGINT,
    is_ai_seeded BOOLEAN NOT NULL DEFAULT FALSE,
    verified_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS material_bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES learning_materials(id) ON DELETE CASCADE,
    UNIQUE (user_id, material_id)
);

CREATE TABLE IF NOT EXISTS quizzes (
    id BIGSERIAL PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a VARCHAR(300) NOT NULL,
    option_b VARCHAR(300) NOT NULL,
    option_c VARCHAR(300) NOT NULL,
    option_d VARCHAR(300) NOT NULL,
    correct_index INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
    explanation TEXT NOT NULL,
    topic_tag VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id BIGINT REFERENCES learning_sessions(id) ON DELETE SET NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    missed_topics VARCHAR(500),
    strong_topics VARCHAR(500),
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Standard, Partial & Full-Text GIN Indexes
CREATE INDEX IF NOT EXISTS idx_req_tutor_status ON session_requests(tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_sess_student_status ON learning_sessions(student_id, status);
CREATE INDEX IF NOT EXISTS idx_sess_tutor_status ON learning_sessions(tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_rev_tutor ON reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id, revoked);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session ON quiz_attempts(session_id);

CREATE INDEX IF NOT EXISTS idx_pending_slot_requests
ON session_requests(slot_id)
WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_skills_fts
ON skills USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(tags, '')));

CREATE INDEX IF NOT EXISTS idx_materials_fts
ON learning_materials USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

-- View: Aggregated Tutor Ratings & Review Counts
CREATE OR REPLACE VIEW vw_tutor_ratings AS
SELECT
    u.id AS tutor_id,
    u.full_name,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 5.0) AS avg_rating,
    COUNT(r.id) AS review_count
FROM users u
LEFT JOIN reviews r ON u.id = r.tutor_id
GROUP BY u.id, u.full_name;

-- Trigger 1: Mark availability slot booked when request accepted
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

-- Trigger 2: Audit session status transitions
CREATE OR REPLACE FUNCTION fn_audit_session_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO session_audit_logs (session_id, old_status, new_status)
        VALUES (NEW.id, NULL, NEW.status);
    ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO session_audit_logs (session_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_session_changes ON learning_sessions;
CREATE TRIGGER trg_audit_session_changes
AFTER INSERT OR UPDATE OF status ON learning_sessions
FOR EACH ROW
EXECUTE FUNCTION fn_audit_session_changes();

-- Stored Function: Automatically reject competing pending requests for a booked slot
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
