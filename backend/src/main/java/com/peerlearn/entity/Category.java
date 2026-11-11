package com.peerlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String icon;

    @Column(nullable = false, length = 30)
    private String tint;

    public Category() {}

    public Category(String name, String icon, String tint) {
        this.name = name;
        this.icon = icon;
        this.tint = tint;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getTint() { return tint; }
    public void setTint(String tint) { this.tint = tint; }
}
