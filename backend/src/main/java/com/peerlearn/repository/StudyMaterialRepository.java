package com.peerlearn.repository;

import com.peerlearn.entity.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    List<StudyMaterial> findBySkillIdOrderByUploadedAtDesc(Long skillId);
    List<StudyMaterial> findByUploaderIdOrderByUploadedAtDesc(Long uploaderId);
    void deleteBySkillId(Long skillId);
}
