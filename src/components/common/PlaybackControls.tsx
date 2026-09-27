import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface PlaybackControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onStep: () => void;
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  currentTime: number;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  onStep,
  timeScale,
  onTimeScaleChange,
  currentTime,
}) => {
  const speeds = [0.25, 0.5, 1.0, 2.0];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800">
      {/* Play / Step / Reset */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            isRunning
              ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
              : 'bg-zinc-100 text-zinc-900 hover:bg-white'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          onClick={onStep}
          disabled={isRunning}
          title="Step forward one frame"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Step</span>
        </button>

        <button
          onClick={onReset}
          title="Reset simulation"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Center: Clean Elapsed Timer */}
      <div className="font-mono text-xs text-zinc-400">
        t = <span className="text-zinc-100 font-semibold">{currentTime.toFixed(2)}s</span>
      </div>

      {/* Right: Speed pills */}
      <div className="flex items-center gap-1">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onTimeScaleChange(s)}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
              timeScale === s
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
