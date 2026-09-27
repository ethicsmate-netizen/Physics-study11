import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  nlmFormulaSheet,
  nlmExaminerTraps,
  nlmPYQs,
  nlmExamMatrix,
  nlmChecklist,
} from '../../data/studyGuides/nlmGuide';

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

interface NlmTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const NlmTheory: React.FC<NlmTheoryProps> = ({ onNavigateChapter }) => {
  const conceptsContent = (
    <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
      {/* Introduction Banner */}
      <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-zinc-100 font-medium mb-1">
            Allen JEE (Main + Advanced) & NEET Theory — Newton's Laws, Friction & Pseudo Forces
          </div>
          <div className="text-xs text-zinc-400">
            Official theory notes from <span className="font-mono text-zinc-300">Newton_s_Laws_Of_Motion_And_Friction_Theory_26.pdf</span> (Pages 121–126).
            Covers contact forces, Free Body Diagrams (FBD), connected pulley systems, and Pseudo forces in non-inertial accelerating frames.
          </div>
        </div>
      </div>

      {/* Section 1: Contact Forces */}
      <section className="space-y-4">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          1. Contact Forces: Normal & Friction
        </h3>

        <p className="text-zinc-400 text-xs sm:text-sm">
          When two physical bodies press against each other, the total contact force <MathBlock math="\vec{R}" /> decomposes into two perpendicular components:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-xs text-zinc-200 block">
              Normal Force (N)
            </span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center">
              <MathBlock math="N \perp \text{contact surface}" display={true} />
            </div>
            <p className="text-xs text-zinc-400">
              Component of contact force perpendicular to the surface. It measures how strongly the contacting surfaces push against each other. On a static incline, <MathBlock math="N = mg\cos\theta" />.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-xs text-zinc-200 block">
              Frictional Force (f)
            </span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center">
              <MathBlock math="f \parallel \text{contact surface}" display={true} />
            </div>
            <p className="text-xs text-zinc-400">
              Component of contact force parallel to the surface. It opposes the relative motion (or attempted/impending relative motion) of the two surfaces in contact.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Pseudo Force & Non-Inertial Frames */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <h3 className="text-base font-medium">
            2. Pseudo Force in Non-Inertial Frames (Page 125)
          </h3>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-3 text-xs">
          <p>
            <strong>Definition from Notes:</strong> The magnitude of pseudo force <MathBlock math="F_p" /> equals the product of mass <MathBlock math="m" /> of the object and acceleration <MathBlock math="a_0" /> of the frame of reference:
          </p>
          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-center font-mono">
            <MathBlock math="\vec{F}_p = -m\vec{a}_0" display={true} />
          </div>
          <p className="text-zinc-400">
            The direction of pseudo force is <em>strictly opposite</em> to the acceleration of the frame. It allows us to apply Newton's second law <MathBlock math="\Sigma \vec{F} = m\vec{a}_{\text{rel}}" /> directly in an accelerating non-inertial frame.
          </p>

          <div className="p-3 rounded bg-zinc-950/80 border border-zinc-800 space-y-2">
            <span className="font-semibold text-zinc-200 block">
              Classic JEE Problem: Accelerating Wedge
            </span>
            <p className="text-zinc-300">
              Consider a wedge accelerating horizontally with acceleration <MathBlock math="a_0" />. On a block of mass <MathBlock math="m" /> on the incline, pseudo force <MathBlock math="F_p = ma_0" /> acts horizontally backwards:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-300 font-mono">
              <li>Component along incline (upwards): <MathBlock math="ma_0\cos\theta" /></li>
              <li>Component perpendicular to incline (downwards): <MathBlock math="ma_0\sin\theta" /></li>
              <li>Modified Normal Force: <MathBlock math="N = m(g\cos\theta + a_0\sin\theta)" /></li>
              <li>Net driving force down incline: <MathBlock math="F_{\parallel} = m(g\sin\theta - a_0\cos\theta)" /></li>
            </ul>
            <div className="p-2 rounded bg-zinc-900 border border-zinc-700 text-center font-mono text-cyan-300 font-semibold mt-2">
              <MathBlock math="F_{\parallel} = 0 \iff a_0 = g\tan\theta \quad (\text{Condition for zero sliding on smooth incline!})" display={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Connected Bodies & Pulley Systems */}
      <section className="space-y-4">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          3. Connected Bodies over Pulley (Page 122)
        </h3>

        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs">
          <p>
            For an ideal inextensible string passing over a massless, frictionless pulley:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-300 font-mono">
            <li>Tension <MathBlock math="T" /> is uniform across the entire string length.</li>
            <li>Inextensibility constraint: If block 1 moves along the incline by <MathBlock math="\Delta s" />, hanging block 2 moves vertically by the exact same distance <MathBlock math="\Delta s" />: <MathBlock math="a_1 = a_2 = a" />.</li>
            <li>Net system acceleration: <MathBlock math="a = \frac{\text{Net Driving Force} - \text{Friction}}{m_1 + m_2}" />.</li>
          </ul>
        </div>
      </section>

      {/* Section 4: Static vs Kinetic Friction */}
      <section className="space-y-4">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          4. Static Friction vs. Kinetic Friction (Page 126)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-zinc-200">Static Friction (<MathBlock math="f_s" />)</span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center font-mono">
              <MathBlock math="f_s \le \mu_s N, \quad (f_s)_{\max} = \mu_s N" display={true} />
            </div>
            <p className="text-zinc-400">
              Acts between surfaces at rest relative to each other. Static friction is a <strong>self-adjusting force</strong>: its magnitude adjusts to precisely cancel the applied driving force until reaching limiting friction <MathBlock math="(f_s)_{\max}" />.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
            <span className="font-medium text-zinc-200">Kinetic Friction (<MathBlock math="f_k" />)</span>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center font-mono">
              <MathBlock math="f_k = \mu_k N \quad (\text{where } \mu_s > \mu_k)" display={true} />
            </div>
            <p className="text-zinc-400">
              Acts between surfaces actively slipping over each other. Once relative motion begins, friction drops slightly to <MathBlock math="f_k = \mu_k N" /> and remains virtually independent of relative velocity.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Angle of Repose */}
      <section className="space-y-3">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          5. Angle of Friction & Angle of Repose
        </h3>

        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs space-y-2">
          <p>
            The Angle of Repose <MathBlock math="\phi" /> is the maximum angle of inclination of a plane with the horizontal such that a body placed on it remains in static equilibrium without sliding:
          </p>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-center font-mono">
            <MathBlock math="\tan\phi = \mu_s \implies \phi = \tan^{-1}(\mu_s)" display={true} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300 pt-1">
            <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
              <strong>If <MathBlock math="\theta \le \phi" />:</strong> Static equilibrium. <MathBlock math="f_s = mg\sin\theta" />, acceleration <MathBlock math="a = 0" />.
            </div>
            <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850">
              <strong>If <MathBlock math="\theta > \phi" />:</strong> Sliding occurs. <MathBlock math="a = g(\sin\theta - \mu_k\cos\theta)" />.
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: High-Yield JEE Traps */}
      <section className="space-y-3">
        <h3 className="text-base font-medium text-white border-b border-zinc-800 pb-2">
          6. High-Yield JEE / NEET Exam Traps
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-zinc-200">Trap 1: <MathBlock math="f_s \neq \mu_s N" /> always!</strong>
              <p className="text-zinc-400">Never substitute <MathBlock math="f = \mu_s N" /> blindly! Static friction only equals <MathBlock math="\mu_s N" /> at the verge of slipping. If the driving force is smaller, static friction matches the driving force exactly.</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-zinc-200">Tip 2: Direction of Pseudo Force is always opposite to frame acceleration.</strong>
              <p className="text-zinc-400">If a cart accelerates to the right, pseudo force is to the left. If a lift accelerates upwards with <MathBlock math="a_0" />, pseudo force is downwards, creating an apparent weight <MathBlock math="m(g + a_0)" />.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <ExamStudyGuideLayout
      chapterId="nlm_friction"
      chapterNumber={4}
      chapterTitle="Newton's Laws & Friction"
      pdfName="Newton_s_Laws_Of_Motion_And_Friction_Theory_26.pdf"
      description="Contact forces, Free Body Diagrams (FBD), connected pulley systems, and Pseudo forces in non-inertial accelerating frames."
      labName="FBD & Incline Friction Lab"
      conceptsContent={conceptsContent}
      formulaSheet={nlmFormulaSheet}
      examinerTraps={nlmExaminerTraps}
      pyqArchetypes={nlmPYQs}
      examMatrix={nlmExamMatrix}
      checklist={nlmChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
