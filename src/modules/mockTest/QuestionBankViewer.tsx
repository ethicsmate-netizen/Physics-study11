import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Tag,
  BookOpen,
  FileQuestion,
} from 'lucide-react';
import { ALL_QUESTIONS } from '../../data/mockTests/testQuestions';
import { CHAPTERS } from '../../data/chapters';
import { TextWithMath } from '../../components/common/TextWithMath';

interface QuestionBankViewerProps {
  onClose?: () => void;
}

export const QuestionBankViewer: React.FC<QuestionBankViewerProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all'); // 'all' | 'JM' | 'JA' | 'O2'
  const [selectedType, setSelectedType] = useState<string>('all');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (qId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const filteredQuestions = useMemo(() => {
    return ALL_QUESTIONS.filter((q) => {
      // Chapter filter
      if (selectedChapterId !== 'all' && q.chapterId !== selectedChapterId) {
        return false;
      }

      // Allen section filter
      if (selectedSection !== 'all' && q.allenSection !== selectedSection) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && q.type !== selectedType) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesText = q.text.toLowerCase().includes(query);
        const matchesConcept = (q.solution.conceptKey || '').toLowerCase().includes(query);
        const matchesChapter = q.chapterTitle.toLowerCase().includes(query);
        if (!matchesTitle && !matchesText && !matchesConcept && !matchesChapter) {
          return false;
        }
      }


      return true;
    });
  }, [selectedChapterId, selectedSection, selectedType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="bg-zinc-900/60 rounded-xl p-5 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ALLEN REPOSITORY EXPLORER</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Question Bank Repository</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {ALL_QUESTIONS.length} Questions Total
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse, search, and practice all 210 authentic Allen module questions with KaTeX solutions and Kota shortcuts.
          </p>
        </div>

        {/* Section Breakdown Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-left">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Allen JM</span>
            <span className="text-xs font-bold text-emerald-400">108 Qs (Main)</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-left">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Allen JA</span>
            <span className="text-xs font-bold text-cyan-400">61 Qs (Adv)</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-left">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Allen O-2</span>
            <span className="text-xs font-bold text-amber-400">41 Qs (Multi)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-zinc-950/70 p-4 rounded-xl border border-zinc-850">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search keywords, formulas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Chapter Filter */}
        <div>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="all">All Chapters ({ALL_QUESTIONS.length} Qs)</option>
            {CHAPTERS.map((ch) => {
              const count = ALL_QUESTIONS.filter((q) => q.chapterId === ch.id).length;
              return (
                <option key={ch.id} value={ch.id}>
                  CH {ch.number.toString().padStart(2, '0')}: {ch.title} ({count} Qs)
                </option>
              );
            })}
          </select>
        </div>

        {/* Section Filter */}
        <div>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="all">All Allen Sections</option>
            <option value="JM">Allen JM (JEE Main Single & Numerical)</option>
            <option value="JA">Allen JA (JEE Advanced Paragraph & Num)</option>
            <option value="O2">Allen O-2 (Objective-2 Multi-Correct)</option>
          </select>
        </div>

        {/* Question Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="all">All Question Types</option>
            <option value="single">Single Choice (MCQ)</option>
            <option value="multiple">Multiple Correct (O-2)</option>
            <option value="paragraph">Paragraph Comprehension</option>
            <option value="numerical">Numerical Value</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <span>
          Showing <strong className="text-zinc-200">{filteredQuestions.length}</strong> of{' '}
          {ALL_QUESTIONS.length} Questions
        </span>
        {(searchQuery || selectedChapterId !== 'all' || selectedSection !== 'all' || selectedType !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedChapterId('all');
              setSelectedSection('all');
              setSelectedType('all');
            }}
            className="text-indigo-400 hover:text-indigo-300 transition underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-850">
            <FileQuestion className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-400 font-medium">No questions match your filter.</p>
            <p className="text-xs text-zinc-500 mt-1">Try clearing filters or search query.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isRevealed = revealedSolutions[q.id];

            return (
              <div
                key={q.id}
                className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 p-5 space-y-4 hover:border-zinc-700/80 transition"
              >
                {/* Question Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-850 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-400 px-2 py-0.5 rounded bg-zinc-800">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        q.allenSection === 'JM'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : q.allenSection === 'JA'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      Allen {q.allenSection}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-850 text-zinc-300">
                      {q.type === 'single'
                        ? 'Single MCQ'
                        : q.type === 'multiple'
                        ? 'Multiple Correct'
                        : q.type === 'paragraph'
                        ? 'Paragraph'
                        : 'Numerical'}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400">
                    {q.chapterTitle}
                  </span>
                </div>

                {/* Paragraph Context if present */}
                {q.paragraphText && (
                  <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-serif">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block mb-1">
                      Comprehension Passage: {q.paragraphTitle}
                    </span>
                    <TextWithMath text={q.paragraphText} />
                  </div>
                )}

                {/* Question Title & Text */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-zinc-100">{q.title}</h4>
                  <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <TextWithMath text={q.text} />
                  </div>
                </div>

                {/* Options (if multiple choice) */}
                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => {
                      const isCorrect = q.correctAnswers.includes(opt.id);

                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg text-xs border flex items-start gap-2.5 ${
                            isRevealed && isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                              : 'bg-zinc-950/40 border-zinc-850 text-zinc-300'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 font-mono text-[11px] font-bold ${
                              isRevealed && isCorrect
                                ? 'bg-emerald-500/30 text-emerald-300'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="pt-0.5">
                            <TextWithMath text={opt.text} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Numerical Answer Info */}
                {q.type === 'numerical' && (
                  <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Expected Input: Decimal / Integer Value</span>
                  </div>
                )}

                {/* Solution Toggle Button */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {isRevealed ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Hide Solution & Answer</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Show Answer & Detailed Solution</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] font-mono text-zinc-500">
                    Concept: {q.solution.conceptKey}
                  </span>
                </div>

                {/* Detailed Solution Reveal */}
                {isRevealed && (
                  <div className="mt-3 p-4 rounded-xl bg-zinc-950 border border-indigo-900/30 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Correct Answer: {q.solution.finalAnswer}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {q.examTarget === 'jee_main' ? 'JEE Main Standard' : 'JEE Advanced Standard'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                      <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                        Step-by-Step Derivation:
                      </span>
                      {q.solution.stepByStep.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2">
                          <span className="text-zinc-600 font-mono text-[10px] pt-0.5">
                            {sIdx + 1}.
                          </span>
                          <div className="flex-1">
                            <TextWithMath text={step} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {q.solution.kotaShortcut && (
                      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 flex items-start gap-2 text-xs text-amber-200">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-mono text-[10px] uppercase text-amber-300 block">
                            Kota Speed Shortcut:
                          </strong>
                          <TextWithMath text={q.solution.kotaShortcut} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
