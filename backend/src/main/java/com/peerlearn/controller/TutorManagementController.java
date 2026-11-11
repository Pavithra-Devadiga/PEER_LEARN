package com.peerlearn.controller;

import com.peerlearn.security.UserPrincipal;
import com.peerlearn.service.TutorManagementService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutor")
public class TutorManagementController {

    private final TutorManagementService service;

    public TutorManagementController(TutorManagementService service) {
        this.service = service;
    }

    @GetMapping("/skills")
    public ResponseEntity<List<Map<String, Object>>> getSkills(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getTutorSkills(principal.getId()));
    }

    @PostMapping("/skills")
    public ResponseEntity<Map<String, Object>> addSkill(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody Map<String, Object> body
    ) {
        String name = body.get("name") != null ? String.valueOf(body.get("name")) : null;
        String level = body.get("level") != null ? String.valueOf(body.get("level")) : null;
        Object rawFee = body.get("hourlyFeeInr");
        Integer fee = rawFee instanceof Number n ? n.intValue() : null;
        return ResponseEntity.ok(service.addTutorSkill(principal.getId(), name, level, fee));
    }

    @PatchMapping("/skills/{id}/fee")
    public ResponseEntity<Map<String, Object>> updateSkillFee(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @RequestBody Map<String, Object> body
    ) {
        Object rawFee = body.get("hourlyFeeInr");
        Integer fee = rawFee instanceof Number n ? n.intValue() : null;
        return ResponseEntity.ok(service.updateTutorSkillFee(principal.getId(), id, fee));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> removeSkill(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        service.removeTutorSkill(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/availability")
    public ResponseEntity<List<String>> getAvailability(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getAvailability(principal.getId()));
    }

    @PutMapping("/availability")
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<String>> updateAvailability(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody Map<String, Object> body
    ) {
        List<String> activeSlots = (List<String>) body.get("activeSlots");
        return ResponseEntity.ok(service.updateAvailability(principal.getId(), activeSlots));
    }

    @GetMapping("/contributions")
    public ResponseEntity<Map<String, Object>> getContributions(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) String skill
    ) {
        return ResponseEntity.ok(service.getContributions(principal.getId(), skill));
    }

    @PostMapping(value = "/contributions", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> addContribution(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.ok(service.addContribution(principal.getId(), body));
    }

    @PostMapping(value = "/contributions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> addContributionMultipart(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(value = "skill", required = false) String skill,
        @RequestParam("title") String title,
        @RequestParam(value = "type", required = false) String type,
        @RequestParam(value = "content", required = false) String content,
        @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
            service.addContributionWithFile(principal.getId(), skill, title, type, content, file)
        );
    }

    @PutMapping(value = "/contributions/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateContribution(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(service.updateContribution(principal.getId(), id, body));
    }

    @PutMapping(value = "/contributions/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateContributionMultipart(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @RequestParam(value = "title", required = false) String title,
        @RequestParam(value = "type", required = false) String type,
        @RequestParam(value = "content", required = false) String content,
        @RequestParam(value = "removeAttachment", defaultValue = "false") boolean removeAttachment,
        @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
            service.updateContributionWithFile(principal.getId(), id, title, type, content, removeAttachment, file)
        );
    }

    @PostMapping("/contributions/{id}/verify")
    public ResponseEntity<Map<String, Object>> verifyMaterial(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.verifyMaterial(principal.getId(), id));
    }

    @DeleteMapping("/contributions/{id}")
    public ResponseEntity<Void> deleteContribution(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        service.deleteContribution(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
