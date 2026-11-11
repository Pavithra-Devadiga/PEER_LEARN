package com.peerlearn.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "material_verifications",
    uniqueConstraints = @UniqueConstraint(columnNames = {"material_id", "tutor_id"})
)
public class MaterialVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private LearningMaterial material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(name = "verified_at", nullable = false, updatable = false)
    private LocalDateTime verifiedAt = LocalDateTime.now();

    public MaterialVerification() {}

    public MaterialVerification(LearningMaterial material, User tutor) {
        this.material = material;
        this.tutor = tutor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LearningMaterial getMaterial() { return material; }
    public void setMaterial(LearningMaterial material) { this.material = material; }

    public User getTutor() { return tutor; }
    public void setTutor(User tutor) { this.tutor = tutor; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}
