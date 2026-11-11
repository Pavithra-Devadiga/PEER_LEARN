package com.peerlearn.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_sessions")
public class LearningSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", unique = true)
    private SessionRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    private AvailabilitySlot slot;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 20)
    private String status = "UPCOMING";

    @Column(name = "scheduled_label", nullable = false, length = 100)
    private String scheduledLabel;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "duration_hours", nullable = false)
    private Double durationHours = 1.0;

    @Column(name = "meeting_url", length = 500)
    private String meetingUrl;

    @Column(name = "fee_inr", nullable = false)
    private Integer feeInr = 99;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LearningSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SessionRequest getRequest() { return request; }
    public void setRequest(SessionRequest request) { this.request = request; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public User getTutor() { return tutor; }
    public void setTutor(User tutor) { this.tutor = tutor; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public AvailabilitySlot getSlot() { return slot; }
    public void setSlot(AvailabilitySlot slot) { this.slot = slot; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getScheduledLabel() { return scheduledLabel; }
    public void setScheduledLabel(String scheduledLabel) { this.scheduledLabel = scheduledLabel; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public Double getDurationHours() { return durationHours; }
    public void setDurationHours(Double durationHours) { this.durationHours = durationHours; }

    public String getMeetingUrl() { return meetingUrl; }
    public void setMeetingUrl(String meetingUrl) { this.meetingUrl = meetingUrl; }

    public Integer getFeeInr() { return feeInr; }
    public void setFeeInr(Integer feeInr) { this.feeInr = feeInr; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
