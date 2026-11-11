package com.peerlearn.controller;

import com.peerlearn.security.UserPrincipal;
import com.peerlearn.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/badges")
    public ResponseEntity<Map<String, Long>> getBadges(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getSidebarBadges(principal.getId()));
    }

    @GetMapping("/student/dashboard")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getStudentDashboard(principal.getId()));
    }

    @GetMapping("/tutor/dashboard")
    public ResponseEntity<Map<String, Object>> getTutorDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getTutorDashboard(principal.getId()));
    }

    @GetMapping("/tutor/insights")
    public ResponseEntity<Map<String, Object>> getTutorInsights(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getTutorInsights(principal.getId()));
    }

    @GetMapping("/calendar")
    public ResponseEntity<Map<String, Object>> getCalendar(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(defaultValue = "student") String mode,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) Integer month
    ) {
        return ResponseEntity.ok(dashboardService.getCalendarData(principal.getId(), mode, year, month));
    }
}
