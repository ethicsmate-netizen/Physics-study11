import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathProps {
  math: string;
  className?: string;
}

export const InlineMath: React.FC<MathProps> = ({ math, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: false,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX error:', err);
      }
    }
  }, [math]);

  return <span ref={containerRef} className={`inline-math ${className}`} />;
};

export const BlockMath: React.FC<MathProps> = ({ math, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX error:', err);
      }
    }
  }, [math]);

  return <div ref={containerRef} className={`block-math overflow-x-auto py-1 text-center ${className}`} />;
};

export const MathBlock: React.FC<MathProps & { display?: boolean }> = ({
  math,
  display = false,
  className = '',
}) => {
  return display ? (
    <BlockMath math={math} className={className} />
  ) : (
    <InlineMath math={math} className={className} />
  );
};
