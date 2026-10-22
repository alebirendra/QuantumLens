import React, { useState } from 'react';
import { DOSData, VanHoveCandidate } from '../types/physics';
import { Activity, Download, Eye, AlertCircle } from 'lucide-react';

interface DOSPlotProps {
  data: DOSData;
  vanHoveCandidates?: VanHoveCandidate[];
  onSelectVanHove?: (vhs: VanHoveCandidate) => void;
}

export const DOSPlot: React.FC<DOSPlotProps> = ({
  data,
  vanHoveCandidates = [],
  onSelectVanHove,
}) => {
  const [showProjections, setShowProjections] = useState<boolean>(true);
  const [showVHS, setShowVHS] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ energy: number; total: number; x: number; y: number } | null>(null);

  const width = 750;
  const height = 450;
  const margin = { top: 25, right: 30, bottom: 45, left: 65 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Extents
  const minE = Math.min(...data.points.map((p) => p.energy - data.eFermi));
  const maxE = Math.max(...data.points.map((p) => p.energy - data.eFermi));
  const maxDOS = Math.max(...data.points.map((p) => p.total), 1.0);

  const xScale = (e: number) => margin.left + ((e - minE) / (maxE - minE)) * plotWidth;
  const yScale = (dos: number) => margin.top + (1 - dos / maxDOS) * plotHeight;

  // Y-axis ticks
  const yTicks = [0, maxDOS * 0.25, maxDOS * 0.5, maxDOS * 0.75, maxDOS];

  // Path generator
  let totalD = '';
  let spinUpD = '';
  let spinDownD = '';

  data.points.forEach((pt, idx) => {
    const x = xScale(pt.energy - data.eFermi);
    const yTot = yScale(pt.total);
    if (idx === 0) totalD += `M ${x} ${yTot}`;
    else totalD += ` L ${x} ${yTot}`;

    if (pt.spinUp !== undefined) {
      const yUp = yScale(pt.spinUp);
      if (idx === 0) spinUpD += `M ${x} ${yUp}`;
      else spinUpD += ` L ${x} ${yUp}`;
    }
    if (pt.spinDown !== undefined) {
      const yDown = yScale(pt.spinDown);
      if (idx === 0) spinDownD += `M ${x} ${yDown}`;
      else spinDownD += ` L ${x} ${yDown}`;
    }
  });

  const handleExportCSV = () => {
    let csv = 'energy_relative_to_EF_eV,total_dos,spin_up,spin_down\n';
    data.points.forEach((p) => {
      csv += `${(p.energy - data.eFermi).toFixed(4)},${p.total},${p.spinUp ?? ''},${p.spinDown ?? ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.systemName.replace(/\s+/g, '_')}_dos.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Electronic Density of States (DOS & PDOS)
            </h2>
            <p className="text-xs text-slate-400">
              Total, spin-resolved, and orbital-projected states vs energy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowVHS(!showVHS)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border cursor-pointer ${
              showVHS ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>van Hove Candidates ({vanHoveCandidates.length})</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative bg-slate-950 rounded-lg p-2 border border-slate-800/80">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none font-sans">
          {/* Y Gridlines */}
          {yTicks.map((val) => {
            const y = yScale(val);
            return (
              <g key={`y-${val}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Fermi Energy Line at 0 eV */}
          {(() => {
            const x0 = xScale(0);
            return (
              <g>
                <line
                  x1={x0}
                  y1={margin.top}
                  x2={x0}
                  y2={margin.top + plotHeight}
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text x={x0 + 4} y={margin.top + 14} fill="#22d3ee" fontSize="11" fontWeight="bold">
                  E_F = 0 eV
                </text>
              </g>
            );
          })()}

          {/* Area fill for total DOS */}
          <path
            d={`${totalD} L ${xScale(maxE)} ${yScale(0)} L ${xScale(minE)} ${yScale(0)} Z`}
            fill="#3b82f6"
            fillOpacity="0.12"
          />

          {/* Total DOS Line */}
          <path d={totalD} fill="none" stroke="#60a5fa" strokeWidth="2.2" />

          {/* Spin Up Line if exists */}
          {spinUpD && (
            <path d={spinUpD} fill="none" stroke="#f43f5e" strokeWidth="1.6" strokeDasharray="5 2" />
          )}

          {/* Spin Down Line if exists */}
          {spinDownD && (
            <path d={spinDownD} fill="none" stroke="#818cf8" strokeWidth="1.6" strokeDasharray="2 2" />
          )}

          {/* van Hove Singularity Markers */}
          {showVHS &&
            vanHoveCandidates.map((vhs, idx) => {
              const x = xScale(vhs.energy);
              const y = yScale(vhs.dosValue);
              return (
                <g
                  key={`vhs-${idx}`}
                  className="cursor-pointer group"
                  onClick={() => onSelectVanHove?.(vhs)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="animate-bounce"
                  />
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={margin.top + plotHeight}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    strokeOpacity="0.7"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    VHS #{idx + 1}
                  </text>
                </g>
              );
            })}

          {/* X Axis Ticks */}
          {[-2.0, -1.0, 0.0, 1.0, 2.0].map((e) => {
            const x = xScale(e);
            if (x < margin.left || x > margin.left + plotWidth) return null;
            return (
              <g key={`x-${e}`}>
                <line x1={x} y1={margin.top + plotHeight} x2={x} y2={margin.top + plotHeight + 5} stroke="#64748b" />
                <text
                  x={x}
                  y={margin.top + plotHeight + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                >
                  {e > 0 ? `+${e.toFixed(1)}` : e.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X Axis Label */}
          <text
            x={margin.left + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="12"
          >
            Energy (E - E_F) [eV]
          </text>

          {/* Y Axis Label */}
          <text
            x={-height / 2}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="12"
          >
            Density of States [states / eV / cell]
          </text>
        </svg>
      </div>

      {/* Legend & van Hove info card */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-blue-400 rounded" />
            <span>Total DOS</span>
          </div>
          {data.points[0]?.spinUp !== undefined && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-rose-500 rounded" />
                <span>Spin-Up</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-indigo-400 rounded" />
                <span>Spin-Down</span>
              </div>
            </>
          )}
          {showVHS && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>van Hove Singularity Candidate</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>E_F: {data.eFermi.toFixed(3)} eV</span>
          <span>•</span>
          <span>Sampling: {data.points.length} energy points</span>
        </div>
      </div>

      {/* Physics Caveat banner */}
      <div className="mt-3 p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Physics Interpretation Rule (Section 4.B3):</strong>{' '}
          A peak in the DOS is treated as a candidate feature and not definitive proof of a van Hove
          singularity without verified 3D saddle-point dispersion (∇_k E_n(k) = 0).
        </span>
      </div>
    </div>
  );
};
