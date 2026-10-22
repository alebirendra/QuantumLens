import React from 'react';
import { QuantumMaterialDataset } from '../types/physics';
import { Compass, ShieldCheck, CheckCircle2, ShieldAlert, Sparkles, Layers, Info } from 'lucide-react';

interface MagneticSymmetryViewProps {
  material: QuantumMaterialDataset;
}

export const MagneticSymmetryView: React.FC<MagneticSymmetryViewProps> = ({ material }) => {
  const isAltermagnet = material.category === 'Altermagnet';
  const isFerromagnet = material.magneticState === 'Ferromagnetic';

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Magnetic Symmetry & Spin Group Classification
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  MSG & Spin Symmetry
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Identification of magnetic space groups, spin rotations, and symmetry-enforced band degeneracies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Crystal System:</span>{' '}
              <span className="font-bold text-cyan-300">{material.crystalSystem}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Space Group:</span>{' '}
              <span className="font-bold text-white">{material.spaceGroup}</span>
            </div>
          </div>
        </div>

        {/* Section 5.C4 Mandate */}
        <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Magnetic Classification Principle (Section 5.C4):</strong>{' '}
            Distinguish a candidate altermagnetic electronic structure from a confirmed altermagnetic
            classification. Spin splitting alone is not sufficient; spin groups [R_i || O_i] decoupled
            from real-space rotations in the non-relativistic limit must be formally identified.
          </div>
        </div>
      </div>

      {/* Grid: Symmetry Analysis & Allowed Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Symmetry Properties Card */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Symmetry Operations & Transformation Properties</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Magnetic Point Group:</div>
              <div className="text-base font-bold text-cyan-300 mt-1">
                {isAltermagnet ? "4'/m'm'm (m-3m family)" : isFerromagnet ? "-3m' / m-3" : "-3m1' (Paramagnetic)"}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Time-Reversal Symmetry (𝒯):</div>
              <div className="text-white mt-1">
                {material.magneticState === 'Nonmagnetic'
                  ? 'Preserved: 𝒯 * E_↑(k) = E_↓(-k), enforcing Kramers degeneracy across entire BZ.'
                  : 'Broken locally: Sublattices carry opposite moments connected by spatial rotation {C_4z | τ}.'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Spin-Space Group Decoupling [L_S || L_O]:</div>
              <div className="text-white mt-1">
                {isAltermagnet
                  ? "Spin group G_spin = { [E || E], [C_2 || C_4z] } allows non-relativistic spin splitting with zero macroscopic net magnetization."
                  : 'Standard magnetic group without non-relativistic spin separation.'}
              </div>
            </div>
          </div>
        </div>

        {/* Symmetry-Enforced Degeneracies */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Symmetry-Allowed vs Symmetry-Forbidden Splitting</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nodal Lines with Enforced Spin Degeneracy:</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Along k_z (0, 0, k_z) and the diagonal planes (k_x = ± k_y), symmetry operations {C_2 || C_2xy} enforce ΔE_spin = 0 regardless of exchange strength.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-semibold text-rose-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Maximal Spin Splitting Directions:</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Along the principal reciprocal axes Γ-X (k_x, 0, 0) and Γ-Y (0, k_y, 0), opposite spin sublattices experience maximum effective exchange fields.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[11px] space-y-1">
              <div className="font-semibold text-slate-300">Space Group References:</div>
              <p>{material.references}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
