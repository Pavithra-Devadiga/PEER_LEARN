package com.peerlearn.service;

import com.peerlearn.entity.*;
import com.peerlearn.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class LearningHubService {

    private final SkillRepository skillRepo;
    private final LearningMaterialRepository materialRepo;
    private final MaterialAttachmentRepository attachmentRepo;
    private final MaterialBookmarkRepository bookmarkRepo;
    private final QuizRepository quizRepo;
    private final QuizQuestionRepository questionRepo;
    private final QuizAttemptRepository attemptRepo;
    private final UserRepository userRepo;
    private final LearningSessionRepository sessionRepo;
    private final SessionTopicRepository topicRepo;

    public LearningHubService(
        SkillRepository skillRepo,
        LearningMaterialRepository materialRepo,
        MaterialAttachmentRepository attachmentRepo,
        MaterialBookmarkRepository bookmarkRepo,
        QuizRepository quizRepo,
        QuizQuestionRepository questionRepo,
        QuizAttemptRepository attemptRepo,
        UserRepository userRepo,
        LearningSessionRepository sessionRepo,
        SessionTopicRepository topicRepo
    ) {
        this.skillRepo = skillRepo;
        this.materialRepo = materialRepo;
        this.attachmentRepo = attachmentRepo;
        this.bookmarkRepo = bookmarkRepo;
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
        this.attemptRepo = attemptRepo;
        this.userRepo = userRepo;
        this.sessionRepo = sessionRepo;
        this.topicRepo = topicRepo;
    }

    public record AttachmentPayload(String fileName, String contentType, byte[] data) {}

    public static Map<String, Object> buildAttachmentMeta(LearningMaterial m) {
        if (m.getAttachmentName() == null || m.getAttachmentName().isBlank()) {
            return null;
        }
        Map<String, Object> att = new LinkedHashMap<>();
        att.put("name", m.getAttachmentName());
        att.put("contentType", m.getAttachmentContentType() != null ? m.getAttachmentContentType() : "application/octet-stream");
        att.put("size", m.getAttachmentSize() != null ? m.getAttachmentSize() : 0L);
        att.put("url", "/api/learning/materials/" + m.getId() + "/attachment");
        return att;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLearningHub(Long userId, String skillName) {
        List<Skill> allSkills = skillRepo.findAll();
        List<Skill> hubSkills = allSkills.stream()
            .filter(s -> !materialRepo.findBySkillIdOrderByCreatedAtDesc(s.getId()).isEmpty()
                || quizRepo.findFirstBySkillId(s.getId()).isPresent())
            .toList();
        if (hubSkills.isEmpty()) {
            hubSkills = allSkills;
        }

        List<String> skillNames = hubSkills.stream().map(Skill::getName).toList();
        Skill selected = hubSkills.stream()
            .filter(s -> skillName != null && !skillName.isBlank() && s.getName().equalsIgnoreCase(skillName.trim()))
            .findFirst()
            .orElse(hubSkills.isEmpty() ? null : hubSkills.get(0));

        // Bookmarked IDs for user
        Set<Long> bookmarkedIds = new HashSet<>();
        for (MaterialBookmark bm : bookmarkRepo.findByUserId(userId)) {
            bookmarkedIds.add(bm.getMaterial().getId());
        }

        List<Map<String, Object>> cheatsheets = new ArrayList<>();
        Map<String, Object> quizDto = null;

        if (selected != null) {
            for (LearningMaterial m : materialRepo.findBySkillIdOrderByCreatedAtDesc(selected.getId())) {
                Map<String, Object> cs = new LinkedHashMap<>();
                cs.put("id", m.getId());
                cs.put("title", m.getTitle());
                cs.put("badge", m.getMaterialType());
                cs.put("tint", m.getTint());
                cs.put("readTime", m.getReadTime());
                cs.put("content", m.getContent());
                cs.put("verifiedCount", m.getVerifiedCount());
                cs.put("isAiSeeded", Boolean.TRUE.equals(m.getIsAiSeeded()));
                cs.put("authorName", m.getAuthor() != null ? m.getAuthor().getFullName() : "PeerLearn AI");
                cs.put("attachment", buildAttachmentMeta(m));
                cs.put("bookmarked", bookmarkedIds.contains(m.getId()));
                cheatsheets.add(cs);
            }

            Optional<Quiz> quizOpt = quizRepo.findFirstBySkillId(selected.getId());
            if (quizOpt.isPresent()) {
                Quiz qz = quizOpt.get();
                List<Map<String, Object>> qDtos = questionRepo.findByQuizIdOrderByIdAsc(qz.getId()).stream()
                    .map(qq -> toQuestionDto(qq, false)).toList();

                quizDto = Map.of(
                    "id", qz.getId(),
                    "title", qz.getTitle(),
                    "questions", qDtos
                );
            }
        }

        Map<String, Object> progress = buildLearningProgress(userId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("skills", skillNames);
        result.put("selectedSkill", selected != null ? selected.getName() : "");
        result.put("cheatsheets", cheatsheets);
        result.put("quiz", quizDto);
        result.put("learningProgress", progress);
        return result;
    }

    @Transactional
    public Map<String, Object> toggleBookmark(Long userId, Long materialId) {
        User user = userRepo.findById(userId).orElseThrow();
        LearningMaterial mat = materialRepo.findById(materialId)
            .orElseThrow(() -> new NoSuchElementException("Material not found."));

        Optional<MaterialBookmark> existing = bookmarkRepo.findByUserIdAndMaterialId(userId, materialId);
        boolean bookmarked;
        if (existing.isPresent()) {
            bookmarkRepo.delete(existing.get());
            bookmarked = false;
        } else {
            bookmarkRepo.save(new MaterialBookmark(user, mat));
            bookmarked = true;
        }
        return Map.of("materialId", materialId, "bookmarked", bookmarked);
    }

    @Transactional
    public Map<String, Object> submitQuizAttempt(Long userId, Long quizId, Map<String, Integer> answers) {
        User user = userRepo.findById(userId).orElseThrow();
        Quiz quiz = quizRepo.findById(quizId)
            .orElseThrow(() -> new NoSuchElementException("Quiz not found."));
        List<QuizQuestion> questions = questionRepo.findByQuizIdOrderByIdAsc(quizId);
        return gradeAndSaveAttempt(user, quiz, questions, answers, null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSessionQuiz(Long userId, Long sessionId) {
        LearningSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        boolean authorized = session.getStudent().getId().equals(userId)
            || session.getTutor().getId().equals(userId);
        if (!authorized) {
            throw new SecurityException("Not authorized to view this session quiz.");
        }
        if (!"COMPLETED".equals(session.getStatus())) {
            throw new IllegalArgumentException("Complete the class session first to unlock the post-class quiz.");
        }

        List<SessionTopic> sessionTopics = topicRepo.findBySessionIdOrderByIdAsc(sessionId);
        List<String> coveredTopicNames = sessionTopics.stream()
            .filter(t -> Boolean.TRUE.equals(t.getIsDone()))
            .map(SessionTopic::getTopicName)
            .toList();
        if (coveredTopicNames.isEmpty()) {
            coveredTopicNames = sessionTopics.stream().map(SessionTopic::getTopicName).toList();
        }

        Optional<Quiz> quizOpt = quizRepo.findFirstBySkillId(session.getSkill().getId());
        if (quizOpt.isEmpty()) {
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("sessionId", sessionId);
            empty.put("sessionTitle", session.getTitle());
            empty.put("skill", session.getSkill().getName());
            empty.put("quizTitle", "Post-Class Quiz: " + session.getSkill().getName());
            empty.put("coveredTopics", coveredTopicNames);
            empty.put("matchedTopicCount", 0);
            empty.put("questions", List.of());
            return empty;
        }

        Quiz quiz = quizOpt.get();
        List<ScoredQuestion> selected = selectSessionQuestions(quiz.getId(), sessionTopics);
        List<Map<String, Object>> qDtos = selected.stream()
            .map(sq -> toQuestionDto(sq.question(), sq.relevance() > 0))
            .toList();
        long matchedCount = selected.stream().filter(sq -> sq.relevance() > 0).count();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("sessionId", sessionId);
        res.put("sessionTitle", session.getTitle());
        res.put("skill", session.getSkill().getName());
        res.put("quizId", quiz.getId());
        res.put("quizTitle", "Post-Class Quiz: " + session.getSkill().getName());
        res.put("coveredTopics", coveredTopicNames);
        res.put("matchedTopicCount", matchedCount);
        res.put("questions", qDtos);

        attemptRepo.findTopBySessionIdAndUserIdOrderByAttemptedAtDesc(sessionId, userId).ifPresent(att -> {
            int pct = att.getTotalQuestions() > 0
                ? (int) Math.round(att.getScore() * 100.0 / att.getTotalQuestions())
                : 0;
            res.put("latestAttempt", Map.of(
                "score", att.getScore(),
                "totalQuestions", att.getTotalQuestions(),
                "percentage", pct
            ));
        });

        return res;
    }

    @Transactional
    public Map<String, Object> submitSessionQuizAttempt(Long userId, Long sessionId, Map<String, Integer> answers) {
        LearningSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        if (!session.getStudent().getId().equals(userId)) {
            throw new SecurityException("Only the student who attended this session can submit this post-class quiz.");
        }
        if (!"COMPLETED".equals(session.getStatus())) {
            throw new IllegalArgumentException("Only completed sessions can record a post-class quiz attempt.");
        }

        Quiz quiz = quizRepo.findFirstBySkillId(session.getSkill().getId())
            .orElseThrow(() -> new NoSuchElementException("No quiz bank found for this skill yet."));
        List<SessionTopic> sessionTopics = topicRepo.findBySessionIdOrderByIdAsc(sessionId);
        List<QuizQuestion> questions = selectSessionQuestions(quiz.getId(), sessionTopics).stream()
            .map(ScoredQuestion::question)
            .toList();
        if (questions.isEmpty()) {
            throw new IllegalArgumentException("No quiz questions available for this skill yet.");
        }

        return gradeAndSaveAttempt(session.getStudent(), quiz, questions, answers, session);
    }

    private Map<String, Object> gradeAndSaveAttempt(
        User user,
        Quiz quiz,
        List<QuizQuestion> questions,
        Map<String, Integer> answers,
        LearningSession session
    ) {
        int score = 0;
        Set<String> missed = new LinkedHashSet<>();
        Set<String> strong = new LinkedHashSet<>();

        for (QuizQuestion qq : questions) {
            Integer selectedIdx = answers != null ? answers.get(String.valueOf(qq.getId())) : null;
            if (selectedIdx != null && selectedIdx.equals(qq.getCorrectIndex())) {
                score++;
                strong.add(qq.getTopicTag());
            } else {
                missed.add(qq.getTopicTag());
            }
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setUser(user);
        attempt.setSession(session);
        attempt.setScore(score);
        attempt.setTotalQuestions(questions.size());
        attempt.setMissedTopics(String.join(",", missed));
        attempt.setStrongTopics(String.join(",", strong));
        attemptRepo.save(attempt);

        int pct = questions.isEmpty() ? 0 : (int) Math.round(score * 100.0 / questions.size());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("score", score);
        result.put("totalQuestions", questions.size());
        result.put("percentage", pct);
        result.put("missedTopics", new ArrayList<>(missed));
        result.put("strongTopics", new ArrayList<>(strong));
        result.put("learningProgress", buildLearningProgress(user.getId()));
        return result;
    }

    private record ScoredQuestion(QuizQuestion question, int relevance) {}

    private List<ScoredQuestion> selectSessionQuestions(Long quizId, List<SessionTopic> sessionTopics) {
        List<QuizQuestion> all = questionRepo.findByQuizIdOrderByIdAsc(quizId);
        if (all.isEmpty()) return List.of();

        List<ScoredQuestion> scored = all.stream()
            .map(q -> new ScoredQuestion(q, computeTopicRelevance(q, sessionTopics)))
            .sorted((a, b) -> Integer.compare(b.relevance(), a.relevance()))
            .toList();

        List<ScoredQuestion> picked = new ArrayList<>();
        for (ScoredQuestion sq : scored) {
            if (sq.relevance() > 0 && picked.size() < 5) {
                picked.add(sq);
            }
        }
        for (ScoredQuestion sq : scored) {
            if (picked.size() >= 3) break;
            if (!picked.contains(sq)) {
                picked.add(sq);
            }
        }
        return picked;
    }

    private int computeTopicRelevance(QuizQuestion qq, List<SessionTopic> sessionTopics) {
        if (sessionTopics == null || sessionTopics.isEmpty()) return 0;
        String tag = qq.getTopicTag() != null ? qq.getTopicTag().toLowerCase(Locale.ROOT) : "";
        String qText = qq.getQuestionText() != null ? qq.getQuestionText().toLowerCase(Locale.ROOT) : "";
        Set<String> tagWords = extractKeywords(tag);

        int bestScore = 0;
        for (SessionTopic st : sessionTopics) {
            String topic = st.getTopicName() != null ? st.getTopicName().toLowerCase(Locale.ROOT) : "";
            if (topic.isEmpty()) continue;

            int score = 0;
            if (!tag.isEmpty() && (topic.contains(tag) || tag.contains(topic))) {
                score += 10;
            }
            for (String w : extractKeywords(topic)) {
                if (tagWords.contains(w)) score += 3;
                else if (qText.contains(w)) score += 1;
            }
            if (score > 0 && Boolean.TRUE.equals(st.getIsDone())) {
                score += 1;
            }
            if (score > bestScore) {
                bestScore = score;
            }
        }
        return bestScore;
    }

    private Set<String> extractKeywords(String text) {
        Set<String> stop = Set.of("and", "the", "for", "with", "into", "from", "using", "basics", "overview");
        Set<String> words = new HashSet<>();
        if (text == null) return words;
        for (String token : text.split("[^a-z0-9]+")) {
            if (token.length() >= 3 && !stop.contains(token)) {
                words.add(token);
            }
        }
        return words;
    }

    private Map<String, Object> toQuestionDto(QuizQuestion qq, boolean matchedTopic) {
        Map<String, Object> qm = new LinkedHashMap<>();
        qm.put("id", qq.getId());
        qm.put("question", qq.getQuestionText());
        qm.put("options", List.of(qq.getOptionA(), qq.getOptionB(), qq.getOptionC(), qq.getOptionD()));
        qm.put("correctIndex", qq.getCorrectIndex());
        qm.put("explanation", qq.getExplanation());
        qm.put("topicTag", qq.getTopicTag());
        qm.put("matchedTopic", matchedTopic);
        return qm;
    }

    private Map<String, Object> buildLearningProgress(Long userId) {
        List<QuizAttempt> attempts = attemptRepo.findByUserIdOrderByAttemptedAtDesc(userId);
        if (attempts.isEmpty()) {
            return Map.of(
                "overallScore", "—",
                "level", "Level 1: Getting Started",
                "weakTopics", List.of(),
                "strongTopics", List.of(),
                "history", List.of()
            );
        }

        double totalPct = 0;
        Set<String> weakTopics = new LinkedHashSet<>();
        Set<String> strongTopics = new LinkedHashSet<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
        List<Map<String, Object>> history = new ArrayList<>();

        for (QuizAttempt a : attempts) {
            int pct = a.getTotalQuestions() > 0 ? (int) Math.round(a.getScore() * 100.0 / a.getTotalQuestions()) : 0;
            totalPct += pct;

            if (a.getMissedTopics() != null && !a.getMissedTopics().isBlank()) {
                Arrays.stream(a.getMissedTopics().split(",")).map(String::trim).filter(s -> !s.isEmpty()).forEach(weakTopics::add);
            }
            if (a.getStrongTopics() != null && !a.getStrongTopics().isBlank()) {
                Arrays.stream(a.getStrongTopics().split(",")).map(String::trim).filter(s -> !s.isEmpty()).forEach(strongTopics::add);
            }

            if (history.size() < 5) {
                history.add(Map.of(
                    "date", a.getAttemptedAt().format(fmt),
                    "quiz", a.getQuiz().getTitle(),
                    "score", pct + "%"
                ));
            }
        }

        int overall = (int) Math.round(totalPct / attempts.size());
        String level = overall >= 85 ? "Level 3: Proficient" : overall >= 60 ? "Level 2: Developing" : "Level 1: Foundation";

        // Remove topics from weak if mastered in latest attempts, or keep distinct
        strongTopics.removeAll(weakTopics);

        return Map.of(
            "overallScore", overall + "%",
            "level", level,
            "weakTopics", new ArrayList<>(weakTopics),
            "strongTopics", new ArrayList<>(strongTopics),
            "history", history
        );
    }

    @Transactional(readOnly = true)
    public AttachmentPayload getMaterialAttachment(Long materialId) {
        LearningMaterial mat = materialRepo.findById(materialId)
            .orElseThrow(() -> new NoSuchElementException("Material not found."));
        MaterialAttachment att = attachmentRepo.findByMaterialId(materialId)
            .orElseThrow(() -> new NoSuchElementException("No attachment found for this material."));
        return new AttachmentPayload(mat.getAttachmentName(), mat.getAttachmentContentType(), att.getFileData());
    }
}
