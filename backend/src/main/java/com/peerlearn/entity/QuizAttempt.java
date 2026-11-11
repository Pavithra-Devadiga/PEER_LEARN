package com.peerlearn.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private LearningSession session;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "missed_topics", length = 500)
    private String missedTopics;

    @Column(name = "strong_topics", length = 500)
    private String strongTopics;

    @Column(name = "attempted_at", nullable = false, updatable = false)
    private LocalDateTime attemptedAt = LocalDateTime.now();

    public QuizAttempt() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LearningSession getSession() { return session; }
    public void setSession(LearningSession session) { this.session = session; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public String getMissedTopics() { return missedTopics; }
    public void setMissedTopics(String missedTopics) { this.missedTopics = missedTopics; }

    public String getStrongTopics() { return strongTopics; }
    public void setStrongTopics(String strongTopics) { this.strongTopics = strongTopics; }

    public LocalDateTime getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime attemptedAt) { this.attemptedAt = attemptedAt; }
}
