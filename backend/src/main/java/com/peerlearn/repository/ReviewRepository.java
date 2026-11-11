package com.peerlearn.repository;

import com.peerlearn.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTutorIdOrderByCreatedAtDesc(Long tutorId);
    Optional<Review> findBySessionId(Long sessionId);
    long countByTutorId(Long tutorId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.tutor.id = :tutorId")
    Double findAverageRatingByTutorId(@Param("tutorId") Long tutorId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.tutor.id = :tutorId AND r.skill.id = :skillId")
    Double findAverageRatingByTutorIdAndSkillId(@Param("tutorId") Long tutorId, @Param("skillId") Long skillId);
}
