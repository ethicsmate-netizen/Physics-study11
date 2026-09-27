import React from 'react';

interface Preset {
  label: string;
  value: number;
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  symbol?: string;
  presets?: Preset[];
  onChange: (value: number) => void;
  colorClass?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  symbol,
  presets,
  onChange,
}) => {
  return (
    <div className="py-2.5 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-zinc-300 flex items-center gap-1.5 font-normal">
          {symbol && (
            <span className="font-mono text-zinc-400 font-medium text-[11px]">
              {symbol}
            </span>
          )}
          <span>{label}</span>
        </label>
        <span className="font-mono text-xs text-zinc-100 font-medium">
          {value} <span className="text-zinc-500 text-[11px]">{unit}</span>
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
      />

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1">
          {presets.map((p) => {
            const isSelected = Math.abs(value - p.value) < 0.01;
            return (
              <button
                key={p.label}
                onClick={() => onChange(p.value)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  isSelected
                    ? 'bg-zinc-200 text-zinc-950 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
