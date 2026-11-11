package com.peerlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "material_bookmarks",
    uniqueConstraints = @UniqueConstraint(name = "uk_user_material", columnNames = {"user_id", "material_id"})
)
public class MaterialBookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private LearningMaterial material;

    public MaterialBookmark() {}

    public MaterialBookmark(User user, LearningMaterial material) {
        this.user = user;
        this.material = material;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LearningMaterial getMaterial() { return material; }
    public void setMaterial(LearningMaterial material) { this.material = material; }
}
