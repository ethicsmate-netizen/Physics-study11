import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const kinematics2dFormulaSheet: FormulaItem[] = [
  {
    title: 'Ground-to-Ground Projectile Formulas',
    latex: 'T = \\frac{2u\\sin\\theta}{g}, \\quad H_{\\max} = \\frac{u^2\\sin^2\\theta}{2g}, \\quad R = \\frac{u^2\\sin 2\\theta}{g}',
    conditions: 'Flat ground launch and landing, uniform downward gravity g, air drag neglected.',
    shortcut: 'Express in terms of components: T = \\frac{2u_y}{g}, H = \\frac{u_y^2}{2g}, R = \\frac{2u_x u_y}{g}. Independent x and y motion!',
    examTarget: ['all'],
  },
  {
    title: 'Equation of Trajectory (Parabolic Path)',
    latex: 'y = x\\tan\\theta - \\frac{gx^2}{2u^2\\cos^2\\theta} = x\\tan\\theta\\left(1 - \\frac{x}{R}\\right)',
    conditions: 'Valid at every point (x, y) along the flight path until landing.',
    shortcut: 'The factored form y = x\\tan\\theta(1 - x/R) saves massive calculation time when Range R is known or requested!',
    examTarget: ['all'],
  },
  {
    title: 'Complementary Angle Theorem (Same Range)',
    latex: 'R(\\theta) = R(90^\\circ - \\theta), \\quad R = 4\\sqrt{H_1 H_2} = \\frac{g T_1 T_2}{2}',
    conditions: 'Same projection speed u, landing at same horizontal elevation.',
    shortcut: 'Product of flight times T_1 T_2 = 2R/g. Ratio of maximum heights H_1/H_2 = \\tan^2\\theta.',
    examTarget: ['jee_main', 'neet'],
  },
  {
    title: 'Projectile on an Inclined Plane (Angle β)',
    latex: 'T = \\frac{2u\\sin(\\alpha - \\beta)}{g\\cos\\beta}, \\quad R = \\frac{u^2}{g\\cos^2\\beta}\\left[\\sin(2\\alpha - \\beta) - \\sin\\beta\\right]',
    conditions: '\\alpha is launch angle with horizontal; \\beta is incline angle with horizontal. Launch up the incline.',
    shortcut: 'Rotate coordinates: x-axis along incline (a_x = -g\\sin\\beta), y-axis perpendicular to incline (a_y = -g\\cos\\beta). Range is maximum when \\alpha = \\frac{\\pi}{4} + \\frac{\\beta}{2}.',
    examTarget: ['jee_adv', 'jee_main'],
  },
  {
    title: 'River-Boat Crossing Speed & Drift Formulas',
    latex: 't_{\\min} = \\frac{d}{v_b} \\quad (\\text{Head } \\perp \\text{ bank}), \\quad \\sin\\theta = \\frac{v_r}{v_b} \\quad (\\text{Zero Drift, if } v_b > v_r)',
    conditions: 'v_b is boat speed in still water, v_r is river stream speed, d is river width.',
    shortcut: 'For shortest time: steer directly across. Drift x = v_r t_{\\min} = v_r (d/v_b). If v_b < v_r, zero drift is impossible; minimum drift occurs when \\cos\\theta = v_b/v_r.',
    examTarget: ['all'],
  },
];

export const kinematics2dExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Velocity at Highest Point is NOT Zero',
    trap: 'Assuming total velocity is zero at maximum height (like in 1D vertical motion).',
    reality: 'Vertical velocity is zero (v_y = 0), but horizontal velocity is still fully active: v_{\\text{apex}} = u\\cos\\theta. Kinetic energy at top is non-zero: K_{\\text{top}} = \\frac{1}{2}m u^2 \\cos^2\\theta.',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Complementary Angle Height Relation Factor of 4',
    trap: 'Writing R = \\sqrt{H_1 H_2} instead of R = 4\\sqrt{H_1 H_2}.',
    reality: 'H_1 = \\frac{u^2\\sin^2\\theta}{2g} and H_2 = \\frac{u^2\\cos^2\\theta}{2g}. Multiplying gives H_1 H_2 = \\frac{u^4 \\sin^2 2\\theta}{16 g^2} = \\frac{R^2}{16}. Therefore R = 4\\sqrt{H_1 H_2}. Forgetting the factor of 4 causes instant -1 mark in JEE/NEET.',
    severity: 'critical',
    examTarget: ['jee_main', 'neet'],
  },
  {
    title: 'River Crossing Angle Measurement Reference',
    trap: 'Confusing "angle with river flow" with "angle with perpendicular to river bank".',
    reality: 'If steering angle \\theta is measured upstream from normal to the bank, the angle with river flow direction is (90° + \\theta). Carefully check whether the exam question asks for angle with the bank or angle with the stream.',
    severity: 'high',
    examTarget: ['all'],
  },
];

export const kinematics2dPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2024 / NEET',
    title: 'Projectile Passing Through Given Coordinates Twice',
    problem: 'A projectile is launched from ground with speed u = 20 m/s. It reaches a height of h = 15 m at two distinct times t_1 and t_2. Find the sum and product of these two times (g = 10 m/s²), and the horizontal distance between these two points.',
    conceptUsed: 'Quadratic in time: y(t) = (u\\sin\\theta)t - \\frac{1}{2}gt^2',
    kotaShortcut: 'Sum of roots t_1 + t_2 = \\frac{2u\\sin\\theta}{g} = T_{\\text{total}}! Product t_1 t_2 = \\frac{2h}{g}.',
    solutionLatex: [
      'h = (u\\sin\\theta)t - \\frac{1}{2}gt^2 \\implies \\frac{1}{2}gt^2 - (u\\sin\\theta)t + h = 0',
      't^2 - \\left(\\frac{2u\\sin\\theta}{g}\\right)t + \\frac{2h}{g} = 0',
      't_1 + t_2 = \\frac{2u\\sin\\theta}{g} = T_{\\text{flight}}',
      't_1 t_2 = \\frac{2h}{g} = \\frac{2(15)}{10} = 3.0 \\text{ s}^2',
      '\\Delta x = u_x (t_2 - t_1) = (u\\cos\\theta)\\sqrt{(t_1+t_2)^2 - 4t_1 t_2}'
    ],
    solutionExplanation: 'The quadratic equation in t governs every height h < H_max. By Vieta\'s formulas, sum of roots is the total flight time T, and product of roots is 2h/g independent of angle theta!',
    takeaway: 'Any horizontal chord across a parabolic trajectory has t_1 + t_2 = T and t_1 t_2 = 2h/g.',
    examTarget: ['all'],
  },
  {
    examTag: 'JEE Advanced / Main',
    title: 'Projectile Striking Incline Perpendicularly',
    problem: 'A particle is projected from the base of an incline of angle \\beta with speed u at angle \\alpha to the horizontal. If it strikes the inclined plane perpendicularly, prove that \\tan\\alpha = 2\\tan\\beta + \\cot\\beta.',
    conceptUsed: 'Perpendicular impact condition: v_x\' = 0 along the inclined plane at impact',
    kotaShortcut: 'Along the incline: v_x\' = u\\cos(\\alpha-\\beta) - (g\\sin\\beta)T = 0.',
    solutionLatex: [
      'T = \\frac{2u\\sin(\\alpha-\\beta)}{g\\cos\\beta}',
      'v_x\' = u\\cos(\\alpha-\\beta) - (g\\sin\\beta)T = 0',
      'u\\cos(\\alpha-\\beta) = (g\\sin\\beta)\\frac{2u\\sin(\\alpha-\\beta)}{g\\cos\\beta}',
      '\\cot(\\alpha-\\beta) = 2\\tan\\beta',
      '\\frac{1 + \\tan\\alpha\\tan\\beta}{\\tan\\alpha - \\tan\\beta} = 2\\tan\\beta',
      '\\tan\\alpha = 2\\tan\\beta + \\cot\\beta'
    ],
    solutionExplanation: 'At perpendicular landing, the velocity component parallel to the inclined plane vanishes (v_x\' = 0). Equating this to zero using the flight time T yields the classic JEE Advanced relationship.',
    takeaway: 'Incline projectiles become 1D problems when axes are rotated along and perpendicular to the incline.',
    examTarget: ['jee_adv', 'jee_main'],
  },
];

export const kinematics2dExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Moderate',
    keyFocus: 'Trajectory equation y = x tanθ(1 - x/R), river-boat shortest path/drift, complementary angles, horizontal projections from height.',
  },
  jeeAdv: {
    weightage: '1 – 2 Questions (~4 to 6 Marks)',
    difficulty: 'Hard (Incline Plane & Oblique Vectors)',
    keyFocus: 'Projectiles on inclined planes, perpendicular impact, minimum distance of approach, variable acceleration 2D motion.',
  },
  neet: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Easy to Moderate',
    keyFocus: 'Direct formulas for Range, Max Height, Time of Flight, Complementary angles R = 4√(H1 H2), Rain-umbrella angle tanθ = v_man / v_rain.',
  },
};

export const kinematics2dChecklist: string[] = [
  'Independence of horizontal (ax = 0) and vertical (ay = -g) motion',
  'Ground-to-ground formulas: T = 2uy/g, H = uy^2/2g, R = 2ux uy/g',
  'Factored trajectory equation: y = x tanθ (1 - x/R)',
  'Complementary angles giving equal range (R = 4√(H1 H2))',
  'Horizontal projection from cliff of height H (Range = u√(2H/g))',
  'Incline projectile coordinates (ax = -g sinβ, ay = -g cosβ)',
  'Condition for projectile to hit incline perpendicularly',
  'River-boat: Crossing in minimum time (head perpendicular to bank)',
  'River-boat: Crossing with zero drift (sinθ = vr/vb upstream)',
  'Rain-umbrella relative velocity vector subtraction (v_rel = v_r - v_m)',
];
