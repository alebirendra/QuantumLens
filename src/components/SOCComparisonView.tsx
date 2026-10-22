import React, { useState } from 'react';
import { SOCComparisonResult, BandStructureData } from '../types/physics';
import { GitCompare, ShieldAlert, CheckCircle2, ArrowRight, Layers, Sliders, Info } from 'lucide-react';

interface SOCComparisonViewProps {
  comparison: SOCComparisonResult;
  nonSocData: BandStructureData;
  socData: BandStructureData;
}

export const SOCComparisonView: React.FC<SOCComparisonViewProps> = ({
  comparison,
  nonSocData,
  socData,
}) => {
  const [displayMode, setDisplayMode] = useState<'overlay' | 'soc-only' | 'nonsoc-only'>('overlay');

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Spin-Orbit Coupling (SOC) Quantitative Evaluator
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Relativistic Corrections
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct comparative alignment of Non-SOC vs SOC electronic structures and gap openings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Max SOC Shift:</span>{' '}
              <span className="font-bold text-emerald-400">{(comparison.maxEnergyShift * 1000).toFixed(0)} meV</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Gap Openings:</span>{' '}
              <span className="font-bold text-cyan-300">{comparison.gapOpenings.length}</span>
            </div>
          </div>
        </div>

        {/* Section 6 Scientific Discipline Banner */}
        <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Topological Phase Rule (Section 6 & 10):</strong>{' '}
            An SOC-induced gap opening or band crossing avoided degeneracy does{' '}
            <span className="underline font-semibold text-white">not alone prove</span> a
            topological insulating or semimetallic phase transition. Explicit calculation of Z₂
            invariants (Fu-Kane parity formula for centrosymmetric systems) or Wilson loop flow is
            required to establish non-trivial topology.
          </div>
        </div>
      </div>

      {/* View Mode Toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setDisplayMode('overlay')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            displayMode === 'overlay'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Comparative Overlay (Non-SOC vs SOC)
        </button>
        <button
          onClick={() => setDisplayMode('soc-only')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            displayMode === 'soc-only'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          SOC Band Structure Only
        </button>
        <button
          onClick={() => setDisplayMode('nonsoc-only')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            displayMode === 'nonsoc-only'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Non-SOC Scalar Relativistic Only
        </button>
      </div>

      {/* Main Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Comparative Band Overlay Visualizer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Dual-Calculation Spectral Alignment
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-slate-400 border border-dashed rounded" />
                <span className="text-slate-400">Non-SOC (Dashed)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-400 rounded" />
                <span className="text-emerald-300">SOC (Solid)</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <svg viewBox="0 0 700 360" className="w-full h-auto select-none font-sans">
              {/* E_F = 0 Line */}
              <line x1="50" y1="180" x2="660" y2="180" stroke="#06b6d4" strokeDasharray="4 3" strokeWidth="1.5" />
              <text x="665" y="184" fill="#22d3ee" fontSize="10" fontWeight="bold">
                E_F
              </text>

              {/* High symmetry vertical lines */}
              {nonSocData.highSymmetryPoints.map((sym, idx) => {
                const maxD = nonSocData.highSymmetryPoints[nonSocData.highSymmetryPoints.length - 1].distance || 1;
                const x = 50 + (sym.distance / maxD) * 610;
                return (
                  <g key={`sym-soc-${idx}`}>
                    <line x1={x} y1="30" x2={x} y2="330" stroke="#334155" strokeWidth="1" />
                    <text x={x} y="348" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold">
                      {sym.label}
                    </text>
                  </g>
                );
              })}

              {/* Non-SOC Bands (Dashed Slate) */}
              {(displayMode === 'overlay' || displayMode === 'nonsoc-only') &&
                nonSocData.bands.map((band) => {
                  const maxD = nonSocData.highSymmetryPoints[nonSocData.highSymmetryPoints.length - 1].distance || 1;
                  let dPath = '';
                  band.points.forEach((pt, pIdx) => {
                    const x = 50 + (nonSocData.kPoints[pIdx].distance / maxD) * 610;
                    const y = 180 - (pt.energy - nonSocData.eFermi) * 90;
                    if (pIdx === 0) dPath += `M ${x} ${y}`;
                    else dPath += ` L ${x} ${y}`;
                  });
                  return (
                    <path
                      key={`non-soc-b-${band.bandIndex}`}
                      d={dPath}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                      strokeOpacity="0.8"
                    />
                  );
                })}

              {/* SOC Bands (Solid Emerald / Rose) */}
              {(displayMode === 'overlay' || displayMode === 'soc-only') &&
                socData.bands.map((band) => {
                  const maxD = socData.highSymmetryPoints[socData.highSymmetryPoints.length - 1].distance || 1;
                  let dPath = '';
                  band.points.forEach((pt, pIdx) => {
                    const x = 50 + (socData.kPoints[pIdx].distance / maxD) * 610;
                    const y = 180 - (pt.energy - socData.eFermi) * 90;
                    if (pIdx === 0) dPath += `M ${x} ${y}`;
                    else dPath += ` L ${x} ${y}`;
                  });
                  return (
                    <path
                      key={`soc-b-${band.bandIndex}`}
                      d={dPath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.4"
                      strokeOpacity="0.95"
                    />
                  );
                })}

              {/* Gap Opening Callout Circles */}
              {comparison.gapOpenings.map((gap, gIdx) => {
                const maxD = socData.highSymmetryPoints[socData.highSymmetryPoints.length - 1].distance || 1;
                const dist = socData.kPoints[gap.kIndex]?.distance ?? 0;
                const x = 50 + (dist / maxD) * 610;
                const y = 180; // approximate
                return (
                  <g key={`gap-callout-${gIdx}`}>
                    <circle cx={x} cy={y} r="14" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 2" className="animate-pulse" />
                    <text x={x} y={y - 18} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">
                      Δ_SOC = {(gap.deltaGap * 1000).toFixed(0)} meV
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Quantitative Shifts & Gap Openings Table */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Detected SOC Gaps & Inversion Phenomena
          </h3>

          <div className="space-y-3">
            {comparison.gapOpenings.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                No band crossing gap openings exceeding 20 meV detected between calculations.
              </div>
            ) : (
              comparison.gapOpenings.map((g, idx) => (
                <div key={`g-item-${idx}`} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between text-white font-bold mb-1">
                    <span>
                      Gap Opening at {g.kLabel ?? `k-point #${g.kIndex}`}
                    </span>
                    <span className="text-amber-400">+{(g.deltaGap * 1000).toFixed(1)} meV</span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>Non-SOC Separation: {(g.nonSocEnergyDiff * 1000).toFixed(1)} meV</div>
                    <div>SOC Avoided Gap: {(g.socEnergyDiff * 1000).toFixed(1)} meV</div>
                    <div>Bands Involved: #{g.bandLower} and #{g.bandUpper}</div>
                  </div>
                </div>
              ))
            )}

            {comparison.bandInversions.length > 0 && (
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/80 text-xs space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Band Inversion Detected</span>
                </div>
                {comparison.bandInversions.map((inv, idx) => (
                  <div key={`inv-${idx}`} className="text-slate-300 text-[11px]">
                    <strong>{inv.kPoint}:</strong> {inv.details}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
            <div>Aligned Bands: {comparison.alignedBandsCount}</div>
            <div>Mean Energy Shift: {(comparison.meanEnergyShift * 1000).toFixed(1)} meV</div>
            <div>Max Energy Shift: {(comparison.maxEnergyShift * 1000).toFixed(1)} meV</div>
          </div>
        </div>
      </div>
    </div>
  );
};
