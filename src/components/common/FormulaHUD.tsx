import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface FormulaHUDProps {
  title: string;
  formulaLatex: string;
  evaluatedValues?: { [key: string]: string | number };
  noteSource?: string;
  explanation?: string;
}

export const FormulaHUD: React.FC<FormulaHUDProps> = ({
  title,
  formulaLatex,
  evaluatedValues,
  noteSource = 'Allen Theory',
  explanation,
}) => {
  const formulaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formulaRef.current) {
      try {
        katex.render(formulaLatex, formulaRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
      }
    }
  }, [formulaLatex]);

  return (
    <div className="rounded-lg bg-zinc-900/70 border border-zinc-800 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-300">
          {title}
        </span>
        <span className="font-mono text-[10px] text-zinc-500">
          {noteSource}
        </span>
      </div>

      {/* Main LaTeX Formula */}
      <div
        ref={formulaRef}
        className="py-2 px-2.5 bg-zinc-950/80 rounded border border-zinc-850/80 text-zinc-200 overflow-x-auto text-xs"
      />

      {/* Live Evaluated Variables */}
      {evaluatedValues && Object.keys(evaluatedValues).length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {Object.entries(evaluatedValues).map(([key, val]) => (
            <div
              key={key}
              className="bg-zinc-950/40 px-2 py-1 rounded border border-zinc-800/60 flex items-center justify-between text-[11px]"
            >
              <span className="text-zinc-400 font-mono">{key}</span>
              <span className="text-zinc-100 font-mono font-medium">{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Understated Explanation */}
      {explanation && (
        <p className="text-[11px] text-zinc-400 leading-normal pt-1">
          {explanation}
        </p>
      )}
    </div>
  );
};
