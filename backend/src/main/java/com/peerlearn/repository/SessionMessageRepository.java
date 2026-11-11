package com.peerlearn.repository;

import com.peerlearn.entity.SessionMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionMessageRepository extends JpaRepository<SessionMessage, Long> {
    List<SessionMessage> findBySessionIdOrderBySentAtAsc(Long sessionId);
}
