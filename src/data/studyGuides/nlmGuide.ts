import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const nlmFormulaSheet: FormulaItem[] = [
  {
    title: 'Newton\'s Second Law & Equilibrium',
    latex: '\\Sigma \\vec{F}_{\\text{ext}} = m\\vec{a}, \\quad \\text{Equilibrium: } \\Sigma \\vec{F} = 0 \\iff \\vec{a} = 0',
    conditions: 'Valid strictly in inertial (non-accelerating) frames of reference.',
    shortcut: 'Pulley Shortcut: a = \\frac{\\text{Net Unbalanced Driving Force}}{\\text{Total Moving Inertial Mass of System}}.',
    examTarget: ['all'],
  },
  {
    title: 'Friction Laws & Angle of Repose',
    latex: 'f_s \\le \\mu_s N, \\quad f_k = \\mu_k N, \\quad \\tan\\phi = \\mu_s \\quad (\\text{Angle of Repose})',
    conditions: 'f_s is self-adjusting ($0 \\le f_s \\le \\mu_s N$). f_k acts once relative sliding begins.',
    shortcut: 'Block on incline slips down on its own ONLY if incline angle \\theta > \\phi = \\tan^{-1}\\mu. Acceleration down rough incline: a = g(\\sin\\theta - \\mu\\cos\\theta).',
    examTarget: ['all'],
  },
  {
    title: 'Pseudo-Force in Non-Inertial Reference Frames',
    latex: '\\vec{F}_p = -m\\vec{a}_0, \\quad \\Sigma \\vec{F}_{\\text{real}} + \\vec{F}_p = m\\vec{a}_{\\text{rel}}',
    conditions: 'm is mass of object being analyzed; \\vec{a}_0 is acceleration of the observer\'s reference frame.',
    shortcut: 'Always draw \\vec{F}_p in the direction OPPOSITE to frame acceleration \\vec{a}_0! Enables static equilibrium analysis in accelerated lifts, wedges, and cars.',
    examTarget: ['all'],
  },
  {
    title: 'String Constraint Method (Virtual Work Shortcut)',
    latex: '\\sum_{i} \\vec{T}_i \\cdot \\vec{a}_i = 0 \\implies T_1 a_1 + T_2 a_2 + \\dots = 0',
    conditions: 'Inextensible strings and light, frictionless pulleys in connected systems.',
    shortcut: 'Ratio of accelerations is inversely proportional to ratio of string tensions: \\frac{a_1}{a_2} = \\frac{T_2}{T_1}.',
    examTarget: ['jee_main', 'jee_adv'],
  },
  {
    title: 'Accelerating Wedge Zero-Slip Condition',
    latex: 'a_0 = g\\tan\\theta \\quad (\\text{Frictionless Wedge})',
    conditions: 'Block of mass m on frictionless inclined plane of angle \\theta accelerated horizontally.',
    shortcut: 'At a_0 = g\\tan\\theta, normal force is N = mg/\\cos\\theta. If rough, range of no slip: g\\frac{\\sin\\theta - \\mu\\cos\\theta}{\\cos\\theta + \\mu\\sin\\theta} \\le a_0 \\le g\\frac{\\sin\\theta + \\mu\\cos\\theta}{\\cos\\theta - \\mu\\sin\\theta}.',
    examTarget: ['all'],
  },
];

export const nlmExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Assuming Normal Force Always Equals mg',
    trap: 'Writing N = mg without drawing a Free Body Diagram (FBD) and resolving perpendicular forces.',
    reality: 'Normal force depends completely on contact geometry: on incline N = mg\\cos\\theta; in an accelerating lift N = m(g \\pm a_0); under pulling force at angle \\theta, N = mg - F\\sin\\theta. Always write \\Sigma F_\\perp = 0 to solve for N!',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Static Friction is NOT Always Equal to μs N',
    trap: 'Calculating friction as f = \\mu_s N immediately whenever a body is at rest.',
    reality: '\\mu_s N is the MAXIMUM possible (limiting) static friction. Actual static friction equals whatever external driving force is applied: 0 \\le f_s \\le \\mu_s N. If applied force is 2 N and limiting friction is 10 N, the friction force is EXACTLY 2 N, NOT 10 N!',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Action-Reaction Force Acting on Same Body',
    trap: 'Calling Normal force N and Gravity mg an "Action-Reaction pair" because they cancel each other.',
    reality: 'Action-reaction pairs according to Newton\'s Third Law act on TWO DIFFERENT BODIES. Normal force is between block and surface; gravity is between block and Earth. N and mg can NEVER be an action-reaction pair.',
    severity: 'high',
    examTarget: ['jee_main', 'neet'],
  },
];

export const nlmPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2024 / NEET',
    title: 'Two-Block Stacked System Maximum Force Without Slipping',
    problem: 'Block A of mass m_1 = 2 kg rests on top of block B of mass m_2 = 4 kg, which sits on a frictionless floor. Coefficient of static friction between A and B is \\mu_s = 0.4. What is the maximum horizontal force F applied to block B such that block A does not slip on B?',
    conceptUsed: 'Friction provides common acceleration to block A: f_{s,\\max} = m_1 a_{\\max}',
    kotaShortcut: 'F_{\\max} = (m_1 + m_2) a_{\\max} = (m_1 + m_2)(\\mu_s g).',
    solutionLatex: [
      'f_{s,\\max} = \\mu_s m_1 g = (0.4)(2)(10) = 8.0 \\text{ N}',
      'a_{\\max} = \\frac{f_{s,\\max}}{m_1} = \\mu_s g = (0.4)(10) = 4.0 \\text{ m/s}^2',
      'F = (m_1 + m_2) a_{\\max} = (2 + 4)(4.0) = 24.0 \\text{ N}'
    ],
    solutionExplanation: 'Block A accelerates solely due to static friction between A and B. The maximum acceleration without slipping is a_max = \\mu_s g. Since both blocks accelerate together at this threshold, total force on the combined system is F = (m1 + m2) a_max.',
    takeaway: 'Identify which block is being driven by friction alone. Its maximum acceleration sets the speed limit for the combined system.',
    examTarget: ['all'],
  },
  {
    examTag: 'JEE Advanced / Main',
    title: 'Minimum Wedge Acceleration to Prevent Block Slipping Down Vertical Face',
    problem: 'A block of mass m is held against the vertical front face of a cart. The coefficient of friction between the block and vertical wall is \\mu. What is the minimum forward horizontal acceleration a_0 of the cart to prevent the block from slipping down?',
    conceptUsed: 'Non-Inertial Cart Frame: Pseudo Force F_p = m a_0 provides Normal Force N',
    kotaShortcut: 'N = m a_0. For equilibrium: f_s = mg \\le \\mu N = \\mu m a_0 \\implies a_0 \\ge g/\\mu.',
    solutionLatex: [
      '\\text{In Cart Frame: } N = m a_0',
      '\\text{Vertical Equilibrium: } f_s = m g',
      '\\text{Limiting Friction Condition: } f_s \\le \\mu_s N',
      'm g \\le \\mu_s (m a_0) \\implies a_0 \\ge \\frac{g}{\\mu_s}',
      'a_{0,\\min} = \\frac{g}{\\mu_s}'
    ],
    solutionExplanation: 'In the cart\'s accelerating frame, a pseudo force m a_0 pushes the block against the vertical wall, creating a normal force N = m a_0. The resulting maximum static friction \\mu m a_0 balances downward weight mg.',
    takeaway: 'Normal force can be generated entirely by horizontal pseudo force in non-inertial frames.',
    examTarget: ['jee_adv', 'jee_main'],
  },
];

export const nlmExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Moderate',
    keyFocus: 'Stacked two-body friction problems, movable pulley constraint equations, accelerating frames with pseudo force, angle of repose.',
  },
  jeeAdv: {
    weightage: '2 Questions (~6 to 8 Marks)',
    difficulty: 'Hard (Multi-constraint & Multi-body)',
    keyFocus: 'Movable wedges with rolling/slipping blocks, string and rod constraints, variable friction, spring balance readings.',
  },
  neet: {
    weightage: '2 Questions (~8 Marks)',
    difficulty: 'Easy to Moderate',
    keyFocus: 'Direct pulley formula a = (m1 - m2)g/(m1 + m2), apparent weight in elevator N = m(g ± a), angle of friction tanθ = μ, conservation of momentum.',
  },
};

export const nlmChecklist: string[] = [
  'Newton\'s 1st, 2nd & 3rd Laws of Motion',
  'Free Body Diagram (FBD) drawing rules and resolution along motion axes',
  'Normal force calculation under inclined and angled forces',
  'Static friction (0 ≤ fs ≤ μs N) vs Kinetic friction (fk = μk N)',
  'Angle of Friction and Angle of Repose (tanφ = μ)',
  'Motion on rough incline (a = g(sinθ - μ cosθ))',
  'Two-block stacked friction thresholds and slipping criteria',
  'Inextensible string constraint method (Σ T·a = 0)',
  'Pseudo force (Fp = -m a0) in non-inertial reference frames',
  'Accelerating wedge zero-slip condition (a0 = g tanθ)',
];
