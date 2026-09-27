import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { BookOpen, CheckCircle, AlertCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { ExamStudyGuideLayout } from '../../components/common/ExamStudyGuideLayout';
import {
  thermodynamicsFormulaSheet,
  thermodynamicsExaminerTraps,
  thermodynamicsPYQs,
  thermodynamicsExamMatrix,
  thermodynamicsChecklist,
} from '../../data/studyGuides/thermodynamicsGuide';

const InlineMath: React.FC<{ math: string }> = ({ math }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(math, ref.current, { displayMode: false, throwOnError: false });
      } catch (e) {
        console.error(e);
      }
    }
  }, [math]);
  return <span ref={ref} />;
};

const BlockMath: React.FC<{ math: string }> = ({ math }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(math, ref.current, { displayMode: true, throwOnError: false });
      } catch (e) {
        console.error(e);
      }
    }
  }, [math]);
  return <div ref={ref} />;
};

export interface ThermodynamicsTheoryProps {
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const ThermodynamicsTheory: React.FC<ThermodynamicsTheoryProps> = ({ onNavigateChapter }) => {
  const [activeSection, setActiveSection] = useState<string>('elasticity');

  const sections = [
    { id: 'elasticity', title: '1. Elasticity & Stress-Strain Curves' },
    { id: 'thermal_expansion', title: '2. Thermal Expansion & Stress' },
    { id: 'calorimetry', title: '3. Calorimetry & Phase Transitions' },
    { id: 'heat_transfer', title: '4. Conduction & Radiation Laws' },
    { id: 'thermo_processes', title: '5. First Law & PV Gas Cycles' },
    { id: 'carnot', title: '6. Second Law & Carnot Engine' },
  ];

  const conceptsContent = (
    <div className="space-y-6">
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === sec.id
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* Section 1: Elasticity */}
      {activeSection === 'elasticity' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Elastic Moduli & The Stress-Strain Curve
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Stress is the internal restoring force per unit area (<InlineMath math="\sigma = F_{\text{res}}/A" />), and strain is the fractional deformation (<InlineMath math="\epsilon = \Delta L / L" />).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-1 text-xs">
                <span className="font-mono text-zinc-400 text-[11px] uppercase">Young's Modulus (Y)</span>
                <BlockMath math="Y = \frac{\text{Longitudinal Stress}}{\text{Longitudinal Strain}} = \frac{FL}{A\Delta L}" />
                <span className="text-zinc-500 text-[10px]">Solid wires and tensile rods</span>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-1 text-xs">
                <span className="font-mono text-zinc-400 text-[11px] uppercase">Bulk Modulus (B)</span>
                <BlockMath math="B = -\frac{\Delta P}{\Delta V / V} = -V\frac{dP}{dV}" />
                <span className="text-zinc-500 text-[10px]">Fluids and volume compression</span>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-1 text-xs">
                <span className="font-mono text-zinc-400 text-[11px] uppercase">Rigidity Modulus (η)</span>
                <BlockMath math="\eta = \frac{F_{\text{shear}} / A}{\phi}" />
                <span className="text-zinc-500 text-[10px]">Shear angle <InlineMath math="\phi" /> in radians</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-semibold text-zinc-200">
                Elastic Potential Energy Density
              </span>
              <BlockMath math="u = \frac{U}{\text{Volume}} = \frac{1}{2} \times \text{Stress} \times \text{Strain} = \frac{1}{2} Y (\text{Strain})^2 = \frac{\text{Stress}^2}{2Y}" />
              <p className="text-xs text-zinc-400">
                On the stress-strain curve, the area under the linear proportional region equals the elastic energy stored per unit volume.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Thermal Expansion */}
      {activeSection === 'thermal_expansion' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              Thermal Expansion & Thermal Stress in Clamped Bodies
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              When materials absorb thermal energy, increased microscopic atomic vibration causes expansion across length, area, and volume.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Expansion Coefficients
                </span>
                <BlockMath math="\Delta L = L_0 \alpha \Delta T, \quad \Delta A = A_0 \beta \Delta T, \quad \Delta V = V_0 \gamma \Delta T" />
                <p className="text-xs text-zinc-400">
                  For isotropic solids: <InlineMath math="\beta = 2\alpha" />, <InlineMath math="\gamma = 3\alpha" />.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Thermal Stress in Rigidly Clamped Rods
                </span>
                <BlockMath math="\text{Stress} = Y \frac{\Delta L}{L_0} = Y \alpha \Delta T" />
                <BlockMath math="F_{\text{clamping}} = Y A \alpha \Delta T" />
                <p className="text-xs text-zinc-400">
                  Notice that thermal stress is completely independent of the rod's original length!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
              <span className="text-xs font-semibold text-amber-300">
                Temperature Error in Pendulum Clocks
              </span>
              <BlockMath math="\frac{\Delta T_{\text{period}}}{T} \approx \frac{1}{2}\alpha \Delta \theta \implies \Delta t_{\text{loss/gain}} = \frac{1}{2}\alpha \Delta \theta \times t_{\text{total}}" />
              <p className="text-xs text-zinc-400">
                In summer (<InlineMath math="\Delta \theta > 0" />), the rod expands, period increases, and the clock <strong>runs slow (loses time)</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Calorimetry */}
      {activeSection === 'calorimetry' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Calorimetry, Specific Heat, & Phase Changes
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              The principle of calorimetry is energy conservation: in an isolated system, heat lost by hotter bodies equals heat gained by colder bodies until thermal equilibrium is established.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Sensible Heat & Temperature Change
                </span>
                <BlockMath math="dQ = m c \, dT \implies Q = m c \Delta T" />
                <p className="text-xs text-zinc-400">
                  Water: <InlineMath math="c_w = 1\text{ cal/g}^\circ\text{C} = 4186\text{ J/kg}\cdot\text{K}" />. Ice: <InlineMath math="c_i = 0.5\text{ cal/g}^\circ\text{C}" />.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Latent Heat of Phase Change
                </span>
                <BlockMath math="Q = m L" />
                <p className="text-xs text-zinc-400">
                  Ice fusion: <InlineMath math="L_f = 80\text{ cal/g}" />. Steam vaporization: <InlineMath math="L_v = 540\text{ cal/g}" /> (temperature remains strictly constant during phase change).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Heat Transfer */}
      {activeSection === 'heat_transfer' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-emerald-400" />
              Thermal Conduction & Radiation Laws
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Heat transfers via conduction (microscopic molecular collisions), convection (bulk fluid movement), and radiation (electromagnetic waves requiring no medium).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Thermal Conduction (Ohm's Law Analogy)
                </span>
                <BlockMath math="H = \frac{dQ}{dt} = \frac{T_1 - T_2}{R_{\text{th}}}, \quad R_{\text{th}} = \frac{L}{KA}" />
                <p className="text-xs text-zinc-400">
                  At a junction of multiple conducting rods, <InlineMath math="\Sigma H_i = 0" /> (Kirchhoff's Current Law equivalent).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Stefan-Boltzmann Radiation & Newton's Cooling
                </span>
                <BlockMath math="P = e \sigma A (T^4 - T_s^4)" />
                <p className="text-xs text-zinc-400">
                  For small temperature excess (<InlineMath math="\Delta T \ll T_s" />):
                </p>
                <BlockMath math="\frac{dT}{dt} = -k(T - T_s)" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
              <span className="text-xs font-semibold text-zinc-200">
                Wien's Displacement Law
              </span>
              <BlockMath math="\lambda_{\max} T = b \approx 2.898 \times 10^{-3} \text{ m}\cdot\text{K}" />
              <p className="text-xs text-zinc-400">
                As temperature increases, peak emission wavelength shifts toward higher frequencies / shorter wavelengths.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: First Law & PV Gas Cycles */}
      {activeSection === 'thermo_processes' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-rose-400" />
              First Law of Thermodynamics & PV Diagram Indicator Engines
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              The First Law states that heat supplied to an ideal gas converts into internal energy change and expansion work done by the gas.
            </p>

            <BlockMath math="dQ = dU + dW, \quad dW = P \, dV, \quad dU = n C_v dT" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-850">
                <span className="text-sky-400 font-mono block font-semibold">Isochoric (V = C)</span>
                <span className="text-zinc-400 block text-[11px]">dV = 0</span>
                <BlockMath math="W = 0, \quad Q = \Delta U = n C_v \Delta T" />
              </div>
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-850">
                <span className="text-emerald-400 font-mono block font-semibold">Isobaric (P = C)</span>
                <span className="text-zinc-400 block text-[11px]">dP = 0</span>
                <BlockMath math="W = P\Delta V = nR\Delta T, \quad Q = n C_p \Delta T" />
              </div>
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-850">
                <span className="text-amber-400 font-mono block font-semibold">Isothermal (T = C)</span>
                <span className="text-zinc-400 block text-[11px]">dT = 0</span>
                <BlockMath math="\Delta U = 0, \quad W = nRT \ln\left(\frac{V_f}{V_i}\right)" />
              </div>
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-850">
                <span className="text-rose-400 font-mono block font-semibold">Adiabatic (Q = 0)</span>
                <span className="text-zinc-400 block text-[11px]">PV^\gamma = C</span>
                <BlockMath math="W = -\Delta U = \frac{P_i V_i - P_f V_f}{\gamma - 1}" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <span className="text-xs font-semibold text-emerald-300">
                PV Cyclic Diagrams & Net Work Done
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                In any cyclic thermodynamic process (<InlineMath math="\oint" />):
              </p>
              <BlockMath math="\Delta U_{\text{cycle}} = 0 \implies Q_{\text{net}} = W_{\text{net}} = \text{Area enclosed by PV curve}" />
              <p className="text-xs text-zinc-400">
                <strong>Clockwise cycle</strong>: <InlineMath math="W_{\text{net}} > 0" /> (Heat Engine delivering work to surroundings).
                <br />
                <strong>Counter-clockwise cycle</strong>: <InlineMath math="W_{\text{net}} < 0" /> (Refrigerator / Heat Pump consuming mechanical work).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: Carnot Engine */}
      {activeSection === 'carnot' && (
        <div className="space-y-6 text-zinc-300">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              Second Law of Thermodynamics & Carnot Engine Efficiency
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              The Carnot cycle is an ideal reversible thermodynamic cycle operating between hot reservoir (<InlineMath math="T_H" />) and cold reservoir (<InlineMath math="T_C" />) through 2 reversible isotherms and 2 reversible adiabatics.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Carnot Efficiency Formula
                </span>
                <BlockMath math="\eta = \frac{W_{\text{net}}}{Q_{\text{in}}} = 1 - \frac{Q_{\text{out}}}{Q_{\text{in}}} = 1 - \frac{T_C}{T_H}" />
                <p className="text-xs text-zinc-400">
                  No real heat engine operating between two given temperatures can achieve greater efficiency than a reversible Carnot engine (Carnot's Theorem).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-850 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Refrigerator Coefficient of Performance (COP)
                </span>
                <BlockMath math="\beta = \frac{Q_C}{W} = \frac{T_C}{T_H - T_C}" />
                <p className="text-xs text-zinc-400">
                  Relationship with engine efficiency: <InlineMath math="\beta = \frac{1 - \eta}{\eta}" />.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <ExamStudyGuideLayout
      chapterId="thermodynamics"
      chapterTitle="Thermodynamics, Heat & Elasticity"
      subtitle="Young's Modulus, First Law & PV Work, Adiabatic Slopes, Carnot Efficiency & Calorimetry"
      conceptsContent={conceptsContent}
      formulaSheet={thermodynamicsFormulaSheet}
      examinerTraps={thermodynamicsExaminerTraps}
      pyqs={thermodynamicsPYQs}
      examMatrix={thermodynamicsExamMatrix}
      checklist={thermodynamicsChecklist}
      onNavigateChapter={onNavigateChapter}
    />
  );
};
