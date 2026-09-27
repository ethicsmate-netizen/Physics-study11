import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, CheckCircle, AlertCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  shmFormulaSheet,
  shmExaminerTraps,
  shmPYQs,
  shmExamMatrix,
  shmChecklist,
} from '../../data/studyGuides/shmGuide';

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

export interface ShmTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const ShmTheory: React.FC<ShmTheoryProps> = ({ onNavigateChapter }) => {
  const [activeSection, setActiveSection] = useState<string>('kinematics');

  const sections = [
    { id: 'kinematics', title: '1. SHM Equations & Phasor Projection' },
    { id: 'energy', title: '2. Kinetic & Potential Energy Cycles' },
    { id: 'springs', title: '3. Spring Systems & Reduced Mass' },
    { id: 'pendulums', title: '4. Simple & Compound Pendulums' },
    { id: 'superposition', title: '5. Superposition & Lissajous Figures' },
    { id: 'damping', title: '6. Damped Oscillations & Resonance' },
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

      {/* Section 1: SHM Equations & Phasor */}
      {activeSection === 'kinematics' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Differential Equation of SHM & Phasor Projection
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Simple Harmonic Motion (SHM) is the fundamental oscillatory motion where restoring force and acceleration are directly proportional to displacement and directed strictly toward the equilibrium (mean) position.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Linear SHM Differential Equation
                </span>
                <BlockMath math="\frac{d^2x}{dt^2} + \omega^2 x = 0, \quad \omega = \sqrt{\frac{k}{m}}" />
                <p className="text-xs text-zinc-400">
                  Solutions:
                </p>
                <BlockMath math="x(t) = A\sin(\omega t + \phi), \quad v(t) = A\omega\cos(\omega t + \phi)" />
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Velocity-Displacement Phase Ellipse
                </span>
                <BlockMath math="v = \pm\omega\sqrt{A^2 - x^2} \implies \frac{x^2}{A^2} + \frac{v^2}{(\omega A)^2} = 1" />
                <p className="text-xs text-zinc-400">
                  Traversing an ellipse clockwise in the <InlineMath math="x-v" /> phase plane with maximum velocity <InlineMath math="v_{\max} = A\omega" /> at <InlineMath math="x=0" />.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-800/40 space-y-2">
              <span className="text-xs font-semibold text-indigo-300">
                Geometric Meaning: Reference Circle (Phasor) Projection
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                If a point <InlineMath math="Q" /> revolves uniformly around a circle of radius <InlineMath math="A" /> with constant angular velocity <InlineMath math="\omega" />, the projection of <InlineMath math="Q" /> on any diameter executes exact Simple Harmonic Motion!
              </p>
              <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4">
                <li>Position is the coordinate projection: <InlineMath math="x = A\sin(\omega t + \phi)" />.</li>
                <li>Velocity is tangential speed projected: <InlineMath math="v = \omega A\cos(\omega t + \phi)" /> (leads displacement by <InlineMath math="\pi/2" />).</li>
                <li>Acceleration is centripetal acceleration projected: <InlineMath math="a = -\omega^2 A\sin(\omega t + \phi) = -\omega^2 x" /> (leads displacement by <InlineMath math="\pi" />).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Energy Cycles */}
      {activeSection === 'energy' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              Energy Oscillations & Time vs Position Averages
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              In an ideal harmonic oscillator, total mechanical energy is strictly conserved and shifts back and forth between kinetic energy and elastic potential energy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Energy vs Displacement (<InlineMath math="x" />)
                </span>
                <BlockMath math="U(x) = \frac{1}{2}kx^2, \quad K(x) = \frac{1}{2}k(A^2 - x^2)" />
                <BlockMath math="E = K + U = \frac{1}{2}kA^2 = \frac{1}{2}m\omega^2 A^2 = \text{constant}" />
                <p className="text-xs text-zinc-400">
                  Kinetic energy is an inverted parabola; potential energy is an upright parabola. They intersect equally at <InlineMath math="x = \pm \frac{A}{\sqrt{2}}" /> where <InlineMath math="K = U = \frac{E}{2}" />.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Frequency of Energy Oscillations
                </span>
                <BlockMath math="U(t) = \frac{1}{2}kA^2\sin^2\omega t = \frac{1}{4}kA^2(1 - \cos 2\omega t)" />
                <p className="text-xs text-zinc-400">
                  Notice the argument is <InlineMath math="2\omega t" />! Energy completes two full oscillations per single period of displacement:
                </p>
                <BlockMath math="f_{\text{energy}} = 2 f_{\text{shm}}, \quad T_{\text{energy}} = \frac{T_{\text{shm}}}{2}" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-3">
              <span className="text-xs font-semibold text-zinc-200">
                Averages Over One Cycle (Critical JEE Trap!)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Time Averages Over Period T</span>
                  <BlockMath math="\langle K \rangle_t = \frac{1}{4}kA^2, \quad \langle U \rangle_t = \frac{1}{4}kA^2" />
                  <span className="text-zinc-500 text-[10px]">Over time, energy is split evenly: 50% K, 50% U.</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Position Averages Over [-A, +A]</span>
                  <BlockMath math="\langle K \rangle_x = \frac{1}{3}kA^2, \quad \langle U \rangle_x = \frac{1}{6}kA^2" />
                  <span className="text-zinc-500 text-[10px]">Over space, oscillator spends more time near extremes!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Spring Systems */}
      {activeSection === 'springs' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Spring Combinations & Reduced Mass
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              The time period of an ideal spring-mass system is <InlineMath math="T = 2\pi\sqrt{m/k}" />, completely independent of gravity, angle of incline, or constant external forces!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-1.5 text-xs">
                <span className="font-mono text-zinc-400 text-[11px] uppercase">Series Springs</span>
                <BlockMath math="\frac{1}{k_s} = \frac{1}{k_1} + \frac{1}{k_2}" />
                <BlockMath math="T_s = 2\pi\sqrt{\frac{m(k_1+k_2)}{k_1 k_2}}" />
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-1.5 text-xs">
                <span className="font-mono text-zinc-400 text-[11px] uppercase">Parallel Springs</span>
                <BlockMath math="k_p = k_1 + k_2" />
                <BlockMath math="T_p = 2\pi\sqrt{\frac{m}{k_1 + k_2}}" />
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-1.5 text-xs">
                <span className="font-mono text-zinc-400 text-[11px] uppercase">Two-Body Oscillator</span>
                <BlockMath math="\mu = \frac{m_1 m_2}{m_1 + m_2}" />
                <BlockMath math="T = 2\pi\sqrt{\frac{\mu}{k}}" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
              <span className="text-xs font-semibold text-amber-300">
                Cutting a Spring of Constant <InlineMath math="k" />
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                For any spring, the product <InlineMath math="k \cdot L = \text{constant}" />. When cut into lengths in ratio <InlineMath math="m : n" />, the spring constants become:
              </p>
              <BlockMath math="k_1 = \frac{m+n}{m}k, \quad k_2 = \frac{m+n}{n}k" />
              <p className="text-xs text-zinc-400">
                Cutting a spring in half doubles its stiffness (<InlineMath math="k' = 2k" />), decreasing time period by <InlineMath math="\sqrt{2}" />.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Pendulums */}
      {activeSection === 'pendulums' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-emerald-400" />
              Simple, Physical (Compound), & Bar Pendulums
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Oscillations under gravity require small angular amplitude approximations (<InlineMath math="\sin\theta \approx \theta" />).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Simple Pendulum & Accelerating Frames
                </span>
                <BlockMath math="T = 2\pi\sqrt{\frac{L}{g_{\text{eff}}}}" />
                <p className="text-xs text-zinc-400">
                  In a lift accelerating up with <InlineMath math="a" />: <InlineMath math="g_{\text{eff}} = g+a" /> (time period shortens). In a turning car on a curve of radius <InlineMath math="R" />: <InlineMath math="g_{\text{eff}} = \sqrt{g^2 + (v^2/R)^2}" />.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Compound (Physical) Pendulum
                </span>
                <BlockMath math="T = 2\pi\sqrt{\frac{I_S}{mg\ell}} = 2\pi\sqrt{\frac{k^2/\ell + \ell}{g}}" />
                <p className="text-xs text-zinc-400">
                  Where <InlineMath math="\ell" /> is distance from suspension to CM and <InlineMath math="k" /> is radius of gyration.
                </p>
                <BlockMath math="T_{\min} = 2\pi\sqrt{\frac{2k}{g}} \quad \text{when } \ell = k" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Superposition */}
      {activeSection === 'superposition' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-sky-400" />
              Superposition of SHMs & Lissajous Figures
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              When a particle experiences two simultaneous harmonic oscillations:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Collinear Same Frequency (<InlineMath math="\omega" />)
                </span>
                <BlockMath math="A_{\text{res}} = \sqrt{A_1^2 + A_2^2 + 2A_1A_2\cos\delta}" />
                <BlockMath math="\tan\phi = \frac{A_2\sin\delta}{A_1 + A_2\cos\delta}" />
                <p className="text-xs text-zinc-400">
                  Adds directly like 2D vectors! In phase (<InlineMath math="\delta=0" />): <InlineMath math="A = A_1+A_2" />. Out of phase (<InlineMath math="\delta=\pi" />): <InlineMath math="A = |A_1-A_2|" />.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Perpendicular Directions (<InlineMath math="x \perp y" />)
                </span>
                <BlockMath math="x = A\sin\omega t, \quad y = B\sin(\omega t + \delta)" />
                <p className="text-xs text-zinc-400">
                  If <InlineMath math="\delta = 0" /> or <InlineMath math="\pi" />, trajectory is a <strong>straight line</strong> <InlineMath math="y = \pm \frac{B}{A}x" />.
                  <br />
                  If <InlineMath math="\delta = \frac{\pi}{2}" />, trajectory is an <strong>ellipse</strong> <InlineMath math="\frac{x^2}{A^2} + \frac{y^2}{B^2} = 1" /> (or circle if <InlineMath math="A=B" />).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: Damping & Resonance */}
      {activeSection === 'damping' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Damped Harmonic Motion & Resonance
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              When a viscous resistive force <InlineMath math="F_{\text{damp}} = -bv" /> opposes velocity:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Damped Oscillation Equation
                </span>
                <BlockMath math="x(t) = A_0 e^{-\frac{b t}{2m}}\sin(\omega' t + \delta)" />
                <BlockMath math="\omega' = \sqrt{\frac{k}{m} - \left(\frac{b}{2m}\right)^2}" />
                <p className="text-xs text-zinc-400">
                  Amplitude decays exponentially with time constant <InlineMath math="\tau = \frac{2m}{b}" />.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Forced Oscillation Amplitude at Resonance
                </span>
                <BlockMath math="A(\omega) = \frac{F_0 / m}{\sqrt{(\omega^2 - \omega_0^2)^2 + (b\omega/m)^2}}" />
                <p className="text-xs text-zinc-400">
                  When driving frequency <InlineMath math="\omega \to \omega_0" />, amplitude peaks sharply at <strong>resonance</strong>. Smaller damping <InlineMath math="b" /> produces a much taller and sharper resonance spike!
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
      chapterId="shm"
      chapterTitle="Simple Harmonic Motion & Waves"
      subtitle="Phasor Projections, Kinetic-Potential Cycles, Spring-Mass Combinations & Resonance"
      conceptsContent={conceptsContent}
      formulaSheet={shmFormulaSheet}
      examinerTraps={shmExaminerTraps}
      pyqs={shmPYQs}
      examMatrix={shmExamMatrix}
      checklist={shmChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
