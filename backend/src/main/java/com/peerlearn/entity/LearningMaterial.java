package com.peerlearn.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_materials")
public class LearningMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "material_type", nullable = false, length = 30)
    private String materialType;

    @Column(nullable = false, length = 30)
    private String tint = "violet";

    @Column(name = "read_time", nullable = false, length = 40)
    private String readTime = "5 min read";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "attachment_name", length = 255)
    private String attachmentName;

    @Column(name = "attachment_content_type", length = 120)
    private String attachmentContentType;

    @Column(name = "attachment_size")
    private Long attachmentSize;

    @Column(name = "is_ai_seeded", nullable = false)
    private Boolean isAiSeeded = false;

    @Column(name = "verified_count", nullable = false)
    private Integer verifiedCount = 0;

    @Column(nullable = false, length = 20)
    private String status = "Published";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LearningMaterial() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMaterialType() { return materialType; }
    public void setMaterialType(String materialType) { this.materialType = materialType; }

    public String getTint() { return tint; }
    public void setTint(String tint) { this.tint = tint; }

    public String getReadTime() { return readTime; }
    public void setReadTime(String readTime) { this.readTime = readTime; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public String getAttachmentContentType() { return attachmentContentType; }
    public void setAttachmentContentType(String attachmentContentType) { this.attachmentContentType = attachmentContentType; }

    public Long getAttachmentSize() { return attachmentSize; }
    public void setAttachmentSize(Long attachmentSize) { this.attachmentSize = attachmentSize; }

    public Boolean getIsAiSeeded() { return isAiSeeded; }
    public void setIsAiSeeded(Boolean isAiSeeded) { this.isAiSeeded = isAiSeeded; }

    public Integer getVerifiedCount() { return verifiedCount; }
    public void setVerifiedCount(Integer verifiedCount) { this.verifiedCount = verifiedCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
