import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const rotationalDynamicsFormulaSheet: FormulaItem[] = [
  {
    title: 'Parallel & Perpendicular Axis Theorems',
    latex: 'I = I_{cm} + M d^2 \\quad (\\text{Parallel Axis}), \\quad I_z = I_x + I_y \\quad (\\text{Perpendicular Axis, 2D Planar Only})',
    conditions: 'In parallel axis theorem, ONE axis MUST pass through the Center of Mass. Perpendicular axis theorem is STRICTLY for 2D flat planar sheets.',
    shortcut: 'Never use perpendicular axis theorem on a sphere or cylinder! For disc: I_diameter = 1/2 I_z = 1/4 M R^2.',
    examTarget: ['all'],
  },
  {
    title: 'The Great Incline Pure Rolling Race Formula',
    latex: 'a = \\frac{g\\sin\\theta}{1 + \\frac{k^2}{R^2}}, \\quad v = \\sqrt{\\frac{2gh}{1 + \\frac{k^2}{R^2}}}, \\quad t = \\frac{1}{\\sin\\theta}\\sqrt{\\frac{2h}{g}\\left(1 + \\frac{k^2}{R^2}\\right)}',
    conditions: 'Body of radius R, radius of gyration k rolling purely without slipping down an incline of angle \\theta.',
    shortcut: 'Smallest k^2/R^2 reaches the bottom FIRST with HIGHEST speed! Rank: Solid Sphere (0.4) > Disc (0.5) > Shell (0.67) > Ring (1.0).',
    examTarget: ['all'],
  },
  {
    title: 'Minimum Friction Coefficient for Pure Rolling on Incline',
    latex: '\\mu_{\\min} = \\frac{\\tan\\theta}{1 + \\frac{R^2}{k^2}} = \\frac{\\tan\\theta}{\\frac{R^2}{k^2} + 1}',
    conditions: 'If \\mu < \\mu_min, pure rolling fails and the body slips as it rolls.',
    shortcut: 'The body with the LARGEST k^2/R^2 requires the GREATEST friction to prevent slipping: Ring needs \\mu = 1/2 \\tan\\theta; Sphere needs only 2/7 \\tan\\theta.',
    examTarget: ['all'],
  },
  {
    title: 'Instantaneous Center of Rotation (ICR) in Pure Rolling',
    latex: 'v_P = 0 \\quad (\\text{Contact Point}), \\quad v_{cm} = \\omega R, \\quad v_{\\text{top}} = 2\\omega R = 2v_{cm}',
    conditions: 'Pure rolling without slipping on a stationary ground.',
    shortcut: 'At any point at distance r from bottom contact point: v = \\omega r. Top point is at distance 2R, so speed is exactly 2 v_cm!',
    examTarget: ['all'],
  },
  {
    title: 'Conservation of Angular Momentum & Coaxial Coupling',
    latex: 'I_1 \\omega_1 = I_2 \\omega_2, \\quad \\omega_{\\text{common}} = \\frac{I_1 \\omega_1 + I_2 \\omega_2}{I_1 + I_2}, \\quad \\Delta E_{\\text{loss}} = \\frac{1}{2}\\left(\\frac{I_1 I_2}{I_1 + I_2}\\right)(\\omega_1 - \\omega_2)^2',
    conditions: 'When external net torque about the rotation axis is zero (\\Sigma \\vec{\\tau}_{\\text{ext}} = 0).',
    shortcut: 'Heat dissipated when two rotating discs couple is identical in structure to kinetic energy loss in completely inelastic linear collision!',
    examTarget: ['all'],
  },
];

export const rotationalDynamicsExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Applying Parallel Axis Theorem Between Two Arbitrary Axes',
    trap: 'Writing I_A = I_B + M d^2 between any two random parallel axes A and B.',
    reality: 'Parallel Axis Theorem is ONLY valid when ONE of the two axes passes through the CENTER OF MASS! The correct relation is I_A = I_{cm} + M d_A^2 and I_B = I_{cm} + M d_B^2. Never transfer directly between two non-CM axes.',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Contact Point Acceleration in Pure Rolling is NOT Zero',
    trap: 'Assuming that because the instantaneous velocity of the contact point is zero (v = 0), its acceleration must also be zero.',
    reality: 'Tangential acceleration of the contact point is zero, but its CENTRIPETAL ACCELERATION is non-zero: a_c = \\omega^2 R = v^2/R directed straight towards the center of the wheel! Contact point has zero velocity, but upward acceleration.',
    severity: 'critical',
    examTarget: ['jee_adv', 'jee_main'],
  },
  {
    title: 'Perpendicular Axis Theorem Applied to 3D Sphere/Cylinder',
    trap: 'Using I_z = I_x + I_y for a solid sphere or solid cylinder.',
    reality: 'The Perpendicular Axis Theorem is derived from \\int (x^2 + y^2) dm = \\int r^2 dm and holds ONLY when z = 0 for all particles—i.e., strictly 2D flat planar laminae. For a 3D sphere, I_x + I_y + I_z = 2 \\int r^2 dm.',
    severity: 'high',
    examTarget: ['all'],
  },
];

export const rotationalDynamicsPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2024 / NEET',
    title: 'Incline Rolling Race: Arrival Order and Final Speed',
    problem: 'A solid sphere, a uniform solid cylinder (disc), and a thin spherical shell all have the same mass M and outer radius R. They are released simultaneously from rest from the top of an inclined plane of height h = 7 m and angle \\theta. Find the speed of the solid sphere at the bottom and determine the arrival sequence (take g = 10 m/s²).',
    conceptUsed: 'Pure Rolling Energy Conservation: Mgh = 1/2 M v^2 (1 + k^2 / R^2)',
    kotaShortcut: 'v = \\sqrt{\\frac{2gh}{1 + k^2/R^2}}. For solid sphere: k^2/R^2 = 2/5 = 0.4.',
    solutionLatex: [
      'v_{\\text{sphere}} = \\sqrt{\\frac{2gh}{1 + 2/5}} = \\sqrt{\\frac{2gh}{7/5}} = \\sqrt{\\frac{10gh}{7}}',
      'v_{\\text{sphere}} = \\sqrt{\\frac{10(10)(7)}{7}} = \\sqrt{100} = 10.0 \\text{ m/s}',
      'k^2/R^2 \\text{ values: Sphere (0.4) < Disc (0.5) < Shell (0.67) < Ring (1.0)}',
      '\\text{Arrival Order: 1st Solid Sphere, 2nd Solid Cylinder, 3rd Spherical Shell}'
    ],
    solutionExplanation: 'The object with the smallest radius of gyration ratio k^2/R^2 stores the least fraction of energy in rotation, leaving the maximum energy for forward translation.',
    takeaway: 'Sphere always wins the incline rolling race! Speed order: Sphere > Disc > Shell > Ring.',
    examTarget: ['all'],
  },
  {
    examTag: 'JEE Advanced',
    title: 'Pivoted Rod Released from Horizontal: Angular Acceleration & Hinge Force',
    problem: 'A uniform rod of mass M and length L is pivoted at one end on a frictionless horizontal hinge. It is released from rest in a horizontal position. Find its instantaneous angular acceleration \\alpha and the vertical hinge reaction force immediately upon release.',
    conceptUsed: 'Torque about hinge: \\tau = I_{\\text{hinge}} \\alpha; Center of Mass Acceleration: a_{cm} = \\alpha (L/2)',
    kotaShortcut: 'Torque \\tau = Mg(L/2). Moment of inertia I = 1/3 M L^2.',
    solutionLatex: [
      '\\tau_{\\text{hinge}} = Mg\\left(\\frac{L}{2}\\right)',
      'I_{\\text{hinge}} = \\frac{1}{3}ML^2',
      '\\tau = I\\alpha \\implies Mg\\left(\\frac{L}{2}\\right) = \\left(\\frac{1}{3}ML^2\\right)\\alpha \\implies \\alpha = \\frac{3g}{2L}',
      'a_{cm} = \\alpha\\left(\\frac{L}{2}\\right) = \\left(\\frac{3g}{2L}\\right)\\left(\\frac{L}{2}\\right) = \\frac{3}{4}g',
      '\\text{Vertical Force Balance: } Mg - N_{\\text{hinge}} = M a_{cm} = M\\left(\\frac{3}{4}g\\right)',
      'N_{\\text{hinge}} = Mg - \\frac{3}{4}Mg = \\frac{1}{4}Mg'
    ],
    solutionExplanation: 'Immediately after release, the angular velocity is zero, so centripetal acceleration is zero. The hinge reaction force is strictly vertical and equals Mg/4 upwards.',
    takeaway: 'Never assume hinge reaction is zero! Always compute CM acceleration a_cm = α r_cm and apply Newton\'s 2nd Law.',
    examTarget: ['jee_adv'],
  },
];

export const rotationalDynamicsExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '2 Questions (~8 Marks)',
    difficulty: 'Moderate to Hard',
    keyFocus: 'Moment of inertia formulas and theorems, pure rolling speed on incline, angular momentum conservation with figure skater/disc, torque equilibrium.',
  },
  jeeAdv: {
    weightage: '2 – 3 Questions (~8 to 12 Marks)',
    difficulty: 'Hard to Very Hard',
    keyFocus: 'Combined translation and rotation with slipping-to-rolling transition, toppling vs sliding on incline, complex hinge reactions, instantaneous axis of rotation.',
  },
  neet: {
    weightage: '2 Questions (~8 Marks)',
    difficulty: 'Easy to Moderate',
    keyFocus: 'Radius of gyration k = √(I/M), parallel/perpendicular axis theorem application, torque τ = r F sinθ, rolling speed ratio v = √(2gh / (1 + k^2/R^2)).',
  },
};

export const rotationalDynamicsChecklist: string[] = [
  'Moment of Inertia definitions (I = ∫ r^2 dm = M k^2)',
  'Moments of inertia of ring, disc, sphere, cylinder, rod, and plate',
  'Parallel Axis Theorem (I = Icm + M d^2) condition of validity',
  'Perpendicular Axis Theorem (Iz = Ix + Iy) for planar laminae only',
  'Torque vector equation (τ = r × F = I α)',
  'Pure rolling kinematics (v_cm = ω R, a_cm = α R)',
  'Velocity field in rolling wheel: v_contact = 0, v_top = 2 v_cm',
  'Acceleration of rolling body on incline (a = g sinθ / (1 + k^2/R^2))',
  'Minimum friction coefficient for pure rolling (μ_min = tanθ / (1 + R^2/k^2))',
  'Conservation of Angular Momentum (I1 ω1 = I2 ω2) & coaxial disc coupling',
];
