package com.peerlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "skill_curriculum_topics")
public class SkillCurriculumTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "topic_name", nullable = false, length = 200)
    private String topicName;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 1;

    public SkillCurriculumTopic() {}

    public SkillCurriculumTopic(Skill skill, String topicName, Integer sortOrder) {
        this.skill = skill;
        this.topicName = topicName;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
