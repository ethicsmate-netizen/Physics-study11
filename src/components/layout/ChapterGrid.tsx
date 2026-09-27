import React, { useState } from 'react';
import { ArrowUpRight, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { CHAPTERS, Chapter } from '../../data/chapters';

interface ChapterGridProps {
  onSelectChapter: (chapterId: string, tab?: 'simulation' | 'theory') => void;
  onOpenTestArena?: () => void;
}

export const ChapterGrid: React.FC<ChapterGridProps> = ({ onSelectChapter, onOpenTestArena }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Foundations', 'Mechanics', 'Waves & Oscillations', 'Thermal'];

  const filteredChapters =
    selectedCategory === 'All'
      ? CHAPTERS
      : CHAPTERS.filter((c) => c.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Minimalist Header */}
      <div className="border-b border-zinc-800/80 pb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
          <span>Class 11 & 12</span>
          <span>•</span>
          <span>Allen Nurture Curriculum</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
          Physics Imagined
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Interactive physics simulation engine for JEE & NEET. Experiment with variables, observe vector decomposition, inspect Free Body Diagrams, and understand physical principles in real time.
        </p>

        {/* JEE Mock Test Arena Hero Feature Banner */}
        {onOpenTestArena && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-zinc-900 to-cyan-950/40 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-indigo-950/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  NEW FEATURE
                </span>
                <span className="text-xs font-mono text-cyan-300">
                  Topic-Wise JEE Test Arena
                </span>
              </div>
              <h2 className="text-base font-semibold text-white">
                JEE Main (100M) & Advanced (60M) Test Simulator
              </h2>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                Choose any combination of chapters to generate mixed tests. Complete with authentic NTA CBT interface, live timer, palette, and exact marking schemes (+4, -1 Main / Multi-correct & numerical Adv).
              </p>
            </div>

            <button
              onClick={onOpenTestArena}
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-950/50"
            >
              <span>Launch Test Arena</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Minimalist Category Filter */}
        <div className="flex items-center gap-1 mt-6 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-zinc-100 text-zinc-900 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Theory & Simulation Helper Note */}
        <div className="flex items-center gap-2 mt-4 text-xs text-zinc-400 bg-zinc-900/60 px-3.5 py-2.5 rounded-lg border border-zinc-800">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-zinc-200">Allen Theory & Derivations</strong> are active for all 10 chapters. Click <span className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">📖 Theory</span> on any card below, or toggle the <strong className="text-zinc-200">Theory & Notes</strong> button in the top navigation bar inside any chapter.
          </span>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map((chapter: Chapter) => {
          const isActive = chapter.status === 'active';

          return (
            <div
              key={chapter.id}
              onClick={() => isActive && onSelectChapter(chapter.id, 'simulation')}
              className={`group p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 flex flex-col justify-between transition-colors ${
                isActive
                  ? 'cursor-pointer hover:border-zinc-600 hover:bg-zinc-900/80'
                  : 'opacity-65'
              }`}
            >
              <div>
                {/* Chapter Number & Status */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-mono text-zinc-400 text-[11px]">
                    {chapter.number.toString().padStart(2, '0')}
                  </span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60">
                      Simulation Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-400">
                      Curriculum
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-medium text-zinc-100 mb-1.5 group-hover:text-white transition-colors">
                  {chapter.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-normal mb-4 line-clamp-2">
                  {chapter.description}
                </p>

                {/* Key Formulas Preview */}
                <div className="space-y-1 mb-4">
                  {chapter.keyFormulas.slice(0, 2).map((formula, idx) => (
                    <div
                      key={idx}
                      className="font-mono text-[11px] text-zinc-300 truncate bg-zinc-950/60 px-2 py-1 rounded border border-zinc-850"
                    >
                      ${formula}$
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-zinc-400 truncate max-w-[150px]">
                  {chapter.pdfName}
                </span>

                {isActive ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChapter(chapter.id, 'theory');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-all font-semibold shadow-sm"
                      title="Read Allen Theory, Formulas & Derivations"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Theory</span>
                    </button>
                    <span className="inline-flex items-center gap-0.5 text-xs text-zinc-200 group-hover:text-white font-medium">
                      <span>Lab</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-zinc-400">Notes Linked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
