import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const kinematics1dFormulaSheet: FormulaItem[] = [
  {
    title: 'Calculus Definitions of Velocity & Acceleration',
    latex: 'v = \\frac{dx}{dt}, \\quad a = \\frac{dv}{dt} = \\frac{d^2x}{dt^2} = v\\frac{dv}{dx}',
    conditions: 'Always valid for 1D rectilinear motion (even when acceleration is variable).',
    shortcut: 'When acceleration is given as a function of position a(x), always use a = v(dv/dx) and integrate \\int v dv = \\int a(x) dx.',
    examTarget: ['all'],
  },
  {
    title: 'Equations of Motion (Constant Acceleration)',
    latex: 'v = u + at, \\quad s = ut + \\frac{1}{2}at^2, \\quad v^2 = u^2 + 2as, \\quad s_n = u + \\frac{a}{2}(2n - 1)',
    conditions: 'STRICTLY valid ONLY when acceleration a = \\text{constant} in both magnitude and direction.',
    shortcut: 'Galileo\'s Odd Number Law: For body starting from rest with constant a, distances in successive equal time intervals are in ratio 1 : 3 : 5 : 7 : 9...',
    examTarget: ['all'],
  },
  {
    title: 'Stopping Distance & Stopping Time',
    latex: 's_{\\text{stop}} = \\frac{u^2}{2a}, \\quad t_{\\text{stop}} = \\frac{u}{a}',
    conditions: 'When retarded by constant deceleration a (e.g., brakes or friction).',
    shortcut: 'Stopping distance is proportional to u^2! If speed doubles, stopping distance quadruples (4x). If reaction time t_r is present: s = u t_r + u^2/(2a).',
    examTarget: ['jee_main', 'neet'],
  },
  {
    title: 'Vertical Motion Under Gravity (Symmetric Flight)',
    latex: 't_{\\text{ascent}} = t_{\\text{descent}} = \\frac{u}{g}, \\quad T_{\\text{total}} = \\frac{2u}{g}, \\quad H_{\\max} = \\frac{u^2}{2g}',
    conditions: 'Ideal projectile in vacuum (air resistance neglected), uniform gravity g.',
    shortcut: 'Speed at any height h during upward journey equals speed at same height h during downward journey: |v| = \\sqrt{u^2 - 2gh}.',
    examTarget: ['jee_main', 'neet'],
  },
  {
    title: 'Calculus Motion Graph Transformations',
    latex: '\\text{Slope}(x-t) = v, \\quad \\text{Slope}(v-t) = a, \\quad \\int v\\,dt = \\Delta x, \\quad \\int a\\,dt = \\Delta v',
    conditions: 'General kinematics curves.',
    shortcut: 'Area under v-t graph above time axis is positive displacement; area below is negative. Total distance = sum of absolute areas.',
    examTarget: ['all'],
  },
];

export const kinematics1dExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Constant Acceleration Formula with Variable Acceleration',
    trap: 'Using v^2 = u^2 + 2as when acceleration depends on time (e.g. a = 3t^2) or velocity (a = -kv).',
    reality: 'You CANNOT use kinematic formulas when a is not constant. You MUST set up differential equations: \\int dv = \\int a(t) dt or \\int v dv = \\int a(x) dx.',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Average Speed vs Magnitude of Average Velocity',
    trap: 'Assuming Average Speed = |Average Velocity| when a particle reverses its direction of motion.',
    reality: 'Average Speed = (Total Distance) / \\Delta t, while Average Velocity = (Net Displacement) / \\Delta t. They are equal ONLY if the particle moves strictly in a straight line without reversing direction.',
    severity: 'high',
    examTarget: ['jee_main', 'neet'],
  },
  {
    title: 'Sign Convention in Ball Thrown From Tower Top',
    trap: 'Setting displacement as +H when a ball is thrown upwards from a tower of height H and lands on the ground below.',
    reality: 'Taking initial release point as origin and upwards as positive: final ground position is y = -H. The displacement equation is -H = ut - \\frac{1}{2}gt^2.',
    severity: 'critical',
    examTarget: ['all'],
  },
];

export const kinematics1dPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2023 / NEET',
    title: 'Meeting of Two Balls Under Gravity',
    problem: 'Ball A is dropped from the top of a tower of height H = 80 m. Simultaneously, ball B is projected vertically upwards from the base with speed u = 40 m/s. Find when and where the two balls meet (take g = 10 m/s²).',
    conceptUsed: 'Relative Motion in 1D: a_{rel} = g - g = 0 (Uniform Relative Motion)',
    kotaShortcut: 'Since both balls experience the same downward gravity g, their relative acceleration is ZERO! Hence relative speed is constant: v_{rel} = u. Meeting time t = H / u instantly!',
    solutionLatex: [
      'a_{\\text{rel}} = g - g = 0 \\implies v_{\\text{rel}} = u - 0 = 40 \\text{ m/s}',
      't_{\\text{meet}} = \\frac{\\text{Initial Relative Separation}}{v_{\\text{rel}}} = \\frac{80}{40} = 2.0 \\text{ s}',
      'y_A = \\frac{1}{2}g t^2 = \\frac{1}{2}(10)(2)^2 = 20 \\text{ m (from top)}',
      '\\text{Height above ground } = 80 - 20 = 60 \\text{ m}'
    ],
    solutionExplanation: 'Using relative motion eliminates the quadratic t^2 term entirely, turning a 2-minute algebra problem into a 10-second mental calculation.',
    takeaway: 'For any two particles moving under gravity alone, a_rel = 0. They approach each other with constant relative velocity.',
    examTarget: ['all'],
  },
  {
    examTag: 'JEE Advanced / Main',
    title: 'Velocity-Dependent Deceleration Stopping Problem',
    problem: 'A particle moves with initial velocity u along x-axis. Its deceleration is given by a = -\\alpha \\sqrt{v}, where \\alpha > 0. Find the total distance covered and the time taken before coming to rest.',
    conceptUsed: 'Calculus Form: a = dv/dt for time, and a = v(dv/dx) for distance',
    kotaShortcut: 'Integrate directly with limits u to 0.',
    solutionLatex: [
      '\\frac{dv}{dt} = -\\alpha v^{1/2} \\implies \\int_u^0 v^{-1/2} dv = -\\alpha \\int_0^T dt',
      '\\left[2v^{1/2}\\right]_u^0 = -\\alpha T \\implies T = \\frac{2\\sqrt{u}}{\\alpha}',
      'v\\frac{dv}{dx} = -\\alpha v^{1/2} \\implies v^{1/2} dv = -\\alpha dx',
      '\\int_u^0 v^{1/2} dv = -\\alpha \\int_0^S dx \\implies \\left[\\frac{2}{3}v^{3/2}\\right]_u^0 = -\\alpha S',
      'S = \\frac{2 u^{3/2}}{3\\alpha}'
    ],
    solutionExplanation: 'For time, use dv/dt = a(v). For distance, use v(dv/dx) = a(v). Integrating both with limits from u to 0 gives exact stopping time and distance.',
    takeaway: 'Master both forms of acceleration: a = dv/dt (time link) and a = v dv/dx (space/distance link).',
    examTarget: ['jee_adv', 'jee_main'],
  },
];

export const kinematics1dExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '1 Question (~4 Marks)',
    difficulty: 'Moderate (Calculus or Graph Based)',
    keyFocus: 'Motion under gravity with air resistance or elevator frame, parsing area/slope of v-t and a-t graphs, stopping distance.',
  },
  jeeAdv: {
    weightage: '1 Question (~3 to 4 Marks)',
    difficulty: 'Moderate to Hard (Multi-particle / Calculus)',
    keyFocus: 'Variable acceleration a(v) or a(x), relative pursuit in 1D, piecewise non-linear motion graphs.',
  },
  neet: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Easy (Direct Formula & Galileo Ratios)',
    keyFocus: 'Displacement in n-th second, height of tower, ratio of distance in successive seconds, stopping distance proportional to u^2.',
  },
};

export const kinematics1dChecklist: string[] = [
  'Distance vs Displacement & Speed vs Velocity definitions',
  'Calculus definitions: v = dx/dt, a = dv/dt = v dv/dx',
  'Three kinematic equations under constant acceleration',
  'Displacement in n-th second formula (s_n = u + a/2(2n-1))',
  'Galileo\'s odd-number distance ratio (1 : 3 : 5 : 7)',
  'Stopping distance (s ∝ u^2) & Driver reaction time',
  'Symmetric vertical flight under gravity (ascent = descent)',
  'Ball thrown from tower of height H with sign conventions',
  'Calculus graph slopes (x-t slope = v, v-t slope = a)',
  'Calculus graph areas (v-t area = displacement, a-t area = Δv)',
];
