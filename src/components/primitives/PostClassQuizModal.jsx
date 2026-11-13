import React, { useEffect, useState } from 'react';
import {
  X,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { PillButton } from './PillButton';
import { useToast } from '../../context/ToastContext';
import { getQuizForSkill } from '../../data/quizData';

export function PostClassQuizModal({ session, isOpen, onClose, onCompleted }) {
  const { showToast } = useToast();
  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answersMap, setAnswersMap] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isOpen || !session) return;
    const skillName = session.skill || session.title || 'Python Programming';
    const data = getQuizForSkill(skillName);
    setQuizData(data);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setAnswersMap({});
    setResult(null);
  }, [isOpen, session]);

  if (!isOpen || !session) return null;

  const questions = quizData?.questions || [];
  const currentQ = questions[currentIdx];

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || !currentQ) return;
    setIsSubmitted(true);
    setAnswersMap((prev) => ({ ...prev, [currentQ.id]: selectedAnswer }));
  };

  const handleNextOrFinish = () => {
    if (!currentQ) return;
    const latestAnswers = { ...answersMap, [currentQ.id]: selectedAnswer };

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      return;
    }

    // Calculate score client-side with 0 DB tables!
    let correctCount = 0;
    const strong = [];
    const missed = [];

    questions.forEach((q) => {
      const chosen = latestAnswers[q.id];
      if (chosen === q.correctIndex) {
        correctCount++;
        strong.push(q.topicTag);
      } else {
        missed.push(q.topicTag);
      }
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const evaluation = {
      score: correctCount,
      totalQuestions,
      percentage,
      strongTopics: strong,
      missedTopics: missed,
    };

    setResult(evaluation);
    showToast(
      `Post-class quiz completed: ${correctCount}/${totalQuestions} (${percentage}%)!`,
      'success'
    );
    if (onCompleted) onCompleted(evaluation);
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setAnswersMap({});
    setResult(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-card rounded-3xl shadow-2xl border border-border-card p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close post-class quiz"
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-card-muted text-text-muted hover:text-text-main"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 pr-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-accent-muted text-accent mb-2">
            <HelpCircle className="w-3.5 h-3.5" /> Post-Class Topic Quiz
          </span>
          <h2 className="text-xl font-extrabold text-text-main">
            {quizData?.title || `${session.skill} Knowledge Check`}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-muted">Skill:</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-card-muted border border-border-subtle text-text-main">
              {session.skill || 'Programming & CS'}
            </span>
          </div>
        </div>

        {questions.length === 0 && (
          <div className="p-6 rounded-2xl bg-card-muted/60 border border-border-subtle text-center text-xs text-text-muted">
            No quiz questions exist yet for {session.skill}.
          </div>
        )}

        {result && (
          <div className="space-y-4 pt-2 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Session Quiz Score
              </p>
              <h3 className="text-3xl font-extrabold text-accent mt-1">
                {result.score} / {result.totalQuestions} ({result.percentage}%)
              </h3>
            </div>

            {result.strongTopics?.length > 0 && (
              <div className="text-left p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-1.5">
                  Strong Grasp
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.strongTopics.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-card text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/25"
                    >
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.missedTopics?.length > 0 && (
              <div className="text-left p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1.5">
                  Review Next
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missedTopics.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-card text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/25"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-center gap-2.5">
              <PillButton variant="secondary" size="sm" icon={RotateCcw} onClick={handleRetry}>
                Retake Quiz
              </PillButton>
              <PillButton variant="primary" size="sm" onClick={onClose}>
                Done
              </PillButton>
            </div>
          </div>
        )}

        {!result && currentQ && (
          <div className="space-y-4 pt-2 border-t border-border-subtle/70">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-accent">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" /> Topic: {currentQ.topicTag}
              </span>
            </div>

            <h3 className="text-base font-bold text-text-main leading-snug">
              {currentQ.question}
            </h3>

            <div className="space-y-2">
              {currentQ.options.map((opt, idx) => {
                let cls =
                  'w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all ';
                if (isSubmitted) {
                  if (idx === currentQ.correctIndex) {
                    cls += 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                  } else if (idx === selectedAnswer) {
                    cls += 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-300 font-bold';
                  } else {
                    cls += 'bg-card-muted/40 border-border-subtle text-text-muted opacity-70';
                  }
                } else if (selectedAnswer === idx) {
                  cls += 'bg-accent-muted border-accent text-accent font-bold';
                } else {
                  cls += 'bg-card-muted/50 border-border-subtle text-text-main hover:bg-card-muted';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setSelectedAnswer(idx)}
                    className={cls}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {isSubmitted && currentQ.explanation && (
              <div className="p-3.5 rounded-2xl bg-card-muted border border-border-subtle text-xs text-text-secondary">
                <span className="font-bold text-text-main">Explanation: </span>
                {currentQ.explanation}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              {!isSubmitted ? (
                <PillButton
                  variant="primary"
                  size="sm"
                  disabled={selectedAnswer === null}
                  onClick={handleCheckAnswer}
                >
                  Check Answer
                </PillButton>
              ) : (
                <PillButton
                  variant="primary"
                  size="sm"
                  onClick={handleNextOrFinish}
                >
                  {currentIdx + 1 < questions.length ? 'Next Question →' : 'Finish & View Score'}
                </PillButton>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
