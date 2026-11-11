package com.peerlearn.controller;

import com.peerlearn.security.UserPrincipal;
import com.peerlearn.service.BookingAndSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BookingAndSessionController {

    private final BookingAndSessionService service;

    public BookingAndSessionController(BookingAndSessionService service) {
        this.service = service;
    }

    @PostMapping("/requests")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> createRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody Map<String, Object> body
    ) {
        Long tutorId = ((Number) body.get("tutorId")).longValue();
        Long slotId = ((Number) body.get("slotId")).longValue();
        String skillName = (String) body.get("skillName");
        List<String> topics = (List<String>) body.get("topics");
        String message = (String) body.get("message");
        return ResponseEntity.ok(service.createRequest(principal.getId(), tutorId, skillName, slotId, topics, message));
    }

    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<Void> withdrawRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long requestId
    ) {
        service.withdrawRequest(principal.getId(), requestId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tutor/requests")
    public ResponseEntity<List<Map<String, Object>>> getTutorRequests(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getTutorRequestsGrouped(principal.getId()));
    }

    @PostMapping("/tutor/requests/{requestId}/accept")
    public ResponseEntity<Map<String, Object>> acceptRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long requestId
    ) {
        return ResponseEntity.ok(service.acceptRequest(principal.getId(), requestId));
    }

    @PostMapping("/tutor/requests/{requestId}/reject")
    public ResponseEntity<Map<String, Object>> rejectRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long requestId
    ) {
        return ResponseEntity.ok(service.rejectRequest(principal.getId(), requestId));
    }

    @GetMapping("/sessions/student")
    public ResponseEntity<List<Map<String, Object>>> getStudentSessions(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getStudentSessions(principal.getId()));
    }

    @GetMapping("/sessions/tutor")
    public ResponseEntity<List<Map<String, Object>>> getTutorSessions(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getTutorSessions(principal.getId()));
    }

    @PatchMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<Void> cancelSession(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId
    ) {
        service.cancelSession(principal.getId(), sessionId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<Void> completeSession(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId
    ) {
        service.completeSession(principal.getId(), sessionId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/sessions/{sessionId}/topics/{topicId}/toggle")
    public ResponseEntity<Map<String, Object>> toggleTopic(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId,
        @PathVariable Long topicId
    ) {
        return ResponseEntity.ok(service.toggleTopic(principal.getId(), sessionId, topicId));
    }

    @PostMapping("/sessions/{sessionId}/topics")
    public ResponseEntity<Map<String, Object>> addTopic(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(service.addTopic(principal.getId(), sessionId, body.get("name")));
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(service.sendMessage(principal.getId(), sessionId, body.get("text")));
    }

    @PostMapping("/sessions/{sessionId}/rate")
    public ResponseEntity<Map<String, Object>> rateSession(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId,
        @RequestBody Map<String, Object> body
    ) {
        Integer rating = ((Number) body.get("rating")).intValue();
        String comment = (String) body.get("comment");
        return ResponseEntity.ok(service.rateSession(principal.getId(), sessionId, rating, comment));
    }

    @PatchMapping("/sessions/{sessionId}/meeting-url")
    public ResponseEntity<Map<String, Object>> updateMeetingUrl(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(service.updateMeetingUrl(principal.getId(), sessionId, body.get("meetingUrl")));
    }
}
