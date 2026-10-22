import React, { useState, useMemo, useRef } from 'react';
import { BandStructureData, DiracCandidate } from '../types/physics';
import { ZoomIn, ZoomOut, Download, Sliders, Info, Eye, Layers } from 'lucide-react';

interface BandStructurePlotProps {
  data: BandStructureData;
  diracCandidates?: DiracCandidate[];
  onSelectCandidate?: (candidate: DiracCandidate) => void;
  selectedBandIndex?: number | null;
  onSelectBandIndex?: (idx: number | null) => void;
}

export const BandStructurePlot: React.FC<BandStructurePlotProps> = ({
  data,
  diracCandidates = [],
  onSelectCandidate,
  selectedBandIndex = null,
  onSelectBandIndex,
}) => {
  const [energyRange, setEnergyRange] = useState<[number, number]>([-2.5, 2.5]);
  const [useFermiReference, setUseFermiReference] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<'spin' | 'orbital' | 'monochrome'>('spin');
  const [showCrossings, setShowCrossings] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<{
    bandIndex: number;
    kLabel?: string;
    kDistance: number;
    energy: number;
    x: number;
    y: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // Chart dimensions
  const width = 850;
  const height = 480;
  const margin = { top: 30, right: 30, bottom: 45, left: 60 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Reciprocal distance extent
  const maxDist = useMemo(() => {
    return Math.max(...data.kPoints.map((k) => k.distance), 0.001);
  }, [data.kPoints]);

  // Coordinate transforms
  const xScale = (dist: number) => margin.left + (dist / maxDist) * plotWidth;
  const yScale = (e: number) => {
    const energy = useFermiReference ? e - data.eFermi : e;
    const [minE, maxE] = energyRange;
    return margin.top + (1 - (energy - minE) / (maxE - minE)) * plotHeight;
  };

  // Generate energy ticks
  const energyTicks = useMemo(() => {
    const [minE, maxE] = energyRange;
    const count = 7;
    const step = (maxE - minE) / (count - 1);
    return Array.from({ length: count }, (_, i) => Number((minE + i * step).toFixed(2)));
  }, [energyRange]);

  // Handle Export CSV
  const handleExportCSV = () => {
    let csv = 'k_distance,k_label,kx,ky,kz,band_index,spin,energy_eV\n';
    data.bands.forEach((band) => {
      band.points.forEach((pt, kIdx) => {
        const kp = data.kPoints[kIdx];
        csv += `${kp.distance},${kp.label || ''},${kp.coords.join(';')},${band.bandIndex},${band.spinChannel},${(pt.energy - (useFermiReference ? data.eFermi : 0)).toFixed(5)}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.systemName.replace(/\s+/g, '_')}_bands.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-200">
      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Reciprocal-Space Band Structure Explorer
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {data.sourceFormat}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Energy Reference Toggle */}
          <button
            onClick={() => setUseFermiReference(!useFermiReference)}
            className={`px-2.5 py-1 rounded font-medium border cursor-pointer ${
              useFermiReference
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Ref: {useFermiReference ? 'E - E_F (0 eV)' : `E_raw (E_F = ${data.eFermi} eV)`}
          </button>

          {/* Color Mode */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setColorMode('spin')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                colorMode === 'spin' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Spin Channel
            </button>
            <button
              onClick={() => setColorMode('orbital')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                colorMode === 'orbital' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Orbital Proj
            </button>
          </div>

          {/* Toggle Crossings */}
          <button
            onClick={() => setShowCrossings(!showCrossings)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border cursor-pointer ${
              showCrossings
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Crossings ({diracCandidates.length})</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-1 py-0.5">
            <button
              title="Zoom In"
              onClick={() =>
                setEnergyRange(([min, max]) => [Number((min * 0.8).toFixed(2)), Number((max * 0.8).toFixed(2))])
              }
              className="p-1 hover:text-cyan-300 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              title="Zoom Out"
              onClick={() =>
                setEnergyRange(([min, max]) => [Number((min * 1.25).toFixed(2)), Number((max * 1.25).toFixed(2))])
              }
              className="p-1 hover:text-cyan-300 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              title="Reset Zoom"
              onClick={() => setEnergyRange([-2.5, 2.5])}
              className="px-1 text-[10px] text-slate-400 hover:text-white cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main Interactive SVG Plot */}
      <div className="relative overflow-x-auto bg-slate-950 rounded-lg p-2 border border-slate-800/80">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none font-sans"
        >
          {/* Background gridlines for energy */}
          {energyTicks.map((e) => {
            const y = yScale(useFermiReference ? e + data.eFermi : e);
            if (y < margin.top || y > margin.top + plotHeight) return null;
            return (
              <g key={`etick-${e}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {e.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Fermi Level (E = 0) highlighted line */}
          {(() => {
            const y0 = yScale(data.eFermi);
            if (y0 >= margin.top && y0 <= margin.top + plotHeight) {
              return (
                <g>
                  <line
                    x1={margin.left}
                    y1={y0}
                    x2={margin.left + plotWidth}
                    y2={y0}
                    stroke="#06b6d4"
                    strokeDasharray="5 3"
                    strokeWidth="1.5"
                  />
                  <text
                    x={margin.left + plotWidth - 4}
                    y={y0 - 5}
                    textAnchor="end"
                    fill="#22d3ee"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    E_F
                  </text>
                </g>
              );
            }
            return null;
          })()}

          {/* High symmetry vertical lines and labels */}
          {data.highSymmetryPoints.map((sym, idx) => {
            const x = xScale(sym.distance);
            return (
              <g key={`sym-${idx}`}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={margin.top + plotHeight}
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={margin.top + plotHeight + 18}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="13"
                  fontWeight="bold"
                >
                  {sym.label}
                </text>
              </g>
            );
          })}

          {/* Plot Bands */}
          {data.bands.map((band) => {
            const isSelected = selectedBandIndex === band.bandIndex;
            // Build SVG path
            let d = '';
            band.points.forEach((pt, pIdx) => {
              const x = xScale(data.kPoints[pIdx].distance);
              const y = yScale(pt.energy);
              if (pIdx === 0) d += `M ${x} ${y}`;
              else d += ` L ${x} ${y}`;
            });

            // Color selection based on spin channel or orbital
            let strokeColor = '#38bdf8'; // Default cyan
            if (colorMode === 'spin') {
              if (band.spinChannel === 'up') strokeColor = '#f43f5e'; // Rose / crimson
              else if (band.spinChannel === 'down') strokeColor = '#6366f1'; // Indigo
              else if (band.spinChannel === 'noncollinear') strokeColor = '#10b981'; // Emerald
            } else if (colorMode === 'orbital') {
              // Color based on primary orbital weight if available
              const firstWithOrb = band.points[0]?.projections?.[0]?.orbital;
              if (firstWithOrb?.includes('d')) strokeColor = '#eab308'; // Amber for d-orbitals
              else if (firstWithOrb?.includes('p')) strokeColor = '#06b6d4'; // Cyan for p
              else strokeColor = '#a855f7'; // Purple for others
            }

            return (
              <g key={`band-${band.bandIndex}-${band.spinChannel}`}>
                {/* Wider invisible stroke for easy clicking/hovering */}
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="12"
                  className="cursor-pointer"
                  onClick={() => onSelectBandIndex?.(isSelected ? null : band.bandIndex)}
                />
                {/* Visible band curve */}
                <path
                  d={d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '3.5' : '1.8'}
                  strokeOpacity={selectedBandIndex && !isSelected ? 0.25 : 0.95}
                  className="transition-all duration-150"
                />

                {/* Interactive Points on hover */}
                {isSelected &&
                  band.points.map((pt, pIdx) => {
                    const x = xScale(data.kPoints[pIdx].distance);
                    const y = yScale(pt.energy);
                    if (y < margin.top || y > margin.top + plotHeight) return null;
                    return (
                      <circle
                        key={`pt-${pIdx}`}
                        cx={x}
                        cy={y}
                        r="3"
                        fill={strokeColor}
                        stroke="#0f172a"
                        strokeWidth="1"
                        className="cursor-pointer hover:r-5 transition-all"
                        onMouseEnter={() => {
                          setHoveredPoint({
                            bandIndex: band.bandIndex,
                            kLabel: data.kPoints[pIdx].label,
                            kDistance: data.kPoints[pIdx].distance,
                            energy: pt.energy - (useFermiReference ? data.eFermi : 0),
                            x,
                            y,
                          });
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
              </g>
            );
          })}

          {/* Highlight Candidate Dirac / Band Crossings */}
          {showCrossings &&
            diracCandidates.map((c) => {
              const x = xScale(data.kPoints[c.kIndex].distance);
              const y = yScale(c.energy + (useFermiReference ? data.eFermi : 0));
              if (y < margin.top || y > margin.top + plotHeight) return null;

              return (
                <g
                  key={c.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectCandidate?.(c)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="6.5"
                    fill={c.isAvoidedCrossing ? '#f59e0b' : '#ef4444'}
                    fillOpacity="0.8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill="none"
                    stroke={c.isAvoidedCrossing ? '#f59e0b' : '#ef4444'}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                </g>
              );
            })}

          {/* Y-Axis Label */}
          <text
            x={-height / 2}
            y={16}
            transform="rotate(-90)"
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="500"
          >
            {useFermiReference ? 'Energy (E - E_F) [eV]' : 'Energy (E_raw) [eV]'}
          </text>

          {/* X-Axis Label */}
          <text
            x={margin.left + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="12"
          >
            Reciprocal Space Wavevector Path k
          </text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none z-10 bg-slate-900 border border-slate-700 shadow-xl rounded px-2.5 py-1.5 text-xs text-white"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-semibold text-cyan-300">
              Band #{hoveredPoint.bandIndex} {hoveredPoint.kLabel ? `at ${hoveredPoint.kLabel}` : ''}
            </div>
            <div>Energy: {hoveredPoint.energy.toFixed(3)} eV</div>
            <div className="text-[10px] text-slate-400">Dist: {hoveredPoint.kDistance.toFixed(3)} 1/Å</div>
          </div>
        )}
      </div>

      {/* Plot Legend & Meta Stats */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-4">
          {colorMode === 'spin' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-rose-500 rounded" />
                <span>Spin-Up (↑)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-indigo-500 rounded" />
                <span>Spin-Down (↓)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-500 rounded" />
                <span>Noncollinear</span>
              </div>
            </>
          )}
          {colorMode === 'orbital' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-amber-400 rounded" />
                <span>d-orbital Dominant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-cyan-400 rounded" />
                <span>p-orbital Dominant</span>
              </div>
            </>
          )}
          {showCrossings && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Candidate Dirac Crossing</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>k-points: {data.kPoints.length}</span>
          <span>•</span>
          <span>Bands: {data.bands.length}</span>
          <span>•</span>
          <span>
            {selectedBandIndex ? `Selected: Band #${selectedBandIndex}` : 'Click any band to inspect'}
          </span>
        </div>
      </div>
    </div>
  );
};
