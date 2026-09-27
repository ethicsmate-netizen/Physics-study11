import React from 'react';
import katex from 'katex';

interface TextWithMathProps {
  text: string;
  className?: string;
}

/**
 * Parses a string containing LaTeX delimited by $...$ (inline) or $$...$$ (block)
 * and renders it cleanly using KaTeX alongside regular text and line breaks.
 */
export const TextWithMath: React.FC<TextWithMathProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by $$...$$ or $...$
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\n)/g;
  const parts = text.split(regex);

  return (
    <span className={`leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part === '\n') {
          return <br key={index} />;
        }

        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          try {
            const html = katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="block my-2 overflow-x-auto text-center"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <span key={index} className="block font-mono text-amber-400 my-2">
                {part}
              </span>
            );
          }
        }

        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          try {
            const html = katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="inline-math mx-0.5 text-zinc-100"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <span key={index} className="font-mono text-amber-400 mx-0.5">
                {part}
              </span>
            );
          }
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
