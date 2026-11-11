package com.peerlearn.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "option_a", nullable = false, length = 300)
    private String optionA;

    @Column(name = "option_b", nullable = false, length = 300)
    private String optionB;

    @Column(name = "option_c", nullable = false, length = 300)
    private String optionC;

    @Column(name = "option_d", nullable = false, length = 300)
    private String optionD;

    @Column(name = "correct_index", nullable = false)
    private Integer correctIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "topic_tag", nullable = false, length = 120)
    private String topicTag;

    public QuizQuestion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getOptionA() { return optionA; }
    public void setOptionA(String optionA) { this.optionA = optionA; }

    public String getOptionB() { return optionB; }
    public void setOptionB(String optionB) { this.optionB = optionB; }

    public String getOptionC() { return optionC; }
    public void setOptionC(String optionC) { this.optionC = optionC; }

    public String getOptionD() { return optionD; }
    public void setOptionD(String optionD) { this.optionD = optionD; }

    public Integer getCorrectIndex() { return correctIndex; }
    public void setCorrectIndex(Integer correctIndex) { this.correctIndex = correctIndex; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getTopicTag() { return topicTag; }
    public void setTopicTag(String topicTag) { this.topicTag = topicTag; }
}
