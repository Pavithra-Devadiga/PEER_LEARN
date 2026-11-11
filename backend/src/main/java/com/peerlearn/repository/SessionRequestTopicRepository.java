package com.peerlearn.repository;

import com.peerlearn.entity.SessionRequestTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRequestTopicRepository extends JpaRepository<SessionRequestTopic, Long> {
    List<SessionRequestTopic> findByRequestId(Long requestId);
}
