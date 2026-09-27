import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TestScoreReport } from '../../data/mockTests/types';
import { TextWithMath } from '../../components/common/TextWithMath';

interface TestResultViewProps {
  report: TestScoreReport;
  onRetakeTest: () => void;
  onNewTest: () => void;
  onBackToHome: () => void;
}

export const TestResultView: React.FC<TestResultViewProps> = ({
  report,
  onRetakeTest,
  onNewTest,
  onBackToHome,
}) => {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct' | 'partial' | 'unattempted'>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const filteredQuestions = report.scoredQuestions.filter((sq) => {
    if (filter === 'incorrect') return sq.isIncorrect;
    if (filter === 'correct') return sq.isCorrect;
    if (filter === 'partial') return sq.isPartial;
    if (filter === 'unattempted') return sq.isUnattempted;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      {/* 1. Header & Performance Banner */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {report.pattern === 'jee_main' ? 'JEE MAIN CBT RESULT' : 'JEE ADVANCED RESULT'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
            Test Performance Report
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Completed in {formatTime(report.totalTimeSeconds)} • {report.totalQuestions} Questions evaluated with official scoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetakeTest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-750 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Test</span>
          </button>
          <button
            onClick={onNewTest}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            <span>New Custom Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Scorecard Hero Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-mono">MARKS OBTAINED</span>
          <div className="my-2">
            <span
              className={`text-3xl font-extrabold font-mono ${
                report.totalScore >= report.maxScore * 0.5 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {report.totalScore}
            </span>
            <span className="text-sm text-zinc-500 font-mono"> / {report.maxScore}</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {report.percentage}% Score
          </span>
        </div>

        {/* Accuracy Card */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-mono">ACCURACY RATE</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">
              {report.accuracy}%
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            {report.correctCount + report.partialCount} of {report.attemptedCount} attempted
          </span>
        </div>

        {/* Questions Breakdown */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-mono">ATTEMPT STATUS</span>
          <div className="flex items-center gap-2 my-2 text-xs">
            <span className="text-emerald-400 font-mono font-semibold">
              +{report.correctCount} Corr
            </span>
            {report.partialCount > 0 && (
              <span className="text-amber-400 font-mono font-semibold">
                +{report.partialCount} Part
              </span>
            )}
            <span className="text-rose-400 font-mono font-semibold">
              -{report.incorrectCount} Incorr
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            {report.unattemptedCount} Unattempted
          </span>
        </div>

        {/* Pace Card */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-mono">AVG TIME / QUESTION</span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-zinc-200">
              {report.totalQuestions > 0
                ? `${Math.round(report.totalTimeSeconds / report.totalQuestions)}s`
                : '0s'}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Total {formatTime(report.totalTimeSeconds)}
          </span>
        </div>
      </div>

      {/* 3. Section-Wise Breakdown & Topic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section Performance */}
        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
          <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Section Breakdown</span>
          </h3>
          <div className="space-y-2 text-xs">
            {report.sectionBreakdown.map((sec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-zinc-200">{sec.sectionName}</div>
                  <div className="text-[11px] text-zinc-400">
                    {sec.correct} Correct • {sec.incorrect} Incorrect • {sec.total} Total
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-zinc-100">
                    {sec.marks}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500"> / {sec.maxMarks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
          <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Topic Proficiency</span>
          </h3>
          <div className="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
            {Object.values(report.topicBreakdown).map((t) => {
              const accuracy = t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 0;
              return (
                <div
                  key={t.chapterId}
                  className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-200 truncate max-w-[200px]">
                      {t.chapterTitle}
                    </span>
                    <span className="font-mono text-zinc-300">
                      {t.marks} / {t.maxMarks} M
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Comprehensive Solutions Explorer */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Question-by-Question Solution Review
            </h2>
            <p className="text-xs text-zinc-400">
              Detailed step-by-step mathematical derivations and Kota speed shortcuts for every question.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition ${
                filter === 'all'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              All ({report.totalQuestions})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1 rounded-md transition ${
                filter === 'incorrect'
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-zinc-900 text-rose-400 hover:text-rose-300 border border-zinc-800'
              }`}
            >
              Incorrect ({report.incorrectCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1 rounded-md transition ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-zinc-900 text-emerald-400 hover:text-emerald-300 border border-zinc-800'
              }`}
            >
              Correct ({report.correctCount})
            </button>
            {report.partialCount > 0 && (
              <button
                onClick={() => setFilter('partial')}
                className={`px-3 py-1 rounded-md transition ${
                  filter === 'partial'
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 text-amber-400 hover:text-amber-300 border border-zinc-800'
                }`}
              >
                Partial ({report.partialCount})
              </button>
            )}
            <button
              onClick={() => setFilter('unattempted')}
              className={`px-3 py-1 rounded-md transition ${
                filter === 'unattempted'
                  ? 'bg-zinc-700 text-white font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-300 border border-zinc-800'
              }`}
            >
              Unattempted ({report.unattemptedCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((sq) => {
            const isExpanded = expandedSolutions[sq.question.id] ?? true;
            const q = sq.question;
            const res = sq.response;

            return (
              <div
                key={q.id}
                className={`rounded-xl border overflow-hidden transition-all ${
                  sq.isCorrect
                    ? 'bg-zinc-900/40 border-emerald-900/40'
                    : sq.isPartial
                    ? 'bg-zinc-900/40 border-amber-900/40'
                    : sq.isIncorrect
                    ? 'bg-zinc-900/40 border-rose-900/40'
                    : 'bg-zinc-900/30 border-zinc-800'
                }`}
              >
                {/* Question Header Card */}
                <div className="p-4 bg-zinc-950/60 border-b border-zinc-850 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      Q{report.scoredQuestions.indexOf(sq) + 1}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 font-mono">{q.chapterTitle}</span>
                    {q.allenSection && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                        {q.allenSection === 'O2'
                          ? 'Allen O-2'
                          : q.allenSection === 'JM'
                          ? 'Allen JM'
                          : 'Allen JA'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {sq.isCorrect && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>+{sq.marksAwarded} Marks (Correct)</span>
                      </span>
                    )}
                    {sq.isPartial && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        <AlertTriangle className="w-3 h-3" />
                        <span>+{sq.marksAwarded} Marks (Partial)</span>
                      </span>
                    )}
                    {sq.isIncorrect && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        <XCircle className="w-3 h-3" />
                        <span>{sq.marksAwarded} Marks (Incorrect)</span>
                      </span>
                    )}
                    {sq.isUnattempted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-850 text-zinc-400 border border-zinc-750">
                        <HelpCircle className="w-3 h-3" />
                        <span>0 Marks (Unattempted)</span>
                      </span>
                    )}

                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                      title="Toggle Solution Details"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-5 space-y-4 text-sm">
                  {/* Paragraph context if applicable */}
                  {q.paragraphText && (
                    <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                      <div className="text-amber-400 font-mono font-semibold mb-1">
                        {q.paragraphTitle || 'Passage'}
                      </div>
                      <TextWithMath text={q.paragraphText} />
                    </div>
                  )}

                  {/* Question Text */}
                  <div className="text-zinc-100 text-base leading-relaxed">
                    <TextWithMath text={q.text} />
                  </div>

                  {/* Options Display with user choice vs correct choice */}
                  {q.type !== 'numerical' && q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt) => {
                        const isCorrectOpt = q.correctAnswers.includes(opt.id);
                        const isUserChoice = res?.selectedOptions.includes(opt.id);

                        let optClass = 'bg-zinc-950/40 border-zinc-850 text-zinc-400';
                        let badge = null;

                        if (isCorrectOpt && isUserChoice) {
                          optClass = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                          badge = (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 ml-auto">
                              Your Answer (Correct)
                            </span>
                          );
                        } else if (isCorrectOpt && !isUserChoice) {
                          optClass = 'bg-emerald-950/20 border-emerald-600/70 border-dashed text-emerald-300';
                          badge = (
                            <span className="text-[10px] font-mono font-semibold text-emerald-400 ml-auto">
                              Correct Option
                            </span>
                          );
                        } else if (!isCorrectOpt && isUserChoice) {
                          optClass = 'bg-rose-950/40 border-rose-500 text-rose-200';
                          badge = (
                            <span className="text-[10px] font-mono font-bold text-rose-400 ml-auto">
                              Your Answer (Wrong)
                            </span>
                          );
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs ${optClass}`}
                          >
                            <span className="w-5 h-5 rounded font-mono font-bold flex items-center justify-center text-[11px] bg-zinc-800 text-zinc-300 shrink-0">
                              {opt.id}
                            </span>
                            <div className="flex-1">
                              <TextWithMath text={opt.text} />
                            </div>
                            {badge}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Numerical Response Summary */}
                  {q.type === 'numerical' && (
                    <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-zinc-400">Your Answer: </span>
                        <span
                          className={`font-mono font-bold ${
                            sq.isCorrect
                              ? 'text-emerald-400'
                              : res?.numericalValue
                              ? 'text-rose-400'
                              : 'text-zinc-500'
                          }`}
                        >
                          {res?.numericalValue || 'Unattempted'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Correct Value: </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {q.numericalAnswer}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Collapsible Step-by-Step Pedagogical Solution */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-zinc-800/80 space-y-4">
                      {/* Step by step derivation */}
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Detailed Derivation & Solution</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-zinc-300">
                          {q.solution.stepByStep.map((step, sIdx) => (
                            <div key={sIdx} className="leading-relaxed">
                              <TextWithMath text={step} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Kota Shortcut / Examiner Secret */}
                      {q.solution.kotaShortcut && (
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 to-zinc-900 border border-amber-500/30 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-amber-400 font-semibold">
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Kota Classroom Shortcut / Tip</span>
                          </div>
                          <div className="text-zinc-300 leading-relaxed">
                            <TextWithMath text={q.solution.kotaShortcut} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Sticky Bottom Action Controls */}
      <div className="sticky bottom-4 z-20 bg-zinc-950/90 backdrop-blur-md p-4 rounded-xl border border-zinc-800 shadow-xl flex items-center justify-between gap-4">
        <button
          onClick={onBackToHome}
          className="text-xs text-zinc-400 hover:text-zinc-200"
        >
          ← Return to All Chapters
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetakeTest}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
          >
            Retake Test
          </button>
          <button
            onClick={onNewTest}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md"
          >
            Configure New Test
          </button>
        </div>
      </div>
    </div>
  );
};
