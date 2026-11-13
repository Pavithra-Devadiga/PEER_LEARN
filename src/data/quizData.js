// ============================================================================
// PeerLearn Client-Side Static Question Bank (0 Database Tables Needed!)
// Provides rich, interactive topic quizzes without database overhead.
// ============================================================================

export const QUIZ_BANK = {
  'Python Programming': {
    title: 'Python Mastery Check: Scope, Data & OOP',
    questions: [
      {
        id: 'py-1',
        topicTag: 'Mutable Default Arguments',
        question: 'What is the output of modifying a default mutable argument like `def add_item(item, box=[])` across multiple function calls?',
        options: [
          'A new empty list is created on each call',
          'The same list persists and accumulates items across calls',
          'A TypeError is raised at runtime',
          'The box parameter resets to None',
        ],
        correctIndex: 1,
        explanation: 'In Python, default parameter expressions are evaluated once when the function is defined. A mutable default like `box=[]` is shared across all subsequent invocations.',
      },
      {
        id: 'py-2',
        topicTag: 'Scope & LEGB Rule',
        question: 'Which keyword allows modifying a variable bound in an outer (enclosing) function scope in Python?',
        options: ['global', 'nonlocal', 'outer', 'super'],
        correctIndex: 1,
        explanation: '`nonlocal` binds to a variable in the nearest enclosing non-global scope, while `global` targets module-level globals.',
      },
      {
        id: 'py-3',
        topicTag: 'Function Parameters',
        question: 'What do `*args` and `**kwargs` represent in a Python function signature?',
        options: [
          'Pointer references and memory addresses',
          'A tuple of positional arguments and a dictionary of keyword arguments',
          'Required arguments and optional defaults',
          'A list of return values',
        ],
        correctIndex: 1,
        explanation: '`*args` collects extra positional arguments into a tuple, while `**kwargs` collects extra named keyword arguments into a dictionary.',
      },
      {
        id: 'py-4',
        topicTag: 'List Comprehensions',
        question: 'What does `[x * 2 for x in range(5) if x % 2 == 0]` evaluate to in Python?',
        options: ['[0, 2, 4, 6, 8]', '[0, 4, 8]', '[2, 6]', '[0, 2, 4]'],
        correctIndex: 1,
        explanation: 'The even numbers in range(5) are 0, 2, 4. Multiplying each by 2 yields `[0, 4, 8]`.',
      },
      {
        id: 'py-5',
        topicTag: 'Object-Oriented Programming',
        question: 'In Python classes, what is the role of the `self` parameter in method definitions?',
        options: [
          'It refers to the class definition itself like a static variable',
          'It is an explicit reference to the current instance of the class',
          'It imports standard library built-ins into class scope',
          'It is optional and can be omitted in instance methods',
        ],
        correctIndex: 1,
        explanation: 'In Python, `self` represents the instance of the object itself, allowing instance methods to read and write attributes on that specific instance.',
      },
    ],
  },

  'React & Frontend': {
    title: 'React & Modern Frontend Essentials',
    questions: [
      {
        id: 'react-1',
        topicTag: 'Props vs State',
        question: 'What is the key conceptual difference between props and state in React?',
        options: [
          'Props are mutable inside children while state is immutable',
          'Props pass data down from parent (read-only), while state is managed locally inside a component',
          'State never triggers re-renders',
          'Props only work in class components',
        ],
        correctIndex: 1,
        explanation: 'Props are passed from parent to child and should be treated as read-only. State is private, local data managed by the component that triggers re-renders when updated.',
      },
      {
        id: 'react-2',
        topicTag: 'useEffect & Lifecycle',
        question: 'When you pass an empty array `[]` as the dependency array to `useEffect`, when does the effect run?',
        options: [
          'On every state update and keystroke',
          'Once after the initial mount, plus cleanup on component unmount',
          'Never runs',
          'Synchronously before the DOM is painted',
        ],
        correctIndex: 1,
        explanation: 'An empty dependency array indicates no reactive values change, so React runs the effect once after the component mounts and cleans it up when unmounting.',
      },
      {
        id: 'react-3',
        topicTag: 'Component Re-renders',
        question: 'Which of the following will cause a React functional component to re-render?',
        options: [
          'Mutating a local variable declared with let',
          'Calling a state updater function returned by useState',
          'Reading a property on window',
          'Adding a comment inside JSX',
        ],
        correctIndex: 1,
        explanation: 'Calling a state setter (e.g. `setCount(...)`) schedules a re-render so React can reflect updated UI state.',
      },
      {
        id: 'react-4',
        topicTag: 'JSX Rules',
        question: 'Why must JSX expressions have a single parent root element or Fragment `<>...</>`?',
        options: [
          'Browsers only support one HTML tag per document',
          'JSX translates to React.createElement function calls which take one root object',
          'Tailwind CSS classes require single wrappers',
          'React Router will throw a navigation error',
        ],
        correctIndex: 1,
        explanation: 'Under the hood, JSX compiles to JavaScript function calls (`React.createElement(...)`), which can only return a single expression value.',
      },
    ],
  },

  'SQL & Database Design': {
    title: 'SQL, Normalization & Relational Design',
    questions: [
      {
        id: 'sql-1',
        topicTag: 'Normalization (3NF)',
        question: 'Which condition defines Third Normal Form (3NF)?',
        options: [
          'The table has no duplicate rows',
          'The table is in 2NF and has no transitive dependencies between non-key attributes',
          'All columns contain comma-separated text',
          'Every column is indexed with a B-tree',
        ],
        correctIndex: 1,
        explanation: 'A relation is in 3NF if it is in 2NF and every non-prime attribute depends solely on the candidate key with no transitive dependencies (X -> Y -> Z).',
      },
      {
        id: 'sql-2',
        topicTag: 'JOINs & Relationships',
        question: 'What is the key difference between INNER JOIN and LEFT OUTER JOIN?',
        options: [
          'INNER JOIN is always slower than LEFT JOIN',
          'INNER JOIN only returns matching rows from both tables; LEFT JOIN returns all left rows, filling unmatched right columns with NULL',
          'LEFT JOIN deletes rows from the right table',
          'INNER JOIN requires a composite primary key',
        ],
        correctIndex: 1,
        explanation: 'INNER JOIN filters out non-matching rows on both sides. LEFT JOIN keeps all rows from the left table and inserts NULL for any missing right-side matches.',
      },
      {
        id: 'sql-3',
        topicTag: 'Aggregations & HAVING',
        question: 'When should the `HAVING` clause be used instead of `WHERE` in a SQL query?',
        options: [
          'When filtering on raw row values before grouping',
          'When filtering the results of aggregate functions (like COUNT, AVG, SUM) after GROUP BY',
          'When sorting query results in descending order',
          'When joining three or more tables',
        ],
        correctIndex: 1,
        explanation: '`WHERE` filters individual rows before grouping; `HAVING` filters the aggregated groups created by `GROUP BY`.',
      },
      {
        id: 'sql-4',
        topicTag: 'Triggers & Procedures',
        question: 'What is the primary advantage of a database trigger in a relational database?',
        options: [
          'It replaces the need for primary keys',
          'It automatically executes logic in response to INSERT, UPDATE, or DELETE operations to enforce business rules and data consistency',
          'It speeds up web page styling',
          'It stores files directly as text',
        ],
        correctIndex: 1,
        explanation: 'Triggers run automatically in the database engine whenever targeted DML events occur, ensuring business rules and integrity are enforced regardless of which application client updates the data.',
      },
    ],
  },

  'Data Structures & Algorithms': {
    title: 'Data Structures & Algorithmic Complexity',
    questions: [
      {
        id: 'algo-1',
        topicTag: 'Time Complexity (Big-O)',
        question: 'What is the worst-case time complexity of Binary Search on a sorted array of N elements?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctIndex: 1,
        explanation: 'Binary Search halves the remaining search range on every comparison step, resulting in logarithmic time O(log N).',
      },
      {
        id: 'algo-2',
        topicTag: 'Stacks & Queues',
        question: 'Which ordering principle does a standard Queue data structure follow?',
        options: [
          'LIFO (Last-In, First-Out)',
          'FIFO (First-In, First-Out)',
          'Random Access',
          'Priority Order always',
        ],
        correctIndex: 1,
        explanation: 'A standard queue processes elements in the order they arrived: First-In, First-Out (FIFO).',
      },
      {
        id: 'algo-3',
        topicTag: 'Hash Tables',
        question: 'What is the average time complexity for searching an element in a well-distributed Hash Table?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        correctIndex: 0,
        explanation: 'With a good hash function and reasonable load factor, hash table lookups take constant time O(1) on average.',
      },
    ],
  },

  'Figma UI/UX Design': {
    title: 'Figma Auto-Layout & Design Systems Check',
    questions: [
      {
        id: 'figma-1',
        topicTag: 'Auto-Layout Resizing',
        question: 'Which resizing option causes a child layer inside an Auto-Layout frame to expand to fill all remaining horizontal space?',
        options: ['Hug contents', 'Fill container', 'Fixed width', 'Scale'],
        correctIndex: 1,
        explanation: '`Fill container` instructs the child layer to stretch and occupy whatever space remains in the parent frame along that axis.',
      },
      {
        id: 'figma-2',
        topicTag: 'Frames vs Groups',
        question: 'Why are Frames preferred over regular Groups when building responsive user interface components?',
        options: [
          'Groups cannot contain text layers',
          'Frames support Auto-Layout gap, internal padding, clipping, and responsive constraints',
          'Frames only export in vector formats',
          'Groups prevent color changes',
        ],
        correctIndex: 1,
        explanation: 'Frames act like HTML/CSS flex containers with independent padding, alignment, clipping, and layout flow, whereas Groups are simple bounding boxes.',
      },
    ],
  },

  'Acoustic & Electric Guitar': {
    title: 'Guitar Chords, Rhythm & Technique',
    questions: [
      {
        id: 'guitar-1',
        topicTag: 'Barre Chords',
        question: 'Which technique uses the index finger pressed flat across all six strings on a fret to play movable chord shapes?',
        options: ['Hammer-on', 'Palm muting', 'Barre chord', 'Harmonic tap'],
        correctIndex: 2,
        explanation: 'A barre chord uses your index finger like a movable capo across the fretboard (e.g. F major and B minor).',
      },
      {
        id: 'guitar-2',
        topicTag: 'Tuning & Strings',
        question: 'What is standard guitar tuning from lowest pitch (thickest 6th string) to highest pitch (thinnest 1st string)?',
        options: ['D A D G B E', 'E A D G B E', 'C G C F A D', 'E B G D A E'],
        correctIndex: 1,
        explanation: 'Standard guitar tuning is E - A - D - G - B - E.',
      },
    ],
  },
};

export function getQuizForSkill(skillName) {
  if (!skillName) {
    return QUIZ_BANK['Python Programming'];
  }
  const clean = skillName.trim().toLowerCase();
  for (const [key, value] of Object.entries(QUIZ_BANK)) {
    if (key.toLowerCase().includes(clean) || clean.includes(key.toLowerCase())) {
      return value;
    }
  }
  // Fallback to first available quiz
  return QUIZ_BANK['Python Programming'];
}
