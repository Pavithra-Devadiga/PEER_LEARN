package com.peerlearn.service;

import com.peerlearn.entity.PasswordResetToken;
import com.peerlearn.entity.User;
import com.peerlearn.entity.UserSession;
import com.peerlearn.repository.LearningSessionRepository;
import com.peerlearn.repository.PasswordResetTokenRepository;
import com.peerlearn.repository.ReviewRepository;
import com.peerlearn.repository.TutorSkillRepository;
import com.peerlearn.repository.UserRepository;
import com.peerlearn.repository.UserSessionRepository;
import com.peerlearn.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final LearningSessionRepository sessionRepository;
    private final TutorSkillRepository tutorSkillRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailNotificationService emailNotificationService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AuthService(
        UserRepository userRepository,
        UserSessionRepository userSessionRepository,
        PasswordResetTokenRepository passwordResetTokenRepository,
        LearningSessionRepository sessionRepository,
        TutorSkillRepository tutorSkillRepository,
        ReviewRepository reviewRepository,
        PasswordEncoder passwordEncoder,
        JwtUtil jwtUtil,
        EmailNotificationService emailNotificationService
    ) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.sessionRepository = sessionRepository;
        this.tutorSkillRepository = tutorSkillRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailNotificationService = emailNotificationService;
    }

    @Transactional
    public Map<String, Object> register(String name, String email, String password, HttpServletRequest request) {
        if (name == null || name.isBlank() || email == null || email.isBlank() || password == null || password.length() < 6) {
            throw new IllegalArgumentException("Name, valid email, and password (min 6 chars) are required.");
        }
        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(name.trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setAuthProvider("LOCAL");
        user.setTitle("Student & Peer Learner");
        user.setBio("Joined PeerLearn to exchange skills and learn collaboratively.");
        user.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + URLEncoder.encode(name.trim(), StandardCharsets.UTF_8));
        user.setLastLoginAt(LocalDateTime.now());
        User saved = userRepository.save(user);

        emailNotificationService.sendWelcomeEmail(saved.getEmail(), saved.getFullName(), "LOCAL");

        String token = createSessionAndToken(saved, "EMAIL", request);
        return Map.of(
            "token", token,
            "user", toUserDto(saved),
            "welcomeEmailConfigured", emailNotificationService.isSmtpConfigured()
        );
    }

    @Transactional
    public Map<String, Object> login(String email, String password, HttpServletRequest request) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required.");
        }
        User user = userRepository.findByEmailIgnoreCase(email.trim())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException(
                "This account was created with " + user.getAuthProvider() + ". Please sign in with " + user.getAuthProvider() + "."
            );
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = createSessionAndToken(user, "EMAIL", request);
        return Map.of("token", token, "user", toUserDto(user));
    }

    @Transactional
    public Map<String, Object> loginDemo(HttpServletRequest request) {
        User demoUser = userRepository.findByEmailIgnoreCase("hannah.student@university.edu")
            .orElseThrow(() -> new IllegalArgumentException(
                "Demo account (hannah.student@university.edu) is not in the database yet. Please restart the Spring Boot backend."
            ));

        demoUser.setLastLoginAt(LocalDateTime.now());
        userRepository.save(demoUser);

        String token = createSessionAndToken(demoUser, "DEMO", request);
        return Map.of("token", token, "user", toUserDto(demoUser));
    }

    @Transactional
    public void logoutSession(String tokenId) {
        if (tokenId == null || tokenId.isBlank()) return;
        userSessionRepository.findByTokenId(tokenId).ifPresent(sess -> {
            sess.setRevoked(true);
            sess.setLoggedOutAt(LocalDateTime.now());
            userSessionRepository.save(sess);
        });
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserSessions(Long userId, String currentTokenId) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a");
        LocalDateTime now = LocalDateTime.now();

        return userSessionRepository.findTop10ByUserIdOrderByLoggedInAtDesc(userId).stream()
            .map(s -> {
                boolean active = !Boolean.TRUE.equals(s.getRevoked()) && s.getExpiresAt().isAfter(now);
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", s.getId());
                m.put("authMethod", s.getAuthMethod());
                m.put("ipAddress", s.getIpAddress() != null ? s.getIpAddress() : "localhost");
                m.put("device", simplifyUserAgent(s.getUserAgent()));
                m.put("loggedInAt", s.getLoggedInAt().format(fmt));
                m.put("active", active);
                m.put("isCurrent", s.getTokenId().equals(currentTokenId));
                return m;
            }).toList();
    }

    @Transactional
    public void revokeSessionById(Long userId, Long sessionId) {
        UserSession sess = userSessionRepository.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        if (!sess.getUser().getId().equals(userId)) {
            throw new SecurityException("Not authorized to revoke this session.");
        }
        sess.setRevoked(true);
        sess.setLoggedOutAt(LocalDateTime.now());
        userSessionRepository.save(sess);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return toUserDto(user);
    }

    @Transactional
    public Map<String, Object> updateProfile(Long userId, Map<String, String> body, HttpServletRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));

        String name = body.get("name");
        String email = body.get("email");
        String title = body.get("title");
        String bio = body.get("bio");
        String avatar = body.get("avatar");
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (name != null && !name.isBlank()) {
            user.setFullName(name.trim());
        }

        boolean emailChanged = false;
        if (email != null && !email.isBlank()) {
            String normalized = email.trim().toLowerCase();
            if (!normalized.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmailIgnoreCase(normalized)) {
                    throw new IllegalArgumentException("That email address is already taken.");
                }
                user.setEmail(normalized);
                emailChanged = true;
            }
        }

        if (title != null) {
            user.setTitle(title.trim());
        }

        if (bio != null) {
            user.setBio(bio.trim());
        }

        if (avatar != null && !avatar.isBlank()) {
            user.setAvatarUrl(avatar.trim());
        }

        if (newPassword != null && !newPassword.isBlank()) {
            if (newPassword.length() < 6) {
                throw new IllegalArgumentException("New password must be at least 6 characters.");
            }
            if (user.getPasswordHash() != null && !user.getPasswordHash().isBlank()) {
                if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                    throw new IllegalArgumentException("Current password is incorrect.");
                }
            }
            user.setPasswordHash(passwordEncoder.encode(newPassword));
        }

        User saved = userRepository.save(user);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("user", toUserDto(saved));
        if (emailChanged) {
            response.put("token", createSessionAndToken(saved, saved.getAuthProvider(), request));
        }
        return response;
    }

    @Transactional
    public Map<String, String> forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Please enter your email address.");
        }
        String genericMessage = "If an account exists for that email, a password reset link has been generated (valid for 30 minutes).";

        userRepository.findByEmailIgnoreCase(email.trim()).ifPresent(user -> {
            byte[] randomBytes = new byte[32];
            SECURE_RANDOM.nextBytes(randomBytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(token);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
            resetToken.setUsed(false);
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendUrl + "/reset-password?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
            log.info("Password reset link generated for {}: {}", user.getEmail(), resetLink);

            emailNotificationService.sendPlainEmail(
                user.getEmail(),
                "PeerLearn — Reset your password",
                "Hi " + user.getFullName() + ",\n\n"
                    + "Use the link below within 30 minutes to reset your PeerLearn password:\n"
                    + resetLink + "\n\n"
                    + "If you did not request this, you can safely ignore this email.",
                "Password reset email"
            );
        });

        return Map.of("message", genericMessage);
    }

    @Transactional
    public Map<String, String> resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Reset token is missing.");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters.");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token.trim())
            .orElseThrow(() -> new IllegalArgumentException("Invalid password reset link."));

        if (Boolean.TRUE.equals(resetToken.getUsed()) || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This password reset link has expired or already been used.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        List<UserSession> activeSessions = userSessionRepository.findByUserIdAndRevokedFalse(user.getId());
        if (!activeSessions.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            activeSessions.forEach(s -> {
                s.setRevoked(true);
                s.setLoggedOutAt(now);
            });
            userSessionRepository.saveAll(activeSessions);
        }

        return Map.of("message", "Password updated successfully. Please sign in with your new password.");
    }

    private String createSessionAndToken(User user, String authMethod, HttpServletRequest request) {
        String tokenId = UUID.randomUUID().toString();
        String jwt = jwtUtil.generateToken(user.getId(), user.getEmail(), tokenId);

        UserSession sess = new UserSession();
        sess.setUser(user);
        sess.setTokenId(tokenId);
        sess.setAuthMethod(authMethod != null ? authMethod : "EMAIL");
        sess.setIpAddress(extractIp(request));
        sess.setUserAgent(truncate(request != null ? request.getHeader("User-Agent") : "Web Browser", 290));
        sess.setLoggedInAt(LocalDateTime.now());
        sess.setExpiresAt(LocalDateTime.now().plus(Duration.ofMillis(jwtUtil.getExpirationMs())));
        sess.setRevoked(false);
        userSessionRepository.save(sess);

        return jwt;
    }

    private String extractIp(HttpServletRequest request) {
        if (request == null) return "localhost";
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String simplifyUserAgent(String ua) {
        if (ua == null || ua.isBlank()) return "Web Browser";
        if (ua.contains("Edg/")) return "Microsoft Edge";
        if (ua.contains("Chrome/")) return "Google Chrome";
        if (ua.contains("Firefox/")) return "Mozilla Firefox";
        if (ua.contains("Safari/") && !ua.contains("Chrome")) return "Apple Safari";
        return truncate(ua, 45);
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }

    public Map<String, Object> toUserDto(User u) {
        long sessionsLearned = sessionRepository.countByStudentIdAndStatus(u.getId(), "COMPLETED");
        long sessionsTaught = sessionRepository.countByTutorIdAndStatus(u.getId(), "COMPLETED");
        long skillsCount = tutorSkillRepository.findByTutorId(u.getId()).size();
        Double avg = reviewRepository.findAverageRatingByTutorId(u.getId());
        String avgRating = avg != null ? String.valueOf(Math.round(avg * 10.0) / 10.0) : "—";

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        String memberSince = u.getCreatedAt() != null ? u.getCreatedAt().format(fmt) : "2026";

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", u.getId());
        dto.put("name", u.getFullName());
        dto.put("email", u.getEmail());
        dto.put("authProvider", u.getAuthProvider());
        dto.put("hasPassword", u.getPasswordHash() != null && !u.getPasswordHash().isBlank());
        dto.put("title", u.getTitle() != null ? u.getTitle() : "Student & Peer Learner");
        dto.put("bio", u.getBio() != null ? u.getBio() : "");
        dto.put("avatar", u.getAvatarUrl() != null ? u.getAvatarUrl()
            : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + URLEncoder.encode(u.getFullName(), StandardCharsets.UTF_8));
        dto.put("initials", u.getFullName().isEmpty() ? "U" : u.getFullName().substring(0, 1).toUpperCase());
        dto.put("memberSince", memberSince);
        dto.put("stats", Map.of(
            "sessionsLearned", sessionsLearned,
            "sessionsTaught", sessionsTaught,
            "skillsCount", skillsCount,
            "avgRating", avgRating
        ));
        dto.put("signedIn", true);
        return dto;
    }
}
