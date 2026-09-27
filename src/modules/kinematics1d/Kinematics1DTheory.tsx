import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, CheckCircle2, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  kinematics1dFormulaSheet,
  kinematics1dExaminerTraps,
  kinematics1dPYQs,
  kinematics1dExamMatrix,
  kinematics1dChecklist,
} from '../../data/studyGuides/kinematics1dGuide';

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

interface Kinematics1DTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const Kinematics1DTheory: React.FC<Kinematics1DTheoryProps> = ({ onNavigateChapter }) => {
  const [activeSection, setActiveSection] = useState<string>('foundations');

  const sections = [
    { id: 'foundations', title: '1. Distance, Displacement & Calculus' },
    { id: 'equations', title: '2. Equations of Motion & nth Second' },
    { id: 'graphs', title: '3. Graph Interpretations (Allen Pg 44)' },
    { id: 'gravity', title: '4. Motion Under Gravity & Towers' },
    { id: 'relative', title: '5. Relative Motion & Traps' },
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
            <ChevronRight className={`w-3 h-3 ${activeSection === s.id ? 'text-indigo-400' : 'text-zinc-600'}`} />
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Section 1: Foundations & Calculus */}
      {activeSection === 'foundations' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-medium text-zinc-100">
                Distance vs. Displacement (Allen Notes Pg 41)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="py-2 px-3">Property</th>
                    <th className="py-2 px-3">Distance (<InlineMath math="s" />)</th>
                    <th className="py-2 px-3">Displacement (<InlineMath math="\vec{s}" />)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  <tr>
                    <td className="py-2 px-3 text-zinc-400">Nature</td>
                    <td className="py-2 px-3 text-sky-400">Scalar quantity</td>
                    <td className="py-2 px-3 text-indigo-400">Vector quantity</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-zinc-400">Path Dependency</td>
                    <td className="py-2 px-3">Total actual length of path traversed</td>
                    <td className="py-2 px-3">Shortest straight-line distance from initial to final point</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-zinc-400">Possible Values</td>
                    <td className="py-2 px-3">Strictly positive (<InlineMath math="s \ge 0" />), never decreases with time</td>
                    <td className="py-2 px-3">Can be positive, zero, or negative</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-zinc-400">Fundamental Inequality</td>
                    <td className="py-2 px-3" colSpan={2}>
                      <span className="text-emerald-400 font-semibold">
                        <InlineMath math="\text{Distance} \ge |\text{Displacement}|" />
                      </span>
                      <span className="text-zinc-500 block text-[11px] mt-0.5">
                        Equality holds if and only if motion is along a straight line without reversing direction.
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculus in 1D */}
          <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Calculus Transformation Bridge (Allen Notes Pg 43 & 45)</span>
            </h3>

            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs space-y-3 font-mono">
              <div className="flex items-center justify-around text-center py-2 bg-zinc-900/70 rounded border border-zinc-800">
                <div className="space-y-1">
                  <span className="text-zinc-400 block text-[11px]">Position</span>
                  <span className="text-sky-400 text-sm font-semibold">x(t)</span>
                </div>
                <div className="text-zinc-500 flex flex-col items-center">
                  <span className="text-[10px] text-amber-400">diff: v = dx/dt →</span>
                  <span className="text-[10px] text-emerald-400">← int: x = ∫v dt</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 block text-[11px]">Velocity</span>
                  <span className="text-amber-400 text-sm font-semibold">v(t)</span>
                </div>
                <div className="text-zinc-500 flex flex-col items-center">
                  <span className="text-[10px] text-amber-400">diff: a = dv/dt →</span>
                  <span className="text-[10px] text-emerald-400">← int: v = ∫a dt</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 block text-[11px]">Acceleration</span>
                  <span className="text-indigo-400 text-sm font-semibold">a(t)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded bg-zinc-900/50 border border-zinc-850">
                  <span className="text-zinc-400 block font-semibold mb-1 text-[11px]">Spatial Acceleration Form:</span>
                  <BlockMath math="a = \frac{dv}{dt} = \frac{dv}{dx} \cdot \frac{dx}{dt} = v \frac{dv}{dx}" />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Crucial for problems where acceleration is given as a function of position <InlineMath math="a(x)" /> rather than time <InlineMath math="a(t)" />.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-zinc-900/50 border border-zinc-850">
                  <span className="text-zinc-400 block font-semibold mb-1 text-[11px]">Definite Area under Curves:</span>
                  <BlockMath math="\Delta x = x_2 - x_1 = \int_{t_1}^{t_2} v(t)\,dt" />
                  <BlockMath math="\Delta v = v_2 - v_1 = \int_{t_1}^{t_2} a(t)\,dt" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Kinematic Equations & nth Second */}
      {activeSection === 'equations' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Standard Equations of Motion (Constant Acceleration)</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              These equations apply strictly when acceleration is uniform (<InlineMath math="\vec{a} = \text{constant}" />).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-zinc-400 text-[10px]">1. Velocity-Time Relation</span>
                <BlockMath math="v = u + at" />
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-zinc-400 text-[10px]">2. Position-Time Relation</span>
                <BlockMath math="s = ut + \frac{1}{2}at^2" />
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-zinc-400 text-[10px]">3. Velocity-Displacement Relation</span>
                <BlockMath math="v^2 = u^2 + 2as" />
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-zinc-400 text-[10px]">4. Average Velocity Form</span>
                <BlockMath math="s = \left(\frac{u + v}{2}\right)t = vt - \frac{1}{2}at^2" />
              </div>
            </div>

            {/* Distance in nth second */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-indigo-950/80 space-y-2">
              <span className="text-xs font-medium text-indigo-300 block">
                Displacement in the <InlineMath math="n^{\text{th}}" /> Second (Allen Notes Pg 43)
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Distance travelled specifically between time <InlineMath math="t = (n-1)" /> and <InlineMath math="t = n" />:
              </p>
              <BlockMath math="s_n = s(n) - s(n-1) = \left[un + \frac{1}{2}an^2\right] - \left[u(n-1) + \frac{1}{2}a(n-1)^2\right]" />
              <div className="py-2 px-3 rounded bg-zinc-900/80 border border-zinc-800 text-center text-sm font-semibold text-emerald-400 font-mono">
                <InlineMath math="s_n = u + \frac{a}{2}(2n - 1)" />
              </div>
              <p className="text-[11px] text-zinc-500">
                Note on Dimensions: The factor 1 has implicit units of 1 second, ensuring dimensional consistency (<InlineMath math="[L]" />).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Graphs (Allen Notes Page 44) */}
      {activeSection === 'graphs' && (
        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Classification of Motion Graphs (Allen Notes Pg 44)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2 px-3">Physical Scenario</th>
                  <th className="py-2 px-3">v-t Curve Behavior</th>
                  <th className="py-2 px-3">s-t Curve Behavior</th>
                  <th className="py-2 px-3">Key JEE Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                <tr>
                  <td className="py-2 px-3 font-semibold text-zinc-200">1. Uniform Motion (<InlineMath math="a = 0" />)</td>
                  <td className="py-2 px-3 text-sky-400">Horizontal line (<InlineMath math="v = \text{const}" />)</td>
                  <td className="py-2 px-3 text-emerald-400">Straight line with constant slope</td>
                  <td className="py-2 px-3 text-zinc-400">Slope of s-t equals velocity; curvature is zero.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-zinc-200">2. Uniform Accel. (<InlineMath math="u = 0" />)</td>
                  <td className="py-2 px-3 text-sky-400">Line passing through origin (<InlineMath math="v = at" />)</td>
                  <td className="py-2 px-3 text-emerald-400">Upward opening parabola, zero slope at <InlineMath math="t=0" /></td>
                  <td className="py-2 px-3 text-zinc-400">Horizontal tangent at origin reflects <InlineMath math="u = 0" />.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-zinc-200">3. Uniform Accel. (<InlineMath math="u \ne 0" />)</td>
                  <td className="py-2 px-3 text-sky-400">Line with intercept <InlineMath math="u" /></td>
                  <td className="py-2 px-3 text-emerald-400">Parabola with initial positive slope</td>
                  <td className="py-2 px-3 text-zinc-400">Slope of s-t increases continuously.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-zinc-200">4. Uniform Retardation till <InlineMath math="v = 0" /></td>
                  <td className="py-2 px-3 text-sky-400">Line sloping down to touch t-axis at <InlineMath math="t_0" /></td>
                  <td className="py-2 px-3 text-emerald-400">Inverted parabola reaching flat apex at <InlineMath math="t_0" /></td>
                  <td className="py-2 px-3 text-zinc-400">At stopping time <InlineMath math="t_0 = u/a" />, slope of s-t is strictly zero.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-zinc-200">5. Retarded then Reversed</td>
                  <td className="py-2 px-3 text-sky-400">Line crosses t-axis into negative velocity</td>
                  <td className="py-2 px-3 text-emerald-400">Parabola peaks at apex then slopes downward</td>
                  <td className="py-2 px-3 text-zinc-400">Slope changes sign at apex; represents vertical throw under gravity!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 4: Vertical Motion Under Gravity */}
      {activeSection === 'gravity' && (
        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Vertical Motion Under Gravity (Allen Notes Pg 44)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
              <span className="text-zinc-200 font-semibold block text-xs">A. Body Projected Vertically Upward</span>
              <ul className="space-y-1 text-zinc-400">
                <li>• Acceleration: <InlineMath math="a = -g" /> throughout entire flight.</li>
                <li>• Velocity at highest point: <InlineMath math="v_{\text{apex}} = 0" />.</li>
                <li>• Time of ascent = Time of descent: <InlineMath math="t_{\text{up}} = t_{\text{down}} = \frac{u}{g}" />.</li>
                <li>• Total time of flight: <InlineMath math="T = \frac{2u}{g}" />.</li>
                <li>• Maximum height achieved: <InlineMath math="H_{\max} = \frac{u^2}{2g}" />.</li>
                <li>• Speed on returning to ground: <InlineMath math="v_{\text{ground}} = u" /> (speed is conserved; velocity is <InlineMath math="-u" />).</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
              <span className="text-zinc-200 font-semibold block text-xs">B. Body Projected from Tower of Height h</span>
              <p className="text-zinc-400 leading-relaxed">
                Taking downward as positive or using vector sign convention:
              </p>
              <BlockMath math="-h = ut - \frac{1}{2}gt^2 \implies \frac{1}{2}gt^2 - ut - h = 0" />
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px]">Time to reach ground:</span>
                <InlineMath math="t = \frac{u + \sqrt{u^2 + 2gh}}{g}" />
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px]">Speed on striking ground:</span>
                <InlineMath math="v = \sqrt{u^2 + 2gh}" />
              </div>
            </div>
          </div>

          {/* Galileo's Ratio */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-emerald-950/80 space-y-2">
            <span className="text-xs font-medium text-emerald-400 block">
              Galileo's Law of Odd Numbers (Free Fall from Rest <InlineMath math="u=0" />)
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              The distances traversed by a freely falling body dropped from rest in successive equal time intervals <InlineMath math="\Delta t" /> are in the ratio of odd integers:
            </p>
            <div className="text-center font-mono py-2 text-sm text-emerald-300 font-semibold bg-zinc-900/60 rounded border border-zinc-800">
              <InlineMath math="s_1 : s_2 : s_3 : s_4 : \dots = 1 : 3 : 5 : 7 : \dots" />
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Relative Motion & JEE Traps */}
      {activeSection === 'relative' && (
        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Relative Motion in 1D & Classic JEE Traps</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1.5 font-mono">
              <span className="text-zinc-200 font-semibold block text-xs">1. Relative Pursuit / Catching Condition</span>
              <p className="text-zinc-400 leading-relaxed">
                If Car A is behind Car B separated by distance <InlineMath math="d_0" />:
              </p>
              <BlockMath math="x_{\text{rel}}(t) = d_0 + v_{\text{rel}} t + \frac{1}{2}a_{\text{rel}} t^2" />
              <p className="text-zinc-400">
                • <strong>Catching occurs</strong> if <InlineMath math="x_{\text{rel}}(t) \le 0" /> has a real positive root.
                <br />
                • <strong>Minimum distance of approach</strong> occurs at the instant when relative velocity vanishes (<InlineMath math="v_{\text{rel}} = v_A - v_B = 0" />)!
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-amber-900/30 space-y-2">
              <span className="text-amber-400 font-semibold block text-xs">
                ⚠️ Top 3 Classic JEE Conceptual Traps:
              </span>
              <ul className="space-y-1.5 text-zinc-300 text-xs">
                <li>
                  <span className="text-zinc-400 font-medium font-mono">Trap 1:</span> "Can velocity be zero while acceleration is non-zero?"
                  <span className="text-emerald-400 block ml-2">YES! At the apex of vertical projectile motion, <InlineMath math="v = 0" /> but <InlineMath math="a = -9.8\text{ m/s}^2" />.</span>
                </li>
                <li>
                  <span className="text-zinc-400 font-medium font-mono">Trap 2:</span> "Is the average speed equal to the magnitude of average velocity?"
                  <span className="text-emerald-400 block ml-2">Only if the particle travels in a straight line without reversing direction! If it turns back, average speed <InlineMath math="> |\vec{v}_{\text{avg}}|" />.</span>
                </li>
                <li>
                  <span className="text-zinc-400 font-medium font-mono">Trap 3:</span> "Area under a-t curve gives velocity."
                  <span className="text-emerald-400 block ml-2">NO! Area under a-t curve gives <strong>CHANGE in velocity</strong> (<InlineMath math="\Delta v = v - u" />), NOT instantaneous velocity.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ExamStudyGuideLayout
      chapterId="kinematics_1d"
      chapterNumber={2}
      chapterTitle="Kinematics in 1D"
      pdfName="Kinematics_1D_Theory_26.pdf"
      description="Rectilinear motion, uniform acceleration equations, slope & area of x-t, v-t, a-t graphs, and vertical motion under gravity."
      labName="1D Motion & Graphs Lab"
      conceptsContent={conceptsContent}
      formulaSheet={kinematics1dFormulaSheet}
      examinerTraps={kinematics1dExaminerTraps}
      pyqArchetypes={kinematics1dPYQs}
      examMatrix={kinematics1dExamMatrix}
      checklist={kinematics1dChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
