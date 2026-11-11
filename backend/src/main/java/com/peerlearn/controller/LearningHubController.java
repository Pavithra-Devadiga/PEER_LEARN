package com.peerlearn.controller;

import com.peerlearn.security.UserPrincipal;
import com.peerlearn.service.LearningHubService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/learning")
public class LearningHubController {

    private final LearningHubService service;

    public LearningHubController(LearningHubService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLearningHub(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) String skill
    ) {
        return ResponseEntity.ok(service.getLearningHub(principal.getId(), skill));
    }

    @PostMapping("/materials/{id}/bookmark")
    public ResponseEntity<Map<String, Object>> toggleBookmark(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.toggleBookmark(principal.getId(), id));
    }

    @GetMapping("/materials/{id}/attachment")
    public ResponseEntity<byte[]> getMaterialAttachment(
        @PathVariable Long id,
        @RequestParam(defaultValue = "false") boolean download
    ) {
        LearningHubService.AttachmentPayload payload = service.getMaterialAttachment(id);
        String rawName = payload.fileName() != null ? payload.fileName() : ("material-" + id);
        String safeName = rawName.replaceAll("[^a-zA-Z0-9._ -]", "_").replace('"', '_');
        String ct = payload.contentType() != null ? payload.contentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        boolean previewable = ct.startsWith("image/")
            || MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(ct)
            || ct.startsWith("text/");
        ContentDisposition disposition = (download || !previewable)
            ? ContentDisposition.attachment().filename(safeName, StandardCharsets.UTF_8).build()
            : ContentDisposition.inline().filename(safeName, StandardCharsets.UTF_8).build();

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
            .header("X-Content-Type-Options", "nosniff")
            .contentType(MediaType.parseMediaType(ct))
            .contentLength(payload.data().length)
            .body(payload.data());
    }

    @PostMapping("/quizzes/{quizId}/attempt")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> submitAttempt(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long quizId,
        @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.ok(service.submitQuizAttempt(principal.getId(), quizId, extractAnswers(body)));
    }

    @GetMapping("/sessions/{sessionId}/quiz")
    public ResponseEntity<Map<String, Object>> getSessionQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId
    ) {
        return ResponseEntity.ok(service.getSessionQuiz(principal.getId(), sessionId));
    }

    @PostMapping("/sessions/{sessionId}/quiz/attempt")
    public ResponseEntity<Map<String, Object>> submitSessionQuizAttempt(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId,
        @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.ok(service.submitSessionQuizAttempt(principal.getId(), sessionId, extractAnswers(body)));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Integer> extractAnswers(Map<String, Object> body) {
        Map<String, Object> rawAnswers = body != null ? (Map<String, Object>) body.get("answers") : null;
        Map<String, Integer> selectedAnswers = new java.util.HashMap<>();
        if (rawAnswers != null) {
            rawAnswers.forEach((k, v) -> {
                if (v instanceof Number num) {
                    selectedAnswers.put(k, num.intValue());
                }
            });
        }
        return selectedAnswers;
    }
}
