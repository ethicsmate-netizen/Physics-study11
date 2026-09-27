import React, { useState, useEffect } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  X,
  Info,
} from 'lucide-react';
import {
  ExamPattern,
  ExamSectionConfig,
  Question,
  QuestionStatus,
  UserResponse,
} from '../../data/mockTests/types';
import { TextWithMath } from '../../components/common/TextWithMath';

interface CbtExamViewProps {
  questions: Question[];
  sections: ExamSectionConfig[];
  pattern: ExamPattern;
  timeLimitMinutes: number;
  onSubmitTest: (responses: Record<string, UserResponse>, totalTimeSeconds: number) => void;
  onExitTest: () => void;
}

export const CbtExamView: React.FC<CbtExamViewProps> = ({
  questions,
  sections,
  pattern,
  timeLimitMinutes,
  onSubmitTest,
  onExitTest,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [responses, setResponses] = useState<Record<string, UserResponse>>(() => {
    const initial: Record<string, UserResponse> = {};
    questions.forEach((q, idx) => {
      initial[q.id] = {
        questionId: q.id,
        selectedOptions: [],
        numericalValue: '',
        status: idx === 0 ? 'not_answered' : 'not_visited',
        timeSpentSeconds: 0,
      };
    });
    return initial;
  });

  // Timer states
  const totalSeconds = timeLimitMinutes > 0 ? timeLimitMinutes * 60 : 0;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [showConstantsModal, setShowConstantsModal] = useState<boolean>(false);
  const [showPaletteMobile, setShowPaletteMobile] = useState<boolean>(false);

  // Active question and its response
  const currentQ = questions[currentIndex];
  const currentRes = responses[currentQ.id] || {
    questionId: currentQ.id,
    selectedOptions: [],
    numericalValue: '',
    status: 'not_answered',
    timeSpentSeconds: 0,
  };

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);

      if (timeLimitMinutes > 0) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit when time expires!
            handleSubmitFinal();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimitMinutes]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Switch question
  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;

    // Update status of the destination question to 'not_answered' if it was 'not_visited'
    const targetQ = questions[index];
    setResponses((prev) => {
      const existing = prev[targetQ.id];
      if (existing && existing.status === 'not_visited') {
        return {
          ...prev,
          [targetQ.id]: {
            ...existing,
            status: 'not_answered',
          },
        };
      }
      return prev;
    });

    setCurrentIndex(index);
    setShowPaletteMobile(false);
  };

  // Option selection logic
  const handleSelectOption = (optId: string) => {
    const isMulti = currentQ.type === 'multiple' && pattern === 'jee_adv';
    let newSelected: string[];

    if (isMulti) {
      if (currentRes.selectedOptions.includes(optId)) {
        newSelected = currentRes.selectedOptions.filter((o) => o !== optId);
      } else {
        newSelected = [...currentRes.selectedOptions, optId].sort();
      }
    } else {
      // Single choice / Paragraph
      newSelected = [optId];
    }

    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...currentRes,
        selectedOptions: newSelected,
      },
    }));
  };

  // Numerical input change
  const handleNumericalChange = (val: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...currentRes,
        numericalValue: val,
      },
    }));
  };

  // Clear Response
  const handleClearResponse = () => {
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...currentRes,
        selectedOptions: [],
        numericalValue: '',
        status: 'not_answered',
      },
    }));
  };

  // Save & Next
  const handleSaveAndNext = () => {
    const hasAnswer =
      currentQ.type === 'numerical'
        ? currentRes.numericalValue.trim() !== ''
        : currentRes.selectedOptions.length > 0;

    const newStatus: QuestionStatus = hasAnswer ? 'answered' : 'not_answered';

    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...currentRes,
        status: newStatus,
      },
    }));

    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    const hasAnswer =
      currentQ.type === 'numerical'
        ? currentRes.numericalValue.trim() !== ''
        : currentRes.selectedOptions.length > 0;

    const newStatus: QuestionStatus = hasAnswer
      ? 'answered_marked_review'
      : 'marked_review';

    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...currentRes,
        status: newStatus,
      },
    }));

    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  // Final submission
  const handleSubmitFinal = () => {
    setShowSubmitModal(false);
    onSubmitTest(responses, timeElapsed);
  };

  // Palette counts
  const counts = Object.values(responses).reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<QuestionStatus, number>
  );

  const answeredCount = counts['answered'] || 0;
  const notAnsweredCount = counts['not_answered'] || 0;
  const notVisitedCount = counts['not_visited'] || 0;
  const markedReviewCount = counts['marked_review'] || 0;
  const answeredMarkedCount = counts['answered_marked_review'] || 0;

  // Determine which section the current question belongs to
  const currentSection = sections.find((sec) =>
    sec.questionIndices.includes(currentIndex)
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col select-none">
      {/* 1. NTA CBT Style Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-indigo-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                Φ
              </span>
              <span className="hidden sm:inline">
                {pattern === 'jee_main' ? 'JEE Main CBT' : 'JEE Advanced Paper'}
              </span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-zinc-850 border border-zinc-750 text-zinc-300">
              {pattern === 'jee_main' ? 'Physics (100 Marks)' : 'Physics (60 Marks)'}
            </span>
          </div>

          {/* Section Indicators */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto text-xs">
            {sections.map((sec) => {
              const isCurrent = sec.id === currentSection?.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => goToQuestion(sec.questionIndices[0])}
                  className={`px-2.5 py-1 rounded transition-colors text-[11px] whitespace-nowrap font-medium ${
                    isCurrent
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {sec.name}
                </button>
              );
            })}
          </div>

          {/* Right Timer & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Useful Constants Button */}
            <button
              onClick={() => setShowConstantsModal(true)}
              className="text-xs px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 transition"
              title="View Standard Physical Constants & Formulas"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Constants</span>
            </button>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-semibold border ${
                timeLimitMinutes > 0 && secondsRemaining < 300
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 animate-pulse'
                  : 'bg-zinc-900 border-zinc-750 text-emerald-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {timeLimitMinutes > 0 ? formatTime(secondsRemaining) : formatTime(timeElapsed)}
              </span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm"
            >
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Exam Interface Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Active Question & Answering Area (3 cols on desktop) */}
        <div className="lg:col-span-3 flex flex-col bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden shadow-sm">
          {/* Question Header Status */}
          <div className="bg-zinc-950/80 px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 font-mono text-[11px]">
                {currentQ.chapterTitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentQ.allenSection && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {currentQ.allenSection === 'O2'
                    ? 'Allen O-2'
                    : currentQ.allenSection === 'JM'
                    ? 'Allen JM'
                    : 'Allen JA'}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                {currentQ.type === 'single'
                  ? 'Single Choice MCQ'
                  : currentQ.type === 'multiple'
                  ? 'One or More Options Correct'
                  : currentQ.type === 'paragraph'
                  ? 'Paragraph Based'
                  : 'Numerical Value'}
              </span>

              {/* Marking Scheme Badge */}
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                {currentQ.type === 'multiple'
                  ? '+4, -2 (Partial +1)'
                  : currentQ.type === 'numerical' && pattern === 'jee_adv'
                  ? '+3, 0 (No Negative)'
                  : pattern === 'jee_main'
                  ? '+4, -1'
                  : '+3, -1'}
              </span>
            </div>
          </div>

          {/* Question Scrollable Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 text-sm">
            {/* Paragraph / Comprehension Box if applicable */}
            {currentQ.paragraphText && (
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{currentQ.paragraphTitle || 'COMPREHENSION PASSAGE'}</span>
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed">
                  <TextWithMath text={currentQ.paragraphText} />
                </div>
              </div>
            )}

            {/* Question Stem Text */}
            <div className="text-zinc-100 text-base leading-relaxed">
              <TextWithMath text={currentQ.text} />
            </div>

            {/* Answering Area: Options or Numerical Input */}
            <div className="pt-2">
              {currentQ.type === 'numerical' ? (
                /* Numerical Keypad & Input */
                <div className="max-w-md space-y-4">
                  <div className="text-xs text-zinc-400 font-mono">
                    Enter the numerical value (integer or decimal up to 2 decimal places):
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentRes.numericalValue}
                      onChange={(e) => handleNumericalChange(e.target.value)}
                      placeholder="e.g. 12 or 4.5"
                      className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono text-lg focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      onClick={() => handleNumericalChange('')}
                      className="px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 text-xs font-mono"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Virtual Numerical Keypad */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {['7', '8', '9', 'C', '4', '5', '6', '←', '1', '2', '3', '-', '0', '.', '00', '+/-'].map(
                      (key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            if (key === 'C') {
                              handleNumericalChange('');
                            } else if (key === '←') {
                              handleNumericalChange(currentRes.numericalValue.slice(0, -1));
                            } else if (key === '+/-') {
                              if (currentRes.numericalValue.startsWith('-')) {
                                handleNumericalChange(currentRes.numericalValue.slice(1));
                              } else if (currentRes.numericalValue) {
                                handleNumericalChange('-' + currentRes.numericalValue);
                              }
                            } else {
                              handleNumericalChange(currentRes.numericalValue + key);
                            }
                          }}
                          className="py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-sm font-semibold transition"
                        >
                          {key}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : (
                /* Radio or Checkbox Options */
                <div className="space-y-3">
                  {currentQ.type === 'multiple' && (
                    <div className="text-xs text-amber-400/90 font-mono mb-2">
                      Notice: One or more than one option may be correct. (+4 for all correct, +1 partial per correct option without error, -2 if wrong option picked).
                    </div>
                  )}

                  {currentQ.options?.map((opt) => {
                    const isSelected = currentRes.selectedOptions.includes(opt.id);
                    const isMulti = currentQ.type === 'multiple' && pattern === 'jee_adv';

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/40 text-white'
                            : 'bg-zinc-950/40 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/40 text-zinc-300'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5 transition ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          } ${!isMulti ? 'rounded-full' : 'rounded-md'}`}
                        >
                          {opt.id}
                        </div>

                        <div className="text-sm pt-0.5 flex-1">
                          <TextWithMath text={opt.text} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="bg-zinc-950/90 p-3 sm:p-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndNext}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
              >
                Save & Next
              </button>

              <button
                onClick={handleMarkForReviewAndNext}
                className="px-3.5 py-2 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/60 transition"
              >
                Mark for Review & Next
              </button>

              <button
                onClick={handleClearResponse}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 transition"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => goToQuestion(currentIndex - 1)}
                className={`p-2 rounded-lg border transition ${
                  currentIndex === 0
                    ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Previous Question"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => goToQuestion(currentIndex + 1)}
                className={`p-2 rounded-lg border transition ${
                  currentIndex === questions.length - 1
                    ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Next Question"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowPaletteMobile(!showPaletteMobile)}
                className="lg:hidden px-3 py-2 rounded-lg bg-zinc-800 text-zinc-200"
              >
                Palette
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette & Status Summary (1 col on desktop) */}
        <div
          className={`lg:block ${
            showPaletteMobile ? 'block fixed inset-0 z-50 p-4 bg-black/80' : 'hidden'
          }`}
        >
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="font-semibold text-xs text-white">
                  Question Palette
                </span>
                {showPaletteMobile && (
                  <button
                    onClick={() => setShowPaletteMobile(false)}
                    className="p-1 rounded text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                    {answeredCount}
                  </span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-4 h-4 rounded bg-rose-600 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                    {notAnsweredCount}
                  </span>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-4 h-4 rounded bg-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                    {notVisitedCount}
                  </span>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-4 h-4 rounded bg-purple-700 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                    {markedReviewCount}
                  </span>
                  <span>Marked Review</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300 col-span-2">
                  <span className="w-4 h-4 rounded bg-purple-700 border-2 border-emerald-400 flex items-center justify-center text-[9px] font-mono font-bold text-white">
                    {answeredMarkedCount}
                  </span>
                  <span>Answered & Marked Review</span>
                </div>
              </div>

              {/* Question Number Matrix */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="text-[11px] font-mono text-zinc-400 mb-2">
                  Select Question:
                </div>
                <div className="grid grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    const status = responses[q.id]?.status || 'not_visited';
                    const isCurrent = idx === currentIndex;

                    let bgClass = 'bg-zinc-800 text-zinc-400';
                    if (status === 'answered') bgClass = 'bg-emerald-600 text-white font-bold';
                    else if (status === 'not_answered') bgClass = 'bg-rose-600 text-white font-bold';
                    else if (status === 'marked_review') bgClass = 'bg-purple-700 text-white font-bold';
                    else if (status === 'answered_marked_review')
                      bgClass = 'bg-purple-700 text-white font-bold ring-2 ring-emerald-400';

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(idx)}
                        className={`h-8 rounded font-mono text-xs transition relative flex items-center justify-center ${bgClass} ${
                          isCurrent ? 'ring-2 ring-white scale-105 z-10' : ''
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Submit Test CTA in Sidebar */}
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                Submit Test
              </button>
              <button
                onClick={() => setShowExitModal(true)}
                className="w-full py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 text-xs transition"
              >
                Exit Simulator
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-750 rounded-2xl p-6 shadow-2xl space-y-5">
            <div>
              <h3 className="text-base font-semibold text-white">
                Submit Test Examination?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Please review your question attempt summary before submitting. Once submitted, your score and detailed step-by-step solutions will be generated.
              </p>
            </div>

            {/* Attempt Summary Table */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Total Questions:</span>
                <span className="font-mono text-zinc-200">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-medium">Answered:</span>
                <span className="font-mono text-emerald-400">{answeredCount + answeredMarkedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-medium">Not Answered:</span>
                <span className="font-mono text-rose-400">{notAnsweredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-medium">Marked for Review:</span>
                <span className="font-mono text-purple-400">{markedReviewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Not Visited:</span>
                <span className="font-mono text-zinc-300">{notVisitedCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold transition"
              >
                Resume Test
              </button>
              <button
                onClick={handleSubmitFinal}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-sm w-full bg-zinc-900 border border-zinc-750 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">
              Exit Test Simulator?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to leave? Your current test progress will be lost.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={onExitTest}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Physical Constants & Reference Sheet Modal */}
      {showConstantsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full bg-zinc-900 border border-zinc-750 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Standard Physical Constants (JEE Reference)</span>
              </h3>
              <button
                onClick={() => setShowConstantsModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 flex justify-between items-center">
                <span className="text-zinc-400">Acceleration due to gravity:</span>
                <span className="font-mono text-zinc-200">
                  <TextWithMath text="$g = 9.8\text{ m/s}^2 \text{ or } 10\text{ m/s}^2$" />
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 flex justify-between items-center">
                <span className="text-zinc-400">Universal Gas Constant:</span>
                <span className="font-mono text-zinc-200">
                  <TextWithMath text="$R = 8.314\text{ J/(mol K)} \approx \frac{25}{3}$" />
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 flex justify-between items-center">
                <span className="text-zinc-400">Speed of light in vacuum:</span>
                <span className="font-mono text-zinc-200">
                  <TextWithMath text="$c = 3.0 \times 10^8\text{ m/s}$" />
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 flex justify-between items-center">
                <span className="text-zinc-400">Permittivity of free space:</span>
                <span className="font-mono text-zinc-200">
                  <TextWithMath text="$\varepsilon_0 = 8.854 \times 10^{-12}\text{ F/m}$" />
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 flex justify-between items-center">
                <span className="text-zinc-400">Gravitational Constant:</span>
                <span className="font-mono text-zinc-200">
                  <TextWithMath text="$G = 6.67 \times 10^{-11}\text{ N m}^2/\text{kg}^2$" />
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 flex justify-between items-center">
                <span className="text-zinc-400">Natural logarithm of 2:</span>
                <span className="font-mono text-zinc-200">
                  <TextWithMath text="$\ln 2 \approx 0.693$" />
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowConstantsModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
