package com.peerlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "availability_slots",
    uniqueConstraints = @UniqueConstraint(name = "uk_tutor_slot", columnNames = {"tutor_id", "day_of_week", "slot_time"})
)
public class AvailabilitySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(name = "day_of_week", nullable = false, length = 20)
    private String dayOfWeek;

    @Column(name = "slot_time", nullable = false, length = 40)
    private String slotTime;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    public AvailabilitySlot() {}

    public AvailabilitySlot(User tutor, String dayOfWeek, String slotTime, Boolean isAvailable) {
        this.tutor = tutor;
        this.dayOfWeek = dayOfWeek;
        this.slotTime = slotTime;
        this.isAvailable = isAvailable;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getTutor() { return tutor; }
    public void setTutor(User tutor) { this.tutor = tutor; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}
