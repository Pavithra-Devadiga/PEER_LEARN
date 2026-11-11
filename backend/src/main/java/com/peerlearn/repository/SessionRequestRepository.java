package com.peerlearn.repository;

import com.peerlearn.entity.SessionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SessionRequestRepository extends JpaRepository<SessionRequest, Long> {
    List<SessionRequest> findByTutorIdAndStatusOrderByCreatedAtAsc(Long tutorId, String status);
    List<SessionRequest> findByStudentIdAndStatusInOrderByCreatedAtDesc(Long studentId, List<String> statuses);
    long countByTutorIdAndStatus(Long tutorId, String status);
    long countByStudentIdAndStatus(Long studentId, String status);
    long countBySlotIdAndStatus(Long slotId, String status);
    boolean existsByStudentIdAndSlotIdAndStatus(Long studentId, Long slotId, String status);

    // Invokes PostgreSQL PL/pgSQL Stored Function fn_reject_conflicting_requests
    @Query(value = "SELECT fn_reject_conflicting_requests(:tutorId, :slotId, :acceptedRequestId, :reason)", nativeQuery = true)
    Integer rejectConflictingRequests(
        @Param("tutorId") Long tutorId,
        @Param("slotId") Long slotId,
        @Param("acceptedRequestId") Long acceptedRequestId,
        @Param("reason") String reason
    );
}
