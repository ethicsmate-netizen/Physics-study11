import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, AlertCircle, CheckCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  circularMotionFormulaSheet,
  circularMotionExaminerTraps,
  circularMotionPYQs,
  circularMotionExamMatrix,
  circularMotionChecklist,
} from '../../data/studyGuides/circularMotionGuide';

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

interface CircularMotionTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const CircularMotionTheory: React.FC<CircularMotionTheoryProps> = ({ onNavigateChapter }) => {
  const [activeSection, setActiveSection] = useState<string>('kinematics');

  const sections = [
    { id: 'kinematics', title: '1. Kinematics of Circular Motion' },
    { id: 'dynamics', title: '2. Centripetal & Centrifugal Dynamics' },
    { id: 'banking', title: '3. Banking of Roads (Allen Pg 17–19)' },
    { id: 'vertical', title: '4. Vertical Circular Motion (Looping)' },
  ];

  const conceptsContent = (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
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
            <ChevronRight className={`w-3 h-3 ${activeSection === s.id ? 'text-amber-400' : 'text-zinc-600'}`} />
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Section 1: Kinematics */}
      {activeSection === 'kinematics' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-medium text-zinc-100">
                Angular Variables & Kinematic Bridge (Allen Notes Pg 3–6)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="py-2 px-3">Angular Variable</th>
                    <th className="py-2 px-3">Definition & Units</th>
                    <th className="py-2 px-3">Linear Relation (<InlineMath math="r = \text{radius}" />)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-zinc-200">Angular Position (<InlineMath math="\theta" />)</td>
                    <td className="py-2 px-3">Angle made by radius vector with reference axis (rad)</td>
                    <td className="py-2 px-3 text-sky-400"><InlineMath math="s = r\theta" /> (arc length)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-zinc-200">Angular Velocity (<InlineMath math="\omega" />)</td>
                    <td className="py-2 px-3"><InlineMath math="\omega = \frac{d\theta}{dt}" /> (rad/s)</td>
                    <td className="py-2 px-3 text-emerald-400"><InlineMath math="v = r\omega" /> (tangential speed)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-zinc-200">Angular Accel. (<InlineMath math="\alpha" />)</td>
                    <td className="py-2 px-3"><InlineMath math="\alpha = \frac{d\omega}{dt} = \omega\frac{d\omega}{d\theta}" /> (rad/s²)</td>
                    <td className="py-2 px-3 text-amber-400"><InlineMath math="a_T = r\alpha" /> (tangential accel.)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Acceleration Components */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-xs font-semibold text-zinc-200 block font-mono">
                Decomposition of Total Linear Acceleration:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-zinc-900/60 border border-zinc-850 space-y-1">
                  <span className="text-sky-400 block font-semibold text-[11px]">1. Centripetal / Normal Component (ac)</span>
                  <BlockMath math="a_c = \frac{v^2}{r} = \omega^2 r = v\omega" />
                  <p className="text-[11px] text-zinc-400">
                    Always points towards center. Responsible strictly for changing the <strong>direction</strong> of velocity.
                  </p>
                </div>
                <div className="p-3 rounded bg-zinc-900/60 border border-zinc-850 space-y-1">
                  <span className="text-amber-400 block font-semibold text-[11px]">2. Tangential Component (aT)</span>
                  <BlockMath math="a_T = \frac{dv}{dt} = r\alpha" />
                  <p className="text-[11px] text-zinc-400">
                    Points along tangent. Responsible strictly for changing the <strong>magnitude</strong> (speed) of velocity.
                  </p>
                </div>
              </div>

              <div className="py-2 px-3 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400">Net Acceleration Magnitude:</span>
                <span className="text-emerald-400 font-semibold"><InlineMath math="a = \sqrt{a_c^2 + a_T^2}" /></span>
                <span className="text-zinc-400">Angle with Radius:</span>
                <span className="text-indigo-400 font-semibold"><InlineMath math="\tan\phi = \frac{a_T}{a_c}" /></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Dynamics */}
      {activeSection === 'dynamics' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Centripetal Force & Conical Pendulum (Allen Notes Pg 14–15)</span>
            </h3>

            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2 text-xs">
              <p className="text-zinc-300 leading-relaxed">
                Centripetal force is <strong>not a new kind of physical force</strong>; it is merely the net real force acting along the radial inward direction that provides the necessary centripetal acceleration:
              </p>
              <BlockMath math="\Sigma F_r = m a_c = \frac{m v^2}{r} = m \omega^2 r" />
            </div>

            {/* Conical Pendulum */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-amber-950/80 space-y-3 font-mono text-xs">
              <span className="text-amber-300 font-semibold block text-sm">
                Conical Pendulum Dynamics (Allen Notes Pg 15)
              </span>
              <p className="text-zinc-400">
                A bob of mass <InlineMath math="m" /> whirled in a horizontal circle of radius <InlineMath math="r = L\sin\theta" /> suspended by a string of length <InlineMath math="L" />:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[10px]">Vertical Equilibrium:</span>
                  <BlockMath math="T\cos\theta = mg" />
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[10px]">Radial Centripetal Equation:</span>
                  <BlockMath math="T\sin\theta = \frac{mv^2}{r} = m\omega^2 r" />
                </div>
              </div>
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 space-y-1.5 text-center">
                <span className="text-zinc-400 text-[11px] block">Time Period of Conical Pendulum:</span>
                <div className="text-sm font-semibold text-emerald-400">
                  <InlineMath math="T_{\text{period}} = 2\pi\sqrt{\frac{L\cos\theta}{g}} = 2\pi\sqrt{\frac{h}{g}}" />
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Where <InlineMath math="h = L\cos\theta" /> is the vertical height of the suspension point above the horizontal orbital plane!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Banking of Roads */}
      {activeSection === 'banking' && (
        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-medium text-zinc-100">
              Circular Turning of Vehicles on Roads (Allen Notes Pg 17–19)
            </h3>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            When a vehicle negotiates a turn of radius <InlineMath math="r" />, centripetal force is provided by friction, banking, or a combination of both.
          </p>

          <div className="space-y-3 font-mono text-xs">
            {/* Case 1 */}
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1">
              <span className="text-sky-400 font-semibold block text-xs">Case 1: Level Unbanked Road (<InlineMath math="\theta = 0" />)</span>
              <p className="text-zinc-400 text-[11px]">
                Centripetal force is provided entirely by lateral static friction <InlineMath math="f \le \mu N = \mu mg" />:
              </p>
              <BlockMath math="\frac{mv^2}{r} \le \mu mg \implies v \le \sqrt{\mu r g}" />
            </div>

            {/* Case 2 */}
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1">
              <span className="text-emerald-400 font-semibold block text-xs">Case 2: Frictionless Banked Road (<InlineMath math="\mu = 0" />)</span>
              <p className="text-zinc-400 text-[11px]">
                Normal force component <InlineMath math="N\sin\theta" /> provides required centripetal acceleration while <InlineMath math="N\cos\theta = mg" />:
              </p>
              <BlockMath math="\tan\theta = \frac{v^2}{rg} \implies v_{\text{opt}} = \sqrt{rg\tan\theta}" />
              <p className="text-[11px] text-zinc-500">
                At this designed optimum speed, there is zero lateral wear and tear on the tyres!
              </p>
            </div>

            {/* Case 3 */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-amber-950/80 space-y-2">
              <span className="text-amber-300 font-semibold block text-xs">
                Case 3: Banked Rough Road (<InlineMath math="\theta > 0, \mu > 0" />) — The Full Safety Envelope
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400 text-[10px] block font-semibold mb-1">Maximum Safe Speed (Skid Prevention):</span>
                  <BlockMath math="v_{\max} = \sqrt{rg\left(\frac{\tan\theta + \mu}{1 - \mu\tan\theta}\right)}" />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Tendency to skid outwards/upwards; friction acts <strong>down the incline</strong>.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400 text-[10px] block font-semibold mb-1">Minimum Safe Speed (Slip Prevention):</span>
                  <BlockMath math="v_{\min} = \sqrt{rg\left(\frac{\tan\theta - \mu}{1 + \mu\tan\theta}\right)}" />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Tendency to slip downwards; friction acts <strong>up the incline</strong> (valid if <InlineMath math="\tan\theta > \mu" />).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Vertical Circular Motion */}
      {activeSection === 'vertical' && (
        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span>Vertical Circular Motion & Looping Conditions</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
              <span className="text-zinc-200 font-semibold block text-xs">Tension & Velocity at Arbitrary Angle θ</span>
              <p className="text-zinc-400">
                Let <InlineMath math="\theta" /> be the angle made with the lowest point (bottom):
              </p>
              <BlockMath math="v^2 = u^2 - 2gR(1 - \cos\theta)" />
              <BlockMath math="T(\theta) = \frac{mv^2}{R} + mg\cos\theta = \frac{m}{R}[u^2 - gR(2 - 3\cos\theta)]" />
              <div className="py-2 px-3 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between text-xs">
                <span className="text-zinc-400">Tension Difference (Bottom - Top):</span>
                <span className="text-emerald-400 font-semibold"><InlineMath math="T_{\text{bottom}} - T_{\text{top}} = 6mg" /></span>
              </div>
            </div>

            {/* Three Regimes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-zinc-950 border border-emerald-950/80 space-y-1">
                <span className="text-emerald-400 font-semibold text-[11px] block">1. Looping Regime</span>
                <div className="text-center py-1 font-semibold text-emerald-300">
                  <InlineMath math="u \ge \sqrt{5gR}" />
                </div>
                <p className="text-[10px] text-zinc-400">
                  String remains taut throughout (<InlineMath math="T_{\text{top}} \ge 0" />). Body successfully completes the vertical circle. Speed at top is <InlineMath math="v_{\text{top}} \ge \sqrt{gR}" />.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-sky-950/80 space-y-1">
                <span className="text-sky-400 font-semibold text-[11px] block">2. Oscillation Regime</span>
                <div className="text-center py-1 font-semibold text-sky-300">
                  <InlineMath math="u \le \sqrt{2gR}" />
                </div>
                <p className="text-[10px] text-zinc-400">
                  Velocity vanishes before or at horizontal level (<InlineMath math="\theta \le 90^\circ" />). Particle oscillates like a simple pendulum without the string ever slacking!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-amber-950/80 space-y-1">
                <span className="text-amber-400 font-semibold text-[11px] block">3. Slacking / Parabolic Regime</span>
                <div className="text-center py-1 font-semibold text-amber-300">
                  <InlineMath math="\sqrt{2gR} < u < \sqrt{5gR}" />
                </div>
                <p className="text-[10px] text-zinc-400">
                  String slacks (<InlineMath math="T = 0" />) in upper half (<InlineMath math="90^\circ < \theta < 180^\circ" />) while velocity is still non-zero. Body leaves the circular path and travels along a parabola!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Curvature & Traps */}
      {activeSection === 'curvature' && (
        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400" />
            <span>Radius of Curvature & Rotor / Death Well (Allen Notes Pg 12 & 16)</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
              <span className="text-zinc-200 font-semibold block text-xs">Radius of Curvature Formula (Allen Notes Pg 12)</span>
              <p className="text-zinc-400">
                At any point on an arbitrary trajectory with instantaneous velocity <InlineMath math="v" /> and normal acceleration <InlineMath math="a_\perp" />:
              </p>
              <BlockMath math="R = \frac{v^2}{a_\perp} = \frac{\left[1 + \left(\frac{dy}{dx}\right)^2\right]^{3/2}}{\left|\frac{d^2y}{dx^2}\right|}" />
              <p className="text-[11px] text-zinc-500">
                For standard projectile motion at apex: <InlineMath math="v = u\cos\theta" />, <InlineMath math="a_\perp = g \implies R_{\text{apex}} = \frac{u^2\cos^2\theta}{g}" />!
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
              <span className="text-zinc-200 font-semibold block text-xs">Rotor / Death Well (Allen Notes Pg 16)</span>
              <p className="text-zinc-400">
                A cylinder of radius <InlineMath math="R" /> rotates about its vertical axis. Normal reaction provides centripetal force <InlineMath math="N = m\omega^2 R" /> while upward static friction balances weight <InlineMath math="f_s = mg \le \mu_s N" />:
              </p>
              <BlockMath math="mg \le \mu_s (m\omega^2 R) \implies \omega_{\min} = \sqrt{\frac{g}{\mu_s R}}" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ExamStudyGuideLayout
      chapterId="circular_motion"
      chapterNumber={5}
      chapterTitle="Circular Motion"
      pdfName="Circular_Motion_Theory_26.pdf"
      description="Kinematics of rotation, centripetal vs tangential acceleration, 3D banked road curves, and vertical loop critical speeds."
      labName="3D Banked Road & Circular Lab"
      conceptsContent={conceptsContent}
      formulaSheet={circularMotionFormulaSheet}
      examinerTraps={circularMotionExaminerTraps}
      pyqArchetypes={circularMotionPYQs}
      examMatrix={circularMotionExamMatrix}
      checklist={circularMotionChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
