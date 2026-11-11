package com.peerlearn.repository;

import com.peerlearn.entity.MaterialVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialVerificationRepository extends JpaRepository<MaterialVerification, Long> {
    boolean existsByMaterialIdAndTutorId(Long materialId, Long tutorId);
    void deleteByMaterialId(Long materialId);
}
