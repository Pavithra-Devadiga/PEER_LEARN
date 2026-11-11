package com.peerlearn.config;

import com.peerlearn.entity.*;
import com.peerlearn.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final CategoryRepository categoryRepo;
    private final SkillRepository skillRepo;
    private final SkillCurriculumTopicRepository curriculumRepo;
    private final TutorSkillRepository tutorSkillRepo;
    private final AvailabilitySlotRepository slotRepo;
    private final SessionRequestRepository requestRepo;
    private final SessionRequestTopicRepository requestTopicRepo;
    private final LearningSessionRepository sessionRepo;
    private final SessionTopicRepository sessionTopicRepo;
    private final SessionMessageRepository messageRepo;
    private final ReviewRepository reviewRepo;
    private final LearningMaterialRepository materialRepo;
    private final MaterialBookmarkRepository bookmarkRepo;
    private final QuizRepository quizRepo;
    private final QuizQuestionRepository questionRepo;
    private final QuizAttemptRepository attemptRepo;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
        UserRepository userRepo,
        CategoryRepository categoryRepo,
        SkillRepository skillRepo,
        SkillCurriculumTopicRepository curriculumRepo,
        TutorSkillRepository tutorSkillRepo,
        AvailabilitySlotRepository slotRepo,
        SessionRequestRepository requestRepo,
        SessionRequestTopicRepository requestTopicRepo,
        LearningSessionRepository sessionRepo,
        SessionTopicRepository sessionTopicRepo,
        SessionMessageRepository messageRepo,
        ReviewRepository reviewRepo,
        LearningMaterialRepository materialRepo,
        MaterialBookmarkRepository bookmarkRepo,
        QuizRepository quizRepo,
        QuizQuestionRepository questionRepo,
        QuizAttemptRepository attemptRepo,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepo = userRepo;
        this.categoryRepo = categoryRepo;
        this.skillRepo = skillRepo;
        this.curriculumRepo = curriculumRepo;
        this.tutorSkillRepo = tutorSkillRepo;
        this.slotRepo = slotRepo;
        this.requestRepo = requestRepo;
        this.requestTopicRepo = requestTopicRepo;
        this.sessionRepo = sessionRepo;
        this.sessionTopicRepo = sessionTopicRepo;
        this.messageRepo = messageRepo;
        this.reviewRepo = reviewRepo;
        this.materialRepo = materialRepo;
        this.bookmarkRepo = bookmarkRepo;
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
        this.attemptRepo = attemptRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 0. Backfill auth_provider for any pre-existing rows created before OAuth support
        List<User> existingUsers = userRepo.findAll();
        boolean backfilled = false;
        for (User u : existingUsers) {
            if (u.getAuthProvider() == null || u.getAuthProvider().isBlank()) {
                u.setAuthProvider("LOCAL");
                backfilled = true;
            }
        }
        if (backfilled) {
            userRepo.saveAll(existingUsers);
        }

        // 1. Seed Categories, Skills & Curriculum Topics if catalog is empty
        if (categoryRepo.count() == 0) {
            seedCatalog();
        }

        // 2. Ensure Demo User (Hannah) and sample peer tutors/sessions exist
        if (userRepo.findByEmailIgnoreCase("hannah.student@university.edu").isEmpty()) {
            seedDemoUsersAndActivity();
        }
    }

    private void seedCatalog() {
        Category progCat = categoryRepo.save(new Category("Programming & CS", "Code", "violet"));
        Category designCat = categoryRepo.save(new Category("Design & Creative", "Palette", "yellow"));
        Category langCat = categoryRepo.save(new Category("Languages", "Globe", "green"));
        Category musicCat = categoryRepo.save(new Category("Music & Arts", "Music", "peach"));

        Skill python = skillRepo.save(new Skill(progCat, "Python Programming", "Basics,OOP,Data", 79));
        Skill react = skillRepo.save(new Skill(progCat, "React & Frontend", "Hooks,Vite,Tailwind", 99));
        Skill algo = skillRepo.save(new Skill(progCat, "Data Structures & Algorithms", "Trees,Graphs,Big-O", 129));
        Skill sql = skillRepo.save(new Skill(progCat, "SQL & Database Design", "PostgreSQL,Schema,Indexing", 89));

        Skill figma = skillRepo.save(new Skill(designCat, "Figma UI/UX Design", "Auto-layout,Wireframes,Systems", 89));
        skillRepo.save(new Skill(designCat, "Visual Branding & Typography", "Posters,Brand Kits", 79));
        skillRepo.save(new Skill(designCat, "Motion Design Basics", "After Effects,Lottie", 119));

        Skill spanish = skillRepo.save(new Skill(langCat, "Conversational Spanish", "A1-B2,Grammar,Speaking", 69));
        skillRepo.save(new Skill(langCat, "Japanese (Hiragana & Kanji)", "JLPT N5,Kanji", 99));
        skillRepo.save(new Skill(langCat, "French Conversation", "Pronunciation,Culture", 69));

        Skill guitar = skillRepo.save(new Skill(musicCat, "Acoustic & Electric Guitar", "Chords,Fingerstyle", 79));
        skillRepo.save(new Skill(musicCat, "Piano & Keyboard Basics", "Sheet Music,Scales", 89));
        skillRepo.save(new Skill(musicCat, "Music Production (Ableton)", "Beats,Mixing", 119));

        seedTopics(python, List.of(
            "Variables, Data Types & Operators",
            "Conditionals & Logic Loops",
            "Functions & Scope",
            "Lists, Dictionaries & Tuples",
            "Object-Oriented Programming (Classes)",
            "File I/O & Exception Handling",
            "Libraries (NumPy & Pandas overview)"
        ));
        seedTopics(react, List.of(
            "JSX Syntax & Rules",
            "Props vs State",
            "useEffect & Lifecycle Syncing",
            "Component Composition",
            "Custom Hooks & Context API",
            "Performance & Memoization"
        ));
        seedTopics(sql, List.of(
            "Relational Model & Keys (PK/FK)",
            "Normalization (1NF, 2NF, 3NF)",
            "JOINs & Subqueries",
            "Aggregations & GROUP BY",
            "Indexing & Query Optimization",
            "Transactions & Triggers"
        ));
        seedTopics(algo, List.of(
            "Time & Space Complexity (Big-O)",
            "Recursion & Backtracking",
            "Stacks, Queues & Linked Lists",
            "Binary Trees & BSTs",
            "Graph Traversal (BFS & DFS)"
        ));
        seedTopics(figma, List.of(
            "Figma Interface & Frames",
            "Auto-layout mastery",
            "Typography & Color Scales",
            "Component Properties & Variants",
            "Interactive Prototyping"
        ));
        seedTopics(guitar, List.of(
            "Tuning & Holding the Guitar",
            "Open Chords (E, A, D, G, C)",
            "Basic Strumming & Timing",
            "Barre Chords (F & B minor)",
            "Fingerpicking Basics",
            "Pentatonic Scale & Minor Blues"
        ));
        seedTopics(spanish, List.of(
            "Greetings & Everyday Expressions",
            "Present Tense Conjugations",
            "Ser vs Estar",
            "Past Tenses (Pretérito vs Imperfecto)",
            "Conversational Roleplay"
        ));
    }

    private void seedDemoUsersAndActivity() {
        Skill python = skillRepo.findByNameIgnoreCase("Python Programming").orElseThrow();
        Skill react = skillRepo.findByNameIgnoreCase("React & Frontend").orElseThrow();
        Skill algo = skillRepo.findByNameIgnoreCase("Data Structures & Algorithms").orElseThrow();
        Skill sql = skillRepo.findByNameIgnoreCase("SQL & Database Design").orElseThrow();
        Skill figma = skillRepo.findByNameIgnoreCase("Figma UI/UX Design").orElseThrow();
        Skill branding = skillRepo.findByNameIgnoreCase("Visual Branding & Typography").orElseThrow();
        Skill spanish = skillRepo.findByNameIgnoreCase("Conversational Spanish").orElseThrow();
        Skill guitar = skillRepo.findByNameIgnoreCase("Acoustic & Electric Guitar").orElseThrow();

        String defaultHash = passwordEncoder.encode("password123");

        User hannah = findOrCreateUser(
            "Hannah",
            "hannah.student@university.edu",
            defaultHash,
            "CS Sophomore • Peer Learner & Tutor",
            "Passionate about Python, frontend development, and acoustic guitar. Always happy to trade skills!",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            3, 4
        );
        User sarah = findOrCreateUser(
            "Sarah Jenkins",
            "sarah.jenkins@university.edu",
            defaultHash,
            "CS Junior • Lead Python TA",
            "Hey! I'm a third-year CS student who loves demystifying code. I break down data structures and Python logic into visual analogies that stick.",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            2, 6
        );
        User alex = findOrCreateUser(
            "Alex Rivera",
            "alex.rivera@university.edu",
            defaultHash,
            "Design Senior • UI/UX Enthusiast",
            "Figma enthusiast, product design intern. Let us build clean design systems and responsive auto-layout components together.",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            1, 5
        );
        User priya = findOrCreateUser(
            "Priya Patel",
            "priya.patel@university.edu",
            defaultHash,
            "Graduate Student • Data & ML",
            "Data enthusiast teaching Python for analytics, SQL databases, and algorithmic problem solving.",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
            2, 5
        );
        User elena = findOrCreateUser(
            "Elena Rostova",
            "elena.rostova@university.edu",
            defaultHash,
            "Music Minor • Fingerstyle Guitarist",
            "Teaching acoustic guitar chords, rhythm, and fingerstyle arrangements for beginners and intermediates.",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            1, 4
        );
        User marcus = findOrCreateUser(
            "Marcus Vance",
            "marcus.vance@university.edu",
            defaultHash,
            "CS Freshman • Python Learner",
            "Learning Python OOP and data structures.",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            2, 0
        );
        User maya = findOrCreateUser(
            "Maya Lin",
            "maya.lin@university.edu",
            defaultHash,
            "ISE Junior • Fullstack Explorer",
            "Looking to strengthen Python data structures and SQL skills.",
            "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=150&auto=format&fit=crop&q=80",
            1, 0
        );
        User julian = findOrCreateUser(
            "Julian Grey",
            "julian.grey@university.edu",
            defaultHash,
            "Mechanical Engg • Coding Beginner",
            "Starting Python from scratch for engineering simulations.",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
            1, 0
        );
        User jordan = findOrCreateUser(
            "Jordan Ross",
            "jordan.ross@university.edu",
            defaultHash,
            "ECE Sophomore • Music Hobbyist",
            "Practicing barre chords and strumming speed.",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            2, 0
        );

        // Tutor Skills
        addTutorSkillIfMissing(hannah, python, "Advanced");
        addTutorSkillIfMissing(hannah, guitar, "Intermediate");
        addTutorSkillIfMissing(hannah, react, "Intermediate");

        addTutorSkillIfMissing(sarah, python, "Advanced");
        addTutorSkillIfMissing(sarah, sql, "Advanced");
        addTutorSkillIfMissing(sarah, algo, "Advanced");

        addTutorSkillIfMissing(alex, figma, "Intermediate");
        addTutorSkillIfMissing(alex, branding, "Intermediate");

        addTutorSkillIfMissing(priya, python, "Advanced");
        addTutorSkillIfMissing(priya, sql, "Advanced");

        addTutorSkillIfMissing(elena, guitar, "Advanced");

        // Availability Slots
        AvailabilitySlot hannahTue4 = getOrCreateSlot(hannah, "Tue", "4:00 PM", true);
        AvailabilitySlot hannahThu4 = getOrCreateSlot(hannah, "Thu", "4:00 PM", false);
        AvailabilitySlot hannahThu530 = getOrCreateSlot(hannah, "Thu", "5:30 PM", true);
        getOrCreateSlot(hannah, "Fri", "6:00 PM", true);

        AvailabilitySlot sarahTue4 = getOrCreateSlot(sarah, "Tue", "4:00 PM", true);
        getOrCreateSlot(sarah, "Tue", "5:30 PM", true);
        getOrCreateSlot(sarah, "Thu", "3:00 PM", true);
        getOrCreateSlot(sarah, "Thu", "4:30 PM", false);

        getOrCreateSlot(alex, "Mon", "2:00 PM", true);
        getOrCreateSlot(alex, "Wed", "6:00 PM", true);

        getOrCreateSlot(priya, "Fri", "1:00 PM", true);
        getOrCreateSlot(priya, "Fri", "3:00 PM", true);

        AvailabilitySlot elenaFri6 = getOrCreateSlot(elena, "Fri", "6:00 PM", true);

        // Pending Session Requests
        createRequest(marcus, hannah, python, hannahTue4, "PENDING",
            "Hey Hannah! I'm preparing for my midterm quiz and would love to review scope and recursion.",
            List.of("Functions & Scope", "Conditionals & Logic Loops"));
        createRequest(maya, hannah, python, hannahTue4, "PENDING",
            "Need help formatting nested dictionaries for a lab assignment.",
            List.of("Lists, Dictionaries & Tuples"));
        createRequest(julian, hannah, python, hannahTue4, "PENDING",
            "Starting Python from scratch and want to make sure my environment setup is solid.",
            List.of("Variables, Data Types & Operators"));
        createRequest(jordan, hannah, guitar, hannahThu530, "PENDING",
            "My F chord still buzzes when I switch quickly from C. Looking for finger placement tips!",
            List.of("Barre Chords (F & B minor)", "Basic Strumming & Timing"));

        createRequest(hannah, elena, guitar, elenaFri6, "PENDING",
            "Would love to practice fingerstyle and alternating thumb patterns.",
            List.of("Fingerpicking Basics"));

        // Learning Sessions (Upcoming & Completed)
        LocalDate today = LocalDate.now();

        LearningSession s1 = createSession(null, hannah, sarah, python, sarahTue4,
            "Python Basics: Functions & Logic", "UPCOMING", "Tomorrow at 4:00 PM", today.plusDays(1), 1.0);
        sessionTopicRepo.save(new SessionTopic(s1, "Variables & Data Types", true, false));
        sessionTopicRepo.save(new SessionTopic(s1, "Control Flow (If/Else)", true, false));
        sessionTopicRepo.save(new SessionTopic(s1, "Functions & Scope", false, true));
        sessionTopicRepo.save(new SessionTopic(s1, "List Comprehensions", false, true));
        messageRepo.save(new SessionMessage(s1, sarah, "Hi Hannah! Looking forward to our session tomorrow. Have you worked with functions before?"));
        messageRepo.save(new SessionMessage(s1, hannah, "Hey Sarah! A little bit, but I still get confused with local vs global scope variables."));
        messageRepo.save(new SessionMessage(s1, sarah, "Perfect! We'll start with visual scope diagrams and write 3 practical examples together. See you tomorrow at 4!"));

        LearningSession s2 = createSession(null, marcus, hannah, python, hannahThu4,
            "Python: Object-Oriented Principles", "UPCOMING", "Thursday at 4:00 PM", today.plusDays(3), 1.0);
        sessionTopicRepo.save(new SessionTopic(s2, "Classes & Self keyword", false, true));
        sessionTopicRepo.save(new SessionTopic(s2, "Inheritance & Super()", false, true));
        sessionTopicRepo.save(new SessionTopic(s2, "Dunder methods (__str__, __repr__)", false, false));
        messageRepo.save(new SessionMessage(s2, hannah, "Hey Marcus, accepted your booking! Let me know if you have specific code you want us to review."));
        messageRepo.save(new SessionMessage(s2, marcus, "Thanks Hannah! I have a mini bank-account class exercise from class that I want to walk through."));

        LearningSession s3 = createSession(null, hannah, alex, figma, null,
            "Figma Auto-layout & System Components", "COMPLETED", "5 days ago", today.minusDays(5), 2.0);
        sessionTopicRepo.save(new SessionTopic(s3, "Frame vs Group nesting", true, false));
        sessionTopicRepo.save(new SessionTopic(s3, "Auto-layout padding & gap", true, false));
        sessionTopicRepo.save(new SessionTopic(s3, "Hug, Fill, Fixed resizing", true, false));
        messageRepo.save(new SessionMessage(s3, alex, "Great session today! Remember to use Fill container for responsive card contents."));
        createReview(s3, hannah, alex, figma, 5, "Alex was super helpful! Auto-layout feels so natural now.");

        LearningSession s4 = createSession(null, marcus, hannah, python, null,
            "Python Recursion & List Comprehensions", "COMPLETED", "4 days ago", today.minusDays(4), 2.0);
        sessionTopicRepo.save(new SessionTopic(s4, "Functions & Scope", true, true));
        sessionTopicRepo.save(new SessionTopic(s4, "List Comprehensions", true, false));
        createReview(s4, marcus, hannah, python, 5, "Hannah explained recursion and list comprehensions so clearly! Made everything click.");

        LearningSession s5 = createSession(null, maya, hannah, guitar, null,
            "Guitar Barre Chords Transition", "COMPLETED", "8 days ago", today.minusDays(8), 1.5);
        sessionTopicRepo.save(new SessionTopic(s5, "Barre Chords (F & B minor)", true, true));
        createReview(s5, maya, hannah, guitar, 5, "Super patient tutor. Helped me transition between barre chords cleanly.");

        LearningSession s6 = createSession(null, marcus, hannah, react, null,
            "React Hooks & State Management", "COMPLETED", "12 days ago", today.minusDays(12), 1.5);
        sessionTopicRepo.save(new SessionTopic(s6, "Props vs State", true, false));
        createReview(s6, marcus, hannah, react, 4, "Very clear walkthrough of useEffect dependencies and cleanup functions.");

        LearningSession s7 = createSession(null, hannah, sarah, python, null,
            "Python Basics: Variables & Loops", "COMPLETED", "9 days ago", today.minusDays(9), 2.0);
        sessionTopicRepo.save(new SessionTopic(s7, "Variables, Data Types & Operators", true, false));
        sessionTopicRepo.save(new SessionTopic(s7, "Conditionals & Logic Loops", true, false));
        createReview(s7, hannah, sarah, python, 5, "Sarah made recursion make sense in 20 minutes when my professor took 2 weeks.");

        LearningSession s8 = createSession(null, julian, sarah, sql, null,
            "SQL Joins & Normalization", "COMPLETED", "14 days ago", today.minusDays(14), 1.5);
        createReview(s8, julian, sarah, sql, 5, "Great structure, clear examples, very friendly!");

        // Learning Materials & Bookmarks
        if (materialRepo.count() == 0) {
            LearningMaterial m1 = createMaterial(python, sarah, "Python Essential Syntax & Data Types", "Cheatsheet", "violet",
                "4 min read", "Quick reference for lists, tuples, dictionaries, slicing tricks, and common string formatting methods.", false, 12);
            createMaterial(python, priya, "List Comprehensions & Generator Expressions", "Notes", "blue",
                "6 min read", "Visual guide to transforming [x**2 for x in nums if x > 0] and nested loops without boilerplate.", false, 9);
            LearningMaterial m3 = createMaterial(python, sarah, "Official Python Visual Debugger Guide", "Link", "green",
                "External", "Interactive stepping through call stacks and variable memory states.", false, 15);
            createMaterial(python, null, "Python Programming: Variable Unpacking & Extended Slicing", "Cheatsheet", "violet",
                "5 min read", "Step-by-step memory model showing how list pointers and slice views work in Python 3.", true, 14);
            createMaterial(python, hannah, "Python Memory Management & Garbage Collection", "Notes", "blue",
                "5 min read", "Reference counting, cyclic garbage collector, and object mutability pitfalls.", false, 18);
            createMaterial(python, hannah, "Common Beginner Pitfalls with Mutable Default Args", "Cheatsheet", "violet",
                "3 min read", "Why def add(x, box=[]) shares state across calls and how to use None safely.", false, 32);

            createMaterial(figma, alex, "Figma Auto-Layout Spacing & Resizing Guide", "Cheatsheet", "yellow",
                "4 min read", "Complete cheat sheet for Hug Contents, Fill Container, Fixed Width, and absolute positioning.", false, 11);
            createMaterial(spanish, null, "Pretérito vs Imperfecto Decision Tree", "Notes", "green",
                "5 min read", "When to use completed past actions vs ongoing/habitual past descriptions in Spanish.", true, 7);

            bookmarkRepo.save(new MaterialBookmark(hannah, m1));
            bookmarkRepo.save(new MaterialBookmark(hannah, m3));
        }

        // Quizzes & Questions
        if (quizRepo.count() == 0) {
            Quiz pyQuiz = quizRepo.save(new Quiz(python, "Python Mastery Check: Functions & Scope"));
            createQuestion(pyQuiz,
                "What is the output of modifying a default mutable argument like `def add_item(item, box=[])` across multiple calls?",
                "A new empty list is created on each call",
                "The same list persists and accumulates items across calls",
                "A TypeError is raised at runtime",
                "The box parameter resets to None",
                1,
                "In Python, default arguments are evaluated once when the function is defined, so a mutable default like `box=[]` is shared across all function calls.",
                "Mutable Default Arguments"
            );
            createQuestion(pyQuiz,
                "Which keyword allows modifying a variable bound in an outer (enclosing) function scope in Python?",
                "global", "nonlocal", "outer", "super",
                1,
                "`nonlocal` binds to a variable in the nearest enclosing non-global scope, whereas `global` binds to module-level scope.",
                "Scope & LEGB Rule"
            );
            createQuestion(pyQuiz,
                "What does `*args` and `**kwargs` represent in a function signature?",
                "Pointer references and memory addresses",
                "Tuple of positional arguments and dictionary of keyword arguments",
                "Required arguments and optional arguments",
                "List of return values",
                1,
                "`*args` collects arbitrary positional arguments into a tuple, while `**kwargs` collects arbitrary keyword arguments into a dictionary.",
                "Function Parameters"
            );
            createQuestion(pyQuiz,
                "Which Python data structure preserves insertion order and stores key-value pairs with O(1) average lookup?",
                "tuple", "dict", "set", "frozenset",
                1,
                "Dictionaries (dict) map unique keys to values with average O(1) hash-table lookup and preserve insertion order in Python 3.7+.",
                "Variables, Data Types & Operators"
            );
            createQuestion(pyQuiz,
                "Which statement immediately skips the rest of the current loop iteration and moves to the next item?",
                "break", "pass", "continue", "return",
                2,
                "`continue` jumps to the next iteration of a loop, whereas `break` exits the loop completely.",
                "Conditionals & Logic Loops"
            );
            createQuestion(pyQuiz,
                "What does `[x * 2 for x in range(4) if x % 2 == 0]` evaluate to in Python?",
                "[0, 2, 4, 6]", "[0, 4]", "[2, 6]", "[0, 2, 4]",
                1,
                "Only `0` and `2` satisfy `x % 2 == 0`, producing `[0, 4]`.",
                "List Comprehensions"
            );

            Quiz sqlQuiz = quizRepo.save(new Quiz(sql, "SQL & Normalization Check"));
            createQuestion(sqlQuiz,
                "Which normal form eliminates transitive dependencies of non-key attributes on the primary key?",
                "1NF", "2NF", "3NF", "UNF",
                2,
                "Third Normal Form (3NF) requires the table to be in 2NF and have no transitive dependencies between non-prime attributes.",
                "Normalization (3NF)"
            );
            createQuestion(sqlQuiz,
                "Which SQL clause is used to filter aggregated groups after GROUP BY?",
                "WHERE", "HAVING", "ORDER BY", "DISTINCT",
                1,
                "WHERE filters rows before grouping, whereas HAVING filters groups created by GROUP BY.",
                "Aggregations & HAVING"
            );
            createQuestion(sqlQuiz,
                "Which SQL JOIN returns all rows from the left table and matched rows from the right table (or NULL if no match)?",
                "INNER JOIN", "CROSS JOIN", "LEFT JOIN", "SELF JOIN",
                2,
                "LEFT JOIN preserves all left-table rows and puts NULL where no matching right row exists.",
                "JOINs & Subqueries"
            );

            Quiz figmaQuiz = quizRepo.save(new Quiz(figma, "Figma Auto-Layout Essentials"));
            createQuestion(figmaQuiz,
                "Which resizing option makes a child layer expand to occupy all available space inside an Auto-Layout frame?",
                "Hug contents", "Fill container", "Fixed size", "Scale",
                1,
                "Fill container stretches the child to match the remaining width or height of its parent Auto-Layout frame.",
                "Hug, Fill, Fixed resizing"
            );
            createQuestion(figmaQuiz,
                "Why prefer Frames (with Auto-Layout) over regular Groups for responsive UI cards?",
                "Groups cannot hold text",
                "Frames support padding, spacing gaps, clipping, and responsive constraints",
                "Groups export only as SVG",
                "Frames block nested layers",
                1,
                "Frames support Auto-layout gap, padding, and Hug/Fill resizing rules; Groups are simple bounding boxes.",
                "Auto-layout padding & gap"
            );

            Quiz reactQuiz = quizRepo.save(new Quiz(react, "React & Frontend Mastery Check"));
            createQuestion(reactQuiz,
                "What is the key difference between props and state in React?",
                "Props are mutable inside children while state is immutable",
                "Props pass data down from parent while state is managed locally inside a component",
                "State never triggers re-renders",
                "Props only work in class components",
                1,
                "Props flow top-down and are read-only inside the child, while state holds component-local interactive data.",
                "Props vs State"
            );
            createQuestion(reactQuiz,
                "When you pass `[]` as the dependency array to `useEffect`, when does it run?",
                "Every keystroke", "Once after initial mount (plus cleanup on unmount)", "Never", "Before render",
                1,
                "An empty dependency array `[]` runs the effect once after initial mount.",
                "useEffect & Lifecycle Syncing"
            );

            Quiz guitarQuiz = quizRepo.save(new Quiz(guitar, "Acoustic & Electric Guitar Check"));
            createQuestion(guitarQuiz,
                "Which technique presses the index finger flat across all six strings on a fret to move chord shapes up the neck?",
                "Hammer-on", "Palm muting", "Barre chord", "Harmonic",
                2,
                "A barre chord uses your index finger across the strings like a movable capo (e.g., F and Bm).",
                "Barre Chords (F & B minor)"
            );

            Quiz algoQuiz = quizRepo.save(new Quiz(algo, "Data Structures & Algorithms Check"));
            createQuestion(algoQuiz,
                "What is the worst-case time complexity of Binary Search on a sorted array of N elements?",
                "O(1)", "O(log N)", "O(N)", "O(N log N)",
                1,
                "Binary search halves the remaining search space on every comparison -> O(log N).",
                "Time & Space Complexity (Big-O)"
            );

            createAttempt(pyQuiz, hannah, 3, 3, "", "List Slicing,Dictionary Lookups,Boolean Logic");
            createAttempt(pyQuiz, hannah, 2, 3, "Mutable Default Arguments", "Scope & LEGB Rule,Function Parameters");
            createAttempt(pyQuiz, marcus, 3, 3, "", "Functions & Scope,Mutable Default Arguments");
            createAttempt(pyQuiz, maya, 2, 3, "Scope & LEGB Rule", "Function Parameters");
            createAttempt(pyQuiz, julian, 2, 3, "Mutable Default Arguments", "Function Parameters");
            createAttempt(sqlQuiz, jordan, 2, 2, "", "Normalization (3NF),Aggregations & HAVING");
        }
    }

    private User findOrCreateUser(String name, String email, String hash, String title, String bio, String avatar, int lStreak, int tStreak) {
        return userRepo.findByEmailIgnoreCase(email).orElseGet(() -> {
            User u = new User();
            u.setFullName(name);
            u.setEmail(email);
            u.setPasswordHash(hash);
            u.setAuthProvider("LOCAL");
            u.setTitle(title);
            u.setBio(bio);
            u.setAvatarUrl(avatar);
            u.setLearningStreakWeeks(lStreak);
            u.setTeachingStreakWeeks(tStreak);
            return userRepo.save(u);
        });
    }

    private void addTutorSkillIfMissing(User tutor, Skill skill, String level) {
        if (tutorSkillRepo.findByTutorIdAndSkillId(tutor.getId(), skill.getId()).isEmpty()) {
            int base = skill.getBasePriceInr() != null ? skill.getBasePriceInr() : 99;
            int fee = "Advanced".equalsIgnoreCase(level) ? Math.min(299, base + 20) : base;
            tutorSkillRepo.save(new TutorSkill(tutor, skill, level, fee));
        }
    }

    private AvailabilitySlot getOrCreateSlot(User tutor, String day, String time, boolean available) {
        return slotRepo.findByTutorIdAndDayOfWeekAndSlotTime(tutor.getId(), day, time)
            .orElseGet(() -> slotRepo.save(new AvailabilitySlot(tutor, day, time, available)));
    }

    private void seedTopics(Skill skill, List<String> topics) {
        for (int i = 0; i < topics.size(); i++) {
            curriculumRepo.save(new SkillCurriculumTopic(skill, topics.get(i), i + 1));
        }
    }

    private SessionRequest createRequest(User student, User tutor, Skill skill, AvailabilitySlot slot, String status, String message, List<String> topics) {
        SessionRequest req = new SessionRequest();
        req.setStudent(student);
        req.setTutor(tutor);
        req.setSkill(skill);
        req.setSlot(slot);
        req.setStatus(status);
        req.setMessage(message);
        SessionRequest saved = requestRepo.save(req);
        for (String t : topics) {
            requestTopicRepo.save(new SessionRequestTopic(saved, t));
        }
        return saved;
    }

    private LearningSession createSession(SessionRequest req, User student, User tutor, Skill skill, AvailabilitySlot slot,
                                          String title, String status, String label, LocalDate date, double hours) {
        LearningSession s = new LearningSession();
        s.setRequest(req);
        s.setStudent(student);
        s.setTutor(tutor);
        s.setSkill(skill);
        s.setSlot(slot);
        s.setTitle(title);
        s.setStatus(status);
        s.setScheduledLabel(label);
        s.setScheduledDate(date);
        s.setDurationHours(hours);
        return sessionRepo.save(s);
    }

    private void createReview(LearningSession session, User student, User tutor, Skill skill, int rating, String comment) {
        Review r = new Review();
        r.setSession(session);
        r.setStudent(student);
        r.setTutor(tutor);
        r.setSkill(skill);
        r.setRating(rating);
        r.setComment(comment);
        reviewRepo.save(r);
    }

    private LearningMaterial createMaterial(Skill skill, User author, String title, String type, String tint,
                                            String readTime, String content, boolean aiSeeded, int verifiedCount) {
        LearningMaterial m = new LearningMaterial();
        m.setSkill(skill);
        m.setAuthor(author);
        m.setTitle(title);
        m.setMaterialType(type);
        m.setTint(tint);
        m.setReadTime(readTime);
        m.setContent(content);
        m.setIsAiSeeded(aiSeeded);
        m.setVerifiedCount(verifiedCount);
        m.setStatus("Published");
        return materialRepo.save(m);
    }

    private void createQuestion(Quiz quiz, String q, String a, String b, String c, String d, int correctIdx, String explanation, String tag) {
        QuizQuestion qq = new QuizQuestion();
        qq.setQuiz(quiz);
        qq.setQuestionText(q);
        qq.setOptionA(a);
        qq.setOptionB(b);
        qq.setOptionC(c);
        qq.setOptionD(d);
        qq.setCorrectIndex(correctIdx);
        qq.setExplanation(explanation);
        qq.setTopicTag(tag);
        questionRepo.save(qq);
    }

    private void createAttempt(Quiz quiz, User user, int score, int total, String missed, String strong) {
        QuizAttempt a = new QuizAttempt();
        a.setQuiz(quiz);
        a.setUser(user);
        a.setScore(score);
        a.setTotalQuestions(total);
        a.setMissedTopics(missed);
        a.setStrongTopics(strong);
        attemptRepo.save(a);
    }
}
