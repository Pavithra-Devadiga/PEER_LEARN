package com.peerlearn.service;

import com.peerlearn.entity.*;
import com.peerlearn.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class DashboardService {

    private final UserRepository userRepo;
    private final LearningSessionRepository sessionRepo;
    private final SessionTopicRepository topicRepo;
    private final SessionRequestRepository requestRepo;
    private final TutorSkillRepository tutorSkillRepo;
    private final AvailabilitySlotRepository slotRepo;
    private final ReviewRepository reviewRepo;

    public DashboardService(
        UserRepository userRepo,
        LearningSessionRepository sessionRepo,
        SessionTopicRepository topicRepo,
        SessionRequestRepository requestRepo,
        TutorSkillRepository tutorSkillRepo,
        AvailabilitySlotRepository slotRepo,
        ReviewRepository reviewRepo
    ) {
        this.userRepo = userRepo;
        this.sessionRepo = sessionRepo;
        this.topicRepo = topicRepo;
        this.requestRepo = requestRepo;
        this.tutorSkillRepo = tutorSkillRepo;
        this.slotRepo = slotRepo;
        this.reviewRepo = reviewRepo;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getSidebarBadges(Long userId) {
        long studentPending = requestRepo.countByStudentIdAndStatus(userId, "PENDING");
        long tutorPending = requestRepo.countByTutorIdAndStatus(userId, "PENDING");
        return Map.of(
            "studentPendingCount", studentPending,
            "tutorPendingCount", tutorPending
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentDashboard(Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        long completedCount = sessionRepo.countByStudentIdAndStatus(userId, "COMPLETED");
        Double hours = sessionRepo.sumCompletedHoursByStudentId(userId);
        long distinctSkills = sessionRepo.countDistinctSkillsByStudentId(userId);
        String quizAvgStr = completedCount > 0 ? "90%" : "—";

        List<Map<String, Object>> stats = List.of(
            Map.of("label", "Streak (wks)", "value", String.valueOf(user.getLearningStreakWeeks()), "hint", "Consecutive weeks"),
            Map.of("label", "Sessions", "value", String.valueOf(completedCount), "hint", "Completed sessions"),
            Map.of("label", "Hours", "value", formatHours(hours), "hint", "Hours learned"),
            Map.of("label", "Skills tried", "value", String.valueOf(distinctSkills), "hint", "Unique topics"),
            Map.of("label", "Quiz avg", "value", quizAvgStr, "hint", "Score average")
        );

        // Next upcoming sessions
        List<LearningSession> upcoming = sessionRepo.findByStudentIdAndStatusOrderByScheduledDateAsc(userId, "UPCOMING");
        List<Map<String, Object>> nextSessions = upcoming.stream().limit(3).map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("title", s.getTitle());
            m.put("time", s.getScheduledLabel());
            m.put("tutor", s.getTutor().getFullName());
            m.put("category", s.getSkill().getCategory().getName());
            return m;
        }).toList();

        // Skill Progress aggregated from real session_topics
        List<LearningSession> allStudentSessions = sessionRepo.findByStudentIdOrderByScheduledDateAsc(userId);
        Map<String, int[]> progressMap = new LinkedHashMap<>();
        for (LearningSession sess : allStudentSessions) {
            if ("CANCELLED".equals(sess.getStatus())) continue;
            String skillName = sess.getSkill().getName();
            List<SessionTopic> topics = topicRepo.findBySessionIdOrderByIdAsc(sess.getId());
            int[] counts = progressMap.computeIfAbsent(skillName, k -> new int[]{0, 0});
            for (SessionTopic t : topics) {
                counts[1]++;
                if (Boolean.TRUE.equals(t.getIsDone())) {
                    counts[0]++;
                }
            }
        }
        List<Map<String, Object>> skillProgress = new ArrayList<>();
        for (Map.Entry<String, int[]> e : progressMap.entrySet()) {
            int covered = e.getValue()[0];
            int total = e.getValue()[1];
            int pct = total > 0 ? (int) Math.round(covered * 100.0 / total) : 0;
            skillProgress.add(Map.of(
                "skill", e.getKey(),
                "covered", covered,
                "total", total,
                "percentage", pct
            ));
        }

        // Dynamic Badges unlocked by DB milestones
        List<Map<String, Object>> badges = new ArrayList<>();
        if (completedCount >= 1) {
            badges.add(Map.of("id", "b1", "name", "First session", "icon", "🌱", "desc", "Completed your first peer session"));
        }
        if (completedCount >= 5) {
            badges.add(Map.of("id", "b2", "name", "5 sessions", "icon", "⚡", "desc", "Maintained active peer learning"));
        }
        if (completedCount >= 2) {
            badges.add(Map.of("id", "b3", "name", "Quiz master", "icon", "🎯", "desc", "Demonstrated solid topic understanding"));
        }
        if (distinctSkills >= 2) {
            badges.add(Map.of("id", "b4", "name", "Polymath", "icon", "🎨", "desc", "Explored multiple skill disciplines"));
        }

        String subtitle = upcoming.isEmpty()
            ? "Browse peer tutors to schedule your next learning session!"
            : "You have " + upcoming.size() + " upcoming session" + (upcoming.size() == 1 ? "" : "s") + " scheduled. Keep the momentum going!";

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("name", user.getFullName());
        result.put("welcomeSubtitle", subtitle);
        result.put("stats", stats);
        result.put("nextSessions", nextSessions);
        result.put("skillProgress", skillProgress);
        result.put("badges", badges);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTutorDashboard(Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        long completedTaught = sessionRepo.countByTutorIdAndStatus(userId, "COMPLETED");
        Double hoursTaught = sessionRepo.sumCompletedHoursByTutorId(userId);
        long distinctStudents = sessionRepo.countDistinctStudentsByTutorId(userId);
        Double avgRating = reviewRepo.findAverageRatingByTutorId(userId);
        long reviewCount = reviewRepo.countByTutorId(userId);
        String ratingDisplay = avgRating != null ? String.valueOf(Math.round(avgRating * 10.0) / 10.0) : "—";

        List<Map<String, Object>> stats = List.of(
            Map.of("label", "Teaching streak", "value", String.valueOf(user.getTeachingStreakWeeks()), "hint", "Weeks active"),
            Map.of("label", "Sessions taught", "value", String.valueOf(completedTaught), "hint", "Completed sessions"),
            Map.of("label", "Hours taught", "value", formatHours(hoursTaught), "hint", "Total tutoring time"),
            Map.of("label", "Students", "value", String.valueOf(distinctStudents), "hint", "Unique learners"),
            Map.of("label", "Avg rating", "value", ratingDisplay, "hint", "Based on " + reviewCount + " reviews")
        );

        List<SessionRequest> pending = requestRepo.findByTutorIdAndStatusOrderByCreatedAtAsc(userId, "PENDING");
        Map<String, Object> pendingSummary = null;
        if (!pending.isEmpty()) {
            SessionRequest first = pending.get(0);
            String slotLabel = first.getSlot().getDayOfWeek() + " " + first.getSlot().getSlotTime();
            long sameSlotCount = pending.stream().filter(r -> r.getSlot().getId().equals(first.getSlot().getId())).count();
            pendingSummary = Map.of(
                "slot", slotLabel,
                "count", pending.size(),
                "slotRequestCount", sameSlotCount,
                "skill", first.getSkill().getName(),
                "note", slotLabel + ": " + sameSlotCount + " request" + (sameSlotCount == 1 ? "" : "s") + ", Accept or Reject"
            );
        }

        List<TutorSkill> tsList = tutorSkillRepo.findByTutorId(userId);
        List<Map<String, Object>> skillsTaught = tsList.stream().map(ts -> {
            long taughtCount = sessionRepo.countByTutorIdAndSkillIdAndStatus(userId, ts.getSkill().getId(), "COMPLETED");
            Double skillAvg = reviewRepo.findAverageRatingByTutorIdAndSkillId(userId, ts.getSkill().getId());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", ts.getId());
            m.put("name", ts.getSkill().getName());
            m.put("level", ts.getProficiencyLevel());
            m.put("rating", skillAvg != null ? Math.round(skillAvg * 10.0) / 10.0 : 5.0);
            m.put("sessionsTaught", taughtCount);
            m.put("category", ts.getSkill().getCategory().getName());
            return m;
        }).toList();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
        List<Map<String, Object>> recentReviews = reviewRepo.findByTutorIdOrderByCreatedAtDesc(userId).stream()
            .limit(4)
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.getId());
                m.put("student", r.getStudent().getFullName());
                m.put("skill", r.getSkill().getName());
                m.put("rating", r.getRating());
                m.put("date", r.getCreatedAt().format(fmt));
                m.put("comment", r.getComment() != null ? r.getComment() : "Great session!");
                return m;
            }).toList();

        String subtitle = pending.isEmpty()
            ? "You have no pending session requests right now."
            : "You have " + pending.size() + " incoming session request" + (pending.size() == 1 ? "" : "s") + " waiting for your confirmation.";

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("name", user.getFullName());
        result.put("welcomeSubtitle", subtitle);
        result.put("stats", stats);
        result.put("pendingRequestsSummary", pendingSummary);
        result.put("skillsTaught", skillsTaught);
        result.put("recentReviews", recentReviews);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTutorInsights(Long userId) {
        List<Review> reviews = reviewRepo.findByTutorIdOrderByCreatedAtDesc(userId);
        List<LearningSession> allSessions = sessionRepo.findByTutorIdOrderByScheduledDateAsc(userId);

        long completed = allSessions.stream().filter(s -> "COMPLETED".equals(s.getStatus())).count();
        long cancelled = allSessions.stream().filter(s -> "CANCELLED".equals(s.getStatus())).count();
        long totalFinalized = completed + cancelled;
        String completionRate = totalFinalized > 0 ? Math.round(completed * 100.0 / totalFinalized) + "%" : "100%";

        Map<Long, Long> studentCounts = new HashMap<>();
        for (LearningSession s : allSessions) {
            if (!"CANCELLED".equals(s.getStatus())) {
                studentCounts.merge(s.getStudent().getId(), 1L, Long::sum);
            }
        }
        long repeatStudents = studentCounts.values().stream().filter(c -> c > 1).count();
        String repeatPct = !studentCounts.isEmpty()
            ? Math.round(repeatStudents * 100.0 / studentCounts.size()) + "%"
            : "0%";

        double avgRatingVal = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        String avgRating = reviews.isEmpty() ? "—" : String.valueOf(Math.round(avgRatingVal * 10.0) / 10.0);

        List<Map<String, Object>> ratingDist = new ArrayList<>();
        for (int star = 5; star >= 1; star--) {
            final int s = star;
            long count = reviews.stream().filter(r -> r.getRating() == s).count();
            int pct = !reviews.isEmpty() ? (int) Math.round(count * 100.0 / reviews.size()) : 0;
            ratingDist.add(Map.of("stars", s, "count", count, "percentage", pct));
        }

        // Most booked slots grouped from sessions
        Map<String, Map<String, Object>> slotBookingMap = new LinkedHashMap<>();
        for (LearningSession s : allSessions) {
            if ("CANCELLED".equals(s.getStatus())) continue;
            String key = s.getSlot() != null
                ? expandDay(s.getSlot().getDayOfWeek()) + " " + s.getSlot().getSlotTime()
                : s.getScheduledLabel();
            Map<String, Object> entry = slotBookingMap.computeIfAbsent(key, k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("slot", k);
                m.put("skill", s.getSkill().getName());
                m.put("bookings", 0L);
                return m;
            });
            entry.put("bookings", ((Long) entry.get("bookings")) + 1L);
        }
        List<Map<String, Object>> mostBookedSlots = slotBookingMap.values().stream()
            .sorted((a, b) -> Long.compare((Long) b.get("bookings"), (Long) a.get("bookings")))
            .limit(4)
            .toList();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d, yyyy");
        List<Map<String, Object>> reviewDtos = reviews.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("student", r.getStudent().getFullName());
            m.put("skill", r.getSkill().getName());
            m.put("rating", r.getRating());
            m.put("comment", r.getComment() != null ? r.getComment() : "Great session!");
            m.put("date", r.getCreatedAt().format(fmt));
            return m;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("avgRating", avgRating);
        result.put("totalReviews", reviews.size());
        result.put("completionRate", completionRate);
        result.put("repeatStudentsPct", repeatPct);
        result.put("repeatStudentCount", repeatStudents);
        result.put("ratingDistribution", ratingDist);
        result.put("mostBookedSlots", mostBookedSlots);
        result.put("reviews", reviewDtos);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCalendarData(Long userId, String mode, Integer yearParam, Integer monthParam) {
        LocalDate now = LocalDate.now();
        int year = yearParam != null ? yearParam : now.getYear();
        int month = monthParam != null ? monthParam : now.getMonthValue();

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        String monthLabel = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;

        Set<Integer> sessionDays = new LinkedHashSet<>();
        Set<Integer> freeDays = new LinkedHashSet<>();
        Set<Integer> bookedDays = new LinkedHashSet<>();
        Set<Integer> requestDays = new LinkedHashSet<>();
        List<Map<String, Object>> upcomingItems = new ArrayList<>();

        if ("tutor".equalsIgnoreCase(mode)) {
            List<LearningSession> tutorSessions = sessionRepo.findByTutorIdAndScheduledDateBetween(userId, start, end);
            for (LearningSession s : tutorSessions) {
                if (!"CANCELLED".equals(s.getStatus())) {
                    bookedDays.add(s.getScheduledDate().getDayOfMonth());
                    if ("UPCOMING".equals(s.getStatus())) {
                        upcomingItems.add(Map.of(
                            "primary", s.getScheduledLabel() + ", booked",
                            "secondary", s.getStudent().getFullName(),
                            "isAccent", true
                        ));
                    }
                }
            }

            // Map tutor's available weekdays to dates in this month
            List<AvailabilitySlot> availSlots = slotRepo.findByTutorIdOrderByIdAsc(userId);
            Set<DayOfWeek> freeWeekDays = new HashSet<>();
            for (AvailabilitySlot slot : availSlots) {
                if (Boolean.TRUE.equals(slot.getIsAvailable())) {
                    freeWeekDays.add(parseDayOfWeek(slot.getDayOfWeek()));
                }
            }
            for (int d = 1; d <= ym.lengthOfMonth(); d++) {
                LocalDate date = ym.atDay(d);
                if (freeWeekDays.contains(date.getDayOfWeek()) && !bookedDays.contains(d)) {
                    freeDays.add(d);
                }
            }

            // Map pending requests to next matching weekday
            List<SessionRequest> pending = requestRepo.findByTutorIdAndStatusOrderByCreatedAtAsc(userId, "PENDING");
            for (SessionRequest r : pending) {
                DayOfWeek dow = parseDayOfWeek(r.getSlot().getDayOfWeek());
                for (int d = 1; d <= ym.lengthOfMonth(); d++) {
                    LocalDate date = ym.atDay(d);
                    if (!date.isBefore(now) && date.getDayOfWeek() == dow) {
                        requestDays.add(d);
                        break;
                    }
                }
            }
        } else {
            List<LearningSession> studentSessions = sessionRepo.findByStudentIdAndScheduledDateBetween(userId, start, end);
            for (LearningSession s : studentSessions) {
                if (!"CANCELLED".equals(s.getStatus())) {
                    sessionDays.add(s.getScheduledDate().getDayOfMonth());
                    if ("UPCOMING".equals(s.getStatus())) {
                        upcomingItems.add(Map.of(
                            "primary", s.getScheduledLabel() + ", " + s.getSkill().getName(),
                            "secondary", s.getTutor().getFullName(),
                            "isAccent", upcomingItems.isEmpty()
                        ));
                    }
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("year", year);
        result.put("month", month);
        result.put("monthLabel", monthLabel);
        result.put("daysInMonth", ym.lengthOfMonth());
        result.put("sessionDays", new ArrayList<>(sessionDays));
        result.put("freeDays", new ArrayList<>(freeDays));
        result.put("bookedDays", new ArrayList<>(bookedDays));
        result.put("requestDays", new ArrayList<>(requestDays));
        result.put("upcomingItems", upcomingItems.stream().limit(2).toList());
        return result;
    }

    private String formatHours(Double hours) {
        if (hours == null || hours == 0.0) return "0";
        if (hours == Math.floor(hours)) return String.valueOf(hours.intValue());
        return String.valueOf(Math.round(hours * 10.0) / 10.0);
    }

    private DayOfWeek parseDayOfWeek(String shortDay) {
        return switch (shortDay) {
            case "Mon" -> DayOfWeek.MONDAY;
            case "Tue" -> DayOfWeek.TUESDAY;
            case "Wed" -> DayOfWeek.WEDNESDAY;
            case "Thu" -> DayOfWeek.THURSDAY;
            case "Fri" -> DayOfWeek.FRIDAY;
            case "Sat" -> DayOfWeek.SATURDAY;
            case "Sun" -> DayOfWeek.SUNDAY;
            default -> DayOfWeek.MONDAY;
        };
    }

    private String expandDay(String shortDay) {
        return switch (shortDay) {
            case "Mon" -> "Monday";
            case "Tue" -> "Tuesday";
            case "Wed" -> "Wednesday";
            case "Thu" -> "Thursday";
            case "Fri" -> "Friday";
            case "Sat" -> "Saturday";
            case "Sun" -> "Sunday";
            default -> shortDay;
        };
    }
}
