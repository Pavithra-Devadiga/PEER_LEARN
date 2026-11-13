package com.peerlearn.service;

import com.peerlearn.entity.*;
import com.peerlearn.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class BookingAndSessionService {

    private final UserRepository userRepo;
    private final SkillRepository skillRepo;
    private final AvailabilitySlotRepository slotRepo;
    private final SessionRequestRepository requestRepo;
    private final LearningSessionRepository sessionRepo;
    private final SessionTopicRepository topicRepo;
    private final SessionMessageRepository messageRepo;
    private final ReviewRepository reviewRepo;
    private final TutorSkillRepository tutorSkillRepo;

    public BookingAndSessionService(
        UserRepository userRepo,
        SkillRepository skillRepo,
        AvailabilitySlotRepository slotRepo,
        SessionRequestRepository requestRepo,
        LearningSessionRepository sessionRepo,
        SessionTopicRepository topicRepo,
        SessionMessageRepository messageRepo,
        ReviewRepository reviewRepo,
        TutorSkillRepository tutorSkillRepo
    ) {
        this.userRepo = userRepo;
        this.skillRepo = skillRepo;
        this.slotRepo = slotRepo;
        this.requestRepo = requestRepo;
        this.sessionRepo = sessionRepo;
        this.topicRepo = topicRepo;
        this.messageRepo = messageRepo;
        this.reviewRepo = reviewRepo;
        this.tutorSkillRepo = tutorSkillRepo;
    }

    @Transactional
    public Map<String, Object> createRequest(Long studentId, Long tutorId, String skillName, Long slotId, List<String> topics, String message) {
        if (studentId.equals(tutorId)) {
            throw new IllegalArgumentException("You cannot request a session with yourself.");
        }
        User student = userRepo.findById(studentId).orElseThrow();
        User tutor = userRepo.findById(tutorId).orElseThrow(() -> new NoSuchElementException("Tutor not found."));
        AvailabilitySlot slot = slotRepo.findById(slotId).orElseThrow(() -> new NoSuchElementException("Slot not found."));

        if (!slot.getTutor().getId().equals(tutorId)) {
            throw new IllegalArgumentException("Selected slot does not belong to this tutor.");
        }
        if (!Boolean.TRUE.equals(slot.getIsAvailable())) {
            throw new IllegalArgumentException("This time slot is no longer available.");
        }
        if (requestRepo.existsByStudentIdAndSlotIdAndStatus(studentId, slotId, "PENDING")) {
            throw new IllegalArgumentException("You already have a pending request for this slot.");
        }

        Skill skill = skillRepo.findByNameIgnoreCase(skillName != null ? skillName.trim() : "")
            .orElseGet(() -> {
                List<Skill> matches = skillRepo.searchByName(skillName != null ? skillName.trim() : "");
                if (matches.isEmpty()) throw new NoSuchElementException("Skill not found.");
                return matches.get(0);
            });

        int resolvedFee = tutorSkillRepo.findByTutorIdAndSkillId(tutorId, skill.getId())
            .map(TutorSkill::getHourlyFeeInr)
            .orElse(skill.getBasePriceInr() != null ? skill.getBasePriceInr() : 99);

        String note = (message != null && !message.isBlank()) ? message.trim() : "Looking forward to learning " + skill.getName() + "!";
        String formattedMessage = (topics != null && !topics.isEmpty())
            ? "[" + String.join(", ", topics) + "] " + note
            : note;

        SessionRequest req = new SessionRequest();
        req.setStudent(student);
        req.setTutor(tutor);
        req.setSkill(skill);
        req.setSlot(slot);
        req.setStatus("PENDING");
        req.setFeeInr(resolvedFee);
        req.setMessage(formattedMessage);
        SessionRequest saved = requestRepo.save(req);

        return Map.of("id", saved.getId(), "status", "PENDING");
    }

    @Transactional
    public void withdrawRequest(Long studentId, Long requestId) {
        SessionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new NoSuchElementException("Request not found."));
        if (!req.getStudent().getId().equals(studentId)) {
            throw new SecurityException("Not authorized to withdraw this request.");
        }
        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalArgumentException("Only pending requests can be withdrawn.");
        }
        req.setStatus("WITHDRAWN");
        requestRepo.save(req);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTutorRequestsGrouped(Long tutorId) {
        List<SessionRequest> pending = requestRepo.findByTutorIdAndStatusOrderByCreatedAtAsc(tutorId, "PENDING");
        Map<Long, List<SessionRequest>> bySlot = new LinkedHashMap<>();
        for (SessionRequest r : pending) {
            bySlot.computeIfAbsent(r.getSlot().getId(), k -> new ArrayList<>()).add(r);
        }

        List<Map<String, Object>> groups = new ArrayList<>();
        for (List<SessionRequest> reqList : bySlot.values()) {
            SessionRequest first = reqList.get(0);
            AvailabilitySlot slot = first.getSlot();
            String slotTime = slot.getDayOfWeek() + " " + slot.getSlotTime();

            List<Map<String, Object>> reqDtos = new ArrayList<>();
            for (SessionRequest r : reqList) {
                User student = r.getStudent();
                long completedSessions = sessionRepo.countByStudentIdAndStatus(student.getId(), "COMPLETED");
                String quizScore = completedSessions > 0 ? "92%" : "—";
                List<String> topics = extractTopics(r);

                Map<String, Object> rDto = new LinkedHashMap<>();
                rDto.put("id", r.getId());
                rDto.put("studentName", student.getFullName());
                rDto.put("avatar", student.getAvatarUrl() != null ? student.getAvatarUrl()
                    : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + student.getId());
                rDto.put("stats", Map.of("completed", completedSessions, "quizScore", quizScore));
                rDto.put("topics", topics);
                rDto.put("message", r.getMessage());
                rDto.put("feeInr", r.getFeeInr() != null ? r.getFeeInr() : 99);
                rDto.put("requestedAt", formatTimeAgo(r.getCreatedAt()));
                reqDtos.add(rDto);
            }

            Map<String, Object> group = new LinkedHashMap<>();
            group.put("slotId", slot.getId());
            group.put("slotTime", slotTime);
            group.put("skill", first.getSkill().getName());
            group.put("requests", reqDtos);
            groups.add(group);
        }

        return groups;
    }

    @Transactional
    public Map<String, Object> acceptRequest(Long tutorId, Long requestId) {
        SessionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new NoSuchElementException("Request not found."));
        if (!req.getTutor().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to accept this request.");
        }
        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalArgumentException("This request has already been processed.");
        }

        AvailabilitySlot slot = req.getSlot();
        req.setStatus("ACCEPTED");
        requestRepo.saveAndFlush(req);

        slot.setIsAvailable(false);
        slotRepo.save(slot);

        Integer rejectedRaw = requestRepo.rejectConflictingRequests(
            tutorId, slot.getId(), requestId, "Slot was taken"
        );
        int rejectedCount = rejectedRaw != null ? rejectedRaw : 0;

        String slotLabel = slot.getDayOfWeek() + " " + slot.getSlotTime();
        LocalDate scheduledDate = nextDateForDay(slot.getDayOfWeek());

        LearningSession session = new LearningSession();
        session.setRequest(req);
        session.setStudent(req.getStudent());
        session.setTutor(req.getTutor());
        session.setSkill(req.getSkill());
        session.setSlot(slot);
        session.setTitle(req.getSkill().getName() + ": 1-on-1 Session");
        session.setStatus("UPCOMING");
        session.setScheduledLabel(slotLabel);
        session.setScheduledDate(scheduledDate);
        session.setDurationHours(1.0);
        session.setFeeInr(req.getFeeInr() != null ? req.getFeeInr() : 99);
        session.setMeetingUrl("https://meet.jit.si/peerlearn-" + UUID.randomUUID().toString().substring(0, 8));
        LearningSession savedSession = sessionRepo.save(session);

        List<String> topics = extractTopics(req);
        for (String tName : topics) {
            topicRepo.save(new SessionTopic(savedSession, tName, false, true));
        }

        return Map.of(
            "sessionId", savedSession.getId(),
            "studentName", req.getStudent().getFullName(),
            "slotTime", slotLabel,
            "rejectedCount", rejectedCount
        );
    }

    @Transactional
    public Map<String, Object> rejectRequest(Long tutorId, Long requestId) {
        SessionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new NoSuchElementException("Request not found."));
        if (!req.getTutor().getId().equals(tutorId)) {
            throw new SecurityException("Not authorized to reject this request.");
        }
        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalArgumentException("This request has already been processed.");
        }

        req.setStatus("REJECTED");
        req.setRejectionReason("Declined by tutor");
        requestRepo.save(req);

        return Map.of("studentName", req.getStudent().getFullName(), "status", "REJECTED");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentSessions(Long studentId) {
        List<Map<String, Object>> result = new ArrayList<>();

        List<LearningSession> sessions = sessionRepo.findByStudentIdOrderByScheduledDateAsc(studentId);
        for (LearningSession s : sessions) {
            result.add(toSessionDto(s, studentId, "student"));
        }

        List<SessionRequest> requests = requestRepo.findByStudentIdAndStatusInOrderByCreatedAtDesc(
            studentId, List.of("PENDING", "REJECTED")
        );
        for (SessionRequest r : requests) {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", "req-" + r.getId());
            dto.put("rawId", r.getId());
            dto.put("recordType", "REQUEST");
            dto.put("title", r.getSkill().getName());
            dto.put("tutorName", r.getTutor().getFullName());
            dto.put("studentName", r.getStudent().getFullName());
            dto.put("role", "student");
            dto.put("status", "PENDING".equals(r.getStatus()) ? "Pending" : "Rejected");
            dto.put("datetime", r.getSlot().getDayOfWeek() + " " + r.getSlot().getSlotTime());
            dto.put("skill", r.getSkill().getName());
            dto.put("feeInr", r.getFeeInr() != null ? r.getFeeInr() : 99);

            if ("PENDING".equals(r.getStatus())) {
                long others = Math.max(0, requestRepo.countBySlotIdAndStatus(r.getSlot().getId(), "PENDING") - 1);
                if (others > 0) {
                    dto.put("pendingHint", others + " other student" + (others == 1 ? "" : "s") + " also requested this slot");
                }
            } else if (r.getRejectionReason() != null) {
                dto.put("pendingHint", "Reason: " + r.getRejectionReason());
            }

            List<Map<String, Object>> topics = extractTopics(r).stream()
                .map(tName -> {
                    Map<String, Object> tm = new LinkedHashMap<>();
                    tm.put("id", 0L);
                    tm.put("name", tName);
                    tm.put("done", false);
                    tm.put("askedByStudent", true);
                    return tm;
                }).toList();
            dto.put("topics", topics);
            dto.put("messages", List.of());
            result.add(dto);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTutorSessions(Long tutorId) {
        List<LearningSession> sessions = sessionRepo.findByTutorIdOrderByScheduledDateAsc(tutorId);
        return sessions.stream().map(s -> toSessionDto(s, tutorId, "tutor")).toList();
    }

    @Transactional
    public void cancelSession(Long userId, Long sessionId) {
        LearningSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        if (!session.getStudent().getId().equals(userId) && !session.getTutor().getId().equals(userId)) {
            throw new SecurityException("Not authorized to cancel this session.");
        }
        session.setStatus("CANCELLED");
        sessionRepo.save(session);

        if (session.getSlot() != null) {
            AvailabilitySlot slot = session.getSlot();
            slot.setIsAvailable(true);
            slotRepo.save(slot);
        }
    }

    @Transactional
    public void completeSession(Long tutorId, Long sessionId) {
        LearningSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        if (!session.getTutor().getId().equals(tutorId)) {
            throw new SecurityException("Only the session tutor can mark a session completed.");
        }
        if (!"UPCOMING".equals(session.getStatus())) {
            throw new IllegalArgumentException("Only upcoming sessions can be marked completed.");
        }
        session.setStatus("COMPLETED");
        sessionRepo.save(session);

        User student = session.getStudent();
        if (student.getLearningStreakWeeks() == 0) {
            student.setLearningStreakWeeks(1);
            userRepo.save(student);
        }
        User tutor = session.getTutor();
        if (tutor.getTeachingStreakWeeks() == 0) {
            tutor.setTeachingStreakWeeks(1);
            userRepo.save(tutor);
        }
        if (session.getSlot() != null) {
            AvailabilitySlot slot = session.getSlot();
            slot.setIsAvailable(true);
            slotRepo.save(slot);
        }
    }

    @Transactional
    public Map<String, Object> toggleTopic(Long tutorId, Long sessionId, Long topicId) {
        LearningSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        if (!session.getTutor().getId().equals(tutorId)) {
            throw new SecurityException("Only the session tutor can tick off topics.");
        }
        SessionTopic topic = topicRepo.findById(topicId)
            .orElseThrow(() -> new NoSuchElementException("Topic not found."));
        if (!topic.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("Topic does not belong to this session.");
        }
        topic.setIsDone(!Boolean.TRUE.equals(topic.getIsDone()));
        SessionTopic saved = topicRepo.save(topic);

        return Map.of(
            "id", saved.getId(),
            "name", saved.getTopicName(),
            "done", saved.getIsDone(),
            "askedByStudent", saved.getAskedByStudent()
        );
    }

    @Transactional
    public Map<String, Object> addTopic(Long tutorId, Long sessionId, String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Topic name cannot be empty.");
        }
        LearningSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        if (!session.getTutor().getId().equals(tutorId)) {
            throw new SecurityException("Only the session tutor can add topics.");
        }
        SessionTopic saved = topicRepo.save(new SessionTopic(session, name.trim(), false, false));
        return Map.of(
            "id", saved.getId(),
            "name", saved.getTopicName(),
            "done", saved.getIsDone(),
            "askedByStudent", saved.getAskedByStudent()
        );
    }

    @Transactional
    public Map<String, Object> sendMessage(Long userId, Long sessionId, String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Message text cannot be empty.");
        }
        LearningSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        if (!session.getStudent().getId().equals(userId) && !session.getTutor().getId().equals(userId)) {
            throw new SecurityException("Not a participant in this session.");
        }
        User sender = userRepo.findById(userId).orElseThrow();
        SessionMessage saved = messageRepo.save(new SessionMessage(session, sender, text.trim()));

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("h:mm a");
        return Map.of(
            "id", saved.getId(),
            "sender", sender.getFullName(),
            "text", saved.getMessageText(),
            "time", saved.getSentAt().format(fmt),
            "isSelf", true
        );
    }

    @Transactional
    public Map<String, Object> rateSession(Long studentId, Long sessionId, Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }
        LearningSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        if (!session.getStudent().getId().equals(studentId)) {
            throw new SecurityException("Only the student can rate this session.");
        }

        Review review = reviewRepo.findBySessionId(sessionId).orElse(new Review());
        review.setSession(session);
        review.setStudent(session.getStudent());
        review.setTutor(session.getTutor());
        review.setSkill(session.getSkill());
        review.setRating(rating);
        if (comment != null && !comment.isBlank()) {
            review.setComment(comment.trim());
        } else if (review.getComment() == null) {
            review.setComment("Rated " + rating + " stars.");
        }
        Review saved = reviewRepo.save(review);

        return Map.of("rating", saved.getRating(), "comment", saved.getComment());
    }

    @Transactional
    public Map<String, Object> updateMeetingUrl(Long tutorId, Long sessionId, String meetingUrl) {
        LearningSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new NoSuchElementException("Session not found."));
        if (!session.getTutor().getId().equals(tutorId)) {
            throw new SecurityException("Only the session tutor can update the meeting link.");
        }
        String trimmed = meetingUrl != null ? meetingUrl.trim() : "";
        session.setMeetingUrl(trimmed.isEmpty() ? null : trimmed);
        sessionRepo.save(session);
        return Map.of("meetingUrl", session.getMeetingUrl() != null ? session.getMeetingUrl() : "");
    }

    private List<String> extractTopics(SessionRequest req) {
        String msg = req.getMessage();
        if (msg != null && msg.startsWith("[") && msg.contains("]")) {
            String topicPart = msg.substring(1, msg.indexOf("]"));
            return Arrays.stream(topicPart.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        }
        if (req.getSkill() != null && req.getSkill().getTags() != null && !req.getSkill().getTags().isBlank()) {
            return Arrays.stream(req.getSkill().getTags().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        }
        return List.of("Core Fundamentals & Setup", "Hands-on Practice & Edge Cases", "Review & Next Steps");
    }

    private Map<String, Object> toSessionDto(LearningSession s, Long currentUserId, String role) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", "sess-" + s.getId());
        dto.put("rawId", s.getId());
        dto.put("recordType", "SESSION");
        dto.put("title", s.getTitle());
        dto.put("tutorName", s.getTutor().getFullName());
        dto.put("studentName", s.getStudent().getFullName());
        dto.put("role", role);
        dto.put("status", capitalizeStatus(s.getStatus()));
        dto.put("datetime", s.getScheduledLabel());
        dto.put("skill", s.getSkill().getName());
        dto.put("feeInr", s.getFeeInr() != null ? s.getFeeInr() : 99);
        dto.put("meetingUrl", s.getMeetingUrl());

        List<Map<String, Object>> topics = topicRepo.findBySessionIdOrderByIdAsc(s.getId()).stream()
            .map(t -> {
                Map<String, Object> tm = new LinkedHashMap<>();
                tm.put("id", t.getId());
                tm.put("name", t.getTopicName());
                tm.put("done", Boolean.TRUE.equals(t.getIsDone()));
                tm.put("askedByStudent", Boolean.TRUE.equals(t.getAskedByStudent()));
                return tm;
            }).toList();
        dto.put("topics", topics);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d, h:mm a");
        List<Map<String, Object>> messages = messageRepo.findBySessionIdOrderBySentAtAsc(s.getId()).stream()
            .map(m -> {
                Map<String, Object> mm = new LinkedHashMap<>();
                mm.put("id", m.getId());
                mm.put("sender", m.getSender().getFullName());
                mm.put("text", m.getMessageText());
                mm.put("time", m.getSentAt().format(fmt));
                mm.put("isSelf", m.getSender().getId().equals(currentUserId));
                return mm;
            }).toList();
        dto.put("messages", messages);

        reviewRepo.findBySessionId(s.getId()).ifPresent(r -> {
            dto.put("rating", r.getRating());
            dto.put("ratingComment", r.getComment());
        });

        return dto;
    }

    private String capitalizeStatus(String status) {
        return switch (status) {
            case "UPCOMING" -> "Upcoming";
            case "COMPLETED" -> "Completed";
            case "CANCELLED" -> "Cancelled";
            default -> status;
        };
    }

    private LocalDate nextDateForDay(String shortDay) {
        DayOfWeek dow = switch (shortDay) {
            case "Mon" -> DayOfWeek.MONDAY;
            case "Tue" -> DayOfWeek.TUESDAY;
            case "Wed" -> DayOfWeek.WEDNESDAY;
            case "Thu" -> DayOfWeek.THURSDAY;
            case "Fri" -> DayOfWeek.FRIDAY;
            case "Sat" -> DayOfWeek.SATURDAY;
            case "Sun" -> DayOfWeek.SUNDAY;
            default -> DayOfWeek.MONDAY;
        };
        return LocalDate.now().with(TemporalAdjusters.nextOrSame(dow));
    }

    private String formatTimeAgo(LocalDateTime created) {
        Duration d = Duration.between(created, LocalDateTime.now());
        long mins = Math.max(1, d.toMinutes());
        if (mins < 60) return mins + " min ago";
        long hrs = d.toHours();
        if (hrs < 24) return hrs + " hour" + (hrs == 1 ? "" : "s") + " ago";
        long days = d.toDays();
        return days + " day" + (days == 1 ? "" : "s") + " ago";
    }
}
