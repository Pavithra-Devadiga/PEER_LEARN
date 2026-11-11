package com.peerlearn.repository;

import com.peerlearn.entity.LearningMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, Long> {
    List<LearningMaterial> findBySkillIdOrderByCreatedAtDesc(Long skillId);
    List<LearningMaterial> findBySkillIdAndIsAiSeededTrueOrderByCreatedAtDesc(Long skillId);
    List<LearningMaterial> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
}
