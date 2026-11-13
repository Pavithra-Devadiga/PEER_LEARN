import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/primitives/Card';
import { PillButton } from '../../components/primitives/PillButton';
import { MaterialAttachmentViewer } from '../../components/primitives/MaterialAttachmentViewer';
import { BookOpen, HelpCircle, Bookmark, BookmarkCheck, BarChart2, AlertTriangle, RotateCcw, X, Clock, Paperclip, CheckCircle2 } from 'lucide-react';
import { apiRequest, formatFileSize } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { getQuizForSkill } from '../../data/quizData';

export function LearningPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [activeTab, setActiveTab] = useState('cheatsheets');

  const [cheatsheets, setCheatsheets] = useState([]);
  const [activeGuide, setActiveGuide] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [learningProgress, setLearningProgress] = useState({
    overallScore: '—',
    level: 'Level 1: Getting Started',
    weakTopics: [],
    strongTopics: [],
    history: [],
  });

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answersMap, setAnswersMap] = useState({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const loadHub = useCallback(async (skillName) => {
    try {
      const qs = skillName ? `?skill=${encodeURIComponent(skillName)}` : '';
      const data = await apiRequest(`/api/learning${qs}`);
      if (data) {
        setSkills(data.skills || []);
        const currentSkill = skillName || data.selectedSkill || 'Python Programming';
        setSelectedSkill(currentSkill);
        setCheatsheets(data.cheatsheets || []);
        setQuiz(getQuizForSkill(currentSkill));
        if (data.learningProgress) setLearningProgress(data.learningProgress);
        setCurrentQIndex(0);
        setSelectedAnswer(null);
        setAnswersMap({});
        setIsAnswerSubmitted(false);
        setScore(0);
        setQuizFinished(false);
      }
    } catch (err) {
      showToast(err.message || 'Could not load learning materials.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    loadHub('');
  }, [loadHub]);

  const handleSelectSkill = (skill) => {
    setSelectedSkill(skill);
    setQuiz(getQuizForSkill(skill));
    loadHub(skill);
  };

  const toggleBookmark = async (id) => {
    try {
      const res = await apiRequest(`/api/learning/materials/${id}/bookmark`, { method: 'POST' });
      setCheatsheets((prev) =>
        prev.map((cs) => (cs.id === id ? { ...cs, bookmarked: res.bookmarked } : cs))
      );
      setActiveGuide((prev) =>
        prev && prev.id === id ? { ...prev, bookmarked: res.bookmarked } : prev
      );
      showToast(res.bookmarked ? 'Saved guide to bookmarks.' : 'Removed from bookmarks.', 'info');
    } catch (err) {
      showToast(err.message || 'Could not update bookmark.', 'error');
    }
  };

  const currentQ = quiz?.questions?.[currentQIndex];

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQ) return;
    setIsAnswerSubmitted(true);
    setAnswersMap((prev) => ({ ...prev, [currentQ.id]: selectedAnswer }));
    if (selectedAnswer === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!quiz?.questions) return;
    if (currentQIndex + 1 < quiz.questions.length) {
      setCurrentQIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      const totalPct = Math.round((score / quiz.questions.length) * 100);
      setLearningProgress((prev) => ({
        ...prev,
        overallScore: `${totalPct}%`,
        level: totalPct >= 80 ? 'Level 3: Proficient' : 'Level 2: Developing',
        history: [
          { date: 'Today', quiz: quiz.title, score: `${totalPct}%` },
          ...(prev.history || []).slice(0, 4),
        ],
      }));
      showToast('Quiz complete! Your learning progress has been updated.', 'success');
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setAnswersMap({});
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Skill Picker */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Learning Hub
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Access curated cheatsheets, test yourself with instant quizzes, and view weak spots.
          </p>
        </div>

        {/* Skill Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {skills.map((skill) => (
            <button
              key={skill}
              onClick={() => handleSelectSkill(skill)}
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
      <div className="flex flex-wrap gap-1.5 sm:gap-2 border-b border-border-subtle/80 pb-3">
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
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
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
          {cheatsheets.length === 0 ? (
            <Card className="md:col-span-3 p-8 text-center text-sm text-text-muted">
              No study materials published for {selectedSkill || 'this skill'} yet.
            </Card>
          ) : (
            cheatsheets.map((cs) => (
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
                  <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-3">
                    {cs.content}
                  </p>
                  {cs.attachment && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card-muted border border-border-subtle text-[11px] font-semibold text-text-main mb-3 max-w-full">
                      <Paperclip className="w-3 h-3 text-accent shrink-0" />
                      <span className="truncate">{cs.attachment.name}</span>
                      <span className="text-text-muted shrink-0">({formatFileSize(cs.attachment.size)})</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <span>{cs.readTime}</span>
                    {cs.verifiedCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> {cs.verifiedCount}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveGuide(cs)}
                    className="text-accent font-semibold flex items-center gap-1 hover:underline"
                  >
                    Read Guide →
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Interactive Quiz */}
      {activeTab === 'quiz' && (
        <Card className="max-w-2xl mx-auto p-6 sm:p-8">
          {!quiz || !quiz.questions || quiz.questions.length === 0 ? (
            <div className="text-center py-8 text-sm text-text-muted">
              No quiz available for {selectedSkill || 'this skill'} yet.
            </div>
          ) : !quizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Question {currentQIndex + 1} of {quiz.questions.length}
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
                    {currentQIndex + 1 < quiz.questions.length ? 'Next Question →' : 'See Results'}
                  </PillButton>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent-muted text-accent flex items-center justify-center mx-auto text-2xl font-extrabold">
                {score}/{quiz.questions.length}
              </div>
              <h2 className="text-2xl font-extrabold text-text-main">
                Quiz Complete!
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
                You scored {Math.round((score / quiz.questions.length) * 100)}%! Your learning profile has been updated.
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
                  {learningProgress.level}
                </div>
              </div>
              <div className="text-3xl font-black text-accent">
                {learningProgress.overallScore}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Recent Quiz History
              </div>
              {learningProgress.history.length === 0 ? (
                <p className="text-xs text-text-muted py-2">Take a quiz to track your scores here.</p>
              ) : (
                learningProgress.history.map((h, i) => (
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
                ))
              )}
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
              {learningProgress.weakTopics.length === 0 ? (
                <p className="text-xs text-text-muted py-1">No weak topics detected yet.</p>
              ) : (
                learningProgress.weakTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-between"
                  >
                    <span>{topic}</span>
                    <span
                      onClick={() => navigate(`/student/tutors?skill=${encodeURIComponent(selectedSkill)}`)}
                      className="text-[10px] underline cursor-pointer"
                    >
                      Book Tutor Session
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-text-muted">
                Solid Grasp:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {learningProgress.strongTopics.length === 0 ? (
                  <span className="text-xs text-text-muted">Complete quizzes to identify strong topics.</span>
                ) : (
                  learningProgress.strongTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-500/20"
                    >
                      ✓ {topic}
                    </span>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Interactive Study Guide Reader Modal */}
      {activeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          onClick={() => setActiveGuide(null)}
        >
          <div
            className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border-card p-6 sm:p-8 relative max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveGuide(null)}
              aria-label="Close guide"
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-card-muted text-text-muted hover:text-text-main"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-3 pr-10">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent-muted text-accent">
                {activeGuide.badge}
              </span>
              {activeGuide.readTime && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted">
                  <Clock className="w-3.5 h-3.5" /> {activeGuide.readTime}
                </span>
              )}
              {selectedSkill && (
                <span className="text-xs font-semibold text-text-muted">
                  • {selectedSkill}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-text-main mb-4 pr-8">
              {activeGuide.title}
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 py-3 border-y border-border-subtle/70">
              <div className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line font-normal">
                {activeGuide.content}
              </div>
              <MaterialAttachmentViewer attachment={activeGuide.attachment} />
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
              <PillButton
                variant="secondary"
                size="sm"
                icon={activeGuide.bookmarked ? BookmarkCheck : Bookmark}
                onClick={() => toggleBookmark(activeGuide.id)}
              >
                {activeGuide.bookmarked ? 'Bookmarked' : 'Bookmark Guide'}
              </PillButton>
              <PillButton variant="primary" size="sm" onClick={() => setActiveGuide(null)}>
                Close Reader
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
