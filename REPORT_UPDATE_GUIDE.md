# PeerLearn — Report Update Guide (Old Report → Final 11-Table Project)

> **Purpose of this file:** Upload this file alongside your old DBMS mini-project report (`UVCE, 21CCPC506L, V Sem ISE, 2025–2026`) to **ChatGPT** so it can accurately rewrite and update every chapter, schema table, SQL snippet, architecture diagram, and future enhancement to match your current live **PeerLearn** application.  
> **Live Frontend URL:** `https://peerlearn-frontend-b0zt.onrender.com`

---

## Suggested Prompt to Copy-Paste into ChatGPT

> *"I am attaching my old DBMS mini-project report and this `REPORT_UPDATE_GUIDE.md` describing all upgrades implemented in my final project. Please update every affected section of my report (Abstract, Chapters 1–6, Table of Contents, ER/Relational schemas, PostgreSQL triggers/functions/views/indexes, System Requirements, Interface Modules, Conclusion, Future Enhancements, and Bibliography) while preserving the UVCE academic format and tone. Replace all old Flask/MySQL references with the current Spring Boot 3.3.5 + PostgreSQL (**11 normalized tables in 3NF**, 1 trigger, 1 stored function, 1 view) implementation listed here."*

---

## 1. Project Metadata (Preserve from Old Report)

- **Title:** Peer-to-Peer Skill Exchange Platform (**PeerLearn**)
- **Course:** Database Management System Laboratory (`21CCPC506L`)
- **Part B Mini-Project Requirements:** $\ge 5$ tables, $\ge 1$ trigger, $\ge 1$ stored procedure, normalized to 3NF, suitable frontend.
- **Students:** Pavithra (`U25UV24T064028`), Rithya Jayaram (`U25UV24T064037`) — V Sem, B.Tech (ISE), UVCE
- **Guide:** Dr. Pushpa C N, Dept. of CSE, UVCE
- **Chairperson:** Dr. Manjula S H, Dept. of CSE, UVCE

---

## 2. High-Level Summary of Changes (Old Report → Current Project)

| Dimension | Old Report | Current Final Project |
|---|---|---|
| **Backend** | Python 3.10+ (`Flask`, `PyMySQL`) | **Java 17** + **Spring Boot 3.3.5** (Spring Web, Spring Data JPA/Hibernate, Spring Security, Spring Mail, Flyway) |
| **Database** | MySQL 8.0 (manual SQL scripts) | **PostgreSQL 14+** with **Flyway** versioned migrations (`V1`–`V5`) |
| **Schema Size** | 10 tables | **11 normalized (3NF) tables** (clean, academic, zero clutter) |
| **Authentication** | Basic login + `"developer auth switch"` | **Stateless `Bearer` JWT** + `BCrypt` hashing + **Forgot/Reset Password** + 1-click Demo login (`Hannah`) |
| **Email Service** | None | **Streamlined (Zero SMTP setup needed for registration)**; password reset links generated in-memory with optional Gmail SMTP |
| **DBMS Objects** | MySQL procedures (`sp_recommend_tutors`, `sp_confirm_session_and_deconflict`), `trg_prevent_double_booking` | PostgreSQL **PL/pgSQL function** (`fn_reject_conflicting_requests`), **Trigger** (`trg_mark_slot_booked_on_accept`), **View** (`vw_tutor_ratings`), **Partial Index**, and **Full-Text GIN Index** |
| **Study Materials** | Basic text | **Consolidated PDF & Notes Uploads (`study_materials`) stored as PostgreSQL `BYTEA` up to 10MB** with inline preview and download |
| **Interactive Quizzes** | 3 separate DB tables | **Optimized Zero-DB Question Bank:** Runs client-side via `src/data/quizData.js`, giving instant feedback, explanations, and scores with **0 database tables** |
| **Pricing** | Not implemented | **INR Hourly Session Fees (`₹69–₹149/hr` defaults)**, customizable per skill by tutors and snapshotted on requests/sessions |
| **Video Calling** | Listed under *Future Enhancements* | **Implemented** via auto-generated **Jitsi Meet links** (`https://meet.jit.si/peerlearn-...`), editable inline by tutors |
| **UI & Deployment** | Localhost desktop UI | Redesigned Landing Page (**Features + 3-Step How It Works**), **full mobile phone responsiveness (`320px+`)**, 4-second live session sync, cloud-deployed (`Render` + `PostgreSQL` / `Docker` + `Vite`) |

---

## 3. Chapter-by-Chapter Changes ChatGPT Must Make

### Abstract & Chapter 1 (Introduction)
- Replace references to **MySQL** and **Python Flask** with **PostgreSQL 14+ (11 tables in 3NF, Flyway)** and **Spring Boot 3.3.5 (Java 17) REST API**.
- Highlight that the project fulfills all Part B Mini-Project specifications:
  - 11 Normalized Tables (exceeds the $\ge 5$ minimum requirement while remaining clean and focused)
  - 1 Trigger (`trg_mark_slot_booked_on_accept`)
  - 1 Stored Procedure/Function (`fn_reject_conflicting_requests`)
  - 1 Aggregated View (`vw_tutor_ratings`)
  - Normalized to 3NF (every non-key attribute fully and directly dependent on primary keys)
- State that study notes and PDFs are efficiently managed in a dedicated `study_materials` table (`BYTEA`), while interactive quizzes are delivered via a high-performance client-side question bank.

---

### Chapter 2 (Literature Review & System Analysis)
- Update **Section 2.3 (System Requirements)** and **Section 2.5 (Backend Technologies)**:
  - **Frontend:** React `18.3.1`, Vite `5.4.9`, Tailwind CSS `3.4.14`, React Router DOM `6.27.0` (`BrowserRouter`), Lucide React `0.453.0`.
  - **Backend:** Java `17`, Spring Boot `3.3.5` (Spring Web, Spring Data JPA / Hibernate, Spring Security, Spring Mail, Validation), JJWT `0.12.6`, BCrypt, Flyway.
  - **Database:** PostgreSQL `14+`.
  - **Deployment / Packaging:** Docker multi-stage build, Render cloud hosting (`https://peerlearn-frontend-b0zt.onrender.com`).
- Update **3-Tier Architecture Diagram description**:
  - **Client Tier:** React 18 SPA (Dual-Mode Student/Tutor Switcher, Mobile Nav, Student/Tutor Dashboards, Weekly Availability Drawer, Booking Modal with hourly INR fees, Live Session Workspace with Jitsi & 4s Polling, Learning Hub PDF Viewer, Post-Class Interactive Quiz Modal).
  - **Application Tier:** Spring Boot 3.3.5 REST API (Stateless JWT Filter + BCrypt Security, CORS Config, Booking & Deconfliction Service, Async Gmail SMTP Mailer, Multipart `BYTEA` File Service).
  - **Database Tier:** PostgreSQL 14+ (11 3NF Tables, PL/pgSQL Function `fn_reject_conflicting_requests`, Trigger `trg_mark_slot_booked_on_accept`, View `vw_tutor_ratings`, Partial & GIN Full-Text Indexes).

---

### Chapter 3 (Proposed Work & Database Design — Exactly 11 Tables)

#### 3.2 Relational Schema of All 11 Tables (in 3NF)

1. **`users`**
   - Attributes: `id` (BIGSERIAL, PK), `full_name` (VARCHAR), `email` (VARCHAR, UNIQUE), `password_hash` (VARCHAR), `auth_provider` (VARCHAR), `provider_id` (VARCHAR), `title` (VARCHAR), `bio` (TEXT), `avatar_url` (VARCHAR), `learning_streak_weeks` (INT), `teaching_streak_weeks` (INT), `last_login_at` (TIMESTAMP), `created_at` (TIMESTAMP)
   - Purpose: Stores registered student and tutor accounts.

2. **`categories`**
   - Attributes: `id` (BIGSERIAL, PK), `name` (VARCHAR, UNIQUE), `icon` (VARCHAR), `tint` (VARCHAR)
   - Purpose: High-level classification of skills (Programming, Design, Languages, Music).

3. **`skills`**
   - Attributes: `id` (BIGSERIAL, PK), `category_id` (BIGINT, FK → `categories.id`), `name` (VARCHAR, UNIQUE), `tags` (VARCHAR), `base_price_inr` (INT)
   - Purpose: Distinct subjects available for peer learning and tutoring.

4. **`tutor_skills`**
   - Attributes: `id` (BIGSERIAL, PK), `tutor_id` (BIGINT, FK → `users.id`), `skill_id` (BIGINT, FK → `skills.id`), `proficiency_level` (VARCHAR, CHECK: Beginner, Intermediate, Advanced), `hourly_fee_inr` (INT), UNIQUE `(tutor_id, skill_id)`
   - Purpose: Skills a specific tutor offers with custom hourly pricing.

5. **`availability_slots`**
   - Attributes: `id` (BIGSERIAL, PK), `tutor_id` (BIGINT, FK → `users.id`), `day_of_week` (VARCHAR), `slot_time` (VARCHAR), `is_available` (BOOLEAN), UNIQUE `(tutor_id, day_of_week, slot_time)`
   - Purpose: Weekly recurring time slots published by tutors.

6. **`session_requests`**
   - Attributes: `id` (BIGSERIAL, PK), `student_id` (BIGINT, FK → `users.id`), `tutor_id` (BIGINT, FK → `users.id`), `skill_id` (BIGINT, FK → `skills.id`), `slot_id` (BIGINT, FK → `availability_slots.id`), `status` (VARCHAR, CHECK: PENDING, ACCEPTED, REJECTED, WITHDRAWN), `message` (TEXT), `rejection_reason` (VARCHAR), `fee_inr` (INT), `created_at` (TIMESTAMP)
   - Purpose: Student booking requests submitted for a tutor's slot.

7. **`learning_sessions`**
   - Attributes: `id` (BIGSERIAL, PK), `request_id` (BIGINT, FK → `session_requests.id`, UNIQUE), `student_id` (BIGINT, FK → `users.id`), `tutor_id` (BIGINT, FK → `users.id`), `skill_id` (BIGINT, FK → `skills.id`), `slot_id` (BIGINT, FK → `availability_slots.id`), `title` (VARCHAR), `status` (VARCHAR, CHECK: UPCOMING, COMPLETED, CANCELLED), `scheduled_label` (VARCHAR), `scheduled_date` (DATE), `duration_hours` (FLOAT), `meeting_url` (VARCHAR), `fee_inr` (INT), `created_at` (TIMESTAMP)
   - Purpose: Confirmed learning classes with schedule, status, and meeting link.

8. **`session_topics`**
   - Attributes: `id` (BIGSERIAL, PK), `session_id` (BIGINT, FK → `learning_sessions.id`), `topic_name` (VARCHAR), `is_done` (BOOLEAN), `asked_by_student` (BOOLEAN)
   - Purpose: Live tickable agenda items and learning topics covered in class.

9. **`session_messages`**
   - Attributes: `id` (BIGSERIAL, PK), `session_id` (BIGINT, FK → `learning_sessions.id`), `sender_id` (BIGINT, FK → `users.id`), `message_text` (TEXT), `sent_at` (TIMESTAMP)
   - Purpose: Synchronized in-session chat communication.

10. **`reviews`**
    - Attributes: `id` (BIGSERIAL, PK), `session_id` (BIGINT, FK → `learning_sessions.id`, UNIQUE), `student_id` (BIGINT, FK → `users.id`), `tutor_id` (BIGINT, FK → `users.id`), `skill_id` (BIGINT, FK → `skills.id`), `rating` (INT, CHECK 1..5), `comment` (TEXT), `created_at` (TIMESTAMP)
    - Purpose: Post-session student ratings and feedback for tutors.

11. **`study_materials`**
    - Attributes: `id` (BIGSERIAL, PK), `skill_id` (BIGINT, FK → `skills.id`), `uploader_id` (BIGINT, FK → `users.id`), `title` (VARCHAR), `material_type` (VARCHAR), `file_name` (VARCHAR), `content_type` (VARCHAR), `file_size` (BIGINT), `file_data` (BYTEA), `description` (TEXT), `uploaded_at` (TIMESTAMP)
    - Purpose: Uploaded PDF notes, cheatsheets, and slides stored directly as binary blobs (`BYTEA`).

---

#### 3.3 Normalization to 3NF
- **1NF:** Every column contains atomic values (no repeating groups or multi-valued fields).
- **2NF:** All non-prime attributes are fully functionally dependent on the primary key (no partial key dependencies).
- **3NF:** No non-prime attribute depends transitively on the primary key (transitive dependencies like category name or tutor rating are resolved into separate tables `categories` and `reviews` / view `vw_tutor_ratings`).

---

#### 3.4 PostgreSQL Procedural Objects & Indexes

**A. Stored Function — Conflict Deconfliction (`fn_reject_conflicting_requests`):**
```sql
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
```

**B. Trigger — Slot Locking on Request Acceptance (`trg_mark_slot_booked_on_accept`):**
```sql
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

CREATE TRIGGER trg_mark_slot_booked_on_accept
AFTER UPDATE ON session_requests
FOR EACH ROW
EXECUTE FUNCTION fn_mark_slot_booked_on_accept();
```

**C. View — Aggregated Tutor Ratings (`vw_tutor_ratings`):**
```sql
CREATE OR REPLACE VIEW vw_tutor_ratings AS
SELECT
    u.id AS tutor_id,
    u.full_name,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 5.0) AS avg_rating,
    COUNT(r.id) AS review_count
FROM users u
LEFT JOIN reviews r ON u.id = r.tutor_id
GROUP BY u.id, u.full_name;
```

**D. Partial & Full-Text GIN Indexes:**
```sql
CREATE INDEX idx_pending_slot_requests ON session_requests(slot_id) WHERE status = 'PENDING';
CREATE INDEX idx_skills_fts ON skills USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(tags, '')));
CREATE INDEX idx_study_materials_skill ON study_materials(skill_id);
CREATE INDEX idx_study_materials_uploader ON study_materials(uploader_id);
```

---

### Chapter 4 (Results & Interface Modules)
- **Public Modules:** `/` (Landing Page with Feature Cards & 3-Step *How it works*), `/login`, `/register`, `/reset-password`.
- **Shared Module:** `/profile` (Profile bio & avatar editor, password update, active stateless JWT session display).
- **Student Modules:**
  - `/student/home` (Student Dashboard & Calendar)
  - `/student/browse` (Skill Categories with starting `₹/hr` rates)
  - `/student/tutors` (Tutor Search, Best Match ranking, Booking Modal with topic checklist and INR fee)
  - `/student/sessions` (4-second live sync chat & checklists, Jitsi video meeting link, star rating, and **Post-Class Topic Quiz Modal**)
  - `/student/learning` (PDF Study Materials Reader with `BYTEA` download, Interactive Quizzes, and Learning Analytics)
- **Tutor Modules:**
  - `/tutor/home` (Tutor Dashboard, Availability Calendar, Weekly Availability Drawer)
  - `/tutor/skills` (Skill proficiency + custom `hourly_fee_inr` pricing)
  - `/tutor/requests` (Conflict-aware booking requests queue)
  - `/tutor/sessions` (Live checklist/chat + inline Jitsi meeting URL editor)
  - `/tutor/contribute` (Upload PDF study guides up to 10 MB into `study_materials`)
  - `/tutor/insights` (Teaching performance metrics & review feed)

---

### Chapter 5 (Conclusion & Future Enhancements)
- **Conclusion:** Summarize how the 11-table 3NF schema provides optimal performance, clean academic clarity, and full relational integrity with triggers, stored procedures, and views.
- **Future Enhancements:**
  - Payment gateway integration (Razorpay / UPI).
  - WebSocket / STOMP protocol to replace 4-second polling.
  - Native mobile application using React Native.
  - Automated AI flashcard generation from session topics.

---

### Chapter 6 (Bibliography)
- PostgreSQL 14+ Documentation (`https://www.postgresql.org/docs/`)
- Spring Boot 3.3 Reference Documentation (`https://docs.spring.io/spring-boot/`)
- Flyway Database Migrations Documentation (`https://documentation.red-gate.com/fd`)
- React 18, Vite 5 & Tailwind CSS Documentation
- Elmasri & Navathe, *Fundamentals of Database Systems*, 7th Edition, Pearson.
- Silberschatz, Korth & Sudarshan, *Database System Concepts*, 7th Edition, McGraw-Hill.
