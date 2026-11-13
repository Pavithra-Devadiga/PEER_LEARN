package com.peerlearn.service;

import com.peerlearn.entity.*;
import com.peerlearn.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillBrowseService {

    private final CategoryRepository categoryRepo;
    private final SkillRepository skillRepo;
    private final TutorSkillRepository tutorSkillRepo;
    private final UserRepository userRepo;
    private final AvailabilitySlotRepository slotRepo;
    private final ReviewRepository reviewRepo;

    public SkillBrowseService(
        CategoryRepository categoryRepo,
        SkillRepository skillRepo,
        TutorSkillRepository tutorSkillRepo,
        UserRepository userRepo,
        AvailabilitySlotRepository slotRepo,
        ReviewRepository reviewRepo
    ) {
        this.categoryRepo = categoryRepo;
        this.skillRepo = skillRepo;
        this.tutorSkillRepo = tutorSkillRepo;
        this.userRepo = userRepo;
        this.slotRepo = slotRepo;
        this.reviewRepo = reviewRepo;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCategoriesWithSkills() {
        List<Category> categories = categoryRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Category cat : categories) {
            List<Skill> skills = skillRepo.findByCategoryIdOrderByIdAsc(cat.getId());
            List<Map<String, Object>> skillDtos = new ArrayList<>();
            for (Skill s : skills) {
                List<TutorSkill> skillTutors = tutorSkillRepo.findBySkillId(s.getId());
                long tutorCount = skillTutors.size();
                int startingPriceInr = skillTutors.stream()
                    .map(TutorSkill::getHourlyFeeInr)
                    .filter(Objects::nonNull)
                    .min(Integer::compareTo)
                    .orElse(s.getBasePriceInr() != null ? s.getBasePriceInr() : 99);
                List<String> tags = (s.getTags() != null && !s.getTags().isBlank())
                    ? Arrays.stream(s.getTags().split(",")).map(String::trim).filter(t -> !t.isEmpty()).toList()
                    : List.of("Core", "Practice");

                Map<String, Object> skillDto = new LinkedHashMap<>();
                skillDto.put("id", s.getId());
                skillDto.put("name", s.getName());
                skillDto.put("tutorCount", tutorCount);
                skillDto.put("basePriceInr", s.getBasePriceInr() != null ? s.getBasePriceInr() : 99);
                skillDto.put("startingPriceInr", startingPriceInr);
                skillDto.put("tags", tags);
                skillDtos.add(skillDto);
            }

            Map<String, Object> catDto = new LinkedHashMap<>();
            catDto.put("id", cat.getId());
            catDto.put("name", cat.getName());
            catDto.put("icon", cat.getIcon());
            catDto.put("tint", cat.getTint());
            catDto.put("skills", skillDtos);
            result.add(catDto);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTutors(Long currentUserId, String skillFilter) {
        List<Long> tutorIds = (skillFilter != null && !skillFilter.isBlank())
            ? tutorSkillRepo.findTutorIdsBySkillNameContaining(skillFilter.trim())
            : tutorSkillRepo.findAllDistinctTutorIds();

        List<Map<String, Object>> tutors = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");

        for (Long tid : tutorIds) {
            if (currentUserId != null && tid.equals(currentUserId)) {
                continue;
            }
            User tutor = userRepo.findById(tid).orElse(null);
            if (tutor == null) continue;

            List<TutorSkill> tsList = tutorSkillRepo.findByTutorId(tid);
            if (tsList.isEmpty()) continue;

            List<String> skillsTaught = tsList.stream().map(ts -> ts.getSkill().getName()).toList();
            String highestProficiency = resolveHighestProficiency(tsList);

            Double avg = reviewRepo.findAverageRatingByTutorId(tid);
            long reviewCount = reviewRepo.countByTutorId(tid);
            double rating = avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0;

            List<AvailabilitySlot> slots = slotRepo.findByTutorIdOrderByIdAsc(tid);
            List<Map<String, Object>> slotDtos = new ArrayList<>();
            Set<String> freeDayNames = new LinkedHashSet<>();
            for (AvailabilitySlot slot : slots) {
                Map<String, Object> sDto = new LinkedHashMap<>();
                sDto.put("id", slot.getId());
                sDto.put("day", expandDay(slot.getDayOfWeek()));
                sDto.put("time", slot.getSlotTime());
                sDto.put("available", Boolean.TRUE.equals(slot.getIsAvailable()));
                slotDtos.add(sDto);
                if (Boolean.TRUE.equals(slot.getIsAvailable())) {
                    freeDayNames.add(slot.getDayOfWeek());
                }
            }
            String freeDays = freeDayNames.isEmpty() ? "Flexible" : String.join(" / ", freeDayNames);

            // Topics & affordable INR session fee per taught skill so RequestSessionModal updates dynamically
            Map<String, List<String>> topicsBySkill = new LinkedHashMap<>();
            Map<String, Integer> feeBySkill = new LinkedHashMap<>();
            for (TutorSkill ts : tsList) {
                String sName = ts.getSkill().getName();
                List<String> tList = (ts.getSkill().getTags() != null && !ts.getSkill().getTags().isBlank())
                    ? Arrays.stream(ts.getSkill().getTags().split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList()
                    : List.of("Core Fundamentals & Setup", "Hands-on Practice", "Debugging & Q&A");
                topicsBySkill.put(sName, tList);
                feeBySkill.put(sName, ts.getHourlyFeeInr() != null ? ts.getHourlyFeeInr() : 99);
            }

            // Topics & fee from first matching skill (or first taught skill)
            Skill primarySkill = tsList.stream()
                .filter(ts -> skillFilter != null && !skillFilter.isBlank()
                    && ts.getSkill().getName().toLowerCase().contains(skillFilter.toLowerCase()))
                .findFirst()
                .orElse(tsList.get(0))
                .getSkill();

            List<String> topicsList = topicsBySkill.getOrDefault(
                primarySkill.getName(),
                List.of("Core Fundamentals & Setup", "Hands-on Practice", "Debugging & Q&A")
            );
            int primaryFeeInr = feeBySkill.getOrDefault(primarySkill.getName(), 99);

            List<Review> reviews = reviewRepo.findByTutorIdOrderByCreatedAtDesc(tid);
            List<Map<String, Object>> reviewDtos = reviews.stream().limit(3).map(r -> {
                Map<String, Object> rDto = new LinkedHashMap<>();
                rDto.put("student", r.getStudent().getFullName());
                rDto.put("rating", r.getRating());
                rDto.put("date", r.getCreatedAt().format(fmt));
                rDto.put("text", r.getComment() != null ? r.getComment() : "Great session!");
                return rDto;
            }).toList();

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", tutor.getId());
            dto.put("name", tutor.getFullName());
            dto.put("title", tutor.getTitle() != null ? tutor.getTitle() : "Peer Tutor");
            dto.put("avatar", tutor.getAvatarUrl() != null ? tutor.getAvatarUrl()
                : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + tutor.getId());
            dto.put("proficiency", highestProficiency);
            dto.put("rating", rating);
            dto.put("reviewCount", reviewCount);
            dto.put("freeDays", freeDays);
            dto.put("startingFeeInr", primaryFeeInr);
            dto.put("feeBySkill", feeBySkill);
            dto.put("recommended", false);
            dto.put("recommendReason", "");
            dto.put("bio", tutor.getBio() != null ? tutor.getBio() : "Peer student tutor ready to help.");
            dto.put("skillsTaught", skillsTaught);
            dto.put("availabilitySlots", slotDtos);
            dto.put("topicsList", topicsList);
            dto.put("topicsBySkill", topicsBySkill);
            dto.put("recentReviews", reviewDtos);
            tutors.add(dto);
        }

        // Sort highest rated & most reviewed first and mark top tutor as Recommended Best Match
        tutors.sort((a, b) -> {
            int cmp = Double.compare((Double) b.get("rating"), (Double) a.get("rating"));
            if (cmp != 0) return cmp;
            return Long.compare((Long) b.get("reviewCount"), (Long) a.get("reviewCount"));
        });

        if (!tutors.isEmpty()) {
            Map<String, Object> best = tutors.get(0);
            best.put("recommended", true);
            best.put("recommendReason", best.get("rating") + "★, free " + best.get("freeDays") + " • Top rated peer match");
        }

        return tutors;
    }

    private String resolveHighestProficiency(List<TutorSkill> list) {
        if (list.stream().anyMatch(ts -> "Advanced".equalsIgnoreCase(ts.getProficiencyLevel()))) return "Advanced";
        if (list.stream().anyMatch(ts -> "Intermediate".equalsIgnoreCase(ts.getProficiencyLevel()))) return "Intermediate";
        return "Beginner";
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
