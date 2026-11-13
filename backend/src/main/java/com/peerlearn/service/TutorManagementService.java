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
    private final TutorSkillRepository tutorSkillRepo;
    private final AvailabilitySlotRepository slotRepo;
    private final LearningSessionRepository sessionRepo;
    private final ReviewRepository reviewRepo;
    private final StudyMaterialRepository studyMaterialRepo;

    public TutorManagementService(
        UserRepository userRepo,
        CategoryRepository categoryRepo,
        SkillRepository skillRepo,
        TutorSkillRepository tutorSkillRepo,
        AvailabilitySlotRepository slotRepo,
        LearningSessionRepository sessionRepo,
        ReviewRepository reviewRepo,
        StudyMaterialRepository studyMaterialRepo
    ) {
        this.userRepo = userRepo;
        this.categoryRepo = categoryRepo;
        this.skillRepo = skillRepo;
        this.tutorSkillRepo = tutorSkillRepo;
        this.slotRepo = slotRepo;
        this.sessionRepo = sessionRepo;
        this.reviewRepo = reviewRepo;
        this.studyMaterialRepo = studyMaterialRepo;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTutorSkills(Long tutorId) {
        List<TutorSkill> list = tutorSkillRepo.findByTutorId(tutorId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (TutorSkill ts : list) {
            Skill skill = ts.getSkill();
            long taught = sessionRepo.countByTutorIdAndSkillIdAndStatus(tutorId, skill.getId(), "COMPLETED");
            Double avg = reviewRepo.findAverageRatingByTutorIdAndSkillId(tutorId, skill.getId());

            List<String> checklist = (skill.getTags() != null && !skill.getTags().isBlank())
                ? Arrays.stream(skill.getTags().split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList()
                : List.of("Core Fundamentals & Setup", "Hands-on Practice & Edge Cases", "Project Application & Q&A");

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", ts.getId());
            dto.put("skillId", skill.getId());
            dto.put("name", skill.getName());
            dto.put("level", ts.getProficiencyLevel());
            dto.put("category", skill.getCategory().getName());
            dto.put("tint", skill.getCategory().getTint());
            dto.put("icon", skill.getCategory().getIcon());
            dto.put("sessionsTaught", taught);
            dto.put("hourlyFeeInr", ts.getHourlyFeeInr() != null ? ts.getHourlyFeeInr() : 99);
            dto.put("basePriceInr", skill.getBasePriceInr() != null ? skill.getBasePriceInr() : 99);
            dto.put("rating", avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0);
            dto.put("curriculum", checklist);
            result.add(dto);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> addTutorSkill(Long tutorId, String skillName, String level, Integer hourlyFeeInr) {
        if (skillName == null || skillName.isBlank()) {
            throw new IllegalArgumentException("Skill name is required.");
        }
        User tutor = userRepo.findById(tutorId).orElseThrow();
        String normalizedSkillName = skillName.trim();

        Skill skill = skillRepo.findByNameIgnoreCase(normalizedSkillName).orElseGet(() -> {
            Category defaultCat = categoryRepo.findAll().stream().findFirst().orElseGet(() -> {
                Category cat = new Category();
                cat.setName("General");
                cat.setIcon("BookOpen");
                cat.setTint("indigo");
                return categoryRepo.save(cat);
            });
            Skill s = new Skill();
            s.setName(normalizedSkillName);
            s.setCategory(defaultCat);
            s.setBasePriceInr(hourlyFeeInr != null ? hourlyFeeInr : 99);
            s.setTags("Fundamentals, Hands-on Practice");
            return skillRepo.save(s);
        });

        if (tutorSkillRepo.existsByTutorIdAndSkillId(tutorId, skill.getId())) {
            throw new IllegalArgumentException("You are already teaching " + skill.getName() + ".");
        }

        String prof = (level != null && List.of("Beginner", "Intermediate", "Advanced").contains(level.trim()))
            ? level.trim() : "Intermediate";
        int fee = hourlyFeeInr != null && hourlyFeeInr >= 0 && hourlyFeeInr <= 2000 ? hourlyFeeInr : 99;

        TutorSkill ts = new TutorSkill(tutor, skill, prof, fee);
        TutorSkill saved = tutorSkillRepo.save(ts);

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", saved.getId());
        dto.put("skillId", skill.getId());
        dto.put("name", skill.getName());
        dto.put("level", saved.getProficiencyLevel());
        dto.put("hourlyFeeInr", saved.getHourlyFeeInr());
        dto.put("category", skill.getCategory().getName());
        dto.put("tint", skill.getCategory().getTint());
        dto.put("icon", skill.getCategory().getIcon());
        dto.put("sessionsTaught", 0);
        dto.put("rating", 5.0);
        dto.put("curriculum", List.of("Core Fundamentals & Setup", "Hands-on Practice & Edge Cases"));
        return dto;
    }

    @Transactional
    public Map<String, Object> updateTutorSkillFee(Long tutorId, Long tutorSkillId, Integer feeInr) {
        if (feeInr == null || feeInr < 0 || feeInr > 2000) {
            throw new IllegalArgumentException("Session fee must be between ₹0 and ₹2000.");
        }
        TutorSkill ts = tutorSkillRepo.findById(tutorSkillId)
            .orElseThrow(() -> new NoSuchElementException("Tutor skill not found."));
        if (!ts.getTutor().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to update this skill.");
        }
        ts.setHourlyFeeInr(feeInr);
        TutorSkill saved = tutorSkillRepo.save(ts);
        return Map.of("id", saved.getId(), "hourlyFeeInr", saved.getHourlyFeeInr());
    }

    @Transactional
    public void removeTutorSkill(Long tutorId, Long tutorSkillId) {
        TutorSkill ts = tutorSkillRepo.findById(tutorSkillId)
            .orElseThrow(() -> new NoSuchElementException("Tutor skill not found."));
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
    public List<String> updateAvailability(Long tutorId, List<String> activeSlots) {
        User tutor = userRepo.findById(tutorId).orElseThrow();
        Set<String> desired = new HashSet<>(activeSlots != null ? activeSlots : List.of());

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

        List<StudyMaterial> allForSkill = (skill != null)
            ? studyMaterialRepo.findBySkillIdOrderByUploadedAtDesc(skill.getId())
            : List.of();

        List<Map<String, Object>> reviewQueue = new ArrayList<>();
        for (StudyMaterial m : allForSkill) {
            if (m.getUploader() == null || !Objects.equals(m.getUploader().getId(), tutorId)) {
                reviewQueue.add(toStudyMaterialDto(m, tutorId));
            }
        }

        List<Map<String, Object>> myContribs = studyMaterialRepo.findByUploaderIdOrderByUploadedAtDesc(tutorId)
            .stream().map(m -> toStudyMaterialDto(m, tutorId)).toList();

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
            throw new IllegalArgumentException("Please write study notes or upload a PDF/document file.");
        }

        String fileName;
        String contentType;
        long fileSize;
        byte[] fileData;

        if (hasFile) {
            if (file.getSize() > MAX_ATTACHMENT_BYTES) {
                throw new IllegalArgumentException("Uploaded file exceeds the 10MB limit.");
            }
            fileName = sanitizeOriginalFilename(file.getOriginalFilename());
            String ext = extractExtension(fileName);
            contentType = ALLOWED_ATTACHMENT_TYPES.getOrDefault(ext, "application/pdf");
            fileSize = file.getSize();
            try {
                fileData = file.getBytes();
            } catch (IOException ex) {
                throw new IllegalArgumentException("Could not read uploaded file contents.");
            }
        } else {
            fileName = sanitizeOriginalFilename(title.trim().toLowerCase().replaceAll("\\s+", "-") + ".txt");
            contentType = "text/plain";
            fileData = content.trim().getBytes();
            fileSize = fileData.length;
        }

        StudyMaterial mat = new StudyMaterial();
        mat.setSkill(skill);
        mat.setUploader(tutor);
        mat.setTitle(title.trim());
        mat.setMaterialType(type != null && !type.isBlank() ? type.trim() : (hasFile ? "PDF Guide" : "Study Notes"));
        mat.setFileName(fileName);
        mat.setContentType(contentType);
        mat.setFileSize(fileSize);
        mat.setFileData(fileData);
        mat.setDescription(hasText ? content.trim() : "Attached study resource: " + fileName);

        StudyMaterial saved = studyMaterialRepo.save(mat);
        return toStudyMaterialDto(saved, tutorId);
    }

    @Transactional
    public Map<String, Object> updateContribution(Long tutorId, Long materialId, Map<String, String> body) {
        StudyMaterial mat = studyMaterialRepo.findById(materialId)
            .orElseThrow(() -> new NoSuchElementException("Study material not found."));
        if (mat.getUploader() == null || !mat.getUploader().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to edit this material.");
        }
        if (body.get("title") != null && !body.get("title").isBlank()) {
            mat.setTitle(body.get("title").trim());
        }
        if (body.get("type") != null && !body.get("type").isBlank()) {
            mat.setMaterialType(body.get("type").trim());
        }
        if (body.get("content") != null && !body.get("content").isBlank()) {
            mat.setDescription(body.get("content").trim());
        }
        return toStudyMaterialDto(studyMaterialRepo.save(mat), tutorId);
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
        StudyMaterial mat = studyMaterialRepo.findById(materialId)
            .orElseThrow(() -> new NoSuchElementException("Study material not found."));
        if (mat.getUploader() == null || !mat.getUploader().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to edit this material.");
        }
        if (title != null && !title.isBlank()) mat.setTitle(title.trim());
        if (type != null && !type.isBlank()) mat.setMaterialType(type.trim());
        if (content != null && !content.isBlank()) mat.setDescription(content.trim());

        if (file != null && !file.isEmpty()) {
            if (file.getSize() > MAX_ATTACHMENT_BYTES) {
                throw new IllegalArgumentException("File exceeds 10MB limit.");
            }
            String safeName = sanitizeOriginalFilename(file.getOriginalFilename());
            mat.setFileName(safeName);
            mat.setContentType(ALLOWED_ATTACHMENT_TYPES.getOrDefault(extractExtension(safeName), "application/pdf"));
            mat.setFileSize(file.getSize());
            try {
                mat.setFileData(file.getBytes());
            } catch (IOException e) {
                throw new IllegalArgumentException("Failed to read file.");
            }
        }

        return toStudyMaterialDto(studyMaterialRepo.save(mat), tutorId);
    }

    public Map<String, Object> verifyMaterial(Long tutorId, Long materialId) {
        return Map.of("verified", true, "materialId", materialId);
    }

    @Transactional
    public void deleteContribution(Long tutorId, Long materialId) {
        StudyMaterial mat = studyMaterialRepo.findById(materialId)
            .orElseThrow(() -> new NoSuchElementException("Study material not found."));
        if (mat.getUploader() == null || !mat.getUploader().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to delete this contribution.");
        }
        studyMaterialRepo.delete(mat);
    }

    private String sanitizeOriginalFilename(String rawName) {
        if (rawName == null || rawName.isBlank()) return "study-material.pdf";
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

    private Map<String, Object> toStudyMaterialDto(StudyMaterial m, Long viewerTutorId) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", m.getId());
        dto.put("title", m.getTitle());
        dto.put("type", m.getMaterialType());
        dto.put("skill", m.getSkill().getName());
        dto.put("content", m.getDescription() != null ? m.getDescription() : "");
        dto.put("readTime", formatAttachmentLabel(m.getContentType(), m.getFileSize()));
        dto.put("status", "Published");
        dto.put("isAiSeeded", false);
        dto.put("authorName", m.getUploader() != null ? m.getUploader().getFullName() : "Peer Tutor");
        dto.put("verifiedCount", 1);
        dto.put("verifiedByMe", true);
        dto.put("upvotes", 1);

        Map<String, Object> att = new LinkedHashMap<>();
        att.put("name", m.getFileName());
        att.put("contentType", m.getContentType());
        att.put("size", m.getFileSize());
        att.put("url", "/api/learning/materials/" + m.getId() + "/attachment");
        dto.put("attachment", att);

        return dto;
    }
}
