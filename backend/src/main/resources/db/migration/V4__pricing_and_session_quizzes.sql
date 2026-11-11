-- V4: Affordable INR Pricing & Post-Class Topic-Matched Quizzes

ALTER TABLE skills
    ADD COLUMN IF NOT EXISTS base_price_inr INT NOT NULL DEFAULT 99 CHECK (base_price_inr >= 0 AND base_price_inr <= 2000);

ALTER TABLE tutor_skills
    ADD COLUMN IF NOT EXISTS hourly_fee_inr INT NOT NULL DEFAULT 99 CHECK (hourly_fee_inr >= 0 AND hourly_fee_inr <= 2000);

ALTER TABLE session_requests
    ADD COLUMN IF NOT EXISTS fee_inr INT NOT NULL DEFAULT 99;

ALTER TABLE learning_sessions
    ADD COLUMN IF NOT EXISTS fee_inr INT NOT NULL DEFAULT 99;

ALTER TABLE quiz_attempts
    ADD COLUMN IF NOT EXISTS session_id BIGINT REFERENCES learning_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session ON quiz_attempts(session_id);

-- Set low-cost student-friendly INR rates for catalog skills (idempotent on already-seeded DBs)
UPDATE skills SET base_price_inr = 79 WHERE LOWER(name) LIKE '%python%';
UPDATE skills SET base_price_inr = 99 WHERE LOWER(name) LIKE '%react%';
UPDATE skills SET base_price_inr = 129 WHERE LOWER(name) LIKE '%data structures%';
UPDATE skills SET base_price_inr = 89 WHERE LOWER(name) LIKE '%sql%';
UPDATE skills SET base_price_inr = 89 WHERE LOWER(name) LIKE '%figma%';
UPDATE skills SET base_price_inr = 79 WHERE LOWER(name) LIKE '%branding%';
UPDATE skills SET base_price_inr = 119 WHERE LOWER(name) LIKE '%motion%';
UPDATE skills SET base_price_inr = 69 WHERE LOWER(name) LIKE '%spanish%';
UPDATE skills SET base_price_inr = 99 WHERE LOWER(name) LIKE '%japanese%';
UPDATE skills SET base_price_inr = 69 WHERE LOWER(name) LIKE '%french%';
UPDATE skills SET base_price_inr = 79 WHERE LOWER(name) LIKE '%guitar%';
UPDATE skills SET base_price_inr = 89 WHERE LOWER(name) LIKE '%piano%';
UPDATE skills SET base_price_inr = 119 WHERE LOWER(name) LIKE '%music production%';

UPDATE tutor_skills ts
SET hourly_fee_inr = LEAST(299, s.base_price_inr + CASE WHEN ts.proficiency_level = 'Advanced' THEN 20 ELSE 0 END)
FROM skills s
WHERE ts.skill_id = s.id
  AND ts.hourly_fee_inr = 99
  AND s.base_price_inr <> 99;

UPDATE session_requests sr
SET fee_inr = ts.hourly_fee_inr
FROM tutor_skills ts
WHERE sr.tutor_id = ts.tutor_id
  AND sr.skill_id = ts.skill_id
  AND sr.fee_inr = 99;

UPDATE learning_sessions ls
SET fee_inr = ts.hourly_fee_inr
FROM tutor_skills ts
WHERE ls.tutor_id = ts.tutor_id
  AND ls.skill_id = ts.skill_id
  AND ls.fee_inr = 99;

-- Ensure quizzes exist for React, Guitar, and DSA if those skills already exist
INSERT INTO quizzes (skill_id, title)
SELECT s.id, s.name || ' Mastery Check'
FROM skills s
WHERE LOWER(s.name) IN (
    'react & frontend',
    'acoustic & electric guitar',
    'data structures & algorithms',
    'conversational spanish'
)
AND NOT EXISTS (SELECT 1 FROM quizzes q WHERE q.skill_id = s.id);

-- Add topic-tagged questions for Python, React, Figma, SQL, Guitar, and DSA (skipped if already present)
INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_index, explanation, topic_tag)
SELECT q.id,
       v.q_text, v.opt_a, v.opt_b, v.opt_c, v.opt_d, v.correct_idx, v.expl, v.t_tag
FROM (
    VALUES
    ('Python Programming',
     'Which Python data structure preserves insertion order and stores key-value pairs with O(1) average lookup?',
     'tuple', 'dict', 'set', 'frozenset', 1,
     'Dictionaries (dict) map unique keys to values with average O(1) hash-table lookup and preserve insertion order in Python 3.7+.',
     'Variables, Data Types & Operators'),
    ('Python Programming',
     'Which statement immediately skips the rest of the current loop iteration and moves to the next item?',
     'break', 'pass', 'continue', 'return', 2,
     '`continue` jumps to the next iteration of a `for` or `while` loop, whereas `break` exits the loop completely.',
     'Conditionals & Logic Loops'),
    ('Python Programming',
     'What does `[x * 2 for x in range(4) if x % 2 == 0]` evaluate to in Python?',
     '[0, 2, 4, 6]', '[0, 4]', '[2, 6]', '[0, 2, 4]', 1,
     'Only `0` and `2` pass `x % 2 == 0`, producing `[0*2, 2*2]` which is `[0, 4]`.',
     'List Comprehensions'),
    ('React & Frontend',
     'What is the key difference between props and state in a React component?',
     'Props are mutable internally while state is strictly read-only',
     'Props are passed down from a parent while state is managed locally inside the component',
     'State cannot trigger re-renders while props always do',
     'Props only work in class components', 1,
     'Props flow top-down from parent to child and are read-only inside the child, whereas state holds local interactive data.',
     'Props vs State'),
    ('React & Frontend',
     'When you pass an empty dependency array `[]` to `useEffect(fn, [])`, when does the effect run?',
     'On every single keystroke',
     'Only once after the initial mount (with cleanup on unmount)',
     'Never',
     'Before the DOM renders', 1,
     'An empty dependency array `[]` tells React to run the effect once after initial mount and execute any returned cleanup on unmount.',
     'useEffect & Lifecycle Syncing'),
    ('Figma UI/UX Design',
     'In Figma, why should you prefer Frames (with Auto-Layout) over regular Groups for responsive UI cards?',
     'Groups cannot contain text layers',
     'Frames support padding, spacing gaps, clipping, and responsive resizing rules',
     'Groups automatically export as PDF',
     'Frames forbid nested components', 1,
     'Frames support Auto-layout gap, padding, constraints, and Hug/Fill resizing; Groups just act as bounding containers.',
     'Auto-layout padding & gap'),
    ('Figma UI/UX Design',
     'Which Figma Auto-Layout sizing makes a card wrap tightly around the exact dimensions of its inner text?',
     'Fill container', 'Fixed height', 'Hug contents', 'Absolute position', 2,
     'Hug contents shrinks or expands the parent frame to match the size of its children plus padding.',
     'Hug, Fill, Fixed resizing'),
    ('SQL & Database Design',
     'Which SQL JOIN returns all rows from the left table and matched rows from the right table (or NULL if no match)?',
     'INNER JOIN', 'CROSS JOIN', 'LEFT JOIN', 'SELF JOIN', 2,
     'LEFT JOIN keeps every row from the left table and fills unmatched columns from the right table with NULL.',
     'JOINs & Subqueries'),
    ('Acoustic & Electric Guitar',
     'Which technique uses the index finger pressed flat across all six strings on a fret to move chord shapes up the neck?',
     'Hammer-on', 'Palm muting', 'Barre chord', 'Harmonic', 2,
     'A barre chord uses the index finger across the fretboard (like a movable capo) to play F, B minor, and movable shapes.',
     'Barre Chords (F & B minor)'),
    ('Data Structures & Algorithms',
     'What is the worst-case time complexity of searching for a target value using Binary Search on a sorted array of N elements?',
     'O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 1,
     'Binary search halves the remaining search interval each step, giving O(log N) worst-case time complexity.',
     'Time & Space Complexity (Big-O)')
) AS v(skill_name, q_text, opt_a, opt_b, opt_c, opt_d, correct_idx, expl, t_tag)
JOIN skills s ON LOWER(s.name) = LOWER(v.skill_name)
JOIN quizzes q ON q.skill_id = s.id
WHERE NOT EXISTS (
    SELECT 1 FROM quiz_questions existing
    WHERE existing.quiz_id = q.id
      AND existing.question_text = v.q_text
);
