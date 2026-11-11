package com.peerlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "session_request_topics")
public class SessionRequestTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private SessionRequest request;

    @Column(name = "topic_name", nullable = false, length = 200)
    private String topicName;

    public SessionRequestTopic() {}

    public SessionRequestTopic(SessionRequest request, String topicName) {
        this.request = request;
        this.topicName = topicName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SessionRequest getRequest() { return request; }
    public void setRequest(SessionRequest request) { this.request = request; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }
}
