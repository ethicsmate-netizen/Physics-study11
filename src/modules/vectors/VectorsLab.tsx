import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { VectorsTheory } from './VectorsTheory';
import { Activity, BookOpen } from 'lucide-react';

interface VectorsLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const VectorsLab: React.FC<VectorsLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [magA, setMagA] = useState<number>(8);
  const [angleADeg, setAngleADeg] = useState<number>(0);
  const [magB, setMagB] = useState<number>(6);
  const [angleBDeg, setAngleBDeg] = useState<number>(60);

  const [lawType, setLawType] = useState<'parallelogram' | 'triangle'>('parallelogram');
  const [showComponents, setShowComponents] = useState<boolean>(true);
  const [showDotProductShadow, setShowDotProductShadow] = useState<boolean>(true);
  const [showCrossProductArea, setShowCrossProductArea] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordSysRef = useRef<CoordinateSystem>(new CoordinateSystem({ pixelsPerMeter: 24, originX: 280, originY: 320 }));

  const vecA = Vector2D.fromDegrees(angleADeg, magA);
  const vecB = Vector2D.fromDegrees(angleBDeg, magB);
  const vecR = vecA.add(vecB);

  let angleBetweenDeg = Math.abs(angleBDeg - angleADeg) % 360;
  if (angleBetweenDeg > 180) angleBetweenDeg = 360 - angleBetweenDeg;
  const thetaRad = (angleBetweenDeg * Math.PI) / 180;

  const resultantMag = Math.sqrt(magA * magA + magB * magB + 2 * magA * magB * Math.cos(thetaRad));
  const alphaRad = Math.atan2(magB * Math.sin(thetaRad), magA + magB * Math.cos(thetaRad));
  const alphaDeg = (alphaRad * 180) / Math.PI;

  const dotProduct = magA * magB * Math.cos(thetaRad);
  const crossProduct = magA * magB * Math.sin(thetaRad);

  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const coordSys = coordSysRef.current;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    coordSys.drawGrid(ctx, width, height, {
      gridColor: 'rgba(255, 255, 255, 0.03)',
      axisColor: 'rgba(161, 161, 170, 0.25)',
      labelColor: '#71717a',
    });

    const originScreen = coordSys.worldToScreen(new Vector2D(0, 0));
    const aEndScreen = coordSys.worldToScreen(vecA);
    const bEndScreen = coordSys.worldToScreen(vecB);
    const rEndScreen = coordSys.worldToScreen(vecR);

    // Parallelogram fill
    if (showCrossProductArea || lawType === 'parallelogram') {
      ctx.save();
      ctx.fillStyle = showCrossProductArea ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.02)';
      ctx.strokeStyle = showCrossProductArea ? 'rgba(244, 63, 94, 0.4)' : 'rgba(113, 113, 122, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(originScreen.x, originScreen.y);
      ctx.lineTo(aEndScreen.x, aEndScreen.y);
      ctx.lineTo(rEndScreen.x, rEndScreen.y);
      ctx.lineTo(bEndScreen.x, bEndScreen.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (showCrossProductArea) {
        const center = new Vector2D(
          (originScreen.x + aEndScreen.x + rEndScreen.x + bEndScreen.x) / 4,
          (originScreen.y + aEndScreen.y + rEndScreen.y + bEndScreen.y) / 4
        );
        ctx.fillStyle = '#f43f5e';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Area = ${crossProduct.toFixed(1)}`, center.x, center.y);
      }
      ctx.restore();
    }

    // Dot product shadow
    if (showDotProductShadow && magA > 0) {
      const proj = vecB.projectOn(vecA);
      const projScreen = coordSys.worldToScreen(proj);

      ctx.save();
      ctx.strokeStyle = '#71717a';
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bEndScreen.x, bEndScreen.y);
      ctx.lineTo(projScreen.x, projScreen.y);
      ctx.stroke();

      ctx.strokeStyle = '#d4d4d8';
      ctx.setLineDash([]);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(originScreen.x, originScreen.y);
      ctx.lineTo(projScreen.x, projScreen.y);
      ctx.stroke();

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`proj=${(dotProduct / magA).toFixed(1)}`, projScreen.x, projScreen.y + 14);
      ctx.restore();
    }

    // Vector A
    VectorRenderer.drawScreenVector(
      ctx,
      originScreen,
      new Vector2D(aEndScreen.x - originScreen.x, aEndScreen.y - originScreen.y),
      {
        color: '#38bdf8',
        lineWidth: 2,
        label: `A=${magA}`,
        showComponents: showComponents,
      }
    );

    // Vector B
    if (lawType === 'parallelogram') {
      VectorRenderer.drawScreenVector(
        ctx,
        originScreen,
        new Vector2D(bEndScreen.x - originScreen.x, bEndScreen.y - originScreen.y),
        {
          color: '#a1a1aa',
          lineWidth: 2,
          label: `B=${magB}`,
          showComponents: showComponents,
        }
      );
    } else {
      VectorRenderer.drawScreenVector(
        ctx,
        aEndScreen,
        new Vector2D(rEndScreen.x - aEndScreen.x, rEndScreen.y - aEndScreen.y),
        {
          color: '#a1a1aa',
          lineWidth: 2,
          label: `B=${magB}`,
          showComponents: showComponents,
        }
      );
    }

    // Resultant Vector R
    VectorRenderer.drawScreenVector(
      ctx,
      originScreen,
      new Vector2D(rEndScreen.x - originScreen.x, rEndScreen.y - originScreen.y),
      {
        color: '#fafafa',
        lineWidth: 2.5,
        label: `R=${resultantMag.toFixed(2)}`,
        headSize: 10,
      }
    );

    // Angle Arc
    VectorRenderer.drawAngleArc(
      ctx,
      originScreen,
      30,
      (angleADeg * Math.PI) / 180,
      (angleBDeg * Math.PI) / 180,
      `θ=${angleBetweenDeg.toFixed(0)}°`,
      '#a1a1aa'
    );
  }, [
    vecA,
    vecB,
    vecR,
    showCrossProductArea,
    lawType,
    crossProduct,
    showDotProductShadow,
    magA,
    dotProduct,
    showComponents,
    magB,
    resultantMag,
    angleADeg,
    angleBDeg,
    angleBetweenDeg,
  ]);

  useEffect(() => {
    renderScene();
  }, [renderScene]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium text-zinc-100">
              Units, Basic Math & Vectors
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
              Allen Ch 01
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Vector addition, orthogonal resolution, dot product projection, cross product, and dimensional analysis.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'simulation'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Interactive Lab</span>
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'theory'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Theory & Notes</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'simulation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">
              Addition Geometry Mode:
            </span>
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800">
              <button
                onClick={() => setLawType('parallelogram')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  lawType === 'parallelogram' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Parallelogram Law
              </button>
              <button
                onClick={() => setLawType('triangle')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  lawType === 'triangle' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Triangle Law
              </button>
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b]">
            <canvas
              ref={canvasRef}
              width={820}
              height={500}
              className="w-full h-[460px] block"
            />

            {/* Readouts */}
            <div className="absolute top-3 left-3 flex gap-2 font-mono text-[11px] text-zinc-300">
              <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                |A|={magA}, |B|={magB}
              </span>
              <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                |R|={resultantMag.toFixed(2)}
              </span>
            </div>

            {/* Toggles */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <button
                onClick={() => setShowComponents(!showComponents)}
                className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                  showComponents
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                    : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                }`}
              >
                Components
              </button>

              <button
                onClick={() => setShowDotProductShadow(!showDotProductShadow)}
                className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                  showDotProductShadow
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                    : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                }`}
              >
                Dot Product Projection
              </button>

              <button
                onClick={() => setShowCrossProductArea(!showCrossProductArea)}
                className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                  showCrossProductArea
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                    : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                }`}
              >
                Cross Product Area
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="p-3.5 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-2.5">
            <span className="text-xs font-medium text-zinc-300 block">
              Vector Properties
            </span>

            <SliderControl
              label="Vector A Magnitude"
              symbol="|A|"
              value={magA}
              min={1}
              max={15}
              unit=""
              onChange={setMagA}
            />

            <SliderControl
              label="Vector A Angle"
              symbol="θ_A"
              value={angleADeg}
              min={0}
              max={360}
              unit="°"
              onChange={setAngleADeg}
            />

            <SliderControl
              label="Vector B Magnitude"
              symbol="|B|"
              value={magB}
              min={1}
              max={15}
              unit=""
              onChange={setMagB}
            />

            <SliderControl
              label="Vector B Angle"
              symbol="θ_B"
              value={angleBDeg}
              min={0}
              max={360}
              unit="°"
              onChange={setAngleBDeg}
              presets={[
                { label: '30°', value: 30 },
                { label: '60°', value: 60 },
                { label: '90°', value: 90 },
                { label: '180°', value: 180 },
              ]}
            />
          </div>

          <FormulaHUD
            title="Resultant & Dot Product"
            formulaLatex="R = \sqrt{A^2 + B^2 + 2AB\cos\theta}, \quad \vec{A}\cdot\vec{B} = AB\cos\theta"
            evaluatedValues={{
              'Angle (θ)': `${angleBetweenDeg.toFixed(0)}°`,
              'Resultant |R|': `${resultantMag.toFixed(2)}`,
              'Angle (α with A)': `${alphaDeg.toFixed(1)}°`,
              'A · B': `${dotProduct.toFixed(2)}`,
              '|A × B|': `${crossProduct.toFixed(2)}`,
            }}
            explanation="When θ = 90°, cos(θ) = 0 and scalar product vanishes. When θ = 0°, resultant is maximum R = A + B."
            noteSource="Allen Notes Ch 01"
          />
        </div>
      </div>
      </div>
      )}

      {/* Tab 2: Theory & Notes */}
      {activeTab === 'theory' && <VectorsTheory onNavigateChapter={onNavigateChapter} />}
    </div>
  );
};
