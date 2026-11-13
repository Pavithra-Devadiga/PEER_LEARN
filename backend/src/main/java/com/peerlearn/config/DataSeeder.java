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
    private final TutorSkillRepository tutorSkillRepo;
    private final AvailabilitySlotRepository slotRepo;
    private final SessionRequestRepository requestRepo;
    private final LearningSessionRepository sessionRepo;
    private final SessionTopicRepository sessionTopicRepo;
    private final SessionMessageRepository messageRepo;
    private final ReviewRepository reviewRepo;
    private final StudyMaterialRepository studyMaterialRepo;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
        UserRepository userRepo,
        CategoryRepository categoryRepo,
        SkillRepository skillRepo,
        TutorSkillRepository tutorSkillRepo,
        AvailabilitySlotRepository slotRepo,
        SessionRequestRepository requestRepo,
        LearningSessionRepository sessionRepo,
        SessionTopicRepository sessionTopicRepo,
        SessionMessageRepository messageRepo,
        ReviewRepository reviewRepo,
        StudyMaterialRepository studyMaterialRepo,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepo = userRepo;
        this.categoryRepo = categoryRepo;
        this.skillRepo = skillRepo;
        this.tutorSkillRepo = tutorSkillRepo;
        this.slotRepo = slotRepo;
        this.requestRepo = requestRepo;
        this.sessionRepo = sessionRepo;
        this.sessionTopicRepo = sessionTopicRepo;
        this.messageRepo = messageRepo;
        this.reviewRepo = reviewRepo;
        this.studyMaterialRepo = studyMaterialRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 0. Backfill auth_provider for any pre-existing rows
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

        // 1. Seed Categories & Skills if catalog is empty
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

        skillRepo.save(new Skill(progCat, "Python Programming", "Functions & Scope, OOP, Recursion, List Comprehensions", 79));
        skillRepo.save(new Skill(progCat, "React & Frontend", "JSX, Props vs State, useEffect, Hooks", 99));
        skillRepo.save(new Skill(progCat, "Data Structures & Algorithms", "Time Complexity, Trees, Graphs, Sorting", 129));
        skillRepo.save(new Skill(progCat, "SQL & Database Design", "3NF Normalization, JOINs, Triggers, Indexing", 89));

        skillRepo.save(new Skill(designCat, "Figma UI/UX Design", "Auto-layout, Wireframes, Design Systems", 89));
        skillRepo.save(new Skill(designCat, "Visual Branding & Typography", "Posters, Brand Kits, Hierarchy", 79));
        skillRepo.save(new Skill(designCat, "Motion Design Basics", "After Effects, Transitions, Keyframes", 119));

        skillRepo.save(new Skill(langCat, "Conversational Spanish", "Greetings, Present Tense, Ser vs Estar", 69));
        skillRepo.save(new Skill(langCat, "Japanese (Hiragana & Kanji)", "Hiragana, Katakana, JLPT N5", 99));
        skillRepo.save(new Skill(langCat, "French Conversation", "Pronunciation, Basic Phrases, Culture", 69));

        skillRepo.save(new Skill(musicCat, "Acoustic & Electric Guitar", "Open Chords, Strumming, Barre Chords, Fingerstyle", 79));
        skillRepo.save(new Skill(musicCat, "Piano & Keyboard Basics", "Sheet Music, Major Scales, Arpeggios", 89));
        skillRepo.save(new Skill(musicCat, "Music Production (Ableton)", "Beats, MIDI, Equalization, Mixing", 119));
    }

    private void seedDemoUsersAndActivity() {
        Skill python = skillRepo.findByNameIgnoreCase("Python Programming").orElseThrow();
        Skill react = skillRepo.findByNameIgnoreCase("React & Frontend").orElseThrow();
        Skill algo = skillRepo.findByNameIgnoreCase("Data Structures & Algorithms").orElseThrow();
        Skill sql = skillRepo.findByNameIgnoreCase("SQL & Database Design").orElseThrow();
        Skill figma = skillRepo.findByNameIgnoreCase("Figma UI/UX Design").orElseThrow();
        Skill branding = skillRepo.findByNameIgnoreCase("Visual Branding & Typography").orElseThrow();
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
            "[Functions & Scope, Conditionals & Logic Loops] Hey Hannah! I'm preparing for my midterm quiz and would love to review scope and recursion.");
        createRequest(maya, hannah, python, hannahTue4, "PENDING",
            "[Lists, Dictionaries & Tuples] Need help formatting nested dictionaries for a lab assignment.");
        createRequest(julian, hannah, python, hannahTue4, "PENDING",
            "[Variables, Data Types & Operators] Starting Python from scratch and want to make sure my environment setup is solid.");
        createRequest(jordan, hannah, guitar, hannahThu530, "PENDING",
            "[Barre Chords, Basic Strumming] My F chord still buzzes when I switch quickly from C. Looking for finger placement tips!");

        createRequest(hannah, elena, guitar, elenaFri6, "PENDING",
            "[Fingerpicking Basics] Would love to practice fingerstyle and alternating thumb patterns.");

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

        // Study Materials (Consolidated 11th table)
        if (studyMaterialRepo.count() == 0) {
            byte[] samplePdfData = "%PDF-1.4 sample peerlearn study notes".getBytes();
            createStudyMaterial(python, sarah, "Python Essential Syntax & Data Types", "PDF Notes", "python-syntax-guide.pdf", "application/pdf", samplePdfData, "Quick reference guide for lists, tuples, dictionaries, slicing tricks, and string methods.");
            createStudyMaterial(python, priya, "List Comprehensions & Generator Expressions", "PDF Notes", "python-comprehensions.pdf", "application/pdf", samplePdfData, "Visual guide to transforming [x**2 for x in nums if x > 0] and nested loops without boilerplate.");
            createStudyMaterial(sql, sarah, "SQL Relational Model & 3NF Normalization Cheat Sheet", "PDF Notes", "sql-3nf-normalization.pdf", "application/pdf", samplePdfData, "Step-by-step 1NF, 2NF, 3NF normalization rules and sample schemas with foreign key constraints.");
            createStudyMaterial(figma, alex, "Figma Auto-Layout Spacing & Resizing Guide", "PDF Notes", "figma-autolayout-guide.pdf", "application/pdf", samplePdfData, "Complete cheatsheet for Hug Contents, Fill Container, Fixed Width, and absolute positioning.");
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

    private SessionRequest createRequest(User student, User tutor, Skill skill, AvailabilitySlot slot, String status, String message) {
        SessionRequest req = new SessionRequest();
        req.setStudent(student);
        req.setTutor(tutor);
        req.setSkill(skill);
        req.setSlot(slot);
        req.setStatus(status);
        req.setMessage(message);
        return requestRepo.save(req);
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

    private void createStudyMaterial(Skill skill, User uploader, String title, String type, String fileName, String contentType, byte[] data, String desc) {
        StudyMaterial m = new StudyMaterial();
        m.setSkill(skill);
        m.setUploader(uploader);
        m.setTitle(title);
        m.setMaterialType(type);
        m.setFileName(fileName);
        m.setContentType(contentType);
        m.setFileSize((long) data.length);
        m.setFileData(data);
        m.setDescription(desc);
        studyMaterialRepo.save(m);
    }
}
