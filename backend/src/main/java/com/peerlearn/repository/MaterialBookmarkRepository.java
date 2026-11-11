package com.peerlearn.repository;

import com.peerlearn.entity.MaterialBookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MaterialBookmarkRepository extends JpaRepository<MaterialBookmark, Long> {
    List<MaterialBookmark> findByUserId(Long userId);
    Optional<MaterialBookmark> findByUserIdAndMaterialId(Long userId, Long materialId);
    long countByMaterialId(Long materialId);
}
