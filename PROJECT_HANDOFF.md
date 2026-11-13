# PeerLearn — Project Overview, Maintenance Rules & Deployment Handoff

> Use this file as context for any AI assistant or developer helping deploy, maintain, or extend **PeerLearn**.  
> **Contains zero secrets** — all credentials belong in hosting environment variables or git-ignored `application-local.properties`.

---

## 1. What PeerLearn Is

**PeerLearn** is a full-stack student-to-student skill-exchange web application (*"Learn one skill, teach another"*) backed by a **3NF PostgreSQL 14+ relational database** managed with **Flyway**, a **Spring Boot 3.3.5 (Java 17)** REST API, and a **React 18 + Vite 5 + Tailwind CSS v3** SPA.

One account acts as both **Student** and **Tutor** (switched via the top bar `ModeToggle`), with dedicated views, PostgreSQL session tracking, clash-free slot scheduling, live checklists/chat, file uploads, and automated Gmail SMTP notifications.

---

## 2. Tech Stack & Exact Versions

- **Frontend (`package.json`):**
  - React `18.3.1`, React Router DOM `6.27.0` (`BrowserRouter`)
  - Vite `5.4.9`, Tailwind CSS `3.4.14`, Lucide React `0.453.0`
  - Soft neo-brutalist theme (`Outfit` Google font + CSS variables for Light/Dark and Student/Tutor modes in `src/index.css`), responsive down to `320px–480px` mobile screens (`html, body` set to `overflow-x: hidden; max-width: 100%`).
- **Backend (`backend/pom.xml`):**
  - Java `17`, Spring Boot `3.3.5` (`peerlearn-backend-1.0.0.jar`)
  - Spring Web, Spring Data JPA (Hibernate), Spring Security (`STATELESS` JWT + BCrypt, `jjwt` `0.12.6`), Validation, Spring Mail (`spring-boot-starter-mail`), `@EnableAsync`
  - PostgreSQL JDBC Driver, Flyway (`flyway-core` + `flyway-database-postgresql`)
- **Database:**
  - PostgreSQL `14+`, normalized across **11 tables** (3NF, fulfilling Part B DBMS Mini-Project requirements: $\ge 5$ tables, trigger, stored procedure, view), versioned via Flyway migrations (`V1`–`V5`) with reference DDL at `backend/database/schema_postgres.sql`.

---

## 3. Repository Structure & Key Files

### Frontend (`src/`)
- `src/lib/api.js` — Reads `import.meta.env.VITE_API_BASE_URL || ''`. Sends `Authorization: Bearer <token>` on `apiRequest()` and `fetchAttachmentBlob()`, and dispatches `peerlearn:unauthorized` on HTTP `401`.
- `vite.config.js` — Local dev server proxies `/api` to `http://localhost:8080`.
- `vercel.json` — Production SPA rewrite (`/(.*) -> /index.html`) so direct routes (`/login`, `/reset-password?token=...`, `/student/home`) work on Vercel.
- `src/App.jsx` — All routes:
  - **Public:** `/`, `/login`, `/register`, `/reset-password`
  - **Protected Shared:** `/profile` (bio, avatar, password change, active JWT sessions table & revoke)
  - **Student Mode:** `/student/home`, `/student/browse`, `/student/tutors`, `/student/sessions`, `/student/learning`
  - **Tutor Mode:** `/tutor/home`, `/tutor/skills`, `/tutor/requests`, `/tutor/sessions`, `/tutor/contribute`, `/tutor/insights`
- **Key Components (`src/components/primitives/`):**
  - `TopBar.jsx`, `ModeToggle.jsx`, `AppShell.jsx` (includes scrollable `md:hidden` mobile navigation pill bar)
  - `Calendar.jsx`, `AvailabilityDrawer.jsx` (weekly tutor availability manager)
  - `RequestSessionModal.jsx` (dynamic `topicsBySkill`, hourly INR fee preview, note to tutor)
  - `PostClassQuizModal.jsx` (post-class quiz matched to session-covered topics)
  - `MaterialAttachmentViewer.jsx` (previews/downloads `BYTEA` blobs from `/api/...` via `fetchAttachmentBlob`)

### Backend (`backend/`)
- `backend/Dockerfile` — Multi-stage build (`maven:3.9.9-eclipse-temurin-17-alpine` → `eclipse-temurin:17-jre-alpine`, `ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xss512k", "-Xmx384m", "-jar", "app.jar"]`).
- `backend/src/main/resources/application.properties` — Main runtime config reading environment variables with local fallbacks.
- `backend/src/main/resources/application-local.properties` — **Git-ignored** local secrets file (never commit).
- `backend/src/main/java/com/peerlearn/config/SecurityConfig.java` — Stateless security filter chain, JWT filter (`JwtAuthFilter`), CORS configuration trimming whitespace and trailing slashes from `app.cors.allowed-origins`.
- `backend/src/main/java/com/peerlearn/controller/AuthController.java` — `/api/health`, `/api/auth/register`, `/api/auth/login`, `/api/auth/demo`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/sessions`, `/api/profile`.
- `backend/src/main/java/com/peerlearn/service/AuthService.java` — Registration, BCrypt login, demo account login (`hannah.student@university.edu`), session management (`user_sessions`), password reset tokens (`password_reset_tokens`, 30-min expiry), uses `app.frontend.url` to generate reset links.
- `backend/src/main/java/com/peerlearn/service/EmailNotificationService.java` — Optional email helper for password-reset emails via `MimeMessageHelper` (`UTF-8`). Registration does not send emails, ensuring zero setup friction.

### Flyway Migrations (`backend/src/main/resources/db/migration/`)
1. `V1__initial_schema.sql` — Core initial schema.
2. `V2__dbms_enhancements.sql` — Triggers (`trg_mark_slot_booked_on_accept`), stored function `fn_reject_conflicting_requests`, view `vw_tutor_ratings`, partial & GIN full-text indexes.
3. `V3__material_attachments.sql` — Initial attachment storage.
4. `V4__pricing_and_session_quizzes.sql` — INR fee columns.
5. `V5__simplify_to_11_tables.sql` — Streamlines schema down to exactly **11 tables** (`users`, `categories`, `skills`, `tutor_skills`, `availability_slots`, `session_requests`, `learning_sessions`, `session_topics`, `session_messages`, `reviews`, `study_materials`). Quizzes run via zero-DB static question bank in `src/data/quizData.js`.

---

## 4. Implemented Features That Must Be Preserved

1. **Stateless JWT Auth + PostgreSQL Revocation:**
   - Google/GitHub OAuth2 was intentionally removed; authentication is strictly local email/password + `Bearer` JWT (`jti` stored in `user_sessions`), with `clearSessionCookie` clearing any stale `JSESSIONID`.
   - Logging out, revoking a device in Profile, or resetting a password revokes tokens in PostgreSQL `user_sessions`.
2. **Gmail SMTP Welcome & Reset Emails:**
   - Triggered on `/api/auth/register` and `/api/auth/forgot-password`.
   - Displays sender name **`PeerLearn`** (`app.mail.from-name=${MAIL_FROM_NAME:PeerLearn}`) while authenticating with `spring.mail.username` + 16-character Google App Password.
   - Email failures log warnings and never crash registration.
3. **INR Skill Pricing & Clash-Free Booking:**
   - Fees are stored in INR (`₹69–₹149/hr` defaults, editable per skill by tutors in `/tutor/skills`) without any payment gateway integration.
   - Accepting a request triggers PostgreSQL `fn_reject_conflicting_requests` and `trg_mark_slot_booked_on_accept`.
4. **Live Session Sync, Files & Quizzes:**
   - Accepted sessions auto-create Jitsi links (`https://meet.jit.si/peerlearn-...`, editable inline by tutor) and poll every 4 seconds for chat & checklist sync.
   - Study documents/PDFs/images upload up to **10 MB** (`spring.servlet.multipart.max-file-size=10MB`, `max-request-size=12MB`) into PostgreSQL `material_attachments` (`BYTEA`), previewable via `MaterialAttachmentViewer`.
   - Completed sessions unlock topic-matched `PostClassQuizModal` quizzes.

---

## 5. Crucial Precautions & Maintenance Rules

### A. Email Hosting Gotcha (VERY IMPORTANT)
- **Render Free** and **Railway Free/Trial/Hobby** **block outbound SMTP ports (`25`, `465`, `587`)**. Deploying the backend as-is to Render Free or Railway Free will cause Gmail SMTP (`smtp.gmail.com:587`) to time out (`ETIMEDOUT`), breaking welcome and password-reset emails.
- **Keep Gmail SMTP working as-is:** Host the backend Docker container on a provider that allows outbound **port `587`** (e.g., **Koyeb Free Starter**, a VPS like Oracle Cloud / AWS EC2 / DigitalOcean, or a paid Render/Railway tier).
- **Alternative if you must use Render Free:** Modify `EmailNotificationService.java` to call a transactional HTTP email API over port `443` (e.g., Brevo or Resend) instead of `JavaMailSender` SMTP.

### B. Database & Flyway Precautions
- **Direct Connection vs Pooler (e.g., Neon):** Use a **Direct PostgreSQL connection string** (on Neon, host *without* `-pooler`, plus `?sslmode=require`) because Flyway uses PostgreSQL advisory locks (`pg_advisory_lock`) during startup migrations.
- **Never disable Flyway or use `ddl-auto=create-drop`:** Keep `spring.jpa.hibernate.ddl-auto=update`, `spring.flyway.enabled=true`, `baseline-on-migrate=true`, `baseline-version=1`, and never modify applied `V1`–`V4` SQL files without adding a `V5__...` migration.
- **Storage Budget:** Because uploaded PDFs/images are saved as `BYTEA` inside PostgreSQL (`material_attachments`), monitor free-tier DB storage limits (typically 500 MB–1 GB).

### C. Security, CORS & URL Hygiene
- **Never commit secrets:** Ensure `backend/src/main/resources/application-local.properties` and `.env*` stay untracked (`.gitignore` already ignores `*.local`, `application-local.properties`, `.env`).
- **Rotate `JWT_SECRET` in production:** Do not use the default fallback `app.jwt.secret` from `application.properties` in a public deployment; generate a strong random 32+ char `JWT_SECRET` env var.
- **No trailing slashes in URL env vars:** Set `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, and `VITE_API_BASE_URL` **without** a trailing `/` (e.g., `https://peerlearn.vercel.app`). `SecurityConfig` already trims commas/trailing slashes for CORS, and `FRONTEND_URL` is concatenated directly before `/reset-password?token=...`.

### D. Container Memory & SPA Routing
- **512 MB RAM Free Containers:** `backend/Dockerfile` sets `-Xmx384m` with `-XX:+UseSerialGC` specifically so Spring Boot stays inside 512 MB RAM limits on Koyeb/Render free instances. Do not remove this heap cap unless deploying to a 1 GB+ container.
- **SPA Routing:** `BrowserRouter` requires rewrite fallback to `/index.html`. `vercel.json` handles this for Vercel; if switching to Netlify, Cloudflare Pages, or Nginx, add an equivalent `_redirects` / fallback rewrite rule.

---

## 6. Environment Variables Checklist for Any Deployment Platform

### Backend Environment Variables (`backend/Dockerfile`)
| Variable | Purpose | Example / Production Guidance |
|---|---|---|
| `PORT` | HTTP port bound by Tomcat | `8080` (or injected automatically by host) |
| `DB_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://<host>/<db>?sslmode=require` |
| `DB_USERNAME` | PostgreSQL username | `<db-user>` |
| `DB_PASSWORD` | PostgreSQL password | `<db-password>` |
| `JWT_SECRET` | HS256 JWT signing key (256-bit+) | `<random-32+-char-secret>` |
| `MAIL_HOST` | SMTP host *(optional override)* | `smtp.gmail.com` (default) |
| `MAIL_PORT` | SMTP port *(optional override)* | `587` (default) |
| `MAIL_USERNAME` | Gmail address sending emails | `<your-gmail>@gmail.com` |
| `MAIL_PASSWORD` | 16-char Google App Password | `<16-char-app-password>` |
| `MAIL_FROM_NAME` | Visible sender name in inbox | `PeerLearn` (default) |
| `FRONTEND_URL` | Used in email CTA & reset links | `https://<your-frontend-domain>` |
| `CORS_ALLOWED_ORIGINS` | Allowed browser origins (comma-separated) | `https://<your-frontend-domain>` |

### Frontend Environment Variables (`npm run build`)
| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL baked into Vite bundle | `https://<your-backend-domain>` |

---

## 7. Quick Verification Endpoints & Flows After Deploying

1. `GET https://<backend-domain>/api/health` → returns `{"status":"OK","backend":"Spring Boot","database":"PostgreSQL"}`.
2. Open `https://<frontend-domain>` → verify Landing hero, Features, How it works, Light/Dark toggle, and phone layout (`375px`).
3. Sign in with Demo Account (`Hannah`) or register a new email → confirm **Welcome email** arrives from **`PeerLearn`** with a link to `https://<frontend-domain>`.
4. Click **Forgot password** → confirm reset email arrives and `/reset-password?token=...` loads cleanly without a `404`.
5. Test uploading/opening a PDF/image attachment in Tutor Contribute / Student Learning Hub and toggling a session check/chat message.
