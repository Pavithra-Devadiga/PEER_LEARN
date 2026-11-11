package com.peerlearn.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_attachments")
public class MaterialAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false, unique = true)
    private LearningMaterial material;

    @Column(name = "file_data", columnDefinition = "BYTEA", nullable = false)
    private byte[] fileData;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public MaterialAttachment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LearningMaterial getMaterial() { return material; }
    public void setMaterial(LearningMaterial material) { this.material = material; }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
