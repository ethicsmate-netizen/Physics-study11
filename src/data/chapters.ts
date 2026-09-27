export interface Chapter {
  id: string;
  number: number;
  title: string;
  pdfName: string;
  description: string;
  category: 'Mechanics' | 'Waves & Oscillations' | 'Thermal' | 'Foundations';
  status: 'active' | 'ready' | 'planned';
  featuredSimulationName?: string;
  keyFormulas: string[];
  keyConcepts: string[];
  color: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'units_vectors',
    number: 1,
    title: 'Units, Basic Math & Vectors',
    pdfName: 'Units_And_Dimensions_Basic_Mathematics_And_Vectors_Theory_26.pdf',
    description: 'Parallelogram law of vector addition, resolution into Cartesian components, dot product projections, and 3D cross products.',
    category: 'Foundations',
    status: 'active',
    featuredSimulationName: 'Interactive Vector Addition & Resolution Lab',
    keyFormulas: [
      '|\\vec{R}| = \\sqrt{A^2 + B^2 + 2AB\\cos\\theta}',
      '\\tan\\alpha = \\frac{B\\sin\\theta}{A + B\\cos\\theta}',
      '\\vec{A} \\cdot \\vec{B} = AB\\cos\\theta',
      '|\\vec{A} \\times \\vec{B}| = AB\\sin\\theta'
    ],
    keyConcepts: [
      'Triangle & Parallelogram law of vectors',
      'Resolution of vector along orthogonal axes',
      'Geometric meaning of scalar product as shadow/projection',
      'Vector product as normal area vector'
    ],
    color: '#38bdf8' // Cyan
  },
  {
    id: 'kinematics_1d',
    number: 2,
    title: 'Kinematics in 1D',
    pdfName: 'Kinematics_1D_Theory_26.pdf',
    description: 'Rectilinear motion, uniform acceleration equations, slope & area of x-t, v-t, a-t graphs, and vertical motion under gravity.',
    category: 'Mechanics',
    status: 'active',
    featuredSimulationName: '1D Motion Studio & Calculus Graph Engine',
    keyFormulas: [
      'v = u + at',
      's = ut + \\frac{1}{2}at^2',
      'v^2 = u^2 + 2as',
      'v = \\frac{dx}{dt}, \\quad a = \\frac{dv}{dt} = v\\frac{dv}{dx}'
    ],
    keyConcepts: [
      'Slope of x-t gives instantaneous velocity',
      'Slope of v-t gives acceleration; area under v-t gives displacement',
      'Symmetry in vertical motion under gravity'
    ],
    color: '#818cf8' // Indigo
  },
  {
    id: 'kinematics_2d',
    number: 3,
    title: 'Kinematics in 2D & Projectiles',
    pdfName: 'Kinematics_2D_Theory_26.pdf',
    description: 'Ground-to-ground & inclined plane projectiles, complementary launch angles, equation of trajectory, and relative velocity (river-boat & rain-umbrella).',
    category: 'Mechanics',
    status: 'active',
    featuredSimulationName: '2D Projectile & Trajectory Equation Studio',
    keyFormulas: [
      'H_{\\max} = \\frac{u^2 \\sin^2\\alpha}{2g}',
      'T = \\frac{2u \\sin\\alpha}{g}',
      'R = \\frac{u^2 \\sin 2\\alpha}{g}',
      'y = x\\tan\\alpha - \\frac{gx^2}{2u^2\\cos^2\\alpha} = x\\tan\\alpha\\left(1 - \\frac{x}{R}\\right)',
      'T_{\\text{incline}} = \\frac{2u\\sin(\\alpha-\\beta)}{g\\cos\\beta}'
    ],
    keyConcepts: [
      'Independence of orthogonal x and y motions',
      'Two complementary angles (α and 90°-α) yield the same horizontal range',
      'At maximum height, vertical velocity Vy = 0 while Vx = u cos(α)',
      'Crossing a river in minimum time vs least distance'
    ],
    color: '#22c55e' // Emerald
  },
  {
    id: 'nlm_friction',
    number: 4,
    title: "Newton's Laws & Friction",
    pdfName: 'Newton_s_Laws_Of_Motion_And_Friction_Theory_26.pdf',
    description: 'Dynamic Free Body Diagrams (FBD), normal force, incline plane components, tension in pulley systems, and static vs kinetic friction transition.',
    category: 'Mechanics',
    status: 'active',
    featuredSimulationName: 'Dynamic Incline Plane & Free Body Diagram (FBD) Simulator',
    keyFormulas: [
      '\\Sigma \\vec{F} = m\\vec{a}',
      'N = mg\\cos\\theta',
      'f_s \\le \\mu_s N, \\quad f_k = \\mu_k N',
      '\\tan\\phi = \\mu \\quad (\\text{Angle of Repose / Friction})',
      'F_{\\text{spring}} = -kx'
    ],
    keyConcepts: [
      'Separation of bodies in Free Body Diagrams (FBD)',
      'Normal reaction is always perpendicular to contact interface',
      'Static friction self-adjusts up to maximum limit fs,max = μs N',
      'Angle of repose: slipping begins when incline angle θ exceeds tan⁻¹(μs)'
    ],
    color: '#f97316' // Orange
  },
  {
    id: 'circular_motion',
    number: 5,
    title: 'Circular Motion',
    pdfName: 'Circular_Motion_Theory_26.pdf',
    description: 'Centripetal and centrifugal forces, optimal banking of curved roads with/without friction, conical pendulum, and vertical circular loop-the-loop.',
    category: 'Mechanics',
    status: 'active',
    featuredSimulationName: 'Banked Road Safety Envelope & Vertical Loop Studio',
    keyFormulas: [
      'a_c = \\frac{v^2}{r} = \\omega^2 r',
      '\\tan\\theta = \\frac{v^2}{rg} \\quad (\\text{Frictionless Banked Road})',
      'v_{\\text{bottom, min}} = \\sqrt{5gr}, \\quad v_{\\text{top, min}} = \\sqrt{gr}'
    ],
    keyConcepts: [
      'Centripetal acceleration is directed strictly toward center',
      'Centrifugal pseudo force in rotating frame of reference',
      'Tension variation in vertical circle: T_bottom - T_top = 6mg'
    ],
    color: '#eab308' // Yellow
  },
  {
    id: 'work_energy',
    number: 6,
    title: 'Work, Energy & Power',
    pdfName: 'Work_Energy_And_Power_Theory_26.pdf',
    description: 'Work-energy theorem, conservative vs non-conservative forces, potential energy wells U(x), equilibrium stability, and spring mechanics.',
    category: 'Mechanics',
    status: 'active',
    featuredSimulationName: 'Potential Energy Landscape & Work-Energy Studio',
    keyFormulas: [
      'W = \\int \\vec{F} \\cdot d\\vec{r} = \\Delta K',
      'F_x = -\\frac{dU}{dx}',
      'U_{\\text{spring}} = \\frac{1}{2}kx^2',
      'E_{\\text{mech}} = K + U = \\text{constant}'
    ],
    keyConcepts: [
      'Work done is independent of path for conservative forces',
      'Stable equilibrium at potential energy minimum (d²U/dx² > 0)',
      'Live exchange between kinetic and potential energy'
    ],
    color: '#ec4899' // Pink
  },
  {
    id: 'center_of_mass',
    number: 7,
    title: 'Center of Mass & Collisions',
    pdfName: 'Center_Of_Mass_Momentum_And_Collision_Theory_26.pdf',
    description: 'Center of mass coordinates for discrete and continuous systems, momentum conservation, and 1D/2D elastic & inelastic collisions with coefficient of restitution.',
    category: 'Mechanics',
    status: 'active',
    featuredSimulationName: 'Center of Mass, Collision Dynamics & Rocket Propulsion Studio',
    keyFormulas: [
      '\\vec{r}_{\\text{cm}} = \\frac{\\sum m_i \\vec{r}_i}{\\sum m_i}',
      '\\vec{P}_{\\text{sys}} = M\\vec{v}_{\\text{cm}} = \\text{constant} \\quad (\\text{if } \\vec{F}_{\\text{ext}} = 0)',
      'e = \\frac{v_2 - v_1}{u_1 - u_2}'
    ],
    keyConcepts: [
      'Motion of center of mass is unaffected by internal forces',
      'e = 1 for perfectly elastic; e = 0 for completely inelastic collision',
      'Impulse equals change in linear momentum'
    ],
    color: '#a855f7' // Purple
  },
  {
    id: 'rotational_dynamics',
    number: 8,
    title: 'Rotational Dynamics',
    pdfName: 'Rotational_Dynamics_Theory_26.pdf',
    description: 'Moment of inertia theorems, torque τ = Iα, angular momentum conservation, and pure rolling motion down inclined planes.',
    category: 'Mechanics',
    status: 'active',
    featuredSimulationName: 'The Great Incline Pure Rolling Race & Angular Momentum Studio',
    keyFormulas: [
      '\\vec{\\tau} = \\vec{r} \\times \\vec{F} = I\\vec{\\alpha}',
      'L = I\\omega = \\text{constant}',
      'a_{\\text{rolling}} = \\frac{g\\sin\\theta}{1 + \\frac{k^2}{R^2}}',
      'K_{\\text{total}} = \\frac{1}{2}Mv_{\\text{cm}}^2 + \\frac{1}{2}I_{\\text{cm}}\\omega^2'
    ],
    keyConcepts: [
      'Pure rolling condition at contact point: v_cm = ωR',
      'Race down the incline: solid sphere wins against disc, cylinder, and ring',
      'Direction and role of friction in enabling pure rolling'
    ],
    color: '#14b8a6' // Teal
  },
  {
    id: 'shm',
    number: 9,
    title: 'Simple Harmonic Motion (SHM)',
    pdfName: 'Simple_Harmonic_Motion_SHM_Theory_26.pdf',
    description: 'Differential equation of SHM, phasor circle projection, spring-mass systems in series/parallel, simple pendulum, and energy oscillations.',
    category: 'Waves & Oscillations',
    status: 'active',
    featuredSimulationName: 'Phasor Circle Reference, Energy Parabolas & Lissajous Studio',
    keyFormulas: [
      'a = -\\omega^2 x',
      'x(t) = A\\sin(\\omega t + \\phi)',
      'v = \\omega\\sqrt{A^2 - x^2}',
      'T_{\\text{pendulum}} = 2\\pi\\sqrt{\\frac{L}{g}}, \\quad T_{\\text{spring}} = 2\\pi\\sqrt{\\frac{m}{k}}'
    ],
    keyConcepts: [
      'Projection of uniform circular motion on diameter executes SHM',
      'Velocity leads displacement by π/2; acceleration leads by π',
      'Total energy E = 1/2 m ω² A² remains strictly conserved'
    ],
    color: '#06b6d4' // Cyan
  },
  {
    id: 'thermodynamics',
    number: 10,
    title: 'Heat & Thermodynamics',
    pdfName: 'Elasticity_Heat_And_Thermodynamics_Theory_26.pdf',
    description: 'First law of thermodynamics, PV indicator diagrams for isothermal, adiabatic, isobaric, and isochoric processes, and Carnot heat engine efficiency.',
    category: 'Thermal',
    status: 'active',
    featuredSimulationName: 'P-V Carnot Engine, Elastic Wire & Thermal Conduction Studio',
    keyFormulas: [
      '\\Delta Q = \\Delta U + W',
      'W = \\int P\\,dV',
      'PV^\\gamma = \\text{constant} \\quad (\\text{Adiabatic})',
      '\\eta = 1 - \\frac{T_C}{T_H}'
    ],
    keyConcepts: [
      'Area enclosed in a clockwise PV cyclic diagram represents net work done by gas',
      'Internal energy U of an ideal gas depends solely on temperature',
      'Carnot cycle represents the maximum theoretical efficiency between two reservoirs'
    ],
    color: '#f43f5e' // Rose
  }
];
