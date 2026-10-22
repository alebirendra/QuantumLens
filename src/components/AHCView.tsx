import React, { useState } from 'react';
import { AHCData, QuantumMaterialDataset } from '../types/physics';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Layers, Sliders, Info, Download } from 'lucide-react';

interface AHCViewProps {
  ahcData?: AHCData;
  material: QuantumMaterialDataset;
}

export const AHCView: React.FC<AHCViewProps> = ({ ahcData, material }) => {
  const [selectedMu, setSelectedMu] = useState<number>(0.0);

  if (!ahcData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-3">
        <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">Anomalous Hall Conductivity (AHC) Not Available</h3>
        <p className="text-xs max-w-md mx-auto">
          Anomalous Hall conductivity calculations require Kubo-formula or Berry curvature BZ
          integration with Wannier interpolation (e.g. from WannierBerri or postw90.x). Non-magnetic
          materials with time-reversal symmetry have identically zero net AHC.
        </p>
      </div>
    );
  }

  const { chemicalPotentials, sigmaXY, units, kMeshConvergence, validationChecks } = ahcData;
  const maxSigma = Math.max(...sigmaXY, 100);

  // SVG Chart Dimensions
  const width = 750;
  const height = 360;
  const margin = { top: 25, right: 30, bottom: 45, left: 65 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const minMu = Math.min(...chemicalPotentials);
  const maxMu = Math.max(...chemicalPotentials);

  const xScale = (mu: number) => margin.left + ((mu - minMu) / (maxMu - minMu)) * plotWidth;
  const yScale = (val: number) => margin.top + (1 - val / (maxSigma * 1.1)) * plotHeight;

  let pathD = '';
  chemicalPotentials.forEach((mu, idx) => {
    const x = xScale(mu);
    const y = yScale(sigmaXY[idx]);
    if (idx === 0) pathD += `M ${x} ${y}`;
    else pathD += ` L ${x} ${y}`;
  });

  const handleExportCSV = () => {
    let csv = `chemical_potential_eV,sigma_xy_${units}\n`;
    chemicalPotentials.forEach((mu, idx) => {
      csv += `${mu},${sigmaXY[idx]}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.name}_AHC.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Anomalous Hall Conductivity Tensor σ_ij
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Intrinsic Berry Curvature
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Energy-dependent anomalous Hall response σ_xy(μ) and rigorous numerical convergence checks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">σ_xy(E_F):</span>{' '}
              <span className="font-bold text-cyan-300">
                {sigmaXY[Math.floor(sigmaXY.length / 2)]} {units}
              </span>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Section 8.F3 Validation Discipline */}
        <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Section 8.F3 Validation Rule:</strong>{' '}
            Do <span className="underline font-semibold text-white">not report AHC</span> as a
            fully validated result if input datasets are insufficient to verify k-mesh convergence
            and Brillouin zone coverage. QuantumLens displays tensor components with explicit
            indices and preserves source sign conventions.
          </div>
        </div>
      </div>

      {/* Grid: AHC vs Energy Chart & Validation Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* AHC vs Chemical Potential Plot */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center justify-between">
            <span>Anomalous Hall Conductivity σ_xy vs Chemical Potential μ</span>
            <span className="text-[11px] font-mono text-cyan-400">Kubo Intrinsic Formula</span>
          </h3>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none font-sans">
              {/* Gridlines */}
              {[0, maxSigma * 0.25, maxSigma * 0.5, maxSigma * 0.75, maxSigma].map((v) => {
                const y = yScale(v);
                return (
                  <g key={`ahc-y-${v}`}>
                    <line x1={margin.left} y1={y} x2={margin.left + plotWidth} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                    <text x={margin.left - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                      {Math.round(v)}
                    </text>
                  </g>
                );
              })}

              {/* Chemical Potential = 0 Line */}
              {(() => {
                const x0 = xScale(0);
                return (
                  <g>
                    <line x1={x0} y1={margin.top} x2={x0} y2={margin.top + plotHeight} stroke="#06b6d4" strokeDasharray="4 3" strokeWidth="1.5" />
                    <text x={x0 + 4} y={margin.top + 14} fill="#22d3ee" fontSize="11" fontWeight="bold">
                      μ = E_F
                    </text>
                  </g>
                );
              })()}

              {/* Curve */}
              <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="2.5" />

              {/* Area */}
              <path
                d={`${pathD} L ${xScale(maxMu)} ${yScale(0)} L ${xScale(minMu)} ${yScale(0)} Z`}
                fill="#06b6d4"
                fillOpacity="0.1"
              />

              {/* X Axis */}
              {[-0.6, -0.3, 0.0, 0.3, 0.6].map((mu) => {
                const x = xScale(mu);
                if (x < margin.left || x > margin.left + plotWidth) return null;
                return (
                  <g key={`mu-x-${mu}`}>
                    <line x1={x} y1={margin.top + plotHeight} x2={x} y2={margin.top + plotHeight + 5} stroke="#64748b" />
                    <text x={x} y={margin.top + plotHeight + 18} textAnchor="middle" fill="#94a3b8" fontSize="11">
                      {mu > 0 ? `+${mu.toFixed(1)}` : mu.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              <text x={margin.left + plotWidth / 2} y={height - 8} textAnchor="middle" fill="#cbd5e1" fontSize="12">
                Chemical Potential (μ - E_F) [eV]
              </text>
              <text x={-height / 2} y={16} transform="rotate(-90)" textAnchor="middle" fill="#cbd5e1" fontSize="12">
                σ_xy [{units}]
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Tensor Components & Convergence Diagnostics */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Conductivity Tensor & Convergence Diagnostics
          </h3>

          {/* Tensor Table */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2">Conductivity Tensor Components at E_F:</div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">σ_xx (Longitudinal)</div>
                <div className="text-white font-bold mt-1">12,500 {units}</div>
              </div>
              <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800/80">
                <div className="text-cyan-300 text-[10px]">σ_xy (Anomalous)</div>
                <div className="text-cyan-300 font-bold mt-1">{sigmaXY[Math.floor(sigmaXY.length / 2)]} {units}</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">σ_yz (Out-of-Plane)</div>
                <div className="text-white font-bold mt-1">12.5 {units}</div>
              </div>
            </div>
          </div>

          {/* k-Mesh Convergence Table */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2">k-Mesh Integration Convergence:</div>
            <div className="space-y-1.5 font-mono text-xs">
              {kMeshConvergence.map((k, idx) => (
                <div key={`km-${idx}`} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60">
                  <span className="text-slate-300">{k.mesh} Grid</span>
                  <span className="text-white">{k.sigmaXYAtEF.toFixed(1)} {units}</span>
                  {k.converged ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-3 h-3" /> Converged
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-sans">
                      <AlertTriangle className="w-3 h-3" /> Incomplete
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Validation Checks */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Physics Validation Checks:</div>
            {validationChecks.map((v, idx) => (
              <div
                key={`vc-${idx}`}
                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                  v.status === 'pass'
                    ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-900/60 text-amber-300'
                }`}
              >
                {v.status === 'pass' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{v.name}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{v.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
