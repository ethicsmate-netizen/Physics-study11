import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, CheckCircle, AlertCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  workEnergyFormulaSheet,
  workEnergyExaminerTraps,
  workEnergyPYQs,
  workEnergyExamMatrix,
  workEnergyChecklist,
} from '../../data/studyGuides/workEnergyGuide';

const InlineMath: React.FC<{ math: string }> = ({ math }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(math, ref.current, { displayMode: false, throwOnError: false });
      } catch (e) {
        console.error(e);
      }
    }
  }, [math]);
  return <span ref={ref} />;
};

const BlockMath: React.FC<{ math: string }> = ({ math }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(math, ref.current, { displayMode: true, throwOnError: false });
      } catch (e) {
        console.error(e);
      }
    }
  }, [math]);
  return <div ref={ref} />;
};

interface WorkEnergyTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const WorkEnergyTheory: React.FC<WorkEnergyTheoryProps> = ({ onNavigateChapter }) => {
  const [activeSection, setActiveSection] = useState<string>('work');

  const sections = [
    { id: 'work', title: '1. Work of Constant & Variable Forces' },
    { id: 'wet', title: '2. Work-Kinetic Energy Theorem' },
    { id: 'potential', title: '3. Conservative Forces & Potential Energy' },
    { id: 'equilibrium', title: '4. Potential Wells & Equilibrium Nature' },
    { id: 'power', title: '5. Mechanical Power & Springs' },
  ];

  const conceptsContent = (
    <div className="space-y-6">
      {/* Sub-nav tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
              activeSection === s.id
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <ChevronRight className={`w-3 h-3 ${activeSection === s.id ? 'text-pink-400' : 'text-zinc-600'}`} />
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Section 1: Work of a Force */}
      {activeSection === 'work' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-medium text-zinc-100">
                Work of a Force (Allen Notes Pg 55–61)
              </h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Work done by a force <InlineMath math="\vec{F}" /> on a body undergoing displacement <InlineMath math="\Delta\vec{r}" /> is the scalar dot product of force and displacement of the point of application:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-sky-400 block font-semibold text-[11px]">1. Constant Force:</span>
                <BlockMath math="W = \vec{F} \cdot \Delta\vec{r} = F \Delta r \cos\theta" />
                <p className="text-[11px] text-zinc-500">
                  <InlineMath math="W > 0" /> if <InlineMath math="\theta < 90^\circ" />, <InlineMath math="W = 0" /> if <InlineMath math="\theta = 90^\circ" />, <InlineMath math="W < 0" /> if <InlineMath math="\theta > 90^\circ" />.
                </p>
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-emerald-400 block font-semibold text-[11px]">2. Variable Force (Area under F-x):</span>
                <BlockMath math="W = \int_{x_i}^{x_f} F_x(x)\,dx = \text{Area under } F-x \text{ curve}" />
                <p className="text-[11px] text-zinc-500">
                  Area above the x-axis contributes positive work; area below contributes negative work.
                </p>
              </div>
            </div>

            {/* Frame Dependence */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-amber-950/80 space-y-2 text-xs">
              <span className="text-amber-300 font-semibold block text-xs">
                ⚠️ Critical Concept: Work Depends on the Frame of Reference (Allen Notes Pg 62)
              </span>
              <p className="text-zinc-300 leading-relaxed">
                While <strong>force</strong> is frame-invariant (assumes the exact same magnitude and direction in all reference frames), <strong>displacement</strong> depends on the observer's frame. Therefore:
              </p>
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                Example: A man holds a heavy suitcase of mass <InlineMath math="m" /> inside an accelerating lift moving upward through height <InlineMath math="h" />:
                <br />
                • In Lift frame: <InlineMath math="\Delta y = 0 \implies W_{\text{man}} = 0" />.
                <br />
                • In Ground frame: <InlineMath math="\Delta y = h \implies W_{\text{man}} = m(g + a)h > 0" />!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Work-Kinetic Energy Theorem */}
      {activeSection === 'wet' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>The Work-Kinetic Energy Theorem (Allen Notes Pg 62–63)</span>
            </h3>

            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2 text-xs font-mono">
              <span className="text-zinc-200 font-semibold block text-xs">Universal Theorem:</span>
              <p className="text-zinc-300 leading-relaxed">
                The total work done by <strong>all external and internal forces</strong> (conservative, non-conservative, friction, pseudo forces, etc.) acting on a body equals the change in its kinetic energy:
              </p>
              <BlockMath math="W_{\text{net}} = W_{\text{conservative}} + W_{\text{non-conservative}} + W_{\text{other}} = \Delta K = K_f - K_i" />
              <div className="py-2 px-3 bg-zinc-900 border border-zinc-800 rounded text-center text-sm text-emerald-400 font-semibold">
                <InlineMath math="W_{\text{net}} = \frac{1}{2}mv_f^2 - \frac{1}{2}mv_i^2" />
              </div>
            </div>

            {/* Step by step deduction */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono">
              <span className="text-sky-400 font-semibold block text-[11px]">Deduction for Curvilinear Path (Allen Pg 62):</span>
              <p className="text-zinc-400 leading-relaxed">
                Decomposing net force into tangential component <InlineMath math="F_T = m a_T" /> and normal component <InlineMath math="F_N = m a_N" />:
              </p>
              <BlockMath math="W = \int (\vec{F}_T + \vec{F}_N) \cdot d\vec{s} = \int F_T ds = \int m\left(v\frac{dv}{ds}\right)ds = \int_{v_1}^{v_2} m v\,dv = \frac{1}{2}mv_2^2 - \frac{1}{2}mv_1^2" />
              <p className="text-[11px] text-zinc-500">
                Notice that normal forces (<InlineMath math="\vec{F}_N \perp d\vec{s}" />) never do any work because <InlineMath math="\vec{F}_N \cdot d\vec{s} = 0" />!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Potential Energy */}
      {activeSection === 'potential' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Conservative Forces & Potential Energy (Allen Notes Pg 68–74)</span>
            </h3>

            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2 text-xs">
              <p className="text-zinc-300 leading-relaxed">
                A force is defined as <strong>conservative</strong> if the work done in moving a particle between two points is independent of the path taken. Equivalently, the work done along any closed loop vanishes:
              </p>
              <BlockMath math="\oint \vec{F}_C \cdot d\vec{r} = 0" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded bg-zinc-950 border border-zinc-850 space-y-2">
                <span className="text-emerald-400 font-semibold block text-[11px]">Relation between Force & Potential Energy:</span>
                <BlockMath math="\Delta U = -W_C = -\int_{r_i}^{r_f} \vec{F}_C \cdot d\vec{r}" />
                <BlockMath math="F_x = -\frac{\partial U}{\partial x}, \quad \vec{F} = -\nabla U" />
                <p className="text-[11px] text-zinc-400">
                  The negative sign indicates that conservative forces always drive a body in the direction of <strong>decreasing potential energy</strong>!
                </p>
              </div>

              <div className="p-3.5 rounded bg-zinc-950 border border-zinc-850 space-y-2">
                <span className="text-sky-400 font-semibold block text-[11px]">Standard Potential Energies:</span>
                <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                  <li>• Uniform Gravity: <InlineMath math="U(h) = mgh" /></li>
                  <li>• Ideal Spring: <InlineMath math="U(x) = \frac{1}{2}kx^2" /></li>
                  <li>• Gravitation: <InlineMath math="U(r) = -\frac{GMm}{r}" /></li>
                  <li>• Electrostatic: <InlineMath math="U(r) = \frac{1}{4\pi\epsilon_0}\frac{q_1 q_2}{r}" /></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Potential Wells & Equilibrium */}
      {activeSection === 'equilibrium' && (
        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Potential Energy Wells & The Nature of Equilibrium (Allen Notes Pg 75–76)</span>
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed">
            At any equilibrium position, the net conservative force vanishes (<InlineMath math="F = -dU/dx = 0" />). The nature of equilibrium is determined completely by the second spatial derivative:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            {/* Stable */}
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-emerald-950/80 space-y-2">
              <span className="text-emerald-400 font-semibold block text-xs">1. Stable Equilibrium</span>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center space-y-1">
                <div className="text-emerald-300 font-semibold"><InlineMath math="\frac{dU}{dx} = 0, \quad \frac{d^2U}{dx^2} > 0" /></div>
                <span className="text-[10px] text-zinc-400 block">Local Minimum (Potential Well)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Restoring force acts toward equilibrium. When displaced, the particle executes stable harmonic oscillations about this position!
              </p>
            </div>

            {/* Unstable */}
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-rose-950/80 space-y-2">
              <span className="text-rose-400 font-semibold block text-xs">2. Unstable Equilibrium</span>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center space-y-1">
                <div className="text-rose-300 font-semibold"><InlineMath math="\frac{dU}{dx} = 0, \quad \frac{d^2U}{dx^2} < 0" /></div>
                <span className="text-[10px] text-zinc-400 block">Local Maximum (Potential Hill)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Repulsive force acts away from equilibrium. When displaced slightly, the particle accelerates away and never returns!
              </p>
            </div>

            {/* Neutral */}
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-sky-950/80 space-y-2">
              <span className="text-sky-400 font-semibold block text-xs">3. Neutral Equilibrium</span>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center space-y-1">
                <div className="text-sky-300 font-semibold"><InlineMath math="\frac{dU}{dx} = 0, \quad \frac{d^2U}{dx^2} = 0" /></div>
                <span className="text-[10px] text-zinc-400 block">Flat Region (Constant U)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Force remains zero in the neighborhood. When shifted, the particle simply remains at rest in its new position.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Springs & Power */}
      {activeSection === 'springs' && (
        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Vertical Spring Extension & Mechanical Power (Allen Notes Pg 65 & 76–77)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Vertical spring classic illustration */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
              <span className="text-amber-300 font-semibold block text-xs">
                Gradual vs. Sudden Release (Allen Illustration 12, Pg 65):
              </span>
              <p className="text-zinc-400 leading-relaxed">
                A block of mass <InlineMath math="m" /> suspended from an unextended spring of stiffness <InlineMath math="k" />:
              </p>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-sky-400 font-semibold block text-[11px]">Case (a): Lowered Gradual (Equilibrium everywhere):</span>
                <InlineMath math="x_{\text{eq}} = \frac{mg}{k}" />
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-emerald-400 font-semibold block text-[11px]">Case (b): Released Suddenly (Dynamic drop):</span>
                <BlockMath math="W_{\text{net}} = mg x_m - \frac{1}{2}kx_m^2 = 0 \implies x_m = \frac{2mg}{k}" />
                <span className="text-zinc-500 text-[10px] block">
                  The maximum instantaneous extension is exactly <strong>twice</strong> the static equilibrium position!
                </span>
              </div>
            </div>

            {/* Power */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
              <span className="text-pink-300 font-semibold block text-xs">
                Mechanical Power (Allen Notes Pg 76–77):
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Rate of doing work or rate of energy transfer:
              </p>
              <BlockMath math="P_{\text{avg}} = \frac{\Delta W}{\Delta t}, \quad P_{\text{inst}} = \frac{dW}{dt} = \vec{F} \cdot \vec{v}" />
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                • Unit: Watt (<InlineMath math="1\text{ W} = 1\text{ J/s}" />)
                <br />
                • Imperial Conversion: <InlineMath math="1\text{ hp} = 746\text{ W}" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <ExamStudyGuideLayout
      chapterId="work_energy"
      chapterTitle="Work, Power & Energy"
      subtitle="Scalar Dot Products, Variable Force Work, Work-Energy Theorem, Potential Wells & Springs"
      conceptsContent={conceptsContent}
      formulaSheet={workEnergyFormulaSheet}
      examinerTraps={workEnergyExaminerTraps}
      pyqs={workEnergyPYQs}
      examMatrix={workEnergyExamMatrix}
      checklist={workEnergyChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
