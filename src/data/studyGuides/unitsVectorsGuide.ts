import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const unitsVectorsFormulaSheet: FormulaItem[] = [
  {
    title: 'Universal Gravitational Constant (G)',
    latex: '[G] = [M^{-1} L^3 T^{-2}], \\quad \\text{SI: } \\text{N}\\cdot\\text{m}^2/\\text{kg}^2',
    conditions: 'Derived from Newton\'s Law of Gravitation: F = G m_1 m_2 / r^2',
    shortcut: 'Remember force is [MLT^{-2}], multiply by L^2 and divide by M^2.',
    examTarget: ['jee_main', 'neet'],
  },
  {
    title: 'Planck\'s Constant (h)',
    latex: '[h] = [M L^2 T^{-1}], \\quad \\text{SI: } \\text{J}\\cdot\\text{s} = \\text{kg}\\cdot\\text{m}^2/\\text{s}',
    conditions: 'Derived from photon energy E = h\\nu = hc/\\lambda or de Broglie \\lambda = h/p',
    shortcut: 'Same dimensions as Angular Momentum L = mvr!',
    examTarget: ['jee_main', 'jee_adv', 'neet'],
  },
  {
    title: 'Permittivity of Free Space (ε₀)',
    latex: '[\\epsilon_0] = [M^{-1} L^{-3} T^4 A^2], \\quad \\text{SI: } \\text{C}^2/(\\text{N}\\cdot\\text{m}^2) = \\text{F/m}',
    conditions: 'Coulomb\'s Law: F = \\frac{1}{4\\pi\\epsilon_0}\\frac{q_1 q_2}{r^2}',
    shortcut: 'Recall q = [AT], F = [MLT^{-2}]. Dimension of charge squared over force × area.',
    examTarget: ['jee_main', 'neet'],
  },
  {
    title: 'Permeability of Free Space (μ₀)',
    latex: '[\\mu_0] = [M L T^{-2} A^{-2}], \\quad \\text{SI: } \\text{T}\\cdot\\text{m/A} = \\text{H/m}',
    conditions: 'From speed of light relation: c = 1/\\sqrt{\\mu_0 \\epsilon_0}',
    shortcut: 'Combination: [\\mu_0 \\epsilon_0] = [c^{-2}] = [L^{-2} T^2].',
    examTarget: ['jee_main', 'jee_adv', 'neet'],
  },
  {
    title: 'Error Propagation in Power Formula',
    latex: 'Z = \\frac{A^p B^q}{C^r} \\implies \\frac{\\Delta Z}{Z} = p\\left(\\frac{\\Delta A}{A}\\right) + q\\left(\\frac{\\Delta B}{B}\\right) + r\\left(\\frac{\\Delta C}{C}\\right)',
    conditions: 'Valid for fractional errors \\le 5-10%. Errors in measurement always ADD UP to give maximum error.',
    shortcut: 'Never subtract denominator errors! Exponent powers become multipliers in percentage error.',
    examTarget: ['all'],
  },
  {
    title: 'Parallelogram Law of Vector Addition',
    latex: 'R = \\sqrt{A^2 + B^2 + 2AB\\cos\\theta}, \\quad \\tan\\alpha = \\frac{B\\sin\\theta}{A + B\\cos\\theta}',
    conditions: '\\theta is angle between vectors tail-to-tail. \\alpha is angle of resultant with \\vec{A}.',
    shortcut: 'If |A| = |B|, then R = 2A\\cos(\\theta/2) and \\alpha = \\theta/2 (resultant bisects the angle!).',
    examTarget: ['all'],
  },
  {
    title: 'Scalar (Dot) and Vector (Cross) Products',
    latex: '\\vec{A}\\cdot\\vec{B} = AB\\cos\\theta, \\quad |\\vec{A}\\times\\vec{B}| = AB\\sin\\theta',
    conditions: '\\vec{A}\\cdot\\vec{B} = 0 \\iff \\vec{A}\\perp\\vec{B}; \\quad \\vec{A}\\times\\vec{B} = 0 \\iff \\vec{A}\\parallel\\vec{B}',
    shortcut: 'Component form: \\vec{A}\\cdot\\vec{B} = A_x B_x + A_y B_y + A_z B_z. Unit normal \\hat{n} = \\frac{\\vec{A}\\times\\vec{B}}{|\\vec{A}\\times\\vec{B}|}.',
    examTarget: ['all'],
  },
];

export const unitsVectorsExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Units vs Dimensions (The Plane Angle Fallacy)',
    trap: 'Assuming that if a physical quantity has units, it MUST have physical dimensions.',
    reality: 'Plane angle \\theta = \\text{arc}/\\text{radius} has SI unit radians, but is completely dimensionless [M^0 L^0 T^0]. Similarly, solid angle has unit steradians but zero dimension.',
    severity: 'high',
    examTarget: ['jee_main', 'neet'],
  },
  {
    title: 'Vector Subtraction Exponent & Order Trap',
    trap: 'Writing |\\vec{A} - \\vec{B}| = \\sqrt{A^2 - B^2 - 2AB\\cos\\theta} or assuming \\vec{A}\\times\\vec{B} = \\vec{B}\\times\\vec{A}.',
    reality: '|\\vec{A} - \\vec{B}| = \\sqrt{A^2 + B^2 - 2AB\\cos\\theta}. Notice A^2 and B^2 are always POSITIVE! Also, cross product is anti-commutative: \\vec{A}\\times\\vec{B} = -(\\vec{B}\\times\\vec{A}).',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Direction Angle Denominator Trap',
    trap: 'Calculating \\tan\\alpha = \\frac{A\\sin\\theta}{B + A\\cos\\theta} when asked the angle with vector \\vec{A}.',
    reality: 'The vector with which the angle is measured is the one that stands alone in the denominator: with \\vec{A}, \\tan\\alpha = \\frac{B\\sin\\theta}{A + B\\cos\\theta}. With \\vec{B}, \\tan\\beta = \\frac{A\\sin\\theta}{B + A\\cos\\theta}.',
    severity: 'high',
    examTarget: ['jee_main', 'neet'],
  },
];

export const unitsVectorsPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2024 / NEET',
    title: 'Deduction of Surface Tension Period Formula',
    problem: 'The time period T of a liquid drop depends on surface tension S, density \\rho, and radius r. Using dimensional analysis, find the relation T \\propto S^a \\rho^b r^c.',
    conceptUsed: 'Principle of Dimensional Homogeneity: [LHS] = [RHS]',
    kotaShortcut: 'Surface tension S has dimension [MT^{-2}]. To get time T, we need S^{-1/2} since [T] appears only in S. Hence a = -1/2 directly!',
    solutionLatex: [
      '[T] = [T]^1',
      '[S] = [M L^0 T^{-2}], \\quad [\\rho] = [M L^{-3} T^0], \\quad [r] = [M^0 L^1 T^0]',
      '[T]^1 = [M]^{a+b} [L]^{-3b+c} [T]^{-2a}',
      '-2a = 1 \\implies a = -1/2',
      'a + b = 0 \\implies b = 1/2',
      '-3b + c = 0 \\implies c = 3/2',
      'T \\propto \\sqrt{\\frac{\\rho r^3}{S}}'
    ],
    solutionExplanation: 'Equating powers of M, L, and T independently yields a system of three linear equations. Solving gives a = -1/2, b = 1/2, c = 3/2.',
    takeaway: 'In JEE Main and NEET, look for the unique dimension (here time T only appears in surface tension) to crack the power in seconds.',
    examTarget: ['jee_main', 'neet'],
  },
  {
    examTag: 'JEE Advanced / Main',
    title: 'Maximum Percentage Error in Density of Cylinder',
    problem: 'The mass of a solid wire is (0.3 \\pm 0.003) g, radius is (0.5 \\pm 0.005) mm, and length is (6.0 \\pm 0.06) cm. Find the maximum percentage error in the measurement of its density.',
    conceptUsed: 'Logarithmic Differentiation of Density \\rho = m / (\\pi r^2 L)',
    kotaShortcut: '% Error = % Error(m) + 2 × % Error(r) + % Error(L)',
    solutionLatex: [
      '\\rho = \\frac{m}{\\pi r^2 L}',
      '\\frac{\\Delta \\rho}{\\rho}\\times 100 = \\left(\\frac{\\Delta m}{m} + 2\\frac{\\Delta r}{r} + \\frac{\\Delta L}{L}\\right)\\times 100',
      '\\% \\Delta m = \\frac{0.003}{0.3}\\times 100 = 1\\%',
      '\\% \\Delta r = \\frac{0.005}{0.5}\\times 100 = 1\\% \\implies 2\\% \\Delta r = 2\\%',
      '\\% \\Delta L = \\frac{0.06}{6.0}\\times 100 = 1\\%',
      '\\% \\Delta \\rho = 1\\% + 2(1\\%) + 1\\% = 4\\%'
    ],
    solutionExplanation: 'Radius enters with power 2 in the volume \\pi r^2 L, contributing twice its percentage error. Total maximum error is 1% + 2% + 1% = 4%.',
    takeaway: 'Variables with higher powers contribute the most error. Always measure radius with high precision instruments (screw gauge).',
    examTarget: ['all'],
  },
];

export const unitsVectorsExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Easy to Moderate',
    keyFocus: 'Vernier callipers, screw gauge, dimensional formulas of modern physics constants, and error propagation in experimental setups.',
  },
  jeeAdv: {
    weightage: '1 Question (~3 to 4 Marks)',
    difficulty: 'Moderate (Experimental Physics)',
    keyFocus: 'Significant figures, systematic vs random errors, least count of advanced measuring apparatus, and multi-variable dimensional limits.',
  },
  neet: {
    weightage: '2 – 3 Questions (~8 to 12 Marks)',
    difficulty: 'Easy (High Speed Formula Direct)',
    keyFocus: 'Direct matching of dimensional formulas, percentage error calculation, and dot/cross product angle tests.',
  },
};

export const unitsVectorsChecklist: string[] = [
  '7 SI Base Dimensions & Derived Quantities',
  'Dimensional Formulas of G, h, ε₀, μ₀, η, and R',
  'Principle of Dimensional Homogeneity',
  'Fractional & Percentage Error Propagation (Z = A^p B^q / C^r)',
  'Least Count & Reading of Vernier Callipers & Screw Gauge',
  'Vector Addition: Triangle & Parallelogram Laws',
  'Resolution of Vector into 2D & 3D Components',
  'Scalar (Dot) Product & Projection of A along B',
  'Vector (Cross) Product & Unit Normal Vector',
  'Differentiation & Maxima/Minima Criteria for Physics',
];
