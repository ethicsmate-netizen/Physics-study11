import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const shmFormulaSheet: FormulaItem[] = [
  {
    title: 'Fundamental Kinematic Relations of SHM',
    latex: 'x = A\\sin(\\omega t + \\phi), \\quad v = \\omega\\sqrt{A^2 - x^2}, \\quad a = -\\omega^2 x, \\quad \\frac{d^2x}{dt^2} + \\omega^2 x = 0',
    conditions: 'Linear restoring force F = -kx. Valid for small amplitude oscillations.',
    shortcut: 'Max velocity v_{\\max} = A\\omega at mean position (x = 0). Max acceleration a_{\\max} = A\\omega^2 at extreme positions (x = \\pm A).',
    examTarget: ['all'],
  },
  {
    title: 'Phasor Circle (Reference Circle) Time Intervals',
    latex: 't_{0 \\to A/2} = \\frac{T}{12}, \\quad t_{A/2 \\to A} = \\frac{T}{6}, \\quad t_{0 \\to A/\\sqrt{2}} = \\frac{T}{8}',
    conditions: 'Reference circle of radius A revolving with constant angular velocity \\omega.',
    shortcut: 'The particle speeds through the center (0 to A/2 takes only T/12), but slows down near the turning point (A/2 to A takes twice as long: T/6)!',
    examTarget: ['all'],
  },
  {
    title: 'Energy Cycles & Average Energy Formulas',
    latex: 'U = \\frac{1}{2}m\\omega^2 x^2, \\quad K = \\frac{1}{2}m\\omega^2(A^2 - x^2), \\quad E = \\frac{1}{2}kA^2 = \\text{constant}',
    conditions: 'Conservative oscillator with no damping.',
    shortcut: 'Average over one complete period: \\langle K \\rangle = \\langle U \\rangle = \\frac{1}{4}kA^2 = \\frac{1}{2}E_{\\text{total}}. K and U oscillate at TWICE the frequency of displacement: f_{\\text{energy}} = 2 f_{\\text{motion}}!',
    examTarget: ['all'],
  },
  {
    title: 'Spring Combinations & Reduced Mass Two-Body System',
    latex: 'k_{\\text{series}} = \\frac{k_1 k_2}{k_1 + k_2}, \\quad k_{\\text{parallel}} = k_1 + k_2, \\quad T = 2\\pi\\sqrt{\\frac{\\mu}{k}} \\quad \\left(\\mu = \\frac{m_1 m_2}{m_1 + m_2}\\right)',
    conditions: 'Two masses m1 and m2 connected by spring of constant k on a frictionless horizontal floor.',
    shortcut: 'Cutting a spring of constant k into two equal halves gives each piece a new spring constant of k\' = 2k! Period becomes T\' = T/\\sqrt{2}.',
    examTarget: ['all'],
  },
  {
    title: 'Simple & Compound (Physical) Pendulums',
    latex: 'T_{\\text{simple}} = 2\\pi\\sqrt{\\frac{L}{g}}, \\quad T_{\\text{compound}} = 2\\pi\\sqrt{\\frac{I}{mgd}} = 2\\pi\\sqrt{\\frac{L_{\\text{eq}}}{g}} \\quad \\left(L_{\\text{eq}} = \\frac{k^2}{d} + d\\right)',
    conditions: 'Simple pendulum holds strictly for small angular amplitudes \\theta \\le 4^\\circ - 10^\\circ (\\sin\\theta \\approx \\theta).',
    shortcut: 'In an accelerating frame (e.g. lift), replace g with g_eff. In ascending lift with acceleration a: T = 2\\pi\\sqrt{L/(g+a)} (period decreases, pendulum ticks faster!).',
    examTarget: ['all'],
  },
];

export const shmExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Frequency of Energy Oscillation vs Displacement Oscillation',
    trap: 'Assuming that kinetic energy and potential energy oscillate with the same frequency f as the particle displacement.',
    reality: 'Since K \\propto \\cos^2(\\omega t) = \\frac{1 + \\cos(2\\omega t)}{2}, kinetic and potential energy complete TWO full cycles for every single cycle of particle motion: f_{\\text{energy}} = 2 f_{\\text{motion}} and T_{\\text{energy}} = T / 2. This is one of the most common -1 mark traps in JEE Main & NEET!',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Spring-Mass Period in Different Gravity Environments',
    trap: 'Thinking that a spring-mass oscillator has a different time period on the Moon or inside an accelerating elevator.',
    reality: 'Time period of an ideal spring-mass system is T = 2\\pi\\sqrt{m/k}. It depends ONLY on mass m and spring constant k. It is 100% INDEPENDENT OF GRAVITY! Gravity only shifts the equilibrium position, but leaves period T unchanged.',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Cutting a Spring in Halves',
    trap: 'Believing that cutting a spring of stiffness k in half reduces its spring constant to k/2.',
    reality: 'Spring constant is INVERSELY proportional to length (k L = constant). When length is halved (L\' = L/2), stiffness DOUBLES: k\' = 2k! A shorter spring is much stiffer.',
    severity: 'high',
    examTarget: ['jee_main', 'neet'],
  },
];

export const shmPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2024 / NEET',
    title: 'Time Taken to Travel from Mean to A/2 vs A/2 to A',
    problem: 'A particle executes linear SHM with amplitude A and total time period T = 12 s. Starting from the mean position x = 0 at t = 0 moving in the positive direction, find: (a) time t_1 to reach x = A/2, and (b) time t_2 to travel from x = A/2 to x = A.',
    conceptUsed: 'Phasor Circle Reference Angle: x = A sin(ω t)',
    kotaShortcut: '0 to A/2 corresponds to 30° (T/12). A/2 to A corresponds to 60° (T/6).',
    solutionLatex: [
      'x(t_1) = A\\sin(\\omega t_1) = \\frac{A}{2} \\implies \\sin(\\omega t_1) = \\frac{1}{2} \\implies \\omega t_1 = \\frac{\\pi}{6}',
      't_1 = \\frac{\\pi / 6}{2\\pi / T} = \\frac{T}{12} = \\frac{12}{12} = 1.0 \\text{ s}',
      'x(t_{\\text{apex}}) = A \\implies \\omega t_{\\text{apex}} = \\frac{\\pi}{2} \\implies t_{\\text{apex}} = \\frac{T}{4} = 3.0 \\text{ s}',
      't_2 = t_{\\text{apex}} - t_1 = \\frac{T}{4} - \\frac{T}{12} = \\frac{T}{6} = \\frac{12}{6} = 2.0 \\text{ s}'
    ],
    solutionExplanation: 'Because the particle decelerates as it approaches the turning point A, traveling the second half of the amplitude (A/2 to A) takes twice as long (2 s) as the first half (1 s).',
    takeaway: 'Never use constant speed! Always use phasor circle angles: 0 to A/2 takes T/12; A/2 to A takes T/6.',
    examTarget: ['all'],
  },
  {
    examTag: 'JEE Advanced',
    title: 'Two Blocks Connected by a Spring on Frictionless Floor',
    problem: 'Two blocks of masses m_1 = 1 kg and m_2 = 3 kg are connected by a spring of spring constant k = 300 N/m on a frictionless table. The spring is compressed by x_0 = 0.2 m and released. Find the time period of oscillation and the maximum speed of each block.',
    conceptUsed: 'Center of Mass Frame: Two-body system oscillates with Reduced Mass \\mu = m_1 m_2 / (m_1 + m_2)',
    kotaShortcut: 'T = 2\\pi\\sqrt{\\mu / k}. Conservation of momentum gives m_1 v_1 = m_2 v_2.',
    solutionLatex: [
      '\\mu = \\frac{m_1 m_2}{m_1 + m_2} = \\frac{(1)(3)}{1 + 3} = \\frac{3}{4} \\text{ kg} = 0.75 \\text{ kg}',
      'T = 2\\pi\\sqrt{\\frac{\\mu}{k}} = 2\\pi\\sqrt{\\frac{0.75}{300}} = 2\\pi\\sqrt{\\frac{1}{400}} = \\frac{2\\pi}{20} = \\frac{\\pi}{10} \\approx 0.314 \\text{ s}',
      '\\text{Energy Conservation at Mean Position: } \\frac{1}{2}k x_0^2 = \\frac{1}{2}\\mu v_{\\text{rel}}^2',
      'v_{\\text{rel}} = x_0 \\sqrt{\\frac{k}{\\mu}} = 0.2 \\sqrt{\\frac{300}{0.75}} = 0.2 \\sqrt{400} = 4.0 \\text{ m/s}',
      'v_1 = \\frac{m_2}{m_1 + m_2} v_{\\text{rel}} = \\frac{3}{4}(4.0) = 3.0 \\text{ m/s}, \\quad v_2 = \\frac{m_1}{m_1 + m_2} v_{\\text{rel}} = 1.0 \\text{ m/s}'
    ],
    solutionExplanation: 'The center of mass remains completely stationary throughout the oscillation. Replacing the two-body interaction with a single reduced mass \\mu simplifies both period and maximum velocity derivations.',
    takeaway: 'For any two-body spring system: T = 2π√(μ/k). Center of mass does not oscillate.',
    examTarget: ['jee_adv', 'jee_main'],
  },
];

export const shmExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Moderate',
    keyFocus: 'Phasor circle time intervals, spring combinations (series/parallel), simple pendulum in accelerating lift, energy frequency relation.',
  },
  jeeAdv: {
    weightage: '1 – 2 Questions (~4 to 6 Marks)',
    difficulty: 'Hard (Reduced Mass & Damped Resonance)',
    keyFocus: 'Two-body spring oscillations, liquid column U-tube oscillations, physical pendulum radius of gyration, torsional pendulum.',
  },
  neet: {
    weightage: '2 Questions (~8 Marks)',
    difficulty: 'Easy to Moderate',
    keyFocus: 'Direct period formula T = 2π√(m/k) and T = 2π√(L/g), velocity at position x (v = ω√(A^2 - x^2)), average energy over one cycle.',
  },
};

export const shmChecklist: string[] = [
  'SHM definition: F = -kx and differential equation d^2x/dt^2 + ω^2 x = 0',
  'Kinematic equations: x(t) = A sin(ωt + φ), v(x) = ω√(A^2 - x^2), a(x) = -ω^2 x',
  'Phasor circle method for evaluating time intervals between positions',
  'Travel times: 0 to A/2 is T/12; A/2 to A is T/6',
  'Kinetic and potential energy cycles & average energy (1/4 k A^2)',
  'Frequency of energy oscillation is 2f (twice the motion frequency)',
  'Spring combinations (k_series = k1 k2 / (k1+k2), k_parallel = k1 + k2)',
  'Cutting spring rule (half length means 2k stiffness)',
  'Two-body spring oscillator using reduced mass μ = m1 m2 / (m1 + m2)',
  'Simple pendulum (T = 2π√(L/g_eff)) in elevator and incline frames',
];
