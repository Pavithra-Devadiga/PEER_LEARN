export const placeholderData = {
  student: {
    name: 'Hannah',
    welcomeSubtitle: "You're on track to achieve your monthly learning goal. Keep the momentum going!",
    stats: [
      { label: 'Streak (wks)', value: '3', hint: 'Consecutive weeks' },
      { label: 'Sessions', value: '12', hint: 'Completed sessions' },
      { label: 'Hours', value: '18', hint: 'Hours learned' },
      { label: 'Skills tried', value: '5', hint: 'Unique topics' },
      { label: 'Quiz avg', value: '85%', hint: 'Score average' },
    ],
    nextSessions: [
      {
        id: 'ns-1',
        title: 'Python basics',
        time: 'Tue 4 pm',
        date: 'Oct 28',
        tutor: 'Marcus Vance',
        category: 'Programming',
        tint: 'violet',
      },
      {
        id: 'ns-2',
        title: 'Guitar Chords & Rhythm',
        time: 'Fri 6 pm',
        date: 'Oct 31',
        tutor: 'Elena Rostova',
        category: 'Music',
        tint: 'blue',
      },
    ],
    skillProgress: [
      {
        skill: 'Python Basics',
        covered: 5,
        total: 8,
        percentage: 62,
        nextTopic: 'Object-Oriented Programming (Classes)',
      },
      {
        skill: 'Figma UI/UX Prototyping',
        covered: 4,
        total: 6,
        percentage: 67,
        nextTopic: 'Component Variants & Auto-layout',
      },
      {
        skill: 'Conversational Spanish',
        covered: 2,
        total: 10,
        percentage: 20,
        nextTopic: 'Past Tenses (Pretérito vs Imperfecto)',
      },
    ],
    badges: [
      { id: 'b1', name: 'First session', icon: '🌱', desc: 'Completed your first peer session' },
      { id: 'b2', name: '5 sessions', icon: '⚡', desc: 'Maintained active peer learning' },
      { id: 'b3', name: 'Quiz master', icon: '🎯', desc: 'Scored 90%+ in 3 consecutive quizzes' },
      { id: 'b4', name: 'Polymath', icon: '🎨', desc: 'Explored skills across 3 disciplines' },
    ],
    calendarSessions: [
      { day: 4, label: 'Python basics', time: '4:00 PM', tutor: 'Marcus V.' },
      { day: 9, label: 'Figma Auto-layout', time: '2:30 PM', tutor: 'Aria S.' },
      { day: 19, label: 'Guitar Chords', time: '6:00 PM', tutor: 'Elena R.' },
    ],
  },

  tutor: {
    name: 'Hannah',
    welcomeSubtitle: 'You have 3 incoming session requests waiting for your confirmation.',
    stats: [
      { label: 'Teaching streak', value: '4', hint: 'Weeks active' },
      { label: 'Sessions taught', value: '20', hint: 'Completed sessions' },
      { label: 'Hours taught', value: '26', hint: 'Total tutoring time' },
      { label: 'Students', value: '9', hint: 'Unique learners' },
      { label: 'Avg rating', value: '4.8', hint: 'Based on 19 reviews' },
    ],
    pendingRequestsSummary: {
      slot: 'Tue 4 pm',
      count: 3,
      skill: 'Python Basics',
      note: 'Tue 4 pm: 3 requests, Accept or Reject',
    },
    skillsTaught: [
      { name: 'Python', level: 'Advanced', rating: 4.9, sessionsTaught: 14, category: 'Programming' },
      { name: 'Guitar', level: 'Intermediate', rating: 4.7, sessionsTaught: 6, category: 'Music' },
      { name: 'React & Frontend', level: 'Intermediate', rating: 4.8, sessionsTaught: 5, category: 'Web Dev' },
    ],
    recentReviews: [
      {
        id: 'rev-1',
        student: 'Liam C.',
        skill: 'Python',
        rating: 5,
        date: '2 days ago',
        comment: 'Hannah explained recursion and list comprehensions so clearly! Made everything click.',
      },
      {
        id: 'rev-2',
        student: 'Sophie K.',
        skill: 'Guitar',
        rating: 5,
        date: '1 week ago',
        comment: 'Super patient tutor. Helped me transition between barre chords cleanly.',
      },
    ],
    calendarAvailability: {
      // States: 'free' | 'booked' | 'requests'
      freeDays: [2, 16],
      bookedDays: [9],
      requestDays: [4, 11, 18],
      bookedSlotList: [
        { day: 'Tue 4 pm', skill: 'Python', student: 'Marcus Vance', status: 'Booked' },
        { day: 'Thu 5 pm', skill: 'Guitar', student: 'Chloe Zhang', status: 'Booked' },
      ]
    }
  },

  categories: [
    {
      name: 'Programming & CS',
      icon: 'Code',
      tint: 'violet',
      skills: [
        { id: 'py', name: 'Python Programming', tutorCount: 14, tags: ['Basics', 'OOP', 'Data'] },
        { id: 'react', name: 'React & Frontend', tutorCount: 11, tags: ['Hooks', 'Vite', 'Tailwind'] },
        { id: 'algo', name: 'Data Structures & Algorithms', tutorCount: 8, tags: ['Trees', 'Graphs', 'Big-O'] },
        { id: 'sql', name: 'SQL & Database Design', tutorCount: 7, tags: ['MySQL', 'Schema', 'Indexing'] },
      ]
    },
    {
      name: 'Design & Creative',
      icon: 'Palette',
      tint: 'yellow',
      skills: [
        { id: 'figma', name: 'Figma UI/UX Design', tutorCount: 12, tags: ['Auto-layout', 'Wireframes', 'Systems'] },
        { id: 'graphic', name: 'Visual Branding & Typography', tutorCount: 6, tags: ['Posters', 'Brand Kits'] },
        { id: 'motion', name: 'Motion Design Basics', tutorCount: 4, tags: ['After Effects', 'Lottie'] },
      ]
    },
    {
      name: 'Languages',
      icon: 'Globe',
      tint: 'green',
      skills: [
        { id: 'spanish', name: 'Conversational Spanish', tutorCount: 9, tags: ['A1-B2', 'Grammar', 'Speaking'] },
        { id: 'japanese', name: 'Japanese (Hiragana & Kanji)', tutorCount: 5, tags: ['JLPT N5', 'Kanji'] },
        { id: 'french', name: 'French Conversation', tutorCount: 6, tags: ['Pronunciation', 'Culture'] },
      ]
    },
    {
      name: 'Music & Arts',
      icon: 'Music',
      tint: 'peach',
      skills: [
        { id: 'guitar', name: 'Acoustic & Electric Guitar', tutorCount: 8, tags: ['Chords', 'Fingerstyle'] },
        { id: 'piano', name: 'Piano & Keyboard Basics', tutorCount: 5, tags: ['Sheet Music', 'Scales'] },
        { id: 'prod', name: 'Music Production (Ableton)', tutorCount: 4, tags: ['Beats', 'Mixing'] },
      ]
    }
  ],

  tutorsList: [
    {
      id: 'tutor-1',
      name: 'Sarah Jenkins',
      title: 'CS Junior • Lead Python TA',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      proficiency: 'Advanced',
      rating: 4.8,
      reviewCount: 42,
      freeDays: 'Tue / Thu',
      recommended: true,
      recommendReason: '4.8★, free Tue/Thu • 100% completion rate with beginners',
      bio: "Hey! I'm a third-year CS student who loves demystifying code. I break down data structures and Python logic into visual analogies that stick.",
      skillsTaught: ['Python', 'SQL', 'Algorithms'],
      availabilitySlots: [
        { id: 's1', day: 'Tuesday', time: '4:00 PM - 5:00 PM', available: true },
        { id: 's2', day: 'Tuesday', time: '5:30 PM - 6:30 PM', available: true },
        { id: 's3', day: 'Thursday', time: '3:00 PM - 4:00 PM', available: true },
        { id: 's4', day: 'Thursday', time: '4:30 PM - 5:30 PM', available: false },
      ],
      topicsList: [
        'Variables, Data Types & Operators',
        'Conditionals & Logic Loops',
        'Functions & Scope',
        'Lists, Dictionaries & Tuples',
        'Object-Oriented Programming (Classes)',
        'File I/O & Exception Handling',
        'Libraries (NumPy & Pandas overview)',
      ],
      recentReviews: [
        { student: 'Hannah M.', rating: 5, date: 'Oct 24', text: 'Sarah made recursion make sense in 20 minutes when my professor took 2 weeks.' },
        { student: 'Devin T.', rating: 5, date: 'Oct 19', text: 'Great structure, clear examples, very friendly!' },
      ]
    },
    {
      id: 'tutor-2',
      name: 'Alex Rivera',
      title: 'Design Senior • UI/UX Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      proficiency: 'Intermediate',
      rating: 4.7,
      reviewCount: 28,
      freeDays: 'Mon / Wed',
      recommended: false,
      bio: 'Figma enthusiast, product design intern. Let us build clean design systems and responsive auto-layout components together.',
      skillsTaught: ['Figma UI/UX Design', 'Visual Branding'],
      availabilitySlots: [
        { id: 's5', day: 'Monday', time: '2:00 PM - 3:00 PM', available: true },
        { id: 's6', day: 'Wednesday', time: '6:00 PM - 7:00 PM', available: true },
      ],
      topicsList: [
        'Figma Interface & Frames',
        'Auto-layout mastery',
        'Typography & Color Scales',
        'Component Properties & Variants',
        'Interactive Prototyping',
      ],
      recentReviews: [
        { student: 'Mia R.', rating: 5, date: 'Oct 20', text: 'Alex walked through all the tricky Figma auto-layout edge cases!' }
      ]
    },
    {
      id: 'tutor-3',
      name: 'Priya Patel',
      title: 'Graduate Student • Data & ML',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      proficiency: 'Advanced',
      rating: 5.0,
      reviewCount: 19,
      freeDays: 'Friday',
      recommended: false,
      bio: 'Data enthusiast teaching Python for analytics and basic algorithmic problem solving.',
      skillsTaught: ['Python Programming', 'SQL & Database Design'],
      availabilitySlots: [
        { id: 's7', day: 'Friday', time: '1:00 PM - 2:00 PM', available: true },
        { id: 's8', day: 'Friday', time: '3:00 PM - 4:00 PM', available: true },
      ],
      topicsList: [
        'Pandas DataFrame fundamentals',
        'Data cleaning & filtering',
        'Matplotlib & Seaborn plots',
      ],
      recentReviews: [
        { student: 'Lucas G.', rating: 5, date: 'Oct 15', text: 'Priya is phenomenal at breaking down statistical models.' }
      ]
    }
  ],

  // Requests queue for Tutor Mode
  tutorRequestsGrouped: [
    {
      slotTime: 'Tue 4:00 PM',
      skill: 'Python Basics',
      requests: [
        {
          id: 'req-1',
          studentName: 'Marcus Vance',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          stats: { completed: 8, quizScore: '92%' },
          topics: ['Functions & Scope', 'Conditionals & Logic Loops'],
          message: "Hey Hannah! I'm preparing for my midterm quiz and would love to review scope and recursion.",
          requestedAt: '2 hours ago',
        },
        {
          id: 'req-2',
          studentName: 'Maya Lin',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          stats: { completed: 3, quizScore: '78%' },
          topics: ['Lists, Dictionaries & Tuples'],
          message: 'Need help formatting nested dictionaries for a lab assignment.',
          requestedAt: '4 hours ago',
        },
        {
          id: 'req-3',
          studentName: 'Julian Grey',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          stats: { completed: 1, quizScore: '80%' },
          topics: ['Variables & Data Types'],
          message: 'Starting Python from scratch and want to make sure my environment setup is solid.',
          requestedAt: '6 hours ago',
        }
      ]
    },
    {
      slotTime: 'Thu 5:30 PM',
      skill: 'Guitar Fundamentals',
      requests: [
        {
          id: 'req-4',
          studentName: 'Jordan Ross',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
          stats: { completed: 5, quizScore: '85%' },
          topics: ['Barre Chords (F major)', 'Strumming Patterns'],
          message: 'My F chord still buzzes when I switch quickly from C. Looking for finger placement tips!',
          requestedAt: 'Yesterday',
        }
      ]
    }
  ],

  // Sessions list
  sessions: [
    {
      id: 'sess-101',
      title: 'Python Basics: Functions & Logic',
      tutorName: 'Sarah Jenkins',
      studentName: 'Hannah',
      role: 'student',
      status: 'Upcoming',
      datetime: 'Tomorrow at 4:00 PM',
      dateShort: 'Oct 29, 4:00 PM',
      skill: 'Python Basics',
      topics: [
        { name: 'Variables & Data Types', done: true },
        { name: 'Control Flow (If/Else)', done: true },
        { name: 'Functions & Scope', done: false, askedByStudent: true },
        { name: 'List Comprehensions', done: false, askedByStudent: true },
      ],
      messages: [
        { sender: 'Sarah', text: 'Hi Hannah! Looking forward to our session tomorrow. Have you worked with functions before?', time: '10:14 AM', isSelf: false },
        { sender: 'Hannah', text: 'Hey Sarah! A little bit, but I still get confused with local vs global scope variables.', time: '10:22 AM', isSelf: true },
        { sender: 'Sarah', text: "Perfect! We'll start with visual scope diagrams and write 3 practical examples together. See you tomorrow at 4!", time: '10:30 AM', isSelf: false },
      ]
    },
    {
      id: 'sess-102',
      title: 'Python: Object-Oriented Principles',
      tutorName: 'Hannah',
      studentName: 'Marcus Vance',
      role: 'tutor',
      status: 'Upcoming',
      datetime: 'Thursday at 5:00 PM',
      dateShort: 'Oct 31, 5:00 PM',
      skill: 'Python',
      topics: [
        { name: 'Classes & Self keyword', done: false, askedByStudent: true },
        { name: 'Inheritance & Super()', done: false, askedByStudent: true },
        { name: 'Dunder methods (__str__, __repr__)', done: false },
      ],
      messages: [
        { sender: 'Hannah', text: 'Hey Marcus, accepted your booking! Let me know if you have specific code you want us to review.', time: 'Yesterday', isSelf: true },
        { sender: 'Marcus', text: 'Thanks Hannah! I have a mini bank-account class exercise from class that I want to walk through.', time: 'Yesterday', isSelf: false },
      ]
    },
    {
      id: 'sess-103',
      title: 'Figma Auto-layout & System Components',
      tutorName: 'Alex Rivera',
      studentName: 'Hannah',
      role: 'student',
      status: 'Completed',
      datetime: 'Oct 22 at 3:00 PM',
      dateShort: 'Oct 22',
      skill: 'Figma UI/UX Design',
      rating: 5,
      ratingComment: 'Alex was super helpful! Auto-layout feels so natural now.',
      topics: [
        { name: 'Frame vs Group nesting', done: true },
        { name: 'Auto-layout padding & gap', done: true },
        { name: 'Hug, Fill, Fixed resizing', done: true },
      ],
      messages: [
        { sender: 'Alex', text: 'Great session today! Remember to use Fill container for responsive card contents.', time: 'Oct 22, 4:02 PM', isSelf: false },
      ]
    },
    {
      id: 'sess-104',
      title: 'Guitar Fingerstyle & Arpeggios',
      tutorName: 'Elena Rostova',
      studentName: 'Hannah',
      role: 'student',
      status: 'Pending',
      datetime: 'Nov 3 at 6:00 PM',
      dateShort: 'Nov 3',
      skill: 'Acoustic Guitar',
      pendingHint: '2 other students also requested this slot',
      topics: [
        { name: 'Thumb-index-middle alternating', done: false },
        { name: 'Travis picking pattern', done: false },
      ],
      messages: []
    }
  ],

  learningContent: {
    skills: ['Python Basics', 'Figma UI/UX Design', 'Conversational Spanish'],
    cheatsheets: [
      {
        id: 'cs-1',
        title: 'Python Essential Syntax & Data Types',
        badge: 'Cheatsheet',
        tint: 'violet',
        readTime: '4 min read',
        content: 'Quick reference for lists, tuples, dictionaries, slicing tricks, and common string formatting methods.',
        bookmarked: true,
      },
      {
        id: 'cs-2',
        title: 'List Comprehensions & Generator Expressions',
        badge: 'Notes',
        tint: 'blue',
        readTime: '6 min read',
        content: 'Visual guide to transforming [x**2 for x in nums if x > 0] and nested loops without boilerplate.',
        bookmarked: false,
      },
      {
        id: 'cs-3',
        title: 'Official Python Visual Debugger Guide',
        badge: 'Link',
        tint: 'green',
        readTime: 'External',
        content: 'Interactive stepping through call stacks and variable memory states.',
        bookmarked: true,
      }
    ],
    quiz: {
      title: 'Python Mastery Check: Functions & Scope',
      questions: [
        {
          id: 'q1',
          question: 'What is the output of modifying a default mutable argument like `def add_item(item, box=[])` across multiple calls?',
          options: [
            'A new empty list is created on each call',
            'The same list persists and accumulates items across calls',
            'A TypeError is raised at runtime',
            'The box parameter resets to None'
          ],
          correctIndex: 1,
          explanation: 'In Python, default arguments are evaluated once when the function is defined, so a mutable default like `box=[]` is shared across all function calls.'
        },
        {
          id: 'q2',
          question: 'Which keyword allows modifying a variable bound in an outer (enclosing) function scope in Python?',
          options: ['global', 'nonlocal', 'outer', 'super'],
          correctIndex: 1,
          explanation: '`nonlocal` binds to a variable in the nearest enclosing non-global scope, whereas `global` binds to module-level scope.'
        },
        {
          id: 'q3',
          question: 'What does `*args` and `**kwargs` represent in a function signature?',
          options: [
            'Pointer references and memory addresses',
            'Tuple of positional arguments and dictionary of keyword arguments',
            'Required arguments and optional arguments',
            'List of return values'
          ],
          correctIndex: 1,
          explanation: '`*args` collects arbitrary positional arguments into a tuple, while `**kwargs` collects arbitrary keyword arguments into a dictionary.'
        }
      ]
    },
    learningProgress: {
      overallScore: '86%',
      level: 'Level 3: Proficient',
      weakTopics: ['Mutable Default Arguments', 'Generator Expressions vs Iterators'],
      strongTopics: ['List Slicing', 'Dictionary Lookups', 'Boolean Logic'],
      history: [
        { date: 'Oct 26', quiz: 'Functions & Scope', score: '100%' },
        { date: 'Oct 20', quiz: 'Control Flow & Loops', score: '88%' },
        { date: 'Oct 14', quiz: 'Variables & Types', score: '90%' },
      ]
    }
  }
};
