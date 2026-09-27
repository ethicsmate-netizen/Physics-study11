import React from 'react';
import { ChevronRight, ArrowLeft, Activity, BookOpen } from 'lucide-react';
import { CHAPTERS, Chapter } from '../../data/chapters';

interface NavbarProps {
  activeChapterId: string | null;
  onSelectChapter: (id: string | null) => void;
  activeTab?: 'simulation' | 'theory';
  onSelectTab?: (tab: 'simulation' | 'theory') => void;
  isTestArena?: boolean;
  onOpenTestArena?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeChapterId,
  onSelectChapter,
  activeTab = 'simulation',
  onSelectTab,
  isTestArena = false,
  onOpenTestArena,
}) => {
  const currentChapter: Chapter | undefined = CHAPTERS.find(
    (c) => c.id === activeChapterId
  );

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-850 border-zinc-800/80 px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onSelectChapter(null)}
        >
          <div className="w-7 h-7 rounded-lg border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-100 group-hover:border-zinc-500 transition">
            <span className="font-mono text-xs font-semibold">Φ</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight text-zinc-100 group-hover:text-white transition">
              Physics Imagined
            </span>
            <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
              JEE & NEET
            </span>
          </div>
        </div>

        {/* Navigation / Context */}
        <div className="flex items-center gap-2.5">
          {/* Top-level JEE Test Arena Button */}
          {onOpenTestArena && (
            <button
              onClick={onOpenTestArena}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                isTestArena
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-md shadow-indigo-950/40 ring-1 ring-indigo-400'
                  : 'bg-zinc-900/90 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-750'
              }`}
            >
              <span>Mock Test Arena</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Main & Adv
              </span>
            </button>
          )}

          {activeChapterId ? (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => onSelectChapter(null)}
                className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-zinc-850 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chapters</span>
              </button>

              <ChevronRight className="w-3 h-3 text-zinc-600" />

              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200">
                <span className="font-mono text-[11px] text-zinc-400">
                  {currentChapter?.number.toString().padStart(2, '0')}
                </span>
                <span className="font-medium truncate max-w-[140px] sm:max-w-[220px]">
                  {currentChapter?.title}
                </span>
              </div>

              {/* Lab vs Theory Switcher in Top Bar */}
              <div className="flex items-center bg-zinc-900/90 rounded-lg p-0.5 border border-zinc-700/80 shadow-inner">
                <button
                  type="button"
                  onClick={() => onSelectTab?.('simulation')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'simulation'
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                  title="Switch to Interactive Simulation"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Lab</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('theory')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'theory'
                      ? 'bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
                  }`}
                  title="Switch to Allen Theory, Notes & Formulas"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Theory & Notes</span>
                </button>
              </div>
            </div>
          ) : isTestArena ? (
            <button
              onClick={() => onSelectChapter(null)}
              className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Chapters</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 text-xs text-zinc-400 hidden sm:flex">
              <span className="font-mono text-[11px]">Class 11 & 12 Theory & Tests</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
