package com.peerlearn.repository;

import com.peerlearn.entity.LearningSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LearningSessionRepository extends JpaRepository<LearningSession, Long> {
    List<LearningSession> findByStudentIdOrderByScheduledDateAsc(Long studentId);
    List<LearningSession> findByTutorIdOrderByScheduledDateAsc(Long tutorId);
    List<LearningSession> findByStudentIdAndStatusOrderByScheduledDateAsc(Long studentId, String status);
    List<LearningSession> findByTutorIdAndStatusOrderByScheduledDateAsc(Long tutorId, String status);

    long countByStudentIdAndStatus(Long studentId, String status);
    long countByTutorIdAndStatus(Long tutorId, String status);
    long countByTutorIdAndSkillIdAndStatus(Long tutorId, Long skillId, String status);

    @Query("SELECT COALESCE(SUM(s.durationHours), 0.0) FROM LearningSession s WHERE s.student.id = :studentId AND s.status = 'COMPLETED'")
    Double sumCompletedHoursByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COALESCE(SUM(s.durationHours), 0.0) FROM LearningSession s WHERE s.tutor.id = :tutorId AND s.status = 'COMPLETED'")
    Double sumCompletedHoursByTutorId(@Param("tutorId") Long tutorId);

    @Query("SELECT COUNT(DISTINCT s.skill.id) FROM LearningSession s WHERE s.student.id = :studentId AND s.status IN ('UPCOMING', 'COMPLETED')")
    long countDistinctSkillsByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(DISTINCT s.student.id) FROM LearningSession s WHERE s.tutor.id = :tutorId AND s.status IN ('UPCOMING', 'COMPLETED')")
    long countDistinctStudentsByTutorId(@Param("tutorId") Long tutorId);

    List<LearningSession> findByStudentIdAndScheduledDateBetween(Long studentId, LocalDate start, LocalDate end);
    List<LearningSession> findByTutorIdAndScheduledDateBetween(Long tutorId, LocalDate start, LocalDate end);
}
