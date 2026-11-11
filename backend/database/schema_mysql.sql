-- ============================================================================
-- PeerLearn Relational Database Schema (MySQL 8.0+)
-- Normalized to 3NF with Foreign Keys, Constraints, Indexes, Views & Triggers
-- ============================================================================

CREATE DATABASE IF NOT EXISTS peerlearn;
USE peerlearn;

-- 1. Users (Single Dual-Role Account: Student + Tutor)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    title VARCHAR(150),
    bio TEXT,
    avatar_url VARCHAR(500),
    learning_streak_weeks INT NOT NULL DEFAULT 0,
    teaching_streak_weeks INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skill Categories
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    tint VARCHAR(30) NOT NULL
);

-- 3. Skills Catalog
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL UNIQUE,
    tags VARCHAR(255),
    CONSTRAINT fk_skill_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. Standard Shared Curriculum Topics per Skill
CREATE TABLE IF NOT EXISTS skill_curriculum_topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id BIGINT NOT NULL,
    topic_name VARCHAR(200) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_curriculum_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 5. Junction Table: Skills Taught by Each Tutor
CREATE TABLE IF NOT EXISTS tutor_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tutor_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level VARCHAR(30) NOT NULL,
    CONSTRAINT uk_tutor_skill UNIQUE (tutor_id, skill_id),
    CONSTRAINT chk_proficiency CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced')),
    CONSTRAINT fk_ts_tutor FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ts_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 6. Weekly Recurring Availability Slots for Tutors
CREATE TABLE IF NOT EXISTS availability_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tutor_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    slot_time VARCHAR(40) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_tutor_slot UNIQUE (tutor_id, day_of_week, slot_time),
    CONSTRAINT fk_slot_tutor FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Student Session Booking Requests
CREATE TABLE IF NOT EXISTS session_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    tutor_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    message TEXT,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_req_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    CONSTRAINT fk_req_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_tutor FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_slot FOREIGN KEY (slot_id) REFERENCES availability_slots(id) ON DELETE CASCADE
);

-- 8. Requested Topics Attached to Each Booking Request
CREATE TABLE IF NOT EXISTS session_request_topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    topic_name VARCHAR(200) NOT NULL,
    CONSTRAINT fk_reqtopic_req FOREIGN KEY (request_id) REFERENCES session_requests(id) ON DELETE CASCADE
);

-- 9. Confirmed / Active / Completed Learning Sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT UNIQUE,
    student_id BIGINT NOT NULL,
    tutor_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    slot_id BIGINT,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    scheduled_label VARCHAR(100) NOT NULL,
    scheduled_date DATE NOT NULL,
    duration_hours DOUBLE NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_sess_status CHECK (status IN ('UPCOMING', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT fk_sess_req FOREIGN KEY (request_id) REFERENCES session_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_sess_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sess_tutor FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sess_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT fk_sess_slot FOREIGN KEY (slot_id) REFERENCES availability_slots(id) ON DELETE SET NULL
);

-- 10. Live Topic Checklist Inside Each Session
CREATE TABLE IF NOT EXISTS session_topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    topic_name VARCHAR(200) NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    asked_by_student BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_stopic_sess FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE
);

-- 11. Persisted Session Chat Messages
CREATE TABLE IF NOT EXISTS session_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_sess FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Student Ratings & Reviews for Completed Sessions
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    student_id BIGINT NOT NULL,
    tutor_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_rev_sess FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_tutor FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 13. Learning Hub Materials (Cheatsheets, Notes, Links, Tutor Contributions)
CREATE TABLE IF NOT EXISTS learning_materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id BIGINT NOT NULL,
    author_id BIGINT,
    title VARCHAR(200) NOT NULL,
    material_type VARCHAR(30) NOT NULL,
    tint VARCHAR(30) NOT NULL DEFAULT 'violet',
    read_time VARCHAR(40) NOT NULL DEFAULT '5 min read',
    content TEXT NOT NULL,
    is_ai_seeded BOOLEAN NOT NULL DEFAULT FALSE,
    verified_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mat_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT fk_mat_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 14. User Bookmarks for Learning Materials
CREATE TABLE IF NOT EXISTS material_bookmarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    CONSTRAINT uk_user_material UNIQUE (user_id, material_id),
    CONSTRAINT fk_bm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bm_mat FOREIGN KEY (material_id) REFERENCES learning_materials(id) ON DELETE CASCADE
);

-- 15. Skill Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    CONSTRAINT fk_quiz_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 16. Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(300) NOT NULL,
    option_b VARCHAR(300) NOT NULL,
    option_c VARCHAR(300) NOT NULL,
    option_d VARCHAR(300) NOT NULL,
    correct_index INT NOT NULL,
    explanation TEXT NOT NULL,
    topic_tag VARCHAR(120) NOT NULL,
    CONSTRAINT chk_correct_idx CHECK (correct_index BETWEEN 0 AND 3),
    CONSTRAINT fk_qq_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 17. Student Quiz Attempts & Analytics
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    missed_topics VARCHAR(500),
    strong_topics VARCHAR(500),
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qa_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_qa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for query optimization
CREATE INDEX idx_req_tutor_status ON session_requests(tutor_id, status);
CREATE INDEX idx_sess_student_status ON learning_sessions(student_id, status);
CREATE INDEX idx_sess_tutor_status ON learning_sessions(tutor_id, status);
CREATE INDEX idx_rev_tutor ON reviews(tutor_id);

-- SQL View: Aggregated Tutor Ratings & Review Counts
CREATE OR REPLACE VIEW vw_tutor_ratings AS
SELECT
    u.id AS tutor_id,
    u.full_name,
    COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS avg_rating,
    COUNT(r.id) AS review_count
FROM users u
LEFT JOIN reviews r ON u.id = r.tutor_id
GROUP BY u.id, u.full_name;

-- SQL Trigger: Automatically mark an availability slot as booked when a request is accepted
DELIMITER //
CREATE TRIGGER trg_mark_slot_booked_on_accept
AFTER UPDATE ON session_requests
FOR EACH ROW
BEGIN
    IF NEW.status = 'ACCEPTED' AND OLD.status <> 'ACCEPTED' THEN
        UPDATE availability_slots
        SET is_available = FALSE
        WHERE id = NEW.slot_id;
    END IF;
END //
DELIMITER ;
