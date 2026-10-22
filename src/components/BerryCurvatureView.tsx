import React, { useState } from 'react';
import { BerryCurvatureData, QuantumMaterialDataset } from '../types/physics';
import { Radio, ShieldAlert, Sparkles, Sliders, ArrowUpRight, Flame, Layers } from 'lucide-react';

interface BerryCurvatureViewProps {
  berryData?: BerryCurvatureData;
  material: QuantumMaterialDataset;
}

export const BerryCurvatureView: React.FC<BerryCurvatureViewProps> = ({
  berryData,
  material,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(0);

  if (!berryData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-3">
        <Radio className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">Berry Curvature Data Not Available</h3>
        <p className="text-xs max-w-md mx-auto">
          Berry curvature requires explicit velocity operator matrix elements {"<n|v_x|m><m|v_y|n>"}
          from Wannier90 or noncollinear DFT with SOC. It cannot be computed solely from scalar eigenvalues.
        </p>
      </div>
    );
  }

  const { gridX, gridY, omegaZ, hotspots, units } = berryData;
  const size = gridX.length;

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-violet-950/60 border border-violet-800/60 text-violet-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Berry Curvature Distribution Ω_z(k)
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                  Wannier-Interpolated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Momentum-resolved geometric gauge field in the (k_x, k_y) plane driving topological anomalous transport
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Peak Ω_z:</span>{' '}
              <span className="font-bold text-rose-400">
                +{hotspots[0]?.omegaValue ?? 1200} {units}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Hotspots:</span>{' '}
              <span className="font-bold text-cyan-300">{hotspots.length} detected</span>
            </div>
          </div>
        </div>

        {/* Section 8.F1 & 10 Cancellation Caveat */}
        <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Hotspot Cancellation Caveat (Section 8.F1 & 10):</strong>{' '}
            A large Berry-curvature hotspot does <span className="underline font-semibold text-white">not necessarily imply</span>{' '}
            a large net Anomalous Hall Conductivity. Contributions from different bands and
            time-reversal or symmetry-related momentum regions often cancel when integrated over all
            occupied states.
          </div>
        </div>
      </div>

      {/* Grid: 2D Heatmap & Hotspot Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Heatmap Visualizer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center justify-between">
            <span>2D Berry Curvature Field Ω_z(k_x, k_y) at k_z = {berryData.sliceCoord}</span>
            <span className="text-[11px] font-mono text-cyan-400">Units: {units}</span>
          </h3>

          <div className="relative flex justify-center bg-slate-950 border border-slate-800 rounded-lg p-3">
            <svg viewBox="0 0 360 360" className="w-full max-w-[360px] h-auto select-none font-sans">
              {/* Render Heatmap cells */}
              {omegaZ.map((row, iy) =>
                row.map((val, ix) => {
                  const x = (ix / size) * 320 + 20;
                  const y = (iy / size) * 320 + 20;
                  const w = 320 / size;
                  const h = 320 / size;

                  // Normalize color: blue (-), dark (0), red/yellow (+)
                  let fill = '#090d16';
                  if (val > 100) fill = `rgba(244, 63, 94, ${Math.min(1, val / 1000)})`;
                  else if (val > 20) fill = `rgba(251, 191, 36, ${Math.min(1, val / 300)})`;
                  else if (val < -20) fill = `rgba(56, 189, 248, ${Math.min(1, Math.abs(val) / 300)})`;

                  return <rect key={`cell-${ix}-${iy}`} x={x} y={y} width={w} height={h} fill={fill} />;
                })
              )}

              {/* Grid axes */}
              <line x1="180" y1="20" x2="180" y2="340" stroke="#475569" strokeWidth="1" />
              <line x1="20" y1="180" x2="340" y2="180" stroke="#475569" strokeWidth="1" />

              {/* Hotspot Markers */}
              {hotspots.map((h, idx) => {
                const hx = ((h.kx + 1) / 2) * 320 + 20;
                const hy = ((-h.ky + 1) / 2) * 320 + 20;
                const isSelected = selectedHotspot === idx;
                return (
                  <g
                    key={`hs-mark-${idx}`}
                    className="cursor-pointer"
                    onClick={() => setSelectedHotspot(idx)}
                  >
                    <circle
                      cx={hx}
                      cy={hy}
                      r="8"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray="2 2"
                    />
                    <circle cx={hx} cy={hy} r="3" fill="#f43f5e" />
                    <text
                      x={hx + 10}
                      y={hy + 4}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      #{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Axis labels */}
              <text x="330" y="174" fill="#cbd5e1" fontSize="10">
                +k_x
              </text>
              <text x="185" y="32" fill="#cbd5e1" fontSize="10">
                +k_y
              </text>
              <text x="185" y="195" fill="#94a3b8" fontSize="10">
                Γ (0,0)
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Positive Hotspot (+Ω_z)</span>
              <span className="w-3 h-3 rounded bg-cyan-500 ml-2" />
              <span>Negative Hotspot (-Ω_z)</span>
            </div>
            <span className="font-mono text-[11px]">Integration Grid: {size}×{size}</span>
          </div>
        </div>

        {/* Hotspots Breakdown */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Identified Berry Hotspots</span>
          </h3>

          <div className="space-y-3">
            {hotspots.map((h, idx) => (
              <div
                key={`hs-card-${idx}`}
                onClick={() => setSelectedHotspot(idx)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedHotspot === idx
                    ? 'bg-slate-800 border-violet-500/80 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1 font-mono text-xs">
                  <span className="font-bold text-white">Hotspot #{idx + 1}</span>
                  <span className="text-rose-400 font-bold">
                    +{h.omegaValue} {units}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                  <div>
                    k-vector: ({h.kx.toFixed(3)}, {h.ky.toFixed(3)}, 0)
                  </div>
                  <div>Origin: Band anti-crossing near Dirac point</div>
                </div>
                <p className="mt-2 text-[11px] text-slate-300 border-t border-slate-800/80 pt-1.5">
                  {h.note}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Gauge-Invariant Formulation:</div>
            <p className="font-mono text-[10px] text-cyan-300">
              {"Ω_z^n(k) = -2 Im ∑_{m != n} <n|v_x|m><m|v_y|n> / (E_m - E_n)^2"}
            </p>
            <p className="text-slate-400 mt-1">
              Note the inverse square energy denominator (E_m - E_n)²: Berry curvature peaks
              massively wherever bands approach degeneracy with a small SOC gap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
