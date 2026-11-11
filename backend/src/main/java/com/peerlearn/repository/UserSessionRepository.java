package com.peerlearn.repository;

import com.peerlearn.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByTokenId(String tokenId);
    List<UserSession> findTop10ByUserIdOrderByLoggedInAtDesc(Long userId);
    List<UserSession> findByUserIdAndRevokedFalse(Long userId);
}
