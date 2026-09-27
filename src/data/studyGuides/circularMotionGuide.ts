import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const circularMotionFormulaSheet: FormulaItem[] = [
  {
    title: 'Centripetal & Tangential Acceleration',
    latex: 'a_c = \\frac{v^2}{R} = \\omega^2 R, \\quad a_t = \\frac{dv}{dt} = \\alpha R, \\quad a_{\\text{total}} = \\sqrt{a_c^2 + a_t^2}',
    conditions: 'a_c is always radial (perpendicular to velocity, alters direction). a_t is tangential (parallel to velocity, alters speed).',
    shortcut: 'For uniform circular motion (UCM), speed is constant so a_t = 0 and a_total = a_c = v^2/R.',
    examTarget: ['all'],
  },
  {
    title: '3D Banked Road Highway Stability Formulas',
    latex: 'v_{\\text{opt}} = \\sqrt{Rg\\tan\\theta}, \\quad v_{\\max} = \\sqrt{Rg\\frac{\\tan\\theta + \\mu}{1 - \\mu\\tan\\theta}}, \\quad v_{\\min} = \\sqrt{Rg\\frac{\\tan\\theta - \\mu}{1 + \\mu\\tan\\theta}}',
    conditions: 'R is radius of curved track, \\theta is banking angle, \\mu is coefficient of lateral friction.',
    shortcut: 'At v = v_opt, no friction is needed at all! The horizontal component of Normal force (N sinθ) alone provides the centripetal force.',
    examTarget: ['all'],
  },
  {
    title: 'Vertical Circle Critical Speeds (String of length R)',
    latex: 'v_{\\text{bottom}} \\ge \\sqrt{5gR}, \\quad v_{\\text{top}} \\ge \\sqrt{gR}, \\quad v_{\\text{horizontal}} \\ge \\sqrt{3gR}',
    conditions: 'For a body tied to an inextensible light string to complete full vertical revolution without slacking.',
    shortcut: 'Tension difference between bottom and top is ALWAYS constant: T_{\\text{bottom}} - T_{\\text{top}} = 6mg (independent of speed!). If light rigid rod: v_{\\text{bottom}} \\ge \\sqrt{4gR} = 2\\sqrt{gR}.',
    examTarget: ['all'],
  },
  {
    title: 'Conical Pendulum Period & Frequency',
    latex: 'T = 2\\pi\\sqrt{\\frac{L\\cos\\theta}{g}} = 2\\pi\\sqrt{\\frac{h}{g}}, \\quad \\omega = \\sqrt{\\frac{g}{h}}',
    conditions: 'String of length L revolving at semi-vertical angle \\theta in a horizontal circle of radius r = L\\sin\\theta.',
    shortcut: 'Tension in string T_{\\text{ten}} = mg / \\cos\\theta. Notice h = L\\cos\\theta is the vertical depth below the pivot.',
    examTarget: ['jee_main', 'neet'],
  },
  {
    title: 'Radius of Curvature at Any Point of Trajectory',
    latex: 'R_c = \\frac{v^2}{a_\\perp}',
    conditions: 'a_\\perp is the component of total acceleration perpendicular to the instantaneous velocity vector \\vec{v}.',
    shortcut: 'For a projectile at highest point: v = u\\cos\\theta and a_\\perp = g, so R_c = \\frac{u^2 \\cos^2\\theta}{g}.',
    examTarget: ['jee_adv', 'jee_main'],
  },
];

export const circularMotionExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Mixing Centripetal & Centrifugal Forces in Same FBD',
    trap: 'Drawing both centripetal force (mv^2/R inward) and centrifugal force (mv^2/R outward) in the same free body diagram.',
    reality: 'Centripetal force is NOT a separate new force—it is the net real inward physical force (e.g. tension, gravity, or friction). Centrifugal force is a PSEUDO force that exists ONLY in the rotating reference frame. Never draw both!',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'String Slack Condition vs Zero Speed Condition',
    trap: 'Assuming that the particle falls off a vertical circle when its speed becomes zero.',
    reality: 'In string-tied vertical motion, the particle leaves the circular path when string TENSION becomes zero (T = 0), which occurs while the particle STILL has non-zero speed! It then becomes a parabolic projectile under gravity.',
    severity: 'critical',
    examTarget: ['jee_adv', 'jee_main'],
  },
  {
    title: 'Bending of Cyclist vs Banking of Road',
    trap: 'Confusing angle with vertical vs angle with horizontal in \\tan\\theta = v^2/(Rg).',
    reality: 'For a cyclist leaning on a flat road, \\theta is the angle made with the VERTICAL. For a banked road, \\theta is the angle of the incline with the HORIZONTAL. Both obey \\tan\\theta = v^2/(Rg).',
    severity: 'high',
    examTarget: ['jee_main', 'neet'],
  },
];

export const circularMotionPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2024 / NEET',
    title: 'Tension in String at Intermediate Position in Vertical Circle',
    problem: 'A small sphere of mass m = 0.5 kg tied to a string of length R = 1.0 m is released from rest from a horizontal position (\\theta = 0° with horizontal). Find the tension in the string when it reaches the lowest vertical position (g = 10 m/s²).',
    conceptUsed: 'Conservation of Mechanical Energy + Centripetal Force Equation at Bottom',
    kotaShortcut: 'T_{\\text{bottom}} = 3mg always when released from horizontal position!',
    solutionLatex: [
      '\\text{Energy Conservation: } mgR = \\frac{1}{2}m v_{\\text{bottom}}^2 \\implies v_{\\text{bottom}}^2 = 2gR',
      '\\text{FBD at Bottom: } T - mg = \\frac{m v_{\\text{bottom}}^2}{R}',
      'T = mg + \\frac{m(2gR)}{R} = mg + 2mg = 3mg',
      'T = 3(0.5)(10) = 15.0 \\text{ N}'
    ],
    solutionExplanation: 'The loss in gravitational potential energy mgR converts into kinetic energy. At the bottom, tension must support the weight mg PLUS provide the centripetal acceleration m v^2/R = 2mg, yielding T = 3mg exactly.',
    takeaway: 'When released from horizontal, T_bottom = 3mg. When released from vertical top with critical speed, T_bottom = 6mg.',
    examTarget: ['all'],
  },
  {
    examTag: 'JEE Advanced',
    title: 'Bead on a Rotating Circular Wire Hoop',
    problem: 'A smooth circular wire hoop of radius R rotates with constant angular velocity \\omega about its vertical diameter. A small bead of mass m slides without friction on the hoop. Find the angle \\theta that the radius to the bead makes with the downward vertical in equilibrium.',
    conceptUsed: 'Rotating Frame FBD: Centrifugal Force F_cf = m \\omega^2 (R \\sin\\theta) balances Gravity component',
    kotaShortcut: '\\cos\\theta = g / (R\\omega^2). Equilibrium exists only if \\omega > \\sqrt{g/R}.',
    solutionLatex: [
      '\\text{Radius of circular path of bead } r = R\\sin\\theta',
      '\\text{Normal force acts radially inward towards center of hoop: } \\vec{N}',
      'N\\cos\\theta = mg',
      'N\\sin\\theta = m\\omega^2 r = m\\omega^2(R\\sin\\theta)',
      'N = m\\omega^2 R',
      '\\cos\\theta = \\frac{mg}{N} = \\frac{mg}{m\\omega^2 R} = \\frac{g}{\\omega^2 R}',
      '\\theta = \\arccos\\left(\\frac{g}{\\omega^2 R}\\right) \\quad \\text{for } \\omega \\ge \\sqrt{\\frac{g}{R}}'
    ],
    solutionExplanation: 'Equating the vertical component of Normal force to mg and horizontal component to centripetal requirement gives cosθ = g / (R ω^2). Since cosθ ≤ 1, this non-zero angle equilibrium is physically possible only when ω > √(g/R).',
    takeaway: 'If rotation speed ω < √(g/R), the bead stays strictly at the lowest point θ = 0.',
    examTarget: ['jee_adv'],
  },
];

export const circularMotionExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '1 Question (~4 Marks)',
    difficulty: 'Moderate',
    keyFocus: 'Banked highway curves, vertical loop critical speed, radius of curvature of projectile, conical pendulum.',
  },
  jeeAdv: {
    weightage: '1 – 2 Questions (~4 to 6 Marks)',
    difficulty: 'Hard (Rotating Frames & Variable Speed)',
    keyFocus: 'Particle leaving circle (string slacking), bead on rotating ring/cylinder, non-uniform circular motion with calculus.',
  },
  neet: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Easy (Formula Direct)',
    keyFocus: 'Ratio of tensions in vertical circle T_bottom - T_top = 6mg, banking formula tanθ = v^2/Rg, centripetal acceleration ac = v^2/r.',
  },
};

export const circularMotionChecklist: string[] = [
  'Angular variables: angular displacement, velocity (ω) and acceleration (α)',
  'Radial acceleration (ac = v^2/R) vs Tangential acceleration (at = dv/dt)',
  'Total acceleration in non-uniform circular motion (a = √(ac^2 + at^2))',
  'Optimum banking speed formula (v_opt = √(Rg tanθ))',
  'Maximum safe speed on rough banked curve with friction μ',
  'Vertical circle critical speeds: √(5gR) at bottom, √(gR) at top',
  'Tension difference between bottom and top (T_bottom - T_top = 6mg)',
  'String slacking condition (T = 0) vs loss of contact on convex surface (N = 0)',
  'Conical pendulum time period (T = 2π√(L cosθ / g))',
  'Radius of curvature formula (Rc = v^2 / a_perp)',
];
