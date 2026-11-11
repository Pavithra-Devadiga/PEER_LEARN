package com.peerlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "tutor_skills",
    uniqueConstraints = @UniqueConstraint(name = "uk_tutor_skill", columnNames = {"tutor_id", "skill_id"})
)
public class TutorSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "proficiency_level", nullable = false, length = 30)
    private String proficiencyLevel;

    @Column(name = "hourly_fee_inr", nullable = false)
    private Integer hourlyFeeInr = 99;

    public TutorSkill() {}

    public TutorSkill(User tutor, Skill skill, String proficiencyLevel) {
        this(tutor, skill, proficiencyLevel, skill != null && skill.getBasePriceInr() != null ? skill.getBasePriceInr() : 99);
    }

    public TutorSkill(User tutor, Skill skill, String proficiencyLevel, Integer hourlyFeeInr) {
        this.tutor = tutor;
        this.skill = skill;
        this.proficiencyLevel = proficiencyLevel;
        this.hourlyFeeInr = hourlyFeeInr != null ? hourlyFeeInr : 99;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getTutor() { return tutor; }
    public void setTutor(User tutor) { this.tutor = tutor; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public String getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(String proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public Integer getHourlyFeeInr() { return hourlyFeeInr; }
    public void setHourlyFeeInr(Integer hourlyFeeInr) { this.hourlyFeeInr = hourlyFeeInr; }
}
