import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, CheckCircle, AlertCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  rotationalDynamicsFormulaSheet,
  rotationalDynamicsExaminerTraps,
  rotationalDynamicsPYQs,
  rotationalDynamicsExamMatrix,
  rotationalDynamicsChecklist,
} from '../../data/studyGuides/rotationalDynamicsGuide';

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

export interface RotationalDynamicsTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const RotationalDynamicsTheory: React.FC<RotationalDynamicsTheoryProps> = ({ onNavigateChapter }) => {
  const [activeSection, setActiveSection] = useState<string>('moi');

  const sections = [
    { id: 'moi', title: '1. Moment of Inertia & Theorems' },
    { id: 'torque', title: '2. Torque & Static Equilibrium' },
    { id: 'dynamics', title: '3. Fixed-Axis Rotation & Pulleys' },
    { id: 'rolling', title: '4. Pure Rolling & The Incline Race' },
    { id: 'slipping_topple', title: '5. Slipping to Rolling & Toppling' },
    { id: 'angular_momentum', title: '6. Conservation of Angular Momentum' },
  ];

  const conceptsContent = (
    <div className="space-y-6">
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === sec.id
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* Section 1: Moment of Inertia */}
      {activeSection === 'moi' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Moment of Inertia (Rotational Inertia) & Key Theorems
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Moment of inertia <InlineMath math="I" /> measures the resistance of a rigid body to changes in its rotational state about a given axis. It depends upon total mass, shape, density distribution, and the orientation/position of the rotational axis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Perpendicular Axes Theorem (Laminar 2D Bodies Only)
                </span>
                <BlockMath math="I_z = I_x + I_y" />
                <p className="text-xs text-zinc-400">
                  Where the <InlineMath math="x" /> and <InlineMath math="y" /> axes lie in the plane of the laminar body, and <InlineMath math="z" /> is perpendicular through their concurrent intersection point.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Parallel Axes Theorem (Steiner's Theorem)
                </span>
                <BlockMath math="I = I_{\text{cm}} + M d^2" />
                <p className="text-xs text-zinc-400">
                  Valid for <em>any</em> 3D rigid body, provided one axis passes strictly through the <strong>Center of Mass (CM)</strong>. The centroidal axis yields the minimum possible moment of inertia.
                </p>
              </div>
            </div>

            {/* Standard MOI Table */}
            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-semibold text-zinc-200">
                Standard Rigid Body Moments of Inertia (Allen Reference Table)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Ring / Thin Hoop (Perp Axis)</span>
                  <BlockMath math="I_c = M R^2 \quad (k^2/R^2 = 1)" />
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Disc / Solid Cylinder</span>
                  <BlockMath math="I_c = \frac{1}{2}M R^2 \quad (k^2/R^2 = 0.5)" />
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Solid Sphere (Centroidal)</span>
                  <BlockMath math="I_c = \frac{2}{5}M R^2 \quad (k^2/R^2 = 0.4)" />
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Hollow Spherical Shell</span>
                  <BlockMath math="I_c = \frac{2}{3}M R^2 \quad (k^2/R^2 \approx 0.67)" />
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Thin Rod (Center Perp)</span>
                  <BlockMath math="I_c = \frac{1}{12}M L^2" />
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Thin Rod (End Perp)</span>
                  <BlockMath math="I_{\text{end}} = \frac{1}{3}M L^2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Torque & Static Equilibrium */}
      {activeSection === 'torque' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              Torque (<InlineMath math="\vec{\tau}" />) & Rigid Body Equilibrium
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Torque represents the moment of a force and quantifies the rotational effectiveness of a force applied at a given lever arm.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Torque about a Point
                </span>
                <BlockMath math="\vec{\tau} = \vec{r} \times \vec{F} = r F \sin\theta \, \hat{n} = r_\perp F = r F_\perp" />
                <p className="text-xs text-zinc-400">
                  Where <InlineMath math="r_\perp" /> is the perpendicular distance from the pivot to the line of action of the force (lever arm).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Complete Mechanical Equilibrium Conditions
                </span>
                <BlockMath math="\Sigma \vec{F}_{\text{ext}} = \vec{0} \quad (\text{Translational Equilibrium})" />
                <BlockMath math="\Sigma \vec{\tau}_{\text{any pt}} = \vec{0} \quad (\text{Rotational Equilibrium})" />
                <p className="text-xs text-zinc-400">
                  If <InlineMath math="\Sigma \vec{F} = \vec{0}" />, the net torque is completely independent of the choice of origin!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
              <span className="text-xs font-semibold text-amber-300">
                Classic Exam Standard: Leaning Ladder on Rough Floor & Smooth Wall
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                For a uniform ladder of mass <InlineMath math="m" /> and length <InlineMath math="L" /> inclined at angle <InlineMath math="\theta" /> to the horizontal:
              </p>
              <BlockMath math="N_1 = f_s, \quad N_2 = mg" />
              <BlockMath math="\Sigma \tau_{\text{base}} = 0 \implies N_1 (L\sin\theta) - mg\left(\frac{L}{2}\cos\theta\right) = 0 \implies N_1 = \frac{mg}{2\tan\theta}" />
              <p className="text-xs text-zinc-400">
                To prevent slipping: <InlineMath math="f_s \le \mu_s N_2 \implies \mu_s \ge \frac{1}{2\tan\theta}" />.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Fixed-Axis Dynamics */}
      {activeSection === 'dynamics' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-400" />
              Newton's Second Law for Fixed-Axis Rotation
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              For a rigid body rotating about a stationary axis, the net external torque equals the product of its moment of inertia and angular acceleration.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Rotational Equation of Motion
                </span>
                <BlockMath math="\tau_{\text{net, axis}} = I \alpha" />
                <p className="text-xs text-zinc-400">
                  Every point at distance <InlineMath math="r" /> experiences tangential acceleration <InlineMath math="a_t = \alpha r" /> and centripetal acceleration <InlineMath math="a_c = \omega^2 r" />.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Rotational Kinetic Energy & Power
                </span>
                <BlockMath math="K_{\text{rot}} = \frac{1}{2}I\omega^2, \quad P = \vec{\tau} \cdot \vec{\omega}" />
                <p className="text-xs text-zinc-400">
                  Work done by torque: <InlineMath math="W = \int \tau \, d\theta = \Delta K_{\text{rot}}" />.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-semibold text-zinc-200">
                Pulleys with Non-Zero Mass (String Tensions Unequal!)
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                When a string wraps over a real massive pulley of radius <InlineMath math="R" /> and inertia <InlineMath math="I" />:
              </p>
              <BlockMath math="(T_1 - T_2) R = I \alpha = I \frac{a}{R} \implies T_1 - T_2 = \frac{I a}{R^2}" />
              <p className="text-xs text-zinc-400">
                Tensions on either side are <strong>not</strong> equal; the tension difference drives the pulley's angular acceleration!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Pure Rolling & Incline Race */}
      {activeSection === 'rolling' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-emerald-400" />
              Rolling Without Slipping & The Incline Race
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Pure rolling on a stationary surface is the superposition of Center of Mass translation (<InlineMath math="v_{\text{cm}}" />) and centroidal rotation (<InlineMath math="\omega = v_{\text{cm}}/R" />).
            </p>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-medium text-zinc-200">
                Velocity Distribution of Points on a Rolling Wheel
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-rose-400 font-mono block">Bottom Contact Point P</span>
                  <span className="text-zinc-300 font-mono">v_P = 0 (ICR)</span>
                  <span className="text-zinc-500 text-[10px] block">At instantaneous rest!</span>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-sky-400 font-mono block">Center of Mass C</span>
                  <span className="text-zinc-300 font-mono">v_C = \omega R</span>
                  <span className="text-zinc-500 text-[10px] block">Pure translation speed</span>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-emerald-400 font-mono block">Topmost Point A</span>
                  <span className="text-zinc-300 font-mono">v_A = 2 \omega R = 2 v_C</span>
                  <span className="text-zinc-500 text-[10px] block">Doubled forward velocity</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Acceleration Down an Incline (<InlineMath math="\theta" />)
                </span>
                <BlockMath math="a_{\text{rolling}} = \frac{g\sin\theta}{1 + \frac{k^2}{R^2}}" />
                <p className="text-xs text-zinc-400">
                  Smaller <InlineMath math="\frac{k^2}{R^2}" /> gives larger acceleration!
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Minimum Friction for Pure Rolling
                </span>
                <BlockMath math="\mu_{\min} = \frac{\tan\theta}{1 + \frac{R^2}{k^2}}" />
                <p className="text-xs text-zinc-400">
                  If <InlineMath math="\mu < \mu_{\min}" />, the body starts slipping down the incline.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <span className="text-xs font-semibold text-emerald-300">
                The Great Incline Race: Who Wins?
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Ranked by acceleration <InlineMath math="a = \frac{g\sin\theta}{1 + k^2/R^2}" /> and arrival time <InlineMath math="t = \sqrt{2s/a}" />:
              </p>
              <BlockMath math="a_{\text{solid sphere}} (0.71) > a_{\text{disc}} (0.67) > a_{\text{shell}} (0.60) > a_{\text{ring}} (0.50)" />
              <p className="text-xs text-zinc-400">
                The <strong>Solid Sphere always wins</strong> because its mass is concentrated closer to the axis, requiring less energy into rotation!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Slipping to Rolling & Toppling */}
      {activeSection === 'slipping_topple' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Slipping-to-Rolling Transition & Toppling
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              When a body is projected on a rough surface with pure translation (<InlineMath math="v_0, \omega_0 = 0" />), backward kinetic friction retards translation while generating forward torque until pure rolling is achieved.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Transition for a Solid Sphere
                </span>
                <BlockMath math="v(t) = v_0 - \mu_k g t, \quad \omega(t) = \frac{5\mu_k g}{2R}t" />
                <BlockMath math="t_{\text{rolling}} = \frac{2v_0}{7\mu_k g}, \quad v_{\text{rolling}} = \frac{5}{7}v_0" />
                <p className="text-xs text-zinc-400">
                  Once <InlineMath math="v = \omega R" />, kinetic friction vanishes and the body rolls smoothly at constant speed!
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Toppling vs Sliding of a Block
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  For a block of width <InlineMath math="a" /> and height <InlineMath math="b" /> pushed by force <InlineMath math="F" /> at height <InlineMath math="h" />:
                </p>
                <BlockMath math="F_{\text{slide}} = \mu mg, \quad F_{\text{topple}} = \frac{mg a}{2h}" />
                <p className="text-xs text-zinc-400">
                  If <InlineMath math="\mu > \frac{a}{2h}" />, the block <strong>topples before sliding</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: Conservation of Angular Momentum */}
      {activeSection === 'angular_momentum' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-sky-400" />
              Conservation of Angular Momentum (<InlineMath math="\vec{L}" />)
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              When the net external torque about an axis is zero (<InlineMath math="\Sigma \vec{\tau}_{\text{ext}} = \vec{0}" />), total angular momentum about that axis remains invariant in time.
            </p>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-semibold text-zinc-200">
                Angular Momentum Decomposition in General Plane Motion
              </span>
              <BlockMath math="\vec{L}_O = \vec{r}_{\text{cm}} \times M\vec{v}_{\text{cm}} + I_{\text{cm}}\vec{\omega}" />
              <p className="text-xs text-zinc-400">
                Composed of the orbital angular momentum of the mass center plus the spin angular momentum about the mass center.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Figure Skater / Dumbbell Spin
                </span>
                <BlockMath math="I_1 \omega_1 = I_2 \omega_2" />
                <p className="text-xs text-zinc-400">
                  Pulling arms inward reduces <InlineMath math="I" />, producing a dramatic increase in angular velocity <InlineMath math="\omega" /> while increasing kinetic energy (<InlineMath math="K = L^2 / 2I" />) via internal muscular work.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Dropping Coaxial Discs
                </span>
                <BlockMath math="\omega_{\text{common}} = \frac{I_1 \omega_0}{I_1 + I_2}" />
                <p className="text-xs text-zinc-400">
                  Friction between discs is purely internal, conserving total angular momentum while dissipating kinetic energy as thermal heat.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <ExamStudyGuideLayout
      chapterId="rotational_dynamics"
      chapterTitle="Rotational Dynamics & Rolling"
      subtitle="Moment of Inertia, Torque, Angular Momentum, Pure Rolling Race & Toppling"
      conceptsContent={conceptsContent}
      formulaSheet={rotationalDynamicsFormulaSheet}
      examinerTraps={rotationalDynamicsExaminerTraps}
      pyqs={rotationalDynamicsPYQs}
      examMatrix={rotationalDynamicsExamMatrix}
      checklist={rotationalDynamicsChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
