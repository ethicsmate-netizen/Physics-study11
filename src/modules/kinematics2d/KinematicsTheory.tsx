import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  kinematics2dFormulaSheet,
  kinematics2dExaminerTraps,
  kinematics2dPYQs,
  kinematics2dExamMatrix,
  kinematics2dChecklist,
} from '../../data/studyGuides/kinematics2dGuide';

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

interface KinematicsTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const KinematicsTheory: React.FC<KinematicsTheoryProps> = ({ onNavigateChapter }) => {
  const conceptsContent = (
    <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
      {/* Introduction Banner */}
      <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-zinc-100 font-medium mb-1">
            Allen JEE (Main + Advanced) & NEET Theory — Kinematics 2D
          </div>
          <div className="text-xs text-zinc-400">
            Official theory notes from <span className="font-mono text-zinc-300">Kinematics_2D_Theory_26.pdf</span> (Pages 85–88).
            Two-dimensional motion in a uniform gravitational field can always be decomposed into two independent, mutually perpendicular one-dimensional rectilinear motions.
          </div>
        </div>
      </div>

      {/* Section 1: Ground to Ground Projectile Motion */}
      <section className="space-y-4">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          1. Ground to Ground Projectile Motion
        </h3>

        <p className="text-zinc-400 text-xs sm:text-sm">
          When a body is projected obliquely with initial velocity <MathBlock math="u" /> at an angle <MathBlock math="\alpha" /> with the horizontal into a uniform gravitational field, the horizontal component of velocity <MathBlock math="u_x = u\cos\alpha" /> remains strictly constant (since <MathBlock math="a_x = 0" />). The vertical motion is governed by constant downward acceleration <MathBlock math="a_y = -g" />.
        </p>

        {/* Derivations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time of flight */}
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-xs text-zinc-200 block">
              A. Time of Flight & Ascent
            </span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center">
              <MathBlock math="t_H = \frac{u\sin\alpha}{g}, \quad T = \frac{2u\sin\alpha}{g} = 2t_H" display={true} />
            </div>
            <div className="text-xs text-zinc-400 space-y-1">
              <p><strong>Derivation:</strong> At maximum height, vertical velocity ceases temporarily: <MathBlock math="v_y = 0" />.</p>
              <p><MathBlock math="v_y = u_y - gt \implies 0 = u\sin\alpha - gt_H \implies t_H = \frac{u\sin\alpha}{g}" /></p>
              <p>Due to vertical symmetry under constant gravity, total time <MathBlock math="T = 2t_H" />.</p>
            </div>
          </div>

          {/* Maximum Height */}
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-xs text-zinc-200 block">
              B. Maximum Height (H)
            </span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center">
              <MathBlock math="H = \frac{u^2 \sin^2\alpha}{2g} = \frac{u_y^2}{2g}" display={true} />
            </div>
            <div className="text-xs text-zinc-400 space-y-1">
              <p><strong>Derivation:</strong> Using the 3rd equation of motion vertically:</p>
              <p><MathBlock math="v_y^2 = u_y^2 - 2gH \implies 0 = (u\sin\alpha)^2 - 2gH \implies H = \frac{u^2\sin^2\alpha}{2g}" /></p>
              <p>Notice: At the apex, speed is not zero, but <MathBlock math="v_{\text{apex}} = u\cos\alpha" />.</p>
            </div>
          </div>

          {/* Horizontal Range */}
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-xs text-zinc-200 block">
              C. Horizontal Range (R) & Max Range
            </span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center">
              <MathBlock math="R = \frac{u^2 \sin 2\alpha}{g}, \quad R_{\max} = \frac{u^2}{g} \text{ (at } \alpha = 45^\circ\text{)}" display={true} />
            </div>
            <div className="text-xs text-zinc-400 space-y-1">
              <p><strong>Derivation:</strong> Distance traveled along horizontal in total time <MathBlock math="T" />:</p>
              <p><MathBlock math="R = u_x \cdot T = (u\cos\alpha)\left(\frac{2u\sin\alpha}{g}\right) = \frac{u^2(2\sin\alpha\cos\alpha)}{g} = \frac{u^2\sin 2\alpha}{g}" /></p>
            </div>
          </div>

          {/* Trajectory Equation */}
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-xs text-zinc-200 block">
              D. Equation of Trajectory (Parabola)
            </span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center">
              <MathBlock math="y = x\tan\alpha - \frac{gx^2}{2u^2\cos^2\alpha} = x\tan\alpha\left(1 - \frac{x}{R}\right)" display={true} />
            </div>
            <div className="text-xs text-zinc-400 space-y-1">
              <p><strong>Derivation:</strong> Eliminate time <MathBlock math="t" /> by substituting <MathBlock math="t = \frac{x}{u\cos\alpha}" /> into vertical displacement <MathBlock math="y = (u\sin\alpha)t - \frac{1}{2}gt^2" />.</p>
              <p>The factorized form <MathBlock math="y = x\tan\alpha(1 - x/R)" /> is extremely useful in JEE problems where range is given!</p>
            </div>
          </div>
        </div>

        {/* Velocity at any height h */}
        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs space-y-1.5">
          <span className="font-medium text-zinc-200">Velocity and Direction at any Height h:</span>
          <p><MathBlock math="v_x^2 = u^2\cos^2\alpha" /> and <MathBlock math="v_y^2 = u^2\sin^2\alpha - 2gh" />. Adding these gives:</p>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center my-1 font-mono">
            <MathBlock math="v = \sqrt{u^2 - 2gh}" display={true} />
          </div>
          <p className="text-zinc-400">Notice that speed at any height <MathBlock math="h" /> is independent of the projection angle <MathBlock math="\alpha" />—a direct result of Mechanical Energy Conservation!</p>
        </div>
      </section>

      {/* Section 2: Complementary Angles */}
      <section className="space-y-3">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          2. Complementary Angles Property
        </h3>

        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs space-y-2">
          <p>
            For a given projection speed <MathBlock math="u" />, two complementary projection angles <MathBlock math="\alpha" /> and <MathBlock math="(90^\circ - \alpha)" /> result in the <strong>exact same horizontal range</strong>:
          </p>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center font-mono">
            <MathBlock math="R(\alpha) = R(90^\circ - \alpha) = \frac{u^2 \sin 2\alpha}{g}" display={true} />
          </div>
          <p className="text-zinc-400">
            Let <MathBlock math="T_1, T_2" /> be the times of flight and <MathBlock math="H_1, H_2" /> be the maximum heights for the two complementary angles:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-300 font-mono">
            <li><MathBlock math="T_1 \cdot T_2 = \frac{2u\sin\alpha}{g} \cdot \frac{2u\cos\alpha}{g} = \frac{2}{g}\left(\frac{u^2\sin 2\alpha}{g}\right) = \frac{2R}{g}" /></li>
            <li><MathBlock math="H_1 + H_2 = \frac{u^2\sin^2\alpha + u^2\cos^2\alpha}{2g} = \frac{u^2}{2g} = R_{\max}/2" /></li>
            <li><MathBlock math="H_1 \cdot H_2 = \frac{u^4 \sin^2\alpha \cos^2\alpha}{4g^2} = \frac{R^2}{16} \implies R = 4\sqrt{H_1 H_2}" /></li>
          </ul>
        </div>
      </section>

      {/* Section 3: Projectile on Inclined Plane */}
      <section className="space-y-3">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          3. Projectile on an Inclined Plane
        </h3>

        <p className="text-zinc-400 text-xs">
          Let an inclined plane make angle <MathBlock math="\beta" /> with the horizontal. A particle is launched at angle <MathBlock math="\alpha" /> with the horizontal (angle <MathBlock math="(\alpha - \beta)" /> relative to the incline surface).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs">
            <span className="font-medium text-zinc-200">A. Projection UP the Incline</span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 font-mono text-center">
              <MathBlock math="T_{\text{incline}} = \frac{2u\sin(\alpha - \beta)}{g\cos\beta}" display={true} />
              <MathBlock math="R_{PQ} = \frac{u^2}{g\cos^2\beta}[\sin(2\alpha - \beta) - \sin\beta]" display={true} />
            </div>
            <p className="text-zinc-400">
              <strong>Max Range Condition:</strong> <MathBlock math="\sin(2\alpha - \beta) = 1 \implies 2\alpha - \beta = \pi/2 \implies \alpha = \frac{\pi}{4} + \frac{\beta}{2}" />.
              The direction of projection for maximum range exactly bisects the angle between the vertical and the incline plane!
            </p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs">
            <span className="font-medium text-zinc-200">B. Projection DOWN the Incline</span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 font-mono text-center">
              <MathBlock math="T = \frac{2u\sin(\alpha + \beta)}{g\cos\beta}" display={true} />
              <MathBlock math="R_{\text{down}} = \frac{u^2}{g\cos^2\beta}[\sin(2\alpha + \beta) + \sin\beta]" display={true} />
            </div>
            <p className="text-zinc-400">
              <strong>Max Range Condition:</strong> <MathBlock math="\alpha = \frac{\pi}{4} - \frac{\beta}{2}" />.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Relative Motion */}
      <section className="space-y-3">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          4. Relative Motion in 2D (River-Boat & Rain-Man)
        </h3>

        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-3 text-xs">
          <p>
            Relative velocity formula: <MathBlock math="\vec{v}_{A/B} = \vec{v}_A - \vec{v}_B" />.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 space-y-1">
              <span className="text-zinc-200 font-medium">Crossing River in Minimum Time:</span>
              <p className="text-zinc-400">
                To cross river of width <MathBlock math="d" /> in least time, boat must steer perpendicular to flow (<MathBlock math="\theta = 90^\circ" />):
              </p>
              <p className="font-mono text-center"><MathBlock math="t_{\min} = \frac{d}{v_{\text{boat/river}}}" /></p>
              <p className="text-zinc-400">Drift along river: <MathBlock math="x = v_{\text{river}} \cdot t_{\min}" />.</p>
            </div>

            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 space-y-1">
              <span className="text-zinc-200 font-medium">Crossing with Zero Drift (Least Distance):</span>
              <p className="text-zinc-400">
                Boat must head upstream at angle <MathBlock math="\theta" /> with flow such that net velocity along river is zero:
              </p>
              <p className="font-mono text-center"><MathBlock math="\sin\theta = \frac{v_{\text{river}}}{v_{\text{boat/river}}}" /></p>
              <p className="text-zinc-400">Only possible if boat speed exceeds river speed (<MathBlock math="v_b > v_r" />).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Common Traps & JEE Tips */}
      <section className="space-y-3">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          5. High-Yield JEE / NEET Traps & Pitfalls
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-zinc-200">Trap 1: Velocity at the Highest Point is NOT zero.</strong>
              <p className="text-zinc-400">Only the vertical component <MathBlock math="v_y = 0" />. The particle still possesses its horizontal velocity <MathBlock math="v_x = u\cos\alpha" />. Acceleration at the top is still <MathBlock math="g" /> downwards!</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-zinc-200">Tip 2: Tangent to Trajectory equals Instantaneous Velocity.</strong>
              <p className="text-zinc-400">The slope of the trajectory curve <MathBlock math="\frac{dy}{dx} = \tan\theta = \frac{v_y}{v_x}" /> always indicates the direction of instantaneous motion at any coordinate <MathBlock math="(x, y)" />.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <ExamStudyGuideLayout
      chapterId="kinematics_2d"
      chapterNumber={3}
      chapterTitle="Kinematics in 2D & Projectiles"
      pdfName="Kinematics_2D_Theory_26.pdf"
      description="Ground and incline projectile trajectories, complementary launch angles, equation of trajectory, and relative velocity."
      labName="2D Projectile & River Boat Lab"
      conceptsContent={conceptsContent}
      formulaSheet={kinematics2dFormulaSheet}
      examinerTraps={kinematics2dExaminerTraps}
      pyqArchetypes={kinematics2dPYQs}
      examMatrix={kinematics2dExamMatrix}
      checklist={kinematics2dChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
