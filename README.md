# PeerLearn 🎓

> **Learn one skill, teach another.**  
> A peer-to-peer skill exchange platform for students with zero admin friction.

---

## 🌟 Key Features

- **Single Dual-Role Account:** Every student can learn and teach. Flip between Student mode and Tutor mode with a single toggle.
- **Student Mode (Violet Accent):**
  - **Dashboard:** Learning streak, hours learned, next sessions, skill progress, and milestones.
  - **Browse Skills & Tutors:** Search by subject, view pinned "Recommended Best Match", inspect tutor availability, and request 1-on-1 sessions.
  - **My Sessions:** Track pending, upcoming, and completed sessions with built-in chat and read-only topic checklists.
  - **Learning Hub:** Curated cheatsheets, interactive quizzes with instant answer feedback, and personalized focus areas.
- **Tutor Mode (Green Accent):**
  - **Dashboard:** Teaching streaks, hours taught, incoming request summaries, and availability overview.
  - **My Skills:** Add skills with proficiency levels without approval workflows; view shared standard curricula.
  - **Requests Queue:** Grouped by time slot with automated conflict resolution (accepting one booking cleanly auto-rejects colliding requests).
  - **Live Sessions:** Interactive tickable checklists, impromptu topic additions, and integrated chat.
  - **Availability Drawer:** Weekly template editor for recurring 1-hour slots.
  - **Contribute & Insights:** Review AI-seeded materials and analyze student ratings/booking demand trends.
- **Design System:** Soft neo-brutalist / reference aesthetic with full light & dark theme support.
- **Developer Auth Bypass:** Floating switch at development time to prevent repetitive sign-ins while pair programming.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
git clone https://github.com/riti2043/PeerLearn.git
cd PeerLearn
npm install
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
npm run preview
```
