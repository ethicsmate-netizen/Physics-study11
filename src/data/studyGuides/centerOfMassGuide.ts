import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const centerOfMassFormulaSheet: FormulaItem[] = [
  {
    title: 'Center of Mass & Negative Mass Cavity Theorem',
    latex: '\\vec{R}_{cm} = \\frac{\\sum m_i \\vec{r}_i}{\\sum m_i}, \\quad X_{\\text{rem}} = -\\frac{r_c^2 d}{R^2 - r_c^2} \\quad (\\text{Disc with Circular Cavity})',
    conditions: 'R is radius of original disc, r_c is radius of removed circular cavity, d is offset distance of cavity center from disc center.',
    shortcut: 'Treat cavity as a body of NEGATIVE MASS (-m_c). Mass is proportional to area (\\pi r^2) for 2D sheets, or volume (4/3 \\pi r^3) for spheres.',
    examTarget: ['all'],
  },
  {
    title: 'Man Walking on a Frictionless Plank (Zero External Force)',
    latex: '\\Delta x_{\\text{plank}} = -\\frac{m}{M + m}\\Delta x_{\\text{rel}}, \\quad X_{cm} = \\text{constant}',
    conditions: 'System on frictionless floor (F_ext = 0). m is mass of person, M is mass of plank, \\Delta x_rel is walking distance relative to plank.',
    shortcut: 'Since CM does not move: m \\Delta x_m + M \\Delta x_M = 0. Displacement of plank is always opposite to displacement of the person.',
    examTarget: ['all'],
  },
  {
    title: 'Coefficient of Restitution & Kinetic Energy Loss',
    latex: 'e = \\frac{v_{2n} - v_{1n}}{u_{1n} - u_{2n}}, \\quad \\Delta K_{\\text{loss}} = \\frac{1}{2}\\left(\\frac{m_1 m_2}{m_1 + m_2}\\right)(1 - e^2) u_{\\text{rel}}^2',
    conditions: 'STRICTLY measured along the COMMON NORMAL (Line of Impact). e = 1 (Elastic), 0 < e < 1 (Inelastic), e = 0 (Stick together).',
    shortcut: 'In 2D oblique collision of smooth spheres, tangential velocities remain UNCHANGED: v_{1t} = u_{1t} and v_{2t} = u_{2t}!',
    examTarget: ['all'],
  },
  {
    title: 'Variable Mass Equation & Rocket Propulsion',
    latex: 'm\\frac{d\\vec{v}}{dt} = \\vec{F}_{\\text{ext}} + \\vec{v}_{\\text{rel}}\\frac{dm}{dt}, \\quad v(t) = u - gt + v_r \\ln\\left(\\frac{m_0}{m}\\right)',
    conditions: 'v_r is constant fuel exhaust velocity relative to rocket. dm/dt is negative during fuel burnout.',
    shortcut: 'Initial thrust force F_thrust = v_r |dm/dt|. For rocket to lift off from launchpad: F_thrust \\ge m_0 g.',
    examTarget: ['jee_main', 'jee_adv'],
  },
  {
    title: 'Uniform Chain Falling on Weighing Scale Reading',
    latex: 'N = W_{\\text{static}} + F_{\\text{thrust}} = \\lambda x g + \\lambda v^2 = 3\\lambda gx = 3mg\\left(\\frac{x}{L}\\right)',
    conditions: 'Chain of total mass m, length L released from rest from table height onto a scale pan.',
    shortcut: 'The scale reading when length x has landed is EXACTLY 3 TIMES the weight of the fallen portion! 1 part static weight + 2 parts dynamic impact thrust.',
    examTarget: ['jee_adv', 'jee_main'],
  },
];

export const centerOfMassExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Applying Coefficient of Restitution Along Trajectory',
    trap: 'Using e = (v_2 - v_1)/(u_1 - u_2) with total speeds in 2D oblique collisions.',
    reality: 'Restitution e applies EXCLUSIVELY along the LINE OF IMPACT (the common normal perpendicular to the contact tangent). Tangential velocity components are completely unaffected if the surfaces are frictionless.',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Internal Explosions Changing Center of Mass Path',
    trap: 'Thinking that when a projectile explodes mid-air into fragments, the trajectory of the center of mass changes.',
    reality: 'Explosive forces are purely INTERNAL forces (\\Sigma F_internal = 0). The center of mass of all fragments combined continues moving along the EXACT SAME parabolic path as if no explosion had occurred (until pieces hit the ground)!',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Center of Mass Location Fallacy',
    trap: 'Assuming center of mass must always lie inside the material boundaries of an object.',
    reality: 'Center of mass can easily lie in empty space where no material exists: e.g. center of a ring, center of a hollow sphere, or center of an L-shaped bent wire.',
    severity: 'high',
    examTarget: ['jee_main', 'neet'],
  },
];

export const centerOfMassPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2023 / NEET',
    title: 'Center of Mass of Disc with Off-Center Circular Cavity',
    problem: 'From a uniform circular disc of radius R and center O, a circular hole of radius R/2 is scooped out such that its rim touches the edge of the original disc. Find the distance of the center of mass of the remaining portion from O.',
    conceptUsed: 'Negative Mass Superposition Method: Area proportional to radius squared',
    kotaShortcut: 'x_{\\text{rem}} = -\\frac{r^2 d}{R^2 - r^2}. Here r = R/2 and offset d = R/2.',
    solutionLatex: [
      '\\text{Original Disc: Radius } R, \\quad \\text{Area } A_1 = \\pi R^2, \\quad x_1 = 0',
      '\\text{Cavity: Radius } r = R/2, \\quad \\text{Area } A_2 = \\pi (R/2)^2 = \\frac{\\pi R^2}{4}, \\quad x_2 = R/2',
      'X_{cm} = \\frac{A_1 x_1 - A_2 x_2}{A_1 - A_2} = \\frac{0 - (\\pi R^2 / 4)(R/2)}{\\pi R^2 - \\pi R^2 / 4}',
      'X_{cm} = \\frac{-\\pi R^3 / 8}{3\\pi R^2 / 4} = -\\frac{R}{6}'
    ],
    solutionExplanation: 'Treating the hole as negative mass located at x = +R/2 shifts the remaining centroid to x = -R/6 (away from the scooped hole).',
    takeaway: 'For any circular disc with circular cavity: X_rem = - (r^2 d) / (R^2 - r^2).',
    examTarget: ['all'],
  },
  {
    examTag: 'JEE Advanced / Main',
    title: '2D Oblique Elastic Collision of Equal Masses',
    problem: 'A moving ball of mass m collides elastically (e = 1) with an identical stationary ball of mass m at an oblique angle. Prove that after collision, the two balls fly off at an angle of 90° (perpendicular to each other).',
    conceptUsed: 'Conservation of Linear Momentum and Kinetic Energy in Elastic Collision',
    kotaShortcut: 'For equal masses colliding elastically in 2D with one initially at rest: \\vec{v}_1 \\cdot \\vec{v}_2 = 0 (always 90°)!',
    solutionLatex: [
      '\\vec{u}_1 = \\vec{v}_1 + \\vec{v}_2 \\quad (\\text{Canceling equal mass } m)',
      'u_1^2 = |\\vec{v}_1 + \\vec{v}_2|^2 = v_1^2 + v_2^2 + 2\\vec{v}_1 \\cdot \\vec{v}_2',
      '\\text{Elastic Kinetic Energy Conservation: } \\frac{1}{2}m u_1^2 = \\frac{1}{2}m v_1^2 + \\frac{1}{2}m v_2^2',
      'u_1^2 = v_1^2 + v_2^2',
      '\\text{Substituting: } (v_1^2 + v_2^2) = v_1^2 + v_2^2 + 2\\vec{v}_1 \\cdot \\vec{v}_2',
      '2\\vec{v}_1 \\cdot \\vec{v}_2 = 0 \\implies \\vec{v}_1 \\perp \\vec{v}_2 \\quad (\\theta = 90^\\circ)'
    ],
    solutionExplanation: 'Equating the momentum magnitude equation to the kinetic energy conservation equation cancels v1^2 and v2^2, forcing the dot product of final velocities to vanish identically.',
    takeaway: 'Classic IIT-JEE golden theorem: Equal masses + Elastic collision + One at rest => Final paths are strictly mutually perpendicular (90°).',
    examTarget: ['all'],
  },
];

export const centerOfMassExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Moderate',
    keyFocus: 'Center of mass of cavity shapes, 1D elastic collisions, man-on-plank recoil, impulse-momentum theorem.',
  },
  jeeAdv: {
    weightage: '2 Questions (~6 to 8 Marks)',
    difficulty: 'Hard (Variable Mass & 2D Oblique Collisions)',
    keyFocus: 'Tsiolkovsky rocket equation, falling chain on scale, 2D collisions with coefficient of restitution, line of impact decomposition.',
  },
  neet: {
    weightage: '1 – 2 Questions (~4 to 8 Marks)',
    difficulty: 'Easy to Moderate',
    keyFocus: 'Position of CM for discrete particles, velocity of CM, 1D head-on elastic collision formulas, conservation of linear momentum.',
  },
};

export const centerOfMassChecklist: string[] = [
  'Center of mass formula for discrete particles (Rcm = Σ mi ri / M)',
  'Center of mass for standard continuous bodies (rod, ring, disc, hemisphere)',
  'Cavity theorem using negative mass superposition (Xrem = -r^2 d / (R^2 - r^2))',
  'Motion of center of mass (F_ext = M acm)',
  'Conservation of linear momentum when F_ext = 0',
  'Man on plank recoil on frictionless floor (Δx_plank = -m Δx_rel / (M + m))',
  'Coefficient of restitution along line of impact (e = v_rel,sep / v_rel,app)',
  'Head-on 1D elastic collision velocity formulas',
  'Kinetic energy dissipation in inelastic collisions (ΔK = 1/2 μ(1 - e^2) u_rel^2)',
  'Variable mass thrust force (F = v_rel dm/dt) & Tsiolkovsky rocket equation',
];
