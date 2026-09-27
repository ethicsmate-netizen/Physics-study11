import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, CheckCircle, AlertCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  centerOfMassFormulaSheet,
  centerOfMassExaminerTraps,
  centerOfMassPYQs,
  centerOfMassExamMatrix,
  centerOfMassChecklist,
} from '../../data/studyGuides/centerOfMassGuide';

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

export interface CenterOfMassTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const CenterOfMassTheory: React.FC<CenterOfMassTheoryProps> = ({ onNavigateChapter }) => {
  const [activeSection, setActiveSection] = useState<string>('cm_definition');

  const sections = [
    { id: 'cm_definition', title: '1. System of Particles & Center of Mass' },
    { id: 'centroidal_frame', title: '2. Centroidal Frame & Reduced Mass' },
    { id: 'impulse_momentum', title: '3. Impulse-Momentum Theorem' },
    { id: 'collisions', title: '4. Collisions & Restitution Coefficient' },
    { id: 'variable_mass', title: '5. Variable Mass & Rocket Propulsion' },
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

      {/* Section 1: Center of Mass Definition */}
      {activeSection === 'cm_definition' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Center of Mass of Discrete and Continuous Systems
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              The Center of Mass (CM) of a system of particles is a unique point whose translational motion represents the gross translation of the entire system under the action of external forces, regardless of internal interactions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Discrete Particles
                </span>
                <BlockMath math="\vec{r}_{\text{cm}} = \frac{\sum_{i=1}^n m_i \vec{r}_i}{\sum m_i} = \frac{\sum m_i \vec{r}_i}{M}" />
                <p className="text-xs text-zinc-400">
                  In Cartesian coordinates:
                </p>
                <BlockMath math="x_{\text{cm}} = \frac{\sum m_i x_i}{M}, \quad y_{\text{cm}} = \frac{\sum m_i y_i}{M}" />
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Continuous Mass Distribution
                </span>
                <BlockMath math="\vec{r}_{\text{cm}} = \frac{\int \vec{r} \, dm}{\int dm} = \frac{1}{M}\int \vec{r} \, dm" />
                <p className="text-xs text-zinc-400">
                  Where <InlineMath math="dm = \lambda dx" /> (1D rod), <InlineMath math="\sigma dA" /> (2D plate), or <InlineMath math="\rho dV" /> (3D solid).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-medium text-zinc-200">
                Standard Standard Centroid Coordinates (Allen Reference Table)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Semicircular Wire Arc</span>
                  <BlockMath math="y_{\text{cm}} = \frac{2R}{\pi} \approx 0.637R" />
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Semicircular Disc Plate</span>
                  <BlockMath math="y_{\text{cm}} = \frac{4R}{3\pi} \approx 0.424R" />
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Hemispherical Shell</span>
                  <BlockMath math="y_{\text{cm}} = \frac{R}{2}" />
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-mono text-[11px]">Solid Hemisphere</span>
                  <BlockMath math="y_{\text{cm}} = \frac{3R}{8}" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Negative Mass Principle for Cavity & Truncated Bodies
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                When a mass <InlineMath math="m_{\text{removed}}" /> is carved out from an original body <InlineMath math="m_{\text{orig}}" />, treat the cavity as a superimposed body of <em>negative mass</em> <InlineMath math="-m_{\text{removed}}" />:
              </p>
              <BlockMath math="\vec{r}_{\text{remaining}} = \frac{m_{\text{orig}}\vec{r}_{\text{orig}} - m_{\text{removed}}\vec{r}_{\text{cavity}}}{m_{\text{orig}} - m_{\text{removed}}}" />
              <p className="text-xs text-zinc-400">
                For a circular disc of radius <InlineMath math="R" /> with a circular cavity of radius <InlineMath math="R/2" /> tangent to its perimeter, <InlineMath math="x_{\text{remaining}} = -\frac{R}{6}" />.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Centroidal Frame */}
      {activeSection === 'centroidal_frame' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              Centroidal Frame (Center of Mass Reference Frame)
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              The centroidal frame (C-frame) is an inertial or non-inertial reference frame rigidly attached to the center of mass. In this frame, the origin is perpetually located at the CM itself.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Vanishing Mass Moments
                </span>
                <BlockMath math="\sum_{i=1}^n m_i \vec{r}_{i/c} = \vec{0}" />
                <p className="text-xs text-zinc-400">
                  The sum of mass moments of all particles with respect to the center of mass is identically zero!
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Vanishing Total Momentum
                </span>
                <BlockMath math="\vec{P}_{\text{C-frame}} = \sum_{i=1}^n m_i \vec{v}_{i/c} = \vec{0}" />
                <p className="text-xs text-zinc-400">
                  Total linear momentum of the system in its center of mass frame is always zero.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-3">
              <h4 className="text-xs font-semibold text-zinc-200">
                Kinetic Energy Decomposition & Reduced Mass (<InlineMath math="\mu" />)
              </h4>
              <p className="text-xs text-zinc-400">
                The total kinetic energy of any two-particle system decomposes cleanly into CM translation and relative motion:
              </p>
              <BlockMath math="K = \frac{1}{2}M v_{\text{cm}}^2 + \frac{1}{2}\mu v_{\text{rel}}^2" />
              <p className="text-xs text-zinc-400">
                where <InlineMath math="\mu = \frac{m_1 m_2}{m_1 + m_2}" /> is the <strong>reduced mass</strong>, and <InlineMath math="v_{\text{rel}} = |\vec{v}_1 - \vec{v}_2|" />.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <span className="text-xs font-semibold text-emerald-300">
                Classic JEE Problem: Man Walking on a Frictionless Plank
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                When a man of mass <InlineMath math="m" /> walks from one end of a plank of mass <InlineMath math="M" /> and length <InlineMath math="L" /> resting on frictionless ice:
              </p>
              <BlockMath math="\Delta x_{\text{cm}} = 0 \implies m \Delta x_m + M \Delta x_p = 0" />
              <BlockMath math="\Delta x_{\text{plank}} = \frac{m L}{m + M}, \quad \Delta x_{\text{man}} = \frac{M L}{m + M}" />
              <p className="text-xs text-zinc-400">
                The plank moves in the opposite direction so that the system centroid remains perfectly stationary.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Impulse & Momentum */}
      {activeSection === 'impulse_momentum' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Impulse-Momentum Principle & Conservation Laws
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Impulse represents the cumulative time action of a force. By Newton's Second Law, the net impulse of all forces acting on a body equals its net change in linear momentum.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Linear Impulse Equation
                </span>
                <BlockMath math="\vec{I} = \int_{t_i}^{t_f} \vec{F} \, dt = \Delta \vec{p} = m\vec{v}_f - m\vec{v}_i" />
                <p className="text-xs text-zinc-400">
                  On a Force-Time (<InlineMath math="F-t" />) graph, linear impulse is equal to the geometric area under the curve.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Impulsive vs Non-Impulsive Forces
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <strong>Impulsive forces</strong> (e.g. collision contact normal, string jerks) exert immense force <InlineMath math="F \to \infty" /> over <InlineMath math="\Delta t \to 0" />, generating finite momentum changes.
                  <br /><br />
                  <strong>Non-impulsive forces</strong> (e.g. gravity <InlineMath math="mg" />, spring force <InlineMath math="kx" />) produce negligible impulse during microscopic impact intervals (<InlineMath math="\sim 10^{-3}\text{ s}" />) and can be safely neglected during the collision strike itself.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-semibold text-zinc-200">
                Conservation of Linear Momentum
              </span>
              <BlockMath math="\text{If } \Sigma \vec{F}_{\text{ext}} = \vec{0} \implies \vec{P}_{\text{sys}} = \sum m_i \vec{v}_i = \text{constant}" />
              <p className="text-xs text-zinc-400">
                Internal interaction forces cancel out pairwise by Newton's Third Law (<InlineMath math="\vec{f}_{ij} = -\vec{f}_{ji}" />). Even if external forces act in one direction (e.g. gravity along vertical), momentum is strictly conserved in any orthogonal direction where external force is zero (e.g. horizontal).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Collisions & Restitution */}
      {activeSection === 'collisions' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-emerald-400" />
              1D & 2D Oblique Collisions & Newton's Law of Restitution
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              During an impact between two bodies, deformation occurs until maximum compression (where both reach a common velocity <InlineMath math="u_{\text{max}} = v_{\text{cm}}" />), followed by the restitution period where bodies push apart.
            </p>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-medium text-zinc-200">
                Coefficient of Restitution (<InlineMath math="e" />)
              </span>
              <BlockMath math="e = \frac{\text{Impulse of restitution}}{\text{Impulse of deformation}} = \frac{\int R \, dt}{\int D \, dt} = \frac{v_{2n} - v_{1n}}{u_{1n} - u_{2n}} = \frac{v_{\text{separation}}}{v_{\text{approach}}}" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-emerald-400 font-mono block">e = 1</span>
                  <span className="text-zinc-400 text-[11px]">Perfect Elastic (Kinetic Energy Conserved)</span>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-amber-400 font-mono block">0 &lt; e &lt; 1</span>
                  <span className="text-zinc-400 text-[11px]">Inelastic (Partial Energy Dissipated)</span>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-rose-400 font-mono block">e = 0</span>
                  <span className="text-zinc-400 text-[11px]">Perfect Plastic (Bodies Stick Together)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Head-On Collision Velocity Formulas
                </span>
                <BlockMath math="v_1 = \left(\frac{m_1 - e m_2}{m_1 + m_2}\right)u_1 + \frac{(1+e)m_2}{m_1 + m_2}u_2" />
                <BlockMath math="v_2 = \frac{(1+e)m_1}{m_1 + m_2}u_1 + \left(\frac{m_2 - e m_1}{m_1 + m_2}\right)u_2" />
                <p className="text-xs text-zinc-400">
                  <em>Special Case</em>: If <InlineMath math="m_1 = m_2" /> and <InlineMath math="e = 1" />, the bodies completely exchange velocities: <InlineMath math="v_1 = u_2" />, <InlineMath math="v_2 = u_1" />.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Kinetic Energy Loss in 1D Impact
                </span>
                <BlockMath math="\Delta K_{\text{loss}} = \frac{1}{2}\left(\frac{m_1 m_2}{m_1 + m_2}\right)(1 - e^2)(u_1 - u_2)^2" />
                <p className="text-xs text-zinc-400">
                  Notice that maximum kinetic energy loss occurs when <InlineMath math="e = 0" /> (perfectly inelastic impact).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-800/40 space-y-2">
              <span className="text-xs font-semibold text-indigo-300">
                Oblique Collisions: Line of Impact (n-axis) vs Tangent (t-axis)
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                For smooth spherical bodies colliding obliquely:
              </p>
              <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4">
                <li><strong>Along Tangent (t-axis)</strong>: No normal contact force acts along the tangential plane. Hence tangential velocity components remain untouched: <InlineMath math="v_{1t} = u_{1t}" /> and <InlineMath math="v_{2t} = u_{2t}" />.</li>
                <li><strong>Along Normal (n-axis)</strong>: Momentum is conserved and Newton's restitution formula <InlineMath math="v_{2n} - v_{1n} = e(u_{1n} - u_{2n})" /> applies strictly along the line of impact!</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Variable Mass */}
      {activeSection === 'variable_mass' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-rose-400" />
              Variable Mass Systems & Rocket Propulsion
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              When mass enters or exits a system at continuous rate <InlineMath math="\frac{dm}{dt}" /> with relative velocity <InlineMath math="\vec{v}_{\text{rel}}" />, it exerts a reactive thrust force on the system.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Thrust Force Equation
                </span>
                <BlockMath math="\vec{F}_{\text{thrust}} = \vec{v}_{\text{rel}} \frac{dm}{dt}" />
                <p className="text-xs text-zinc-400">
                  Equation of motion for variable mass body:
                </p>
                <BlockMath math="m\frac{d\vec{v}}{dt} = \vec{F}_{\text{ext}} + \vec{v}_{\text{rel}}\frac{dm}{dt}" />
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Tsiolkovsky Rocket Equation
                </span>
                <p className="text-xs text-zinc-400">
                  With constant fuel ejection velocity <InlineMath math="v_r" /> downwards and vertical gravity:
                </p>
                <BlockMath math="v(t) = u - gt + v_r \ln\left(\frac{m_0}{m}\right)" />
                <p className="text-xs text-zinc-400">
                  If launched from rest in deep space (<InlineMath math="u=0, g=0" />): <InlineMath math="v = v_r \ln(m_0/m)" />.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-semibold text-zinc-200">
                Classic Exam Trap: Uniform Chain Falling on Scale
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                When a chain of length <InlineMath math="L" /> and linear mass density <InlineMath math="\lambda" /> is released from rest onto a weighing table, the reading on the table when length <InlineMath math="x" /> has fallen is:
              </p>
              <BlockMath math="N = W_{\text{static}} + F_{\text{thrust}} = \lambda x g + \lambda v^2 = \lambda x g + \lambda(2gx) = 3\lambda gx = 3mg\left(\frac{x}{L}\right)" />
              <p className="text-xs text-zinc-400">
                The reading is exactly <strong>three times</strong> the weight of the fallen portion!
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <ExamStudyGuideLayout
      chapterId="center_of_mass"
      chapterTitle="Center of Mass, Collisions & Momentum"
      subtitle="Discrete & Continuous CM, Cavity Theorem, Oblique Restitution, Rockets & Variable Mass"
      conceptsContent={conceptsContent}
      formulaSheet={centerOfMassFormulaSheet}
      examinerTraps={centerOfMassExaminerTraps}
      pyqs={centerOfMassPYQs}
      examMatrix={centerOfMassExamMatrix}
      checklist={centerOfMassChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
