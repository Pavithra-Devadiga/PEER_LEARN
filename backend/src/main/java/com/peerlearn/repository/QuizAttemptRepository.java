package com.peerlearn.repository;

import com.peerlearn.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserIdOrderByAttemptedAtDesc(Long userId);
    List<QuizAttempt> findByUserIdAndQuizSkillIdOrderByAttemptedAtDesc(Long userId, Long skillId);
    Optional<QuizAttempt> findTopBySessionIdAndUserIdOrderByAttemptedAtDesc(Long sessionId, Long userId);
    Optional<QuizAttempt> findTopBySessionIdOrderByAttemptedAtDesc(Long sessionId);
}
