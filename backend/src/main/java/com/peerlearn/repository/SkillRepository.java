package com.peerlearn.repository;

import com.peerlearn.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByCategoryIdOrderByIdAsc(Long categoryId);
    Optional<Skill> findByNameIgnoreCase(String name);

    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Skill> searchByName(@Param("term") String term);
}
