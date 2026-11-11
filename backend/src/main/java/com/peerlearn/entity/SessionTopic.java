package com.peerlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "session_topics")
public class SessionTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private LearningSession session;

    @Column(name = "topic_name", nullable = false, length = 200)
    private String topicName;

    @Column(name = "is_done", nullable = false)
    private Boolean isDone = false;

    @Column(name = "asked_by_student", nullable = false)
    private Boolean askedByStudent = false;

    public SessionTopic() {}

    public SessionTopic(LearningSession session, String topicName, Boolean isDone, Boolean askedByStudent) {
        this.session = session;
        this.topicName = topicName;
        this.isDone = isDone;
        this.askedByStudent = askedByStudent;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LearningSession getSession() { return session; }
    public void setSession(LearningSession session) { this.session = session; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }

    public Boolean getIsDone() { return isDone; }
    public void setIsDone(Boolean isDone) { this.isDone = isDone; }

    public Boolean getAskedByStudent() { return askedByStudent; }
    public void setAskedByStudent(Boolean askedByStudent) { this.askedByStudent = askedByStudent; }
}
