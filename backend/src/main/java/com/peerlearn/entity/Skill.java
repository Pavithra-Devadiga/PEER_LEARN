package com.peerlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(length = 255)
    private String tags;

    @Column(name = "base_price_inr", nullable = false)
    private Integer basePriceInr = 99;

    public Skill() {}

    public Skill(Category category, String name, String tags) {
        this(category, name, tags, 99);
    }

    public Skill(Category category, String name, String tags, Integer basePriceInr) {
        this.category = category;
        this.name = name;
        this.tags = tags;
        this.basePriceInr = basePriceInr != null ? basePriceInr : 99;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Integer getBasePriceInr() { return basePriceInr; }
    public void setBasePriceInr(Integer basePriceInr) { this.basePriceInr = basePriceInr; }
}
