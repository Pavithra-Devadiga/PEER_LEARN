package com.peerlearn.repository;

import com.peerlearn.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {
    List<AvailabilitySlot> findByTutorIdOrderByIdAsc(Long tutorId);
    Optional<AvailabilitySlot> findByTutorIdAndDayOfWeekAndSlotTime(Long tutorId, String dayOfWeek, String slotTime);
}
