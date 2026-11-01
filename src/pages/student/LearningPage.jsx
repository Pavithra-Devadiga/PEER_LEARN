import React, { useState } from 'react';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { placeholderData } from '../../data/placeholderData';
import { BookOpen, CheckCircle, HelpCircle, Bookmark, BookmarkCheck, BarChart2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

export function LearningPage() {
  const content = placeholderData.learningContent;
  const [selectedSkill, setSelectedSkill] = useState(content.skills[0]);
  const [activeTab, setActiveTab] = useState('cheatsheets');

  // Cheatsheets state
  const [cheatsheets, setCheatsheets] = useState(content.cheatsheets);

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const toggleBookmark = (id) => {
    setCheatsheets((prev) =>
      prev.map((cs) => (cs.id === id ? { ...cs, bookmarked: !cs.bookmarked } : cs))
    );
  };

  const currentQ = content.quiz.questions[currentQIndex];

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    if (selectedAnswer === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < content.quiz.questions.length) {
      setCurrentQIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Skill Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Learning Hub
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Access curated cheatsheets, test yourself with instant quizzes, and view weak spots.
          </p>
        </div>

        {/* Skill Selector */}
        <div className="flex items-center gap-2">
          {content.skills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedSkill === skill
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card text-text-secondary border border-border-subtle hover:bg-card-hover'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-subtle/80 pb-3">
        {[
          { id: 'cheatsheets', label: 'Cheatsheets & Notes', icon: BookOpen },
          { id: 'quiz', label: 'Interactive Quiz', icon: HelpCircle },
          { id: 'analytics', label: 'Check Your Learning', icon: BarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card text-text-secondary hover:text-text-main border border-border-subtle'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Cheatsheets */}
      {activeTab === 'cheatsheets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cheatsheets.map((cs) => (
            <Card key={cs.id} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent-muted text-accent">
                    {cs.badge}
                  </span>
                  <button
                    onClick={() => toggleBookmark(cs.id)}
                    className="p-1 rounded-full text-text-muted hover:text-accent transition-colors"
                  >
                    {cs.bookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-accent fill-accent" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <h3 className="text-base font-bold text-text-main mb-2">
                  {cs.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {cs.content}
                </p>
              </div>

              <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs text-text-muted">
                <span>{cs.readTime}</span>
                <span className="text-accent font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                  Read Guide →
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Interactive Quiz */}
      {activeTab === 'quiz' && (
        <Card className="max-w-2xl mx-auto p-6 sm:p-8">
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Question {currentQIndex + 1} of {content.quiz.questions.length}
                </span>
                <span className="text-xs text-text-muted font-semibold">
                  Score: {score}/{currentQIndex}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-text-main">
                {currentQ.question}
              </h2>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let optStyle =
                    'w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all ';

                  if (isAnswerSubmitted) {
                    if (idx === currentQ.correctIndex) {
                      optStyle += 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                    } else if (idx === selectedAnswer) {
                      optStyle += 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-300 font-bold';
                    } else {
                      optStyle += 'bg-card-muted/40 border-border-subtle opacity-50';
                    }
                  } else {
                    if (selectedAnswer === idx) {
                      optStyle += 'bg-accent-muted border-accent text-accent font-bold ring-1 ring-accent';
                    } else {
                      optStyle += 'bg-card border-border-subtle hover:bg-card-muted text-text-main';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={optStyle}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation after submitting */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-card-muted border border-border-subtle text-xs text-text-secondary leading-relaxed">
                  <span className="font-bold text-text-main">Explanation: </span>
                  {currentQ.explanation}
                </div>
              )}

              <div className="flex justify-end pt-2">
                {!isAnswerSubmitted ? (
                  <PillButton
                    variant="primary"
                    disabled={selectedAnswer === null}
                    onClick={handleSubmitAnswer}
                  >
                    Submit Answer
                  </PillButton>
                ) : (
                  <PillButton variant="primary" onClick={handleNextQuestion}>
                    {currentQIndex + 1 < content.quiz.questions.length ? 'Next Question →' : 'See Results'}
                  </PillButton>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent-muted text-accent flex items-center justify-center mx-auto text-2xl font-extrabold">
                {score}/{content.quiz.questions.length}
              </div>
              <h2 className="text-2xl font-extrabold text-text-main">
                Quiz Complete!
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
                You scored {Math.round((score / content.quiz.questions.length) * 100)}%! Your learning profile has been updated.
              </p>
              <PillButton
                variant="secondary"
                icon={RotateCcw}
                onClick={handleRestartQuiz}
                className="mt-4"
              >
                Retake Quiz
              </PillButton>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Check Your Learning */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-accent" /> Mastery Overview
            </h3>
            <div className="p-4 rounded-2xl bg-accent-muted border border-accent/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Calculated Skill Level
                </div>
                <div className="text-xl font-extrabold text-text-main mt-0.5">
                  {content.learningProgress.level}
                </div>
              </div>
              <div className="text-3xl font-black text-accent">
                {content.learningProgress.overallScore}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Recent Quiz History
              </div>
              {content.learningProgress.history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-card-muted/60 text-xs"
                >
                  <span className="font-semibold text-text-main">{h.quiz}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">{h.date}</span>
                    <span className="font-bold text-accent">{h.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Focus Areas
            </h3>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-text-muted">
                Frequently Missed Topics:
              </div>
              {content.learningProgress.weakTopics.map((topic, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-between"
                >
                  <span>{topic}</span>
                  <span className="text-[10px] underline cursor-pointer">
                    Book Tutor Session
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-text-muted">
                Solid Grasp:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {content.learningProgress.strongTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-500/20"
                  >
                    ✓ {topic}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
