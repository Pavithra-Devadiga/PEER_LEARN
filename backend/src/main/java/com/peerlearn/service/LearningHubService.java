package com.peerlearn.service;

import com.peerlearn.entity.Skill;
import com.peerlearn.entity.StudyMaterial;
import com.peerlearn.repository.SkillRepository;
import com.peerlearn.repository.StudyMaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class LearningHubService {

    private final SkillRepository skillRepo;
    private final StudyMaterialRepository studyMaterialRepo;

    public LearningHubService(
        SkillRepository skillRepo,
        StudyMaterialRepository studyMaterialRepo
    ) {
        this.skillRepo = skillRepo;
        this.studyMaterialRepo = studyMaterialRepo;
    }

    public record AttachmentPayload(String fileName, String contentType, byte[] data) {}

    @Transactional(readOnly = true)
    public Map<String, Object> getLearningHub(Long userId, String skillName) {
        List<Skill> allSkills = skillRepo.findAll();
        List<String> skillNames = allSkills.stream().map(Skill::getName).toList();
        Skill selected = allSkills.stream()
            .filter(s -> skillName != null && !skillName.isBlank() && s.getName().equalsIgnoreCase(skillName.trim()))
            .findFirst()
            .orElse(allSkills.isEmpty() ? null : allSkills.get(0));

        List<Map<String, Object>> cheatsheets = new ArrayList<>();
        if (selected != null) {
            List<StudyMaterial> materials = studyMaterialRepo.findBySkillIdOrderByUploadedAtDesc(selected.getId());
            for (StudyMaterial m : materials) {
                Map<String, Object> cs = new LinkedHashMap<>();
                cs.put("id", m.getId());
                cs.put("title", m.getTitle());
                cs.put("badge", m.getMaterialType());
                cs.put("tint", m.getSkill().getCategory().getTint());
                cs.put("readTime", "PDF Document");
                cs.put("content", m.getDescription() != null ? m.getDescription() : "Study notes & documentation for " + m.getTitle());
                cs.put("verifiedCount", 1);
                cs.put("isAiSeeded", false);
                cs.put("authorName", m.getUploader() != null ? m.getUploader().getFullName() : "Peer Tutor");

                Map<String, Object> att = new LinkedHashMap<>();
                att.put("name", m.getFileName());
                att.put("contentType", m.getContentType());
                att.put("size", m.getFileSize());
                att.put("url", "/api/learning/materials/" + m.getId() + "/attachment");
                cs.put("attachment", att);
                cs.put("bookmarked", false);

                cheatsheets.add(cs);
            }
        }

        Map<String, Object> progress = Map.of(
            "overallScore", "90%",
            "level", "Level 2: Active Learner",
            "weakTopics", List.of(),
            "strongTopics", List.of("Core Concepts", "Syntax"),
            "history", List.of()
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("skills", skillNames);
        result.put("selectedSkill", selected != null ? selected.getName() : "");
        result.put("cheatsheets", cheatsheets);
        result.put("quiz", null);
        result.put("learningProgress", progress);
        return result;
    }

    public Map<String, Object> toggleBookmark(Long userId, Long materialId) {
        return Map.of("materialId", materialId, "bookmarked", true);
    }

    public Map<String, Object> submitQuizAttempt(Long userId, Long quizId, Map<String, Integer> answers) {
        return Map.of("score", 5, "totalQuestions", 5, "percentage", 100);
    }

    public Map<String, Object> getSessionQuiz(Long userId, Long sessionId) {
        return Map.of("sessionId", sessionId, "questions", List.of());
    }

    public Map<String, Object> submitSessionQuizAttempt(Long userId, Long sessionId, Map<String, Integer> answers) {
        return Map.of("score", 5, "totalQuestions", 5, "percentage", 100);
    }

    @Transactional(readOnly = true)
    public AttachmentPayload getMaterialAttachment(Long materialId) {
        StudyMaterial mat = studyMaterialRepo.findById(materialId)
            .orElseThrow(() -> new NoSuchElementException("Study material not found."));
        return new AttachmentPayload(mat.getFileName(), mat.getContentType(), mat.getFileData());
    }
}
