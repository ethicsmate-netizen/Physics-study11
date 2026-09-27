import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  BookOpen,
  CheckSquare,
  Square,
  FileText,
} from 'lucide-react';
import { CHAPTERS, Chapter } from '../../data/chapters';
import { ExamPattern } from '../../data/mockTests/types';
import { ALL_QUESTIONS } from '../../data/mockTests/testQuestions';
import { QuestionBankViewer } from './QuestionBankViewer';

interface TopicSelectorProps {
  onStartTest: (config: {
    pattern: ExamPattern;
    selectedTopicIds: string[];
    timeLimitMinutes: number;
  }) => void;
  onBackToHome: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  onStartTest,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'test' | 'bank'>('test');
  const [pattern, setPattern] = useState<ExamPattern>('jee_main');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(
    CHAPTERS.map((c) => c.id) // Default all selected
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(60);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Foundations', 'Mechanics', 'Waves & Oscillations', 'Thermal'];

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedTopicIds(CHAPTERS.map((c) => c.id));
  };

  const selectCategoryOnly = (cat: string) => {
    if (cat === 'All') {
      selectAll();
    } else {
      setSelectedTopicIds(CHAPTERS.filter((c) => c.category === cat).map((c) => c.id));
    }
  };

  const clearSelection = () => {
    setSelectedTopicIds([]);
  };

  const filteredChapters =
    selectedCategory === 'All'
      ? CHAPTERS
      : CHAPTERS.filter((c) => c.category === selectedCategory);

  const getQuestionCountForTopic = (chapterId: string) => {
    return ALL_QUESTIONS.filter((q) => q.chapterId === chapterId).length;
  };

  const getSectionCountsForTopic = (chapterId: string) => {
    const qs = ALL_QUESTIONS.filter((q) => q.chapterId === chapterId);
    return {
      jm: qs.filter((q) => q.allenSection === 'JM').length,
      ja: qs.filter((q) => q.allenSection === 'JA').length,
      o2: qs.filter((q) => q.allenSection === 'O2').length,
    };
  };

  const totalQuestionsInSelectedTopics = ALL_QUESTIONS.filter((q) =>
    selectedTopicIds.includes(q.chapterId)
  ).length;

  // Global question pool breakdown
  const globalCounts = {
    total: ALL_QUESTIONS.length,
    jm: ALL_QUESTIONS.filter((q) => q.allenSection === 'JM').length,
    ja: ALL_QUESTIONS.filter((q) => q.allenSection === 'JA').length,
    o2: ALL_QUESTIONS.filter((q) => q.allenSection === 'O2').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner / Heading & Tab Navigation */}
      <div className="border-b border-zinc-800/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JEE MOCK TEST ARENA & QUESTION REPOSITORY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              JEE Main & Advanced Test Arena
            </h1>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'test'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Take Mock Test</span>
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'bank'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Browse All {globalCounts.total} Questions</span>
            </button>
          </div>
        </div>

        {/* Global Question Bank Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-850 text-xs">
          <div>
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">Total Question Pool</span>
            <span className="font-bold text-sm text-white font-mono">{globalCounts.total} Questions</span>
            <span className="text-[11px] text-zinc-400 block">Across 10 Chapters (21 Qs each)</span>
          </div>
          <div>
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">Allen JM (JEE Main)</span>
            <span className="font-bold text-sm text-emerald-400 font-mono">{globalCounts.jm} Questions</span>
            <span className="text-[11px] text-zinc-400 block">Single Choice + Numerical</span>
          </div>
          <div>
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">Allen JA (JEE Advanced)</span>
            <span className="font-bold text-sm text-cyan-400 font-mono">{globalCounts.ja} Questions</span>
            <span className="text-[11px] text-zinc-400 block">Paragraph Sets + Decimals</span>
          </div>
          <div>
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">Allen O-2 (Multi-Correct)</span>
            <span className="font-bold text-sm text-amber-400 font-mono">{globalCounts.o2} Questions</span>
            <span className="text-[11px] text-zinc-400 block">Partial Marking Evaluated</span>
          </div>
        </div>
      </div>

      {activeTab === 'bank' ? (
        <QuestionBankViewer />
      ) : (
        <>
          {/* 1. Exam Pattern Selection */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-2">

          <Award className="w-4 h-4 text-amber-400" />
          <span>STEP 1: SELECT EXAM PATTERN & MARKING SCHEME</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* JEE Main Card */}
          <div
            onClick={() => setPattern('jee_main')}
            className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
              pattern === 'jee_main'
                ? 'bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-900 border-indigo-500/80 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/30'
                : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  NTA CBT PATTERN
                </span>
                <h3 className="text-base font-semibold text-white mt-1.5">
                  JEE Main Physics
                </h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-indigo-400">100</span>
                <span className="text-xs text-zinc-400 block font-mono">MARKS</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Total Questions:</span>
                <span className="font-mono font-medium text-zinc-200">25 Questions</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Section 1:</span>
                <span className="font-medium text-zinc-300">20 Single Choice (+4, -1)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Section 2:</span>
                <span className="font-medium text-zinc-300">5 Numerical Value (+4, -1)</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400">Negative Marking:</span>
                <span className="text-rose-400 font-mono font-medium">-1 for wrong answer</span>
              </div>
            </div>
          </div>

          {/* JEE Advanced Card */}
          <div
            onClick={() => setPattern('jee_adv')}
            className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
              pattern === 'jee_adv'
                ? 'bg-gradient-to-br from-amber-950/60 via-zinc-900 to-zinc-900 border-amber-500/80 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30'
                : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  IIT JEE ADVANCED
                </span>
                <h3 className="text-base font-semibold text-white mt-1.5">
                  JEE Advanced Physics
                </h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-amber-400">60</span>
                <span className="text-xs text-zinc-400 block font-mono">MARKS</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Total Questions:</span>
                <span className="font-mono font-medium text-zinc-200">18 Questions</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Sections 1 & 3:</span>
                <span className="font-medium text-zinc-300">4 Single & 4 Paragraph (+3, -1)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Section 2:</span>
                <span className="font-medium text-zinc-300">6 Multi (+4, -2, Partial +1)</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400">Section 4 (Numerical):</span>
                <span className="text-emerald-400 font-mono font-medium">+3 Correct, NO Negative</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Timer & Duration Config */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>STEP 2: TEST DURATION & TIMER</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { mins: 45, label: '45 Minutes (Fast Pace)' },
            { mins: 60, label: '60 Minutes (Standard Physics Section)' },
            { mins: 75, label: '75 Minutes (Extended Practice)' },
            { mins: 0, label: 'Untimed Practice Mode' },
          ].map((item) => (
            <button
              key={item.mins}
              onClick={() => setTimeLimitMinutes(item.mins)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                timeLimitMinutes === item.mins
                  ? 'bg-zinc-100 text-zinc-950 border-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Topic Selection */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>STEP 3: SELECT TOPICS TO INCLUDE ({selectedTopicIds.length} of {CHAPTERS.length} SELECTED)</span>
          </label>

          {/* Quick Selection Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 transition"
            >
              Select All
            </button>
            <button
              onClick={() => selectCategoryOnly('Mechanics')}
              className="px-2.5 py-1 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 transition"
            >
              Mechanics Only
            </button>
            <button
              onClick={clearSelection}
              className="px-2.5 py-1 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-750 transition"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-zinc-200 text-zinc-900 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredChapters.map((chapter: Chapter) => {
            const isSelected = selectedTopicIds.includes(chapter.id);
            const questionCount = getQuestionCountForTopic(chapter.id);
            const sectionCounts = getSectionCountsForTopic(chapter.id);

            return (
              <div
                key={chapter.id}
                onClick={() => toggleTopic(chapter.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-600 ring-1 ring-zinc-600/40 shadow-sm'
                    : 'bg-zinc-950/40 border-zinc-850 hover:border-zinc-750 hover:bg-zinc-900/40 opacity-75'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-zinc-300">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[11px] text-zinc-400">
                      CH {chapter.number.toString().padStart(2, '0')} • {chapter.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold">
                      {questionCount} Questions in Chapter
                    </span>
                  </div>

                  <h4 className="text-xs font-medium text-zinc-100 truncate">
                    {chapter.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 mt-1">
                    <span className="text-emerald-400 font-semibold">{sectionCounts.jm} Allen JM</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-cyan-400 font-semibold">{sectionCounts.ja} Allen JA</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-amber-400 font-semibold">{sectionCounts.o2} Allen O-2</span>
                  </div>

                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1">
                    {chapter.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="sticky bottom-4 z-20 bg-zinc-950/90 backdrop-blur-md p-4 rounded-xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-zinc-300 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              {pattern === 'jee_main' ? 'JEE Main Pattern' : 'JEE Advanced Pattern'}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">
              {pattern === 'jee_main' ? '25 Questions (100 Marks)' : '18 Questions (60 Marks)'}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-cyan-400 font-mono">
              {timeLimitMinutes > 0 ? `${timeLimitMinutes} Mins` : 'Untimed'}
            </span>
          </div>
          <div className="text-zinc-400 text-[11px]">
            <span className="text-zinc-200 font-semibold">
              {selectedTopicIds.length} of {CHAPTERS.length} chapters selected
            </span>{' '}
            ({totalQuestionsInSelectedTopics} of {ALL_QUESTIONS.length} pool questions).
            Questions will be dynamically mixed and formatted.
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onBackToHome}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition"
          >
            Cancel
          </button>

          <button
            disabled={selectedTopicIds.length === 0}
            onClick={() =>
              onStartTest({
                pattern,
                selectedTopicIds,
                timeLimitMinutes,
              })
            }
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
              selectedTopicIds.length > 0
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-indigo-900/30'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <span>Start Test Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

