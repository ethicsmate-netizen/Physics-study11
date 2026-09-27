import { FormulaItem, ExaminerTrap, SolvedArchetype, ExamMatrixData } from '../../components/common/ExamStudyGuideLayout';

export const thermodynamicsFormulaSheet: FormulaItem[] = [
  {
    title: 'Hooke\'s Law, Young\'s Modulus & Elastic Energy Density',
    latex: 'Y = \\frac{F L_0}{A \\Delta L}, \\quad u = \\frac{1}{2}\\times\\text{stress}\\times\\text{strain} = \\frac{\\sigma^2}{2Y}, \\quad U = \\frac{1}{2} F \\Delta L',
    conditions: 'Valid within the proportional elastic limit of the material.',
    shortcut: 'Work done in stretching a wire is NOT F ΔL, but exactly HALF: U = 1/2 F ΔL. The other half is dissipated as thermal heat!',
    examTarget: ['all'],
  },
  {
    title: 'Thermal Expansion & Thermal Stress',
    latex: '\\Delta L = L_0 \\alpha \\Delta T, \\quad \\sigma_{\\text{thermal}} = Y \\alpha \\Delta T, \\quad F_{\\text{wall}} = Y A \\alpha \\Delta T',
    conditions: 'Rod with thermal expansion coefficient \\alpha and Young\'s modulus Y clamped between two rigid unyielding walls.',
    shortcut: 'Thermal stress is completely independent of the rod length L! Force on walls F depends only on area A, Y, α, and ΔT.',
    examTarget: ['all'],
  },
  {
    title: 'First Law of Thermodynamics & Work in Gas Processes',
    latex: '\\Delta Q = \\Delta U + W, \\quad \\Delta U = n C_v \\Delta T, \\quad W_{\\text{iso}} = nRT\\ln\\left(\\frac{V_2}{V_1}\\right), \\quad W_{\\text{adi}} = \\frac{P_1 V_1 - P_2 V_2}{\\gamma - 1}',
    conditions: 'Ideal gas in quasi-static processes. ΔU depends strictly on initial and final temperatures (state function).',
    shortcut: 'In cyclic process: \\Delta U_{\\text{cycle}} = 0 \\implies Q_{\\text{net}} = W_{\\text{net}} = \\text{Area enclosed by P-V loop}. Clockwise = Engine (W > 0); Counter-clockwise = Refrigerator (W < 0).',
    examTarget: ['all'],
  },
  {
    title: 'Molar Heat Capacities & Degree of Freedom Relations',
    latex: 'C_p - C_v = R, \\quad \\gamma = \\frac{C_p}{C_v} = 1 + \\frac{2}{f}, \\quad C_v = \\frac{f}{2}R, \\quad C_p = \\left(\\frac{f}{2} + 1\\right)R',
    conditions: 'Ideal gas. Monoatomic: f = 3, γ = 5/3 ≈ 1.67. Diatomic (rigid): f = 5, γ = 7/5 = 1.40. Non-linear Polyatomic: f = 6, γ = 4/3 ≈ 1.33.',
    shortcut: 'Slope of adiabatic curve on P-V diagram is exactly \\gamma times steeper than isothermal curve: (dP/dV)_{adi} = \\gamma (dP/dV)_{iso}.',
    examTarget: ['all'],
  },
  {
    title: 'Carnot Engine Efficiency & Refrigerator COP',
    latex: '\\eta = 1 - \\frac{Q_C}{Q_H} = 1 - \\frac{T_C}{T_H}, \\quad \\beta = \\frac{Q_C}{W} = \\frac{T_C}{T_H - T_C} = \\frac{1 - \\eta}{\\eta}',
    conditions: 'Temperatures T_H and T_C MUST BE IN KELVIN (K = °C + 273.15). Maximum theoretical efficiency possible.',
    shortcut: 'No real heat engine can exceed Carnot efficiency operating between the same two temperatures. As T_C \\to 0 K, \\eta \\to 100%.',
    examTarget: ['all'],
  },
];

export const thermodynamicsExaminerTraps: ExaminerTrap[] = [
  {
    title: 'Using Celsius Instead of Kelvin in Carnot Engine',
    trap: 'Plugging Celsius temperatures into \\eta = 1 - T_C / T_H (e.g., writing 1 - 27/127).',
    reality: 'Thermodynamic temperature T MUST ALWAYS be converted to absolute Kelvin: T(K) = T(°C) + 273.15! For 27°C and 127°C, T_C = 300 K and T_H = 400 K, giving \\eta = 1 - 300/400 = 25%, NOT 1 - 27/127 ≈ 78.7%!',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Sign Convention of Work Done in First Law (Physics vs Chemistry)',
    trap: 'Writing \\Delta U = Q + W in Physics exam questions.',
    reality: 'In Physics, W is defined as WORK DONE BY THE GAS (expansion is positive, compression is negative): \\Delta Q = \\Delta U + W. (In Chemistry, W is defined as work done on the system: \\Delta U = Q + W). Never mix the two!',
    severity: 'critical',
    examTarget: ['all'],
  },
  {
    title: 'Internal Energy Change in Isothermal Processes',
    trap: 'Assuming \\Delta U \\ne 0 when an ideal gas undergoes isothermal expansion with variable pressure and volume.',
    reality: 'For an IDEAL GAS, internal energy depends EXCLUSIVELY on temperature: U = n C_v T. Therefore, in ANY isothermal process (T = constant), \\Delta U = 0 strictly! All heat absorbed Q converts directly into work done W.',
    severity: 'high',
    examTarget: ['jee_main', 'neet'],
  },
];

export const thermodynamicsPYQs: SolvedArchetype[] = [
  {
    examTag: 'JEE Main 2024 / NEET',
    title: 'Carnot Engine Efficiency & Additional Reservoir Temperature',
    problem: 'A Carnot engine has an efficiency of 40% when its sink temperature is 300 K. By how much must its source temperature be increased to raise its efficiency to 50%?',
    conceptUsed: 'Carnot Efficiency Formula: \\eta = 1 - T_C / T_H',
    kotaShortcut: 'T_H = T_C / (1 - \\eta). Ratio method: T_{H2} / T_{H1} = (1 - \\eta_1) / (1 - \\eta_2).',
    solutionLatex: [
      '\\eta_1 = 1 - \\frac{T_C}{T_{H1}} = 0.40 \\implies \\frac{T_C}{T_{H1}} = 0.60',
      'T_{H1} = \\frac{300}{0.60} = 500 \\text{ K}',
      '\\eta_2 = 1 - \\frac{T_C}{T_{H2}} = 0.50 \\implies \\frac{T_C}{T_{H2}} = 0.50',
      'T_{H2} = \\frac{300}{0.50} = 600 \\text{ K}',
      '\\Delta T_H = T_{H2} - T_{H1} = 600 - 500 = 100 \\text{ K}'
    ],
    solutionExplanation: 'The original source temperature is 500 K. To achieve 50% efficiency with the same 300 K sink, the source must reach 600 K. The required temperature increase is exactly 100 K.',
    takeaway: 'In Carnot problems, work directly with ratios of (1 - η) = TC / TH.',
    examTarget: ['all'],
  },
  {
    examTag: 'JEE Advanced',
    title: 'Thermal Stress and Force in Clamped Rod Cooled Down',
    problem: 'A steel rod of cross-sectional area A = 2 cm² and length L = 1 m is clamped firmly between two rigid unyielding walls at 100°C. If the temperature is reduced to 20°C, find the tension developed in the rod and the force exerted on each wall (Y = 2 × 10¹¹ N/m², \\alpha = 1.2 × 10⁻⁵ /°C).',
    conceptUsed: 'Thermal Strain Prevention by Rigid Boundaries: \\sigma = Y \\alpha \\Delta T',
    kotaShortcut: 'F = Y A \\alpha \\Delta T (Independent of rod length L).',
    solutionLatex: [
      '\\Delta T = 100^\\circ\\text{C} - 20^\\circ\\text{C} = 80^\\circ\\text{C}',
      '\\sigma_{\\text{thermal}} = Y \\alpha \\Delta T = (2\\times 10^{11})(1.2\\times 10^{-5})(80) = 1.92\\times 10^8 \\text{ N/m}^2 = 192 \\text{ MPa}',
      'A = 2 \\text{ cm}^2 = 2\\times 10^{-4} \\text{ m}^2',
      'F = \\sigma_{\\text{thermal}} A = (1.92\\times 10^8)(2\\times 10^{-4}) = 3.84\\times 10^4 \\text{ N} = 38.4 \\text{ kN}'
    ],
    solutionExplanation: 'As the rod attempts to contract by \\Delta L = L \\alpha \\Delta T, the rigid walls exert tensile stress to keep the length constant. The resulting tension is F = Y A \\alpha \\Delta T.',
    takeaway: 'Thermal stress depends on material constants (Y, α) and ΔT, but is independent of rod length L.',
    examTarget: ['jee_adv', 'jee_main'],
  },
];

export const thermodynamicsExamMatrix: ExamMatrixData = {
  jeeMain: {
    weightage: '2 – 3 Questions (~8 to 12 Marks)',
    difficulty: 'Moderate',
    keyFocus: 'First law calculations (Q = ΔU + W), Carnot engine and refrigerator efficiency, molar heat capacities, thermal conductivity series/parallel.',
  },
  jeeAdv: {
    weightage: '2 Questions (~6 to 8 Marks)',
    difficulty: 'Hard (P-V Cyclic Integrals & Gas Mixtures)',
    keyFocus: 'Adiabatic polytropic processes PV^x = C, mixture of non-reactive ideal gases (Cv_mix, γ_mix), radiation heat exchange, thermal stress.',
  },
  neet: {
    weightage: '3 – 4 Questions (~12 to 16 Marks) — TOP SCORING UNIT!',
    difficulty: 'Easy to Moderate',
    keyFocus: 'Carnot efficiency η = 1 - TC/TH, Young\'s modulus Y = FL/(A ΔL), molar heat capacities Cp - Cv = R, Newton\'s law of cooling.',
  },
};

export const thermodynamicsChecklist: string[] = [
  'Stress, strain & Hooke\'s law (Young\'s, Shear, Bulk modulus)',
  'Elastic energy density formula (u = 1/2 × stress × strain = σ^2 / 2Y)',
  'Thermal expansion (ΔL = L α ΔT) & thermal stress (σ = Y α ΔT)',
  'Fourier heat conduction (H = KA ΔT / L) & Kirchhoff thermal junction rule',
  'First law of thermodynamics: ΔQ = ΔU + W (Physics sign convention)',
  'Molar heat capacities (Cv = f/2 R, Cp = (f/2 + 1)R, γ = Cp/Cv)',
  'Work done in isothermal (nRT ln(V2/V1)) vs adiabatic ((P1V1 - P2V2)/(γ-1))',
  'Slope comparison: Adiabatic curve is γ times steeper than Isothermal curve',
  'Carnot cycle 4 steps (2 isotherms + 2 adiabatics) & efficiency (η = 1 - TC/TH in K)',
  'Refrigerator coefficient of performance (β = QC / W = (1 - η) / η)',
];
