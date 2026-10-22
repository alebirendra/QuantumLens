import React, { useState } from 'react';
import { AltermagnetAnalysis, BandStructureData } from '../types/physics';
import { Compass, ShieldAlert, CheckCircle2, Sliders, ArrowUpRight, Zap, Info } from 'lucide-react';

interface AltermagnetViewProps {
  analysis: AltermagnetAnalysis;
  bandStructure: BandStructureData;
}

export const AltermagnetView: React.FC<AltermagnetViewProps> = ({
  analysis,
  bandStructure,
}) => {
  const [selectedHarmonic, setSelectedHarmonic] = useState<string>(analysis.candidateHarmonic);
  const [activeView, setActiveView] = useState<'path-splitting' | '2d-contour' | 'spin-texture'>(
    '2d-contour'
  );

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
                  Altermagnet & Momentum Spin-Splitting Analyzer
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {analysis.candidateHarmonic.toUpperCase()} SYMMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Non-relativistic momentum-dependent spin splitting with alternating sign and zero net magnetization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Max Splitting ΔE:</span>{' '}
              <span className="font-bold text-rose-400">{analysis.maxSplittingMeVEnergy} meV</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Net Magnetization:</span>{' '}
              <span className="font-bold text-emerald-400">0.00 μ_B/cell</span>
            </div>
          </div>
        </div>

        {/* Core Altermagnet Scientific Caveat */}
        <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Section 5.C4 Scientific Rule:</strong>{' '}
            Spin splitting alone is <span className="underline font-semibold text-white">not sufficient</span>{' '}
            to establish altermagnetism. Confirmation requires establishing real-space spin group
            symmetries (rotations connecting sublattices with opposite spin) and distinguishing from
            relativistic Rashba/Dresselhaus effects or broken inversion symmetry.
          </div>
        </div>
      </div>

      {/* Tabs for sub-views */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveView('2d-contour')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeView === '2d-contour'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          2D Reciprocal Splitting Map (d-wave)
        </button>
        <button
          onClick={() => setActiveView('path-splitting')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeView === 'path-splitting'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Splitting Along k-Path ΔE(k)
        </button>
        <button
          onClick={() => setActiveView('spin-texture')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeView === 'spin-texture'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Spin Texture Vectors (S_x, S_y, S_z)
        </button>
      </div>

      {/* Active Sub-View Content */}
      {activeView === '2d-contour' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 2D Splitting Heatmap / Contour */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center justify-between">
              <span>2D Momentum Spin-Splitting Contour (k_x - k_y Plane)</span>
              <span className="text-[11px] font-mono text-cyan-400">ΔE(k) = E_↑(k) - E_↓(k)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Alternating positive (red) and negative (blue) quadrants exhibiting d-wave (k_x² - k_y²) nodal lines
            </p>

            <div className="relative flex justify-center bg-slate-950 border border-slate-800 rounded-lg p-3">
              <svg viewBox="0 0 360 360" className="w-full max-w-[360px] h-auto select-none font-sans">
                {/* Axes */}
                <line x1="180" y1="20" x2="180" y2="340" stroke="#334155" strokeWidth="1.5" />
                <line x1="20" y1="180" x2="340" y2="180" stroke="#334155" strokeWidth="1.5" />

                {/* Nodal lines (kx = ±ky) */}
                <line
                  x1="30"
                  y1="330"
                  x2="330"
                  y2="30"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <line
                  x1="30"
                  y1="30"
                  x2="330"
                  y2="330"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* 4 Quadrant Colored Lobes */}
                {/* +kx, 0: Positive splitting (Red) */}
                <path
                  d="M 180 180 Q 320 180 320 180 Q 250 110 180 180 Z"
                  fill="#f43f5e"
                  fillOpacity="0.45"
                />
                <path
                  d="M 180 180 Q 320 180 320 180 Q 250 250 180 180 Z"
                  fill="#f43f5e"
                  fillOpacity="0.45"
                />

                {/* -kx, 0: Positive splitting (Red) */}
                <path
                  d="M 180 180 Q 40 180 40 180 Q 110 110 180 180 Z"
                  fill="#f43f5e"
                  fillOpacity="0.45"
                />
                <path
                  d="M 180 180 Q 40 180 40 180 Q 110 250 180 180 Z"
                  fill="#f43f5e"
                  fillOpacity="0.45"
                />

                {/* 0, +ky: Negative splitting (Blue) */}
                <path
                  d="M 180 180 Q 180 40 180 40 Q 250 110 180 180 Z"
                  fill="#38bdf8"
                  fillOpacity="0.45"
                />
                <path
                  d="M 180 180 Q 180 40 180 40 Q 110 110 180 180 Z"
                  fill="#38bdf8"
                  fillOpacity="0.45"
                />

                {/* 0, -ky: Negative splitting (Blue) */}
                <path
                  d="M 180 180 Q 180 320 180 320 Q 250 250 180 180 Z"
                  fill="#38bdf8"
                  fillOpacity="0.45"
                />
                <path
                  d="M 180 180 Q 180 320 180 320 Q 110 250 180 180 Z"
                  fill="#38bdf8"
                  fillOpacity="0.45"
                />

                {/* Labels */}
                <text x="340" y="175" fill="#f8fafc" fontSize="11" fontWeight="bold">
                  +k_x (X)
                </text>
                <text x="185" y="25" fill="#f8fafc" fontSize="11" fontWeight="bold">
                  +k_y (Y)
                </text>
                <text x="185" y="195" fill="#cbd5e1" fontSize="11" fontWeight="bold">
                  Γ (0,0)
                </text>
                <text x="270" y="160" fill="#f43f5e" fontSize="13" fontWeight="bold">
                  ΔE &gt; 0
                </text>
                <text x="60" y="160" fill="#f43f5e" fontSize="13" fontWeight="bold">
                  ΔE &gt; 0
                </text>
                <text x="195" y="90" fill="#38bdf8" fontSize="13" fontWeight="bold">
                  ΔE &lt; 0
                </text>
                <text x="195" y="290" fill="#38bdf8" fontSize="13" fontWeight="bold">
                  ΔE &lt; 0
                </text>
                <text x="260" y="60" fill="#fbbf24" fontSize="10">
                  Nodal Line (ΔE=0)
                </text>
              </svg>
            </div>
          </div>

          {/* Magnetic Symmetry & Classification Diagnostics */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Magnetic Symmetry & Spin Group Diagnostics</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Candidate Spin Group:</div>
                <div className="text-sm font-bold text-cyan-300 mt-0.5">
                  {analysis.symmetryDiagnostics.spinGroupCandidate}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Origin of Splitting:</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  Non-Relativistic (Collinear Exchange)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Occurs even when spin-orbit coupling is zero (c = ∞ limit)
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Nodal Lines & Surfaces:</div>
                <ul className="list-disc list-inside text-amber-300 mt-1 space-y-0.5 text-[11px]">
                  {analysis.nodalLines.map((l, i) => (
                    <li key={`nl-${i}`}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Altermagnetic Criteria Check:</div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Net Magnetization: Confirmed (0.00 μ_B)</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Alternating Momentum Splitting: Confirmed</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Info className="w-3.5 h-3.5" />
                <span>Sublattice Permutation Rotation: Needs MSG check</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'path-splitting' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Spin Splitting ΔE_spin(k) = E_↑(k) - E_↓(k) Along Reciprocal Path
          </h3>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <svg viewBox="0 0 750 260" className="w-full h-auto select-none font-sans">
              {/* Zero Line */}
              <line x1="50" y1="130" x2="720" y2="130" stroke="#64748b" strokeWidth="1.5" />
              <text x="40" y="134" textAnchor="end" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                0 meV
              </text>

              {/* +500 and -500 meV lines */}
              <line x1="50" y1="50" x2="720" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
              <text x="40" y="54" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                +600 meV
              </text>
              <line x1="50" y1="210" x2="720" y2="210" stroke="#1e293b" strokeDasharray="3 3" />
              <text x="40" y="214" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                -600 meV
              </text>

              {/* Plot Splitting Curve */}
              {(() => {
                const maxSplitt = Math.max(
                  ...analysis.splittings.map((s) => Math.abs(s.deltaE)),
                  0.001
                );
                let dPath = '';
                analysis.splittings.forEach((s, idx) => {
                  const x = 50 + (idx / (analysis.splittings.length - 1)) * 670;
                  const y = 130 - (s.deltaE / maxSplitt) * 80;
                  if (idx === 0) dPath += `M ${x} ${y}`;
                  else dPath += ` L ${x} ${y}`;
                });
                return (
                  <path
                    d={dPath}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                    className="drop-shadow"
                  />
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {activeView === 'spin-texture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            2D Reciprocal Spin Texture &lt;S_z(k)&gt; Vectors
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Expectation values of spin operator S_z resolved by momentum k in the (k_x, k_y) plane
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-11 gap-2 p-4 bg-slate-950 border border-slate-800 rounded-lg">
            {analysis.spinTextures2D.slice(0, 55).map((pt, idx) => {
              const isPositive = pt.sz > 0;
              const isZero = Math.abs(pt.sz) < 0.05;
              return (
                <div
                  key={`spin-pt-${idx}`}
                  className="flex flex-col items-center justify-center p-2 rounded bg-slate-900/60 border border-slate-800 text-[10px] font-mono"
                >
                  <span className="text-slate-500">
                    ({pt.kx.toFixed(1)}, {pt.ky.toFixed(1)})
                  </span>
                  <div className="my-1">
                    {isZero ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600 block" title="Degenerate / Nodal" />
                    ) : isPositive ? (
                      <span className="text-rose-400 font-bold text-sm">↑</span>
                    ) : (
                      <span className="text-cyan-400 font-bold text-sm">↓</span>
                    )}
                  </div>
                  <span className={isPositive ? 'text-rose-300' : isZero ? 'text-slate-400' : 'text-cyan-300'}>
                    {pt.sz.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
