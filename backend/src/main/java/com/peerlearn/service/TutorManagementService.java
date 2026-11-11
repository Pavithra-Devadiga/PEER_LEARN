package com.peerlearn.service;

import com.peerlearn.entity.*;
import com.peerlearn.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class TutorManagementService {

    private static final long MAX_ATTACHMENT_BYTES = 10L * 1024L * 1024L;
    private static final Map<String, String> ALLOWED_ATTACHMENT_TYPES = Map.ofEntries(
        Map.entry("png", "image/png"),
        Map.entry("jpg", "image/jpeg"),
        Map.entry("jpeg", "image/jpeg"),
        Map.entry("webp", "image/webp"),
        Map.entry("gif", "image/gif"),
        Map.entry("pdf", "application/pdf"),
        Map.entry("txt", "text/plain"),
        Map.entry("md", "text/markdown"),
        Map.entry("csv", "text/csv"),
        Map.entry("doc", "application/msword"),
        Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        Map.entry("ppt", "application/vnd.ms-powerpoint"),
        Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
        Map.entry("xls", "application/vnd.ms-excel"),
        Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    );

    private final UserRepository userRepo;
    private final CategoryRepository categoryRepo;
    private final SkillRepository skillRepo;
    private final SkillCurriculumTopicRepository curriculumRepo;
    private final TutorSkillRepository tutorSkillRepo;
    private final AvailabilitySlotRepository slotRepo;
    private final LearningSessionRepository sessionRepo;
    private final ReviewRepository reviewRepo;
    private final LearningMaterialRepository materialRepo;
    private final MaterialAttachmentRepository attachmentRepo;
    private final MaterialVerificationRepository verificationRepo;
    private final MaterialBookmarkRepository bookmarkRepo;
    private final QuizRepository quizRepo;
    private final QuizQuestionRepository quizQuestionRepo;

    public TutorManagementService(
        UserRepository userRepo,
        CategoryRepository categoryRepo,
        SkillRepository skillRepo,
        SkillCurriculumTopicRepository curriculumRepo,
        TutorSkillRepository tutorSkillRepo,
        AvailabilitySlotRepository slotRepo,
        LearningSessionRepository sessionRepo,
        ReviewRepository reviewRepo,
        LearningMaterialRepository materialRepo,
        MaterialAttachmentRepository attachmentRepo,
        MaterialVerificationRepository verificationRepo,
        MaterialBookmarkRepository bookmarkRepo,
        QuizRepository quizRepo,
        QuizQuestionRepository quizQuestionRepo
    ) {
        this.userRepo = userRepo;
        this.categoryRepo = categoryRepo;
        this.skillRepo = skillRepo;
        this.curriculumRepo = curriculumRepo;
        this.tutorSkillRepo = tutorSkillRepo;
        this.slotRepo = slotRepo;
        this.sessionRepo = sessionRepo;
        this.reviewRepo = reviewRepo;
        this.materialRepo = materialRepo;
        this.attachmentRepo = attachmentRepo;
        this.verificationRepo = verificationRepo;
        this.bookmarkRepo = bookmarkRepo;
        this.quizRepo = quizRepo;
        this.quizQuestionRepo = quizQuestionRepo;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTutorSkills(Long tutorId) {
        List<TutorSkill> list = tutorSkillRepo.findByTutorId(tutorId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (TutorSkill ts : list) {
            Skill skill = ts.getSkill();
            long taught = sessionRepo.countByTutorIdAndSkillIdAndStatus(tutorId, skill.getId(), "COMPLETED");
            Double avg = reviewRepo.findAverageRatingByTutorIdAndSkillId(tutorId, skill.getId());
            List<String> checklist = curriculumRepo.findBySkillIdOrderBySortOrderAsc(skill.getId())
                .stream().map(SkillCurriculumTopic::getTopicName).toList();
            if (checklist.isEmpty()) {
                checklist = List.of(
                    "Core Fundamentals & Setup",
                    "Intermediate Application & Practice",
                    "Advanced Edge Cases & Debugging"
                );
            }

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", ts.getId());
            dto.put("skillId", skill.getId());
            dto.put("name", skill.getName());
            dto.put("level", ts.getProficiencyLevel());
            dto.put("hourlyFeeInr", ts.getHourlyFeeInr() != null ? ts.getHourlyFeeInr() : 99);
            dto.put("rating", avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0);
            dto.put("sessionsTaught", taught);
            dto.put("category", skill.getCategory().getName());
            dto.put("checklist", checklist);
            result.add(dto);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> addTutorSkill(Long tutorId, String skillName, String level, Integer hourlyFeeInr) {
        if (skillName == null || skillName.isBlank()) {
            throw new IllegalArgumentException("Skill name is required.");
        }
        String cleanName = skillName.trim();
        String cleanLevel = (level != null && !level.isBlank()) ? level.trim() : "Intermediate";

        User tutor = userRepo.findById(tutorId).orElseThrow();
        Skill skill = skillRepo.findByNameIgnoreCase(cleanName).orElseGet(() -> {
            Category defaultCat = categoryRepo.findByNameIgnoreCase("Programming & CS")
                .orElseGet(() -> categoryRepo.findAll().stream().findFirst().orElseThrow());
            Skill created = skillRepo.save(new Skill(defaultCat, cleanName, "Fundamentals,Practice", 99));
            curriculumRepo.save(new SkillCurriculumTopic(created, "Core Fundamentals & Setup", 1));
            curriculumRepo.save(new SkillCurriculumTopic(created, "Intermediate Application & Practice", 2));
            curriculumRepo.save(new SkillCurriculumTopic(created, "Advanced Edge Cases & Debugging", 3));
            return created;
        });

        Optional<TutorSkill> existing = tutorSkillRepo.findByTutorIdAndSkillId(tutorId, skill.getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("You already have this skill listed.");
        }

        int resolvedFee = normalizeFeeInr(hourlyFeeInr != null ? hourlyFeeInr : skill.getBasePriceInr());
        TutorSkill saved = tutorSkillRepo.save(new TutorSkill(tutor, skill, cleanLevel, resolvedFee));
        List<String> checklist = curriculumRepo.findBySkillIdOrderBySortOrderAsc(skill.getId())
            .stream().map(SkillCurriculumTopic::getTopicName).toList();

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", saved.getId());
        dto.put("skillId", skill.getId());
        dto.put("name", skill.getName());
        dto.put("level", saved.getProficiencyLevel());
        dto.put("hourlyFeeInr", saved.getHourlyFeeInr());
        dto.put("rating", 5.0);
        dto.put("sessionsTaught", 0L);
        dto.put("category", skill.getCategory().getName());
        dto.put("checklist", checklist);
        return dto;
    }

    @Transactional
    public Map<String, Object> updateTutorSkillFee(Long tutorId, Long tutorSkillId, Integer hourlyFeeInr) {
        TutorSkill ts = tutorSkillRepo.findById(tutorSkillId)
            .orElseThrow(() -> new NoSuchElementException("Skill entry not found."));
        if (!ts.getTutor().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to update this skill fee.");
        }
        int resolvedFee = normalizeFeeInr(hourlyFeeInr);
        ts.setHourlyFeeInr(resolvedFee);
        tutorSkillRepo.save(ts);
        return Map.of("id", ts.getId(), "hourlyFeeInr", resolvedFee);
    }

    private int normalizeFeeInr(Integer rawFee) {
        int fee = rawFee != null ? rawFee : 99;
        if (fee < 0 || fee > 2000) {
            throw new IllegalArgumentException("Session fee must be between ₹0 and ₹2000.");
        }
        return fee;
    }

    @Transactional
    public void removeTutorSkill(Long tutorId, Long tutorSkillId) {
        TutorSkill ts = tutorSkillRepo.findById(tutorSkillId)
            .orElseThrow(() -> new NoSuchElementException("Skill entry not found."));
        if (!ts.getTutor().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to remove this skill.");
        }
        tutorSkillRepo.delete(ts);
    }

    @Transactional(readOnly = true)
    public List<String> getAvailability(Long tutorId) {
        return slotRepo.findByTutorIdOrderByIdAsc(tutorId).stream()
            .filter(s -> Boolean.TRUE.equals(s.getIsAvailable()))
            .map(s -> s.getDayOfWeek() + "-" + s.getSlotTime())
            .toList();
    }

    @Transactional
    public List<String> updateAvailability(Long tutorId, List<String> activeKeys) {
        User tutor = userRepo.findById(tutorId).orElseThrow();
        Set<String> desired = activeKeys != null ? new HashSet<>(activeKeys) : Set.of();

        List<AvailabilitySlot> existing = slotRepo.findByTutorIdOrderByIdAsc(tutorId);
        Set<String> existingKeys = new HashSet<>();

        for (AvailabilitySlot slot : existing) {
            String key = slot.getDayOfWeek() + "-" + slot.getSlotTime();
            existingKeys.add(key);
            slot.setIsAvailable(desired.contains(key));
            slotRepo.save(slot);
        }

        for (String key : desired) {
            if (!existingKeys.contains(key) && key.contains("-")) {
                int idx = key.indexOf('-');
                String day = key.substring(0, idx).trim();
                String time = key.substring(idx + 1).trim();
                slotRepo.save(new AvailabilitySlot(tutor, day, time, true));
            }
        }

        return getAvailability(tutorId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getContributions(Long tutorId, String skillName) {
        Skill skill = resolveSkillForTutor(tutorId, skillName);

        List<Map<String, Object>> reviewQueue = new ArrayList<>();
        if (skill != null) {
            for (LearningMaterial m : materialRepo.findBySkillIdOrderByCreatedAtDesc(skill.getId())) {
                boolean isPeerOrAi = Boolean.TRUE.equals(m.getIsAiSeeded())
                    || m.getAuthor() == null
                    || !Objects.equals(m.getAuthor().getId(), tutorId);
                if (isPeerOrAi) {
                    reviewQueue.add(toMaterialDto(m, tutorId));
                }
            }
        }

        List<Map<String, Object>> myContribs = materialRepo.findByAuthorIdOrderByCreatedAtDesc(tutorId)
            .stream().map(m -> toMaterialDto(m, tutorId)).toList();

        return Map.of(
            "selectedSkill", skill != null ? skill.getName() : "General",
            "aiSeeded", reviewQueue,
            "myContributions", myContribs
        );
    }

    @Transactional
    public Map<String, Object> addContribution(Long tutorId, Map<String, Object> body) {
        String skillName = (String) body.get("skill");
        String title = (String) body.get("title");
        String type = (String) body.get("type");
        String content = (String) body.get("content");

        User tutor = userRepo.findById(tutorId).orElseThrow();
        Skill skill = resolveSkillForTutor(tutorId, skillName);
        if (skill == null) {
            skill = skillRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new NoSuchElementException("No skills found in catalog."));
        }

        if ("Quiz Question".equalsIgnoreCase(type)) {
            String questionText = (String) body.get("questionText");
            String optionA = (String) body.get("optionA");
            String optionB = (String) body.get("optionB");
            String optionC = (String) body.get("optionC");
            String optionD = (String) body.get("optionD");
            String explanation = (String) body.get("explanation");
            String topicTag = (String) body.get("topicTag");
            Object correctRaw = body.get("correctIndex");
            int correctIdx = correctRaw instanceof Number num ? num.intValue() : 0;

            if (questionText == null || questionText.isBlank()
                || optionA == null || optionA.isBlank()
                || optionB == null || optionB.isBlank()
                || optionC == null || optionC.isBlank()
                || optionD == null || optionD.isBlank()) {
                throw new IllegalArgumentException("Question and all 4 options are required.");
            }
            if (correctIdx < 0 || correctIdx > 3) {
                throw new IllegalArgumentException("Correct option index must be between 0 and 3.");
            }

            final Skill targetSkill = skill;
            Quiz quiz = quizRepo.findFirstBySkillId(targetSkill.getId())
                .orElseGet(() -> quizRepo.save(new Quiz(targetSkill, targetSkill.getName() + " Mastery Check")));

            QuizQuestion qq = new QuizQuestion();
            qq.setQuiz(quiz);
            qq.setQuestionText(questionText.trim());
            qq.setOptionA(optionA.trim());
            qq.setOptionB(optionB.trim());
            qq.setOptionC(optionC.trim());
            qq.setOptionD(optionD.trim());
            qq.setCorrectIndex(correctIdx);
            qq.setExplanation(explanation != null && !explanation.isBlank() ? explanation.trim() : "Reviewed and contributed by a peer tutor.");
            qq.setTopicTag(topicTag != null && !topicTag.isBlank() ? topicTag.trim() : targetSkill.getName());
            quizQuestionRepo.save(qq);

            // Also record summary card in tutor's contribution history
            LearningMaterial summary = new LearningMaterial();
            summary.setSkill(skill);
            summary.setAuthor(tutor);
            summary.setTitle(questionText.trim().length() > 90 ? questionText.trim().substring(0, 87) + "..." : questionText.trim());
            summary.setMaterialType("Quiz Question");
            summary.setTint(skill.getCategory().getTint());
            summary.setReadTime("Quiz item");
            summary.setContent("Added to " + quiz.getTitle() + " (" + qq.getTopicTag() + ")");
            summary.setIsAiSeeded(false);
            summary.setVerifiedCount(1);
            summary.setStatus("Published");
            return toMaterialDto(materialRepo.save(summary), tutorId);
        }

        return createTextOrFileContribution(tutorId, skillName, title, type, content, null);
    }

    @Transactional
    public Map<String, Object> addContributionWithFile(
        Long tutorId,
        String skillName,
        String title,
        String type,
        String content,
        MultipartFile file
    ) {
        return createTextOrFileContribution(tutorId, skillName, title, type, content, file);
    }

    private Map<String, Object> createTextOrFileContribution(
        Long tutorId,
        String skillName,
        String title,
        String type,
        String content,
        MultipartFile file
    ) {
        User tutor = userRepo.findById(tutorId).orElseThrow();
        Skill skill = resolveSkillForTutor(tutorId, skillName);
        if (skill == null) {
            skill = skillRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new NoSuchElementException("No skills found in catalog."));
        }

        boolean hasFile = file != null && !file.isEmpty();
        boolean hasText = content != null && !content.isBlank();

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Content title is required.");
        }
        if (!hasText && !hasFile) {
            throw new IllegalArgumentException("Please write study notes or upload a document/image file.");
        }

        LearningMaterial mat = new LearningMaterial();
        mat.setSkill(skill);
        mat.setAuthor(tutor);
        mat.setTitle(title.trim());
        mat.setMaterialType(type != null && !type.isBlank() ? type.trim() : (hasFile ? "Document" : "Notes"));
        mat.setTint(skill.getCategory().getTint());
        mat.setReadTime("4 min read");
        mat.setContent(hasText ? content.trim() : "Attached study resource: " + sanitizeOriginalFilename(file.getOriginalFilename()));
        mat.setIsAiSeeded(false);
        mat.setVerifiedCount(1);
        mat.setStatus("Published");

        LearningMaterial saved = materialRepo.save(mat);
        if (hasFile) {
            saveValidatedAttachment(saved, file);
        }
        return toMaterialDto(saved, tutorId);
    }

    @Transactional
    public Map<String, Object> updateContribution(Long tutorId, Long materialId, Map<String, String> body) {
        return applyContributionUpdate(
            tutorId,
            materialId,
            body.get("title"),
            body.get("type"),
            body.get("content"),
            false,
            null
        );
    }

    @Transactional
    public Map<String, Object> updateContributionWithFile(
        Long tutorId,
        Long materialId,
        String title,
        String type,
        String content,
        boolean removeAttachment,
        MultipartFile file
    ) {
        return applyContributionUpdate(tutorId, materialId, title, type, content, removeAttachment, file);
    }

    private Map<String, Object> applyContributionUpdate(
        Long tutorId,
        Long materialId,
        String title,
        String type,
        String content,
        boolean removeAttachment,
        MultipartFile file
    ) {
        LearningMaterial mat = materialRepo.findById(materialId)
            .orElseThrow(() -> new NoSuchElementException("Contribution not found."));
        if (mat.getAuthor() == null || !mat.getAuthor().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to edit this contribution.");
        }
        if (title != null && !title.isBlank()) mat.setTitle(title.trim());
        if (type != null && !type.isBlank()) mat.setMaterialType(type.trim());
        if (content != null && !content.isBlank()) mat.setContent(content.trim());

        boolean hasNewFile = file != null && !file.isEmpty();
        if (removeAttachment && !hasNewFile) {
            mat.setAttachmentName(null);
            mat.setAttachmentContentType(null);
            mat.setAttachmentSize(null);
            mat.setReadTime("4 min read");
            attachmentRepo.deleteByMaterialId(materialId);
        } else if (hasNewFile) {
            saveValidatedAttachment(mat, file);
        }

        return toMaterialDto(materialRepo.save(mat), tutorId);
    }

    @Transactional
    public Map<String, Object> verifyMaterial(Long tutorId, Long materialId) {
        LearningMaterial mat = materialRepo.findById(materialId)
            .orElseThrow(() -> new NoSuchElementException("Material not found."));
        User tutor = userRepo.findById(tutorId).orElseThrow();

        if (!verificationRepo.existsByMaterialIdAndTutorId(materialId, tutorId)) {
            verificationRepo.save(new MaterialVerification(mat, tutor));
            mat.setVerifiedCount(mat.getVerifiedCount() + 1);
            mat = materialRepo.save(mat);
        }
        return toMaterialDto(mat, tutorId);
    }

    @Transactional
    public void deleteContribution(Long tutorId, Long materialId) {
        LearningMaterial mat = materialRepo.findById(materialId)
            .orElseThrow(() -> new NoSuchElementException("Contribution not found."));
        if (mat.getAuthor() == null || !mat.getAuthor().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to delete this contribution.");
        }
        attachmentRepo.deleteByMaterialId(materialId);
        verificationRepo.deleteByMaterialId(materialId);
        materialRepo.delete(mat);
    }

    private void saveValidatedAttachment(LearningMaterial mat, MultipartFile file) {
        if (file.getSize() > MAX_ATTACHMENT_BYTES) {
            throw new IllegalArgumentException("Uploaded file exceeds the 10MB limit.");
        }
        String safeName = sanitizeOriginalFilename(file.getOriginalFilename());
        String ext = extractExtension(safeName);
        String normalizedType = ALLOWED_ATTACHMENT_TYPES.get(ext);
        if (normalizedType == null) {
            throw new IllegalArgumentException(
                "Unsupported file format. Please upload PDF, PNG/JPG/WEBP/GIF images, TXT/MD/CSV, or Word/PowerPoint/Excel files."
            );
        }

        mat.setAttachmentName(safeName);
        mat.setAttachmentContentType(normalizedType);
        mat.setAttachmentSize(file.getSize());
        mat.setReadTime(formatAttachmentLabel(normalizedType, file.getSize()));
        materialRepo.save(mat);

        try {
            byte[] bytes = file.getBytes();
            MaterialAttachment att = attachmentRepo.findByMaterialId(mat.getId()).orElseGet(MaterialAttachment::new);
            att.setMaterial(mat);
            att.setFileData(bytes);
            attachmentRepo.save(att);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read uploaded file contents.");
        }
    }

    private String sanitizeOriginalFilename(String rawName) {
        if (rawName == null || rawName.isBlank()) return "study-material";
        String base = rawName.replace('\\', '/');
        int slashIdx = base.lastIndexOf('/');
        if (slashIdx >= 0) base = base.substring(slashIdx + 1);
        base = base.trim().replaceAll("[\\r\\n\"]", "_");
        return base.length() > 240 ? base.substring(0, 240) : base;
    }

    private String extractExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String formatAttachmentLabel(String contentType, long bytes) {
        String sizeLabel = bytes >= 1024 * 1024
            ? String.format(Locale.US, "%.1f MB", bytes / (1024.0 * 1024.0))
            : Math.max(1, Math.round(bytes / 1024.0)) + " KB";
        if (contentType.startsWith("image/")) return "Image • " + sizeLabel;
        if ("application/pdf".equals(contentType)) return "PDF • " + sizeLabel;
        return "Document • " + sizeLabel;
    }

    private Skill resolveSkillForTutor(Long tutorId, String skillName) {
        if (skillName != null && !skillName.isBlank()) {
            Optional<Skill> exact = skillRepo.findByNameIgnoreCase(skillName.trim());
            if (exact.isPresent()) return exact.get();
            List<Skill> partial = skillRepo.searchByName(skillName.trim());
            if (!partial.isEmpty()) return partial.get(0);
        }
        List<TutorSkill> tsList = tutorSkillRepo.findByTutorId(tutorId);
        if (!tsList.isEmpty()) return tsList.get(0).getSkill();
        return skillRepo.findAll().stream().findFirst().orElse(null);
    }

    private Map<String, Object> toMaterialDto(LearningMaterial m, Long viewerTutorId) {
        long bookmarks = bookmarkRepo.countByMaterialId(m.getId());
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", m.getId());
        dto.put("title", m.getTitle());
        dto.put("type", m.getMaterialType());
        dto.put("skill", m.getSkill().getName());
        dto.put("content", m.getContent());
        dto.put("readTime", m.getReadTime());
        dto.put("status", m.getStatus());
        dto.put("isAiSeeded", Boolean.TRUE.equals(m.getIsAiSeeded()));
        dto.put("authorName", m.getAuthor() != null ? m.getAuthor().getFullName() : "PeerLearn AI");
        dto.put("verifiedCount", m.getVerifiedCount());
        dto.put("verifiedByMe", viewerTutorId != null && verificationRepo.existsByMaterialIdAndTutorId(m.getId(), viewerTutorId));
        dto.put("upvotes", bookmarks + m.getVerifiedCount());
        dto.put("attachment", LearningHubService.buildAttachmentMeta(m));
        return dto;
    }
}
