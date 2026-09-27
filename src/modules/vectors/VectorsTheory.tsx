import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, AlertCircle, CheckCircle, Compass, Hash, Sparkles } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  unitsVectorsFormulaSheet,
  unitsVectorsExaminerTraps,
  unitsVectorsPYQs,
  unitsVectorsExamMatrix,
  unitsVectorsChecklist,
} from '../../data/studyGuides/unitsVectorsGuide';

interface MathBlockProps {
  math: string;
  display?: boolean;
}

const MathBlock: React.FC<MathBlockProps> = ({ math, display = false }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: display,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX error:', err);
      }
    }
  }, [math, display]);

  return <span ref={containerRef} />;
};

interface VectorsTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const VectorsTheory: React.FC<VectorsTheoryProps> = ({ onNavigateChapter }) => {
  const conceptsContent = (
    <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
      {/* Introduction Banner */}
      <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-zinc-100 font-medium mb-1">
            Allen JEE (Main + Advanced) & NEET Theory — Units, Dimensions, Basic Math & Vectors
          </div>
          <div className="text-xs text-zinc-400">
            Official theory notes from <span className="font-mono text-zinc-300">Units_And_Dimensions_Basic_Mathematics_And_Vectors_Theory_26.pdf</span>.
            Covers dimensional analysis, error propagation, calculus fundamentals for physics, and complete vector algebra (addition, dot product, cross product).
          </div>
        </div>
      </div>

      {/* Section 1: Units & Dimensional Analysis */}
      <section className="space-y-4">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
          <Hash className="w-4 h-4 text-sky-400" />
          <span>1. Units & Dimensional Analysis</span>
        </h3>

        <p className="text-zinc-400 text-xs sm:text-sm">
          Any physical quantity <MathBlock math="Q" /> is expressed as <MathBlock math="Q = n \cdot u" />, where <MathBlock math="n" /> is numerical value and <MathBlock math="u" /> is unit. In the SI system, 7 base dimensions are defined: Length <MathBlock math="[L]" />, Mass <MathBlock math="[M]" />, Time <MathBlock math="[T]" />, Electric Current <MathBlock math="[A]" />, Thermodynamic Temperature <MathBlock math="[K]" />, Amount of Substance <MathBlock math="[\text{mol}]" />, and Luminous Intensity <MathBlock math="[\text{cd}]" />.
        </p>

        {/* Key Dimensional Formulas Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1">
            <span className="text-xs font-semibold text-zinc-200">Gravitational Constant (G)</span>
            <div className="font-mono text-xs text-sky-300 bg-zinc-950 p-2 rounded text-center">
              <MathBlock math="[G] = [M^{-1} L^3 T^{-2}]" display={true} />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">From F = G m₁m₂ / r²</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1">
            <span className="text-xs font-semibold text-zinc-200">Planck's Constant (h)</span>
            <div className="font-mono text-xs text-sky-300 bg-zinc-950 p-2 rounded text-center">
              <MathBlock math="[h] = [M L^2 T^{-1}]" display={true} />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">From E = hν = hc/λ</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1">
            <span className="text-xs font-semibold text-zinc-200">Permittivity (ε₀)</span>
            <div className="font-mono text-xs text-sky-300 bg-zinc-950 p-2 rounded text-center">
              <MathBlock math="[\epsilon_0] = [M^{-1} L^{-3} T^4 A^2]" display={true} />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">From F = q₁q₂ / (4πε₀r²)</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1">
            <span className="text-xs font-semibold text-zinc-200">Permeability (μ₀)</span>
            <div className="font-mono text-xs text-sky-300 bg-zinc-950 p-2 rounded text-center">
              <MathBlock math="[\mu_0] = [M L T^{-2} A^{-2}]" display={true} />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">From c = 1 / √(ε₀μ₀)</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1">
            <span className="text-xs font-semibold text-zinc-200">Viscosity (η)</span>
            <div className="font-mono text-xs text-sky-300 bg-zinc-950 p-2 rounded text-center">
              <MathBlock math="[\eta] = [M L^{-1} T^{-1}]" display={true} />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">From F = 6πηrv (Stokes)</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1">
            <span className="text-xs font-semibold text-zinc-200">Universal Gas Constant (R)</span>
            <div className="font-mono text-xs text-sky-300 bg-zinc-950 p-2 rounded text-center">
              <MathBlock math="[R] = [M L^2 T^{-2} K^{-1} \text{mol}^{-1}]" display={true} />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">From PV = nRT</span>
          </div>
        </div>

        {/* Principle of Homogeneity */}
        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Principle of Homogeneity of Dimensions</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            In any valid physical equation, every additive term on both sides must possess the exact same dimensions. For example, in <MathBlock math="x = ut + \frac{1}{2}at^2" />, the dimension of each term <MathBlock math="[x] = [ut] = [at^2] = [L]" />. Arguments of trigonometric, exponential, and logarithmic functions must be strictly dimensionless (<MathBlock math="[M^0 L^0 T^0]" />).
          </p>
        </div>
      </section>

      {/* Section 2: Error Analysis */}
      <section className="space-y-4">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>2. Error Analysis & Propagation (JEE Core Topic)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-xs text-zinc-200 block">Relative & Percentage Error</span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center">
              <MathBlock math="\text{Relative Error} = \frac{\Delta a}{a_{\text{mean}}}, \quad \text{Percentage Error} = \frac{\Delta a}{a} \times 100\%" display={true} />
            </div>
            <p className="text-xs text-zinc-400">
              When physical quantities are multiplied, divided, or raised to powers, relative errors always add up in quadrature or maximum fractional form.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-xs text-zinc-200 block">General Power Propagation Rule</span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center">
              <MathBlock math="Z = \frac{A^p B^q}{C^r} \implies \frac{\Delta Z}{Z} = p\frac{\Delta A}{A} + q\frac{\Delta B}{B} + r\frac{\Delta C}{C}" display={true} />
            </div>
            <p className="text-xs text-zinc-400">
              Notice that even though <MathBlock math="C^r" /> is in the denominator, its fractional error adds positively to determine the maximum permissible error!
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Basic Mathematics for Physics */}
      <section className="space-y-4">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>3. Essential Mathematics & Calculus for Physics</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
            <span className="text-xs font-semibold text-zinc-200">Differentiation Rules</span>
            <div className="text-xs font-mono text-zinc-300 bg-zinc-950 p-2 rounded space-y-1">
              <div><MathBlock math="\frac{d}{dx}(x^n) = n x^{n-1}" /></div>
              <div><MathBlock math="\frac{d}{dx}(\sin x) = \cos x" /></div>
              <div><MathBlock math="\frac{d}{dx}(\cos x) = -\sin x" /></div>
            </div>
            <p className="text-[11px] text-zinc-500">Gives instantaneous rate of change (e.g. velocity <MathBlock math="v = dx/dt" />).</p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
            <span className="text-xs font-semibold text-zinc-200">Maxima & Minima Conditions</span>
            <div className="text-xs font-mono text-zinc-300 bg-zinc-950 p-2 rounded space-y-1">
              <div><MathBlock math="\frac{dy}{dx} = 0 \quad (\text{Critical Point})" /></div>
              <div><MathBlock math="\frac{d^2y}{dx^2} < 0 \implies \text{Maximum}" /></div>
              <div><MathBlock math="\frac{d^2y}{dx^2} > 0 \implies \text{Minimum}" /></div>
            </div>
            <p className="text-[11px] text-zinc-500">Crucial for equilibrium stability (<MathBlock math="d^2U/dx^2 > 0" /> is stable).</p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
            <span className="text-xs font-semibold text-zinc-200">Small Angle Approximations</span>
            <div className="text-xs font-mono text-zinc-300 bg-zinc-950 p-2 rounded space-y-1">
              <div><MathBlock math="\sin\theta \approx \theta \quad (\text{radians})" /></div>
              <div><MathBlock math="\tan\theta \approx \theta \quad (\text{radians})" /></div>
              <div><MathBlock math="\cos\theta \approx 1 - \frac{\theta^2}{2}" /></div>
            </div>
            <p className="text-[11px] text-zinc-500">For <MathBlock math="\theta \le 10^\circ" /> (essential in simple pendulum SHM).</p>
          </div>
        </div>
      </section>

      {/* Section 4: Vectors Addition & Parallelogram Law */}
      <section className="space-y-4">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>4. Vector Algebra: Addition & Parallelogram Law</span>
        </h3>

        <p className="text-zinc-400 text-xs sm:text-sm">
          A vector possesses both magnitude and direction, and must obey the triangle or parallelogram law of vector addition.
        </p>

        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-3">
          <span className="font-semibold text-xs text-zinc-100 block">
            Parallelogram Law of Vector Addition
          </span>
          <p className="text-xs text-zinc-400">
            If two vectors <MathBlock math="\vec{A}" /> and <MathBlock math="\vec{B}" /> acting at a point are represented in magnitude and direction by two adjacent sides of a parallelogram, their resultant <MathBlock math="\vec{R} = \vec{A} + \vec{B}" /> is represented by the diagonal passing through that common point:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
              <span className="text-[11px] text-zinc-400 block mb-1">Resultant Magnitude</span>
              <MathBlock math="R = \sqrt{A^2 + B^2 + 2AB\cos\theta}" display={true} />
            </div>
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850">
              <span className="text-[11px] text-zinc-400 block mb-1">Direction Angle α with Vector A</span>
              <MathBlock math="\tan\alpha = \frac{B\sin\theta}{A + B\cos\theta}" display={true} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div className="bg-zinc-950/70 p-2 rounded border border-zinc-850 text-zinc-300">
              <span className="text-sky-400 font-semibold block">Same Direction (θ = 0°)</span>
              <MathBlock math="R_{\max} = A + B, \quad \alpha = 0^\circ" />
            </div>
            <div className="bg-zinc-950/70 p-2 rounded border border-zinc-850 text-zinc-300">
              <span className="text-amber-400 font-semibold block">Opposite (θ = 180°)</span>
              <MathBlock math="R_{\min} = |A - B|, \quad \alpha = 0^\circ \text{ or } 180^\circ" />
            </div>
            <div className="bg-zinc-950/70 p-2 rounded border border-zinc-850 text-zinc-300">
              <span className="text-emerald-400 font-semibold block">Perpendicular (θ = 90°)</span>
              <MathBlock math="R = \sqrt{A^2 + B^2}, \quad \tan\alpha = B/A" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Scalar & Vector Products */}
      <section className="space-y-4">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          5. Products of Vectors: Dot Product vs Cross Product
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dot Product */}
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2.5">
            <span className="font-semibold text-xs text-sky-300 block">
              Scalar (Dot) Product: A · B
            </span>
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-center font-mono">
              <MathBlock math="\vec{A} \cdot \vec{B} = AB\cos\theta = A_x B_x + A_y B_y + A_z B_z" display={true} />
            </div>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
              <li><strong>Commutative:</strong> <MathBlock math="\vec{A}\cdot\vec{B} = \vec{B}\cdot\vec{A}" />.</li>
              <li><strong>Orthogonal Condition:</strong> If <MathBlock math="\vec{A} \perp \vec{B}" />, then <MathBlock math="\vec{A}\cdot\vec{B} = 0" />.</li>
              <li><strong>Projection of A on B:</strong> <MathBlock math="\text{Proj}_B(\vec{A}) = \frac{\vec{A}\cdot\vec{B}}{|\vec{B}|} = A\cos\theta" />.</li>
              <li><strong>Physical Examples:</strong> Work done <MathBlock math="W = \vec{F}\cdot\vec{d}" />, Power <MathBlock math="P = \vec{F}\cdot\vec{v}" />, Electric Flux <MathBlock math="\Phi = \vec{E}\cdot\vec{A}" />.</li>
            </ul>
          </div>

          {/* Cross Product */}
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2.5">
            <span className="font-semibold text-xs text-amber-300 block">
              Vector (Cross) Product: A × B
            </span>
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-center font-mono">
              <MathBlock math="\vec{A} \times \vec{B} = (AB\sin\theta)\,\hat{n} = \begin{vmatrix} \hat{i} & \hat{j} & \hat{k} \\ A_x & A_y & A_z \\ B_x & B_y & B_z \end{vmatrix}" display={true} />
            </div>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
              <li><strong>Anti-commutative:</strong> <MathBlock math="\vec{A}\times\vec{B} = -(\vec{B}\times\vec{A})" />.</li>
              <li><strong>Collinear Condition:</strong> If <MathBlock math="\vec{A} \parallel \vec{B}" />, then <MathBlock math="\vec{A}\times\vec{B} = \vec{0}" />.</li>
              <li><strong>Geometric Meaning:</strong> <MathBlock math="|\vec{A}\times\vec{B}|" /> equals area of parallelogram formed by vectors; <MathBlock math="\frac{1}{2}|\vec{A}\times\vec{B}|" /> is area of triangle.</li>
              <li><strong>Physical Examples:</strong> Torque <MathBlock math="\vec{\tau} = \vec{r}\times\vec{F}" />, Angular momentum <MathBlock math="\vec{L} = \vec{r}\times\vec{p}" />, Lorentz force <MathBlock math="\vec{F} = q(\vec{v}\times\vec{B})" />.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <ExamStudyGuideLayout
      chapterId="units_vectors"
      chapterNumber={1}
      chapterTitle="Units, Basic Math & Vectors"
      pdfName="Units_And_Dimensions_Basic_Mathematics_And_Vectors_Theory_26.pdf"
      description="Dimensional formulas of fundamental constants, error propagation, calculus fundamentals, and complete vector algebra for JEE & NEET."
      labName="Vector Addition Lab"
      conceptsContent={conceptsContent}
      formulaSheet={unitsVectorsFormulaSheet}
      examinerTraps={unitsVectorsExaminerTraps}
      pyqArchetypes={unitsVectorsPYQs}
      examMatrix={unitsVectorsExamMatrix}
      checklist={unitsVectorsChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
