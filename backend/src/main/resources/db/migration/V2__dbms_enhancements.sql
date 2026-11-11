-- V2: DBMS Enhancements (Audit Trigger, Stored Function, Partial & Full-Text GIN Indexes, Password Reset & Meeting Links)

-- Ensure OAuth compatibility on pre-existing user tables
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(30) DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Ensure meeting_url column exists on learning_sessions
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS meeting_url VARCHAR(500);

-- Ensure user_sessions exists if migrating from pre-OAuth schema
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

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(120) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Session Lifecycle Audit Log Table
CREATE TABLE IF NOT EXISTS session_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Standard, Partial & Full-Text GIN Indexes
CREATE INDEX IF NOT EXISTS idx_req_tutor_status ON session_requests(tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_sess_student_status ON learning_sessions(student_id, status);
CREATE INDEX IF NOT EXISTS idx_sess_tutor_status ON learning_sessions(tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_rev_tutor ON reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id, revoked);

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
