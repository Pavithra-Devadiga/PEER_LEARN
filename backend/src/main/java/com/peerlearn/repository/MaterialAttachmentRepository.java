package com.peerlearn.repository;

import com.peerlearn.entity.MaterialAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaterialAttachmentRepository extends JpaRepository<MaterialAttachment, Long> {
    Optional<MaterialAttachment> findByMaterialId(Long materialId);
    void deleteByMaterialId(Long materialId);
}
