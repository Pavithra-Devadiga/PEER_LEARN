package com.peerlearn.repository;

import com.peerlearn.entity.TutorSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TutorSkillRepository extends JpaRepository<TutorSkill, Long> {
    List<TutorSkill> findByTutorId(Long tutorId);
    List<TutorSkill> findBySkillId(Long skillId);
    Optional<TutorSkill> findByTutorIdAndSkillId(Long tutorId, Long skillId);
    long countBySkillId(Long skillId);

    @Query("SELECT DISTINCT ts.tutor.id FROM TutorSkill ts")
    List<Long> findAllDistinctTutorIds();

    @Query("SELECT DISTINCT ts.tutor.id FROM TutorSkill ts WHERE LOWER(ts.skill.name) LIKE LOWER(CONCAT('%', :skillName, '%'))")
    List<Long> findTutorIdsBySkillNameContaining(@Param("skillName") String skillName);
}
