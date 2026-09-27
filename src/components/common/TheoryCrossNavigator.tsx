import React from 'react';
import { CHAPTERS } from '../../data/chapters';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';

interface TheoryCrossNavigatorProps {
  currentChapterId: string;
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const TheoryCrossNavigator: React.FC<TheoryCrossNavigatorProps> = ({
  currentChapterId,
  onNavigateChapter,
}) => {
  const currentIndex = CHAPTERS.findIndex((c) => c.id === currentChapterId);
  const prevChapter = currentIndex > 0 ? CHAPTERS[currentIndex - 1] : null;
  const nextChapter = currentIndex < CHAPTERS.length - 1 ? CHAPTERS[currentIndex + 1] : null;

  if (!onNavigateChapter) {
    return null;
  }

  return (
    <div className="space-y-6 pt-8 mt-10 border-t border-zinc-800/80">
      {/* Quick Jump Bar across all 10 Chapters */}
      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-zinc-200">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Curriculum Theory Navigator (Allen 10 Chapters)</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Click any chapter to jump directly to its theory
          </span>
        </div>

        {/* Scrollable / Responsive Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {CHAPTERS.map((ch) => {
            const isCurrent = ch.id === currentChapterId;
            return (
              <button
                key={ch.id}
                onClick={() => onNavigateChapter(ch.id, 'theory')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                  isCurrent
                    ? 'bg-sky-950/80 text-sky-200 border border-sky-700/80 shadow font-semibold'
                    : 'bg-zinc-950/70 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-850'
                }`}
                title={`Read Ch ${ch.number}: ${ch.title} Theory`}
              >
                <span className="text-[10px] text-zinc-500">
                  {ch.number.toString().padStart(2, '0')}
                </span>
                <span className="truncate max-w-[130px] sm:max-w-[180px]">{ch.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prev & Next Chapter Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Previous Chapter */}
        {prevChapter ? (
          <button
            onClick={() => onNavigateChapter(prevChapter.id, 'theory')}
            className="group p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mb-2 group-hover:text-zinc-400">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Previous Chapter Theory</span>
            </div>
            <div>
              <div className="text-xs font-mono text-zinc-500 mb-0.5">
                Chapter {prevChapter.number.toString().padStart(2, '0')}
              </div>
              <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                {prevChapter.title}
              </div>
              <div className="text-xs text-zinc-500 mt-1 line-clamp-1">
                {prevChapter.pdfName}
              </div>
            </div>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-950/30 border border-zinc-900 text-zinc-600 text-xs flex items-center justify-center">
            First Chapter in Syllabus
          </div>
        )}

        {/* Next Chapter */}
        {nextChapter ? (
          <button
            onClick={() => onNavigateChapter(nextChapter.id, 'theory')}
            className="group p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-right transition-all flex flex-col justify-between items-end"
          >
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mb-2 group-hover:text-zinc-400">
              <span>Next Chapter Theory</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
            <div>
              <div className="text-xs font-mono text-zinc-500 mb-0.5">
                Chapter {nextChapter.number.toString().padStart(2, '0')}
              </div>
              <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                {nextChapter.title}
              </div>
              <div className="text-xs text-zinc-500 mt-1 line-clamp-1">
                {nextChapter.pdfName}
              </div>
            </div>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-950/30 border border-zinc-900 text-zinc-600 text-xs flex items-center justify-center">
            Final Chapter in Syllabus
          </div>
        )}
      </div>
    </div>
  );
};
