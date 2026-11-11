package com.peerlearn.controller;

import com.peerlearn.security.UserPrincipal;
import com.peerlearn.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "OK", "backend", "Spring Boot", "database", "PostgreSQL");
    }

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, Object>> register(
        @RequestBody Map<String, String> body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        clearSessionCookie(request, response);
        return ResponseEntity.ok(authService.register(body.get("name"), body.get("email"), body.get("password"), request));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(
        @RequestBody Map<String, String> body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        clearSessionCookie(request, response);
        return ResponseEntity.ok(authService.login(body.get("email"), body.get("password"), request));
    }

    @PostMapping("/auth/demo")
    public ResponseEntity<Map<String, Object>> demoLogin(
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        clearSessionCookie(request, response);
        return ResponseEntity.ok(authService.loginDemo(request));
    }

    @PostMapping("/auth/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.forgotPassword(body.get("email")));
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.resetPassword(body.get("token"), body.get("newPassword")));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(
        Authentication authentication,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        if (authentication != null && authentication.getCredentials() instanceof String tokenId) {
            authService.logoutSession(tokenId);
        }
        clearSessionCookie(request, response);
        return ResponseEntity.noContent().build();
    }

    private void clearSessionCookie(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        Cookie cookie = new Cookie("JSESSIONID", "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
    }

    @GetMapping("/auth/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getProfile(principal.getId()));
    }

    @GetMapping("/auth/sessions")
    public ResponseEntity<List<Map<String, Object>>> getSessions(
        @AuthenticationPrincipal UserPrincipal principal,
        Authentication authentication
    ) {
        String currentTokenId = authentication != null && authentication.getCredentials() instanceof String s ? s : null;
        return ResponseEntity.ok(authService.getUserSessions(principal.getId(), currentTokenId));
    }

    @DeleteMapping("/auth/sessions/{sessionId}")
    public ResponseEntity<Void> revokeSession(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long sessionId
    ) {
        authService.revokeSessionById(principal.getId(), sessionId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody Map<String, String> body,
        HttpServletRequest request
    ) {
        return ResponseEntity.ok(authService.updateProfile(principal.getId(), body, request));
    }
}
