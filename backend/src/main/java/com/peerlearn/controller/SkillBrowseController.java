package com.peerlearn.controller;

import com.peerlearn.security.UserPrincipal;
import com.peerlearn.service.SkillBrowseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SkillBrowseController {

    private final SkillBrowseService skillBrowseService;

    public SkillBrowseController(SkillBrowseService skillBrowseService) {
        this.skillBrowseService = skillBrowseService;
    }

    @GetMapping("/skills/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategories() {
        return ResponseEntity.ok(skillBrowseService.getCategoriesWithSkills());
    }

    @GetMapping("/tutors")
    public ResponseEntity<List<Map<String, Object>>> getTutors(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) String skill
    ) {
        Long userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(skillBrowseService.getTutors(userId, skill));
    }
}
