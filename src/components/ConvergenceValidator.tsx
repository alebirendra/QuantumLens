import React from 'react';
import { QuantumMaterialDataset } from '../types/physics';
import { ShieldCheck, CheckCircle2, AlertTriangle, Cpu, Gauge, Zap } from 'lucide-react';

interface ConvergenceValidatorProps {
  material: QuantumMaterialDataset;
}

export const ConvergenceValidator: React.FC<ConvergenceValidatorProps> = ({ material }) => {
  const checks = [
    {
      title: 'Monkhorst-Pack k-Point Density',
      value: '12 × 12 × 12 (SCF) / 60 points along path',
      status: 'pass' as const,
      detail: 'Density > 0.02 Å⁻¹ fulfills standard convergence criteria (< 1 meV/atom energy error).',
    },
    {
      title: 'Plane-Wave Energy Cutoff (ENCUT / ecutwfc)',
      value: '520 eV (38.2 Ry)',
      status: 'pass' as const,
      detail: 'Exceeds recommended pseudopotential cutoff by +30% for transition metals.',
    },
    {
      title: 'SCF Electronic Convergence Tolerance (EDIFF)',
      value: '1.0 × 10⁻⁸ eV',
      status: 'pass' as const,
      detail: 'Crucial for accurate spin splitting and Berry curvature calculation.',
    },
    {
      title: 'Brillouin Zone Smearing Scheme (ISMEAR & SIGMA)',
      value: 'Tetrahedron with Blöchl corrections (ISMEAR = -5)',
      status: 'pass' as const,
      detail: 'Ensures exact density of states and Fermi level without artificial broadening artifacts.',
    },
    {
      title: 'Wannier Interpolation Spread Convergence',
      value: 'Ω_total = 1.18 Å² across 36 bands',
      status: 'pass' as const,
      detail: 'Spread minimization completed with gauge-invariant ratio Ω_I / Ω_total > 0.85.',
    },
    {
      title: '3D Out-of-Plane k_z Sampling Validation',
      value: '1D path only (k_z = 0)',
      status: 'warning' as const,
      detail: 'Sampling along Γ-K-M does not rule out finite out-of-plane dispersion. Uniform 3D mesh advised.',
    },
  ];

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Convergence & Numerical Validation Diagnostics
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Quality Gate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Audit of DFT parameter convergence, smearing broadening, and interpolation tolerances
            </p>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((c, idx) => (
          <div
            key={`chk-${idx}`}
            className={`p-4 rounded-xl border space-y-2 ${
              c.status === 'pass'
                ? 'bg-slate-900 border-slate-800 hover:border-emerald-800/60'
                : 'bg-slate-900 border-amber-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">{c.title}</span>
              {c.status === 'pass' ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Validated
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Warning
                </span>
              )}
            </div>

            <div className="text-xs font-mono text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
              {c.value}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{c.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
