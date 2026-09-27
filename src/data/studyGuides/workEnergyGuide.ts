import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const workEnergyFormulaSheet: FormulaItem[] = [
  {
    title: 'Work-Kinetic Energy Theorem (Universal)',
    latex: 'W_{\\text{all}} = W_{\\text{conservative}} + W_{\\text{non-conservative}} + W_{\\text{pseudo}} = \\Delta K = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2',
    conditions: 'Universally valid for single particles and rigid bodies in both inertial and non-inertial frames.',
    shortcut: 'Whenever finding final speed or displacement with variable forces or friction, Work-Energy Theorem eliminates the need to integrate acceleration!',
    examTarget: ['all'],
  },
  {
    title: 'Conservative Force & Potential Energy Gradient',
    latex: '\\vec{F} = -\\nabla U = -\\left(\\frac{\\partial U}{\\partial x}\\hat{i} + \\frac{\\partial U}{\\partial y}\\hat{j} + \\frac{\\partial U}{\\partial z}\\hat{k}\\right)',
    conditions: 'Valid strictly for conservative forces (gravity, electrostatic, ideal springs). Path independent: \\oint \\vec{F}\\cdot d\\vec{r} = 0.',
    shortcut: 'In 1D: F_x = -\\frac{dU}{dx}. Force is the negative slope of potential energy curve U(x).',
    examTarget: ['all'],
  },
  {
    title: 'Equilibrium & Stability Conditions',
    latex: '\\text{Equilibrium: } \\frac{dU}{dx} = 0; \\quad \\text{Stable: } \\frac{d^2U}{dx^2} > 0; \\quad \\text{Unstable: } \\frac{d^2U}{dx^2} < 0',
    conditions: 'At stable equilibrium (local minimum of U), small disturbances produce SHM with \\omega = \\sqrt{\\frac{U\'\'(x_0)}{m}}.',
    shortcut: 'Bowl bottom = Stable (d^2U/dx^2 > 0). Hill peak = Unstable (d^2U/dx^2 < 0). Flat table = Neutral (d^2U/dx^2 = 0).',
    examTarget: ['all'],
  },
  {
    title: 'Spring Potential Energy & Work Done',
    latex: 'U_{\\text{spring}} = \\frac{1}{2}kx^2, \\quad W_{\\text{spring}} = -\\frac{1}{2}k(x_f^2 - x_i^2)',
    conditions: 'x is extension or compression measured from the unstretched natural length (x = 0).',
    shortcut: 'Work done BY the spring is negative when extending or compressing away from natural length; positive when returning towards natural length.',
    examTarget: ['all'],
  },
  {
    title: 'Instantaneous vs Average Power',
    latex: 'P = \\vec{F}\\cdot\\vec{v} = F v \\cos\\theta = \\frac{dW}{dt}, \\quad P_{\\text{avg}} = \\frac{W_{\\text{total}}}{\\Delta t}',
    conditions: 'P is rate of doing work in Watts (J/s). 1 hp = 746 W.',
    shortcut: 'If a car moves with CONSTANT ACCELERATION from rest: P(t) = F v = (ma)(at) = ma^2 t. Power increases linearly with time! Average power is exactly half: P_avg = \\frac{1}{2}ma^2 t.',
    examTarget: ['all'],
  },
];

export const workEnergyExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Assuming Normal Force Never Does Work',
    trap: 'Believing that Normal force work is ALWAYS zero because N is perpendicular to the contacting surface.',
    reality: 'Normal force is perpendicular to the surface, but the surface itself may be moving! In an accelerating elevator, N does positive work on a person while ascending. On a moving wedge, normal force transfers energy between block and wedge.',
    severity: 'critical',
    examTarget: ['jee_adv', 'jee_main'],
  },
  {
    title: 'Constant Power vs Constant Acceleration Confusion',
    trap: 'Assuming an engine with constant power P delivers constant acceleration a.',
    reality: 'If Power P = F v = constant, then F = P/v. As velocity v increases, force F DECREASES! Acceleration a = P/(mv) is inversely proportional to speed, not constant.',
    severity: 'high',
    examTarget: ['all'],
  },
  {
    title: 'Sign of Spring Work Done vs Stored Energy',
    trap: 'Writing W_spring = + 1/2 k x^2 when a spring is stretched by x.',
    reality: 'The work done BY the restoring spring force is NEGATIVE: W = -1/2 k x^2. The work done by the external agent against the spring is +1/2 k x^2, which equals the stored potential energy \\Delta U.',
    severity: 'high',
    examTarget: ['jee_main', 'neet'],
  },
];

export const workEnergyPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2024 / NEET',
    title: 'Maximum Compression of Spring on Rough Floor',
    problem: 'A block of mass m = 2 kg moving with speed u = 4 m/s hits a horizontal spring of spring constant k = 400 N/m. The floor is rough with coefficient of friction \\mu = 0.2. Find the maximum compression x of the spring (g = 10 m/s²).',
    conceptUsed: 'Work-Kinetic Energy Theorem: W_spring + W_friction = \\Delta K = -1/2 m u^2',
    kotaShortcut: '1/2 k x^2 + \\mu mg x = 1/2 m u^2 (Quadratic in x).',
    solutionLatex: [
      'W_{\\text{spring}} = -\\frac{1}{2}k x^2, \\quad W_{\\text{friction}} = -f_k x = -\\mu mg x',
      'W_{\\text{net}} = -\\left(\\frac{1}{2}k x^2 + \\mu mg x\\right) = 0 - \\frac{1}{2}m u^2',
      '\\frac{1}{2}(400)x^2 + (0.2)(2)(10)x = \\frac{1}{2}(2)(4)^2',
      '200 x^2 + 4 x - 16 = 0 \\implies 50 x^2 + x - 4 = 0',
      'x = \\frac{-1 + \\sqrt{1 - 4(50)(-4)}}{100} = \\frac{-1 + \\sqrt{801}}{100} \\approx \\frac{-1 + 28.3}{100} = 0.273 \\text{ m}'
    ],
    solutionExplanation: 'The initial kinetic energy 1/2 m u^2 = 16 J is partitioned between spring elastic potential energy 1/2 k x^2 and work dissipated by friction \\mu mg x.',
    takeaway: 'Work-Energy Theorem handles both spring and friction simultaneously without setting up differential equations.',
    examTarget: ['all'],
  },
  {
    examTag: 'JEE Advanced',
    title: 'Potential Well Equilibrium & Small Oscillation Frequency',
    problem: 'A particle of mass m moves along x-axis in a conservative potential U(x) = \\frac{a}{x^2} - \\frac{b}{x}, where a, b > 0. Find the equilibrium separation x_0, the binding energy, and the angular frequency \\omega of small oscillations about equilibrium.',
    conceptUsed: 'Equilibrium dU/dx = 0; Effective Spring Constant k_eff = d^2U/dx^2 at x_0',
    kotaShortcut: 'x_0 = 2a/b. Frequency \\omega = \\sqrt{U\'\'(x_0)/m}.',
    solutionLatex: [
      '\\frac{dU}{dx} = -\\frac{2a}{x^3} + \\frac{b}{x^2} = 0 \\implies x_0 = \\frac{2a}{b}',
      'U(x_0) = \\frac{a}{(2a/b)^2} - \\frac{b}{(2a/b)} = \\frac{b^2}{4a} - \\frac{b^2}{2a} = -\\frac{b^2}{4a}',
      '\\text{Binding Energy } E_{\\text{bind}} = |U(x_0)| = \\frac{b^2}{4a}',
      '\\frac{d^2U}{dx^2} = \\frac{6a}{x^4} - \\frac{2b}{x^3}',
      'k_{\\text{eff}} = U\'\'(x_0) = \\frac{6a}{(2a/b)^4} - \\frac{2b}{(2a/b)^3} = \\frac{b^4}{8a^3}',
      '\\omega = \\sqrt{\\frac{k_{\\text{eff}}}{m}} = \\sqrt{\\frac{b^4}{8 m a^3}}'
    ],
    solutionExplanation: 'Differentiating U(x) twice gives both the equilibrium location and the curvature (effective spring constant k_eff). The small oscillation angular frequency is \\sqrt{k_eff / m}.',
    takeaway: 'Any potential minimum behaves as an ideal harmonic oscillator for infinitesimal displacements!',
    examTarget: ['jee_adv'],
  },
];

export const workEnergyExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Moderate',
    keyFocus: 'Work done by variable force \\int F dx, power delivered by pumps and car engines, spring-block energy conservation, vertical loop energy.',
  },
  jeeAdv: {
    weightage: '2 Questions (~6 to 8 Marks)',
    difficulty: 'Hard (Potential Well Stability & Multi-stage)',
    keyFocus: 'Potential energy functions U(r), partial derivative gradient forces, non-conservative work by internal friction, variable mass work.',
  },
  neet: {
    weightage: '2 Questions (~8 Marks)',
    difficulty: 'Easy to Moderate',
    keyFocus: 'Area under F-x graph, work done by spring 1/2 k x^2, power formula P = F·v, stopping distance via work-energy theorem.',
  },
};

export const workEnergyChecklist: string[] = [
  'Work definition: W = F·s cosθ (dot product) & Area under F-x curve',
  'Work done by variable force integral (W = ∫ Fx dx + ∫ Fy dy + ∫ Fz dz)',
  'Universal Work-Kinetic Energy Theorem (W_all = ΔK)',
  'Conservative forces: path independence and closed-loop zero work (∮ F·dr = 0)',
  'Potential energy gradient formula: F = -dU/dx = -∇U',
  'Equilibrium stability criteria: dU/dx = 0, Stable (U\'\' > 0), Unstable (U\'\' < 0)',
  'Small oscillation frequency in potential well: ω = √(U\'\'(x0) / m)',
  'Spring potential energy (U = 1/2 k x^2) & work done by spring',
  'Instantaneous power (P = F·v) vs Average power (P_avg = W/Δt)',
  'Engine delivering constant power vs engine at constant acceleration',
];
