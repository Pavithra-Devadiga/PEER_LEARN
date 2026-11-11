package com.peerlearn.repository;

import com.peerlearn.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findFirstBySkillId(Long skillId);
}
