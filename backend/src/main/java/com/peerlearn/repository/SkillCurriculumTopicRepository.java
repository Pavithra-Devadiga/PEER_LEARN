package com.peerlearn.repository;

import com.peerlearn.entity.SkillCurriculumTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillCurriculumTopicRepository extends JpaRepository<SkillCurriculumTopic, Long> {
    List<SkillCurriculumTopic> findBySkillIdOrderBySortOrderAsc(Long skillId);
}
