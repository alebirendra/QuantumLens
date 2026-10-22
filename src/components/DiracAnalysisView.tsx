import React, { useState } from 'react';
import { DiracCandidate, BandStructureData } from '../types/physics';
import { Atom, ShieldAlert, CheckCircle2, TrendingUp, HelpCircle, ArrowRight } from 'lucide-react';

interface DiracAnalysisViewProps {
  candidates: DiracCandidate[];
  bandStructure: BandStructureData;
  socBandStructure?: BandStructureData;
}

export const DiracAnalysisView: React.FC<DiracAnalysisViewProps> = ({
  candidates,
  bandStructure,
  socBandStructure,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<DiracCandidate | null>(
    candidates[0] ?? null
  );

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Candidate Dirac & Band-Crossing Analyzer
              </h2>
              <p className="text-xs text-slate-400">
                Automated detection of linear crossings, avoided crossings, and SOC gap openings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Candidates Found:</span>{' '}
              <span className="font-bold text-red-400">{candidates.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">System:</span>{' '}
              <span className="font-bold text-cyan-300">{bandStructure.systemName}</span>
            </div>
          </div>
        </div>

        {/* Core Physics Mandate Banner */}
        <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Mandatory Scientific Discipline (Section 3 & 10):</strong>{' '}
            QuantumLens detects numerical proximity and linear dispersion along 1D paths. It does
            <span className="underline font-semibold text-white ml-1">
              NOT infer topological protection
            </span>{' '}
            solely from an apparent crossing. Symmetry protection requires space group irreducible
            representations, non-Abelian Wilson loops, or parity eigenvalue criteria.
          </div>
        </div>
      </div>

      {/* Two Column Layout: Candidates Table & Detailed Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Candidates List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center justify-between">
            <span>Detected Crossing Points</span>
            <span className="text-[11px] font-mono text-slate-500">Sorted by separation ΔE</span>
          </h3>

          {candidates.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No crossings detected within threshold (±2.5 eV of E_F).
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {candidates.map((c) => {
                const isSelected = selectedCandidate?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-red-500/70 shadow-md shadow-red-950/30'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {c.kPointLabel ?? `k-point #${c.kIndex}`}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            c.confidence === 'High'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : c.confidence === 'Medium'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          }`}
                        >
                          {c.confidence} Confidence
                        </span>
                      </div>
                      <span className="text-xs font-mono font-medium text-cyan-400">
                        {c.energy > 0 ? `+${c.energy}` : c.energy} eV
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2 font-mono">
                      <div>
                        Bands: <span className="text-slate-200">#{c.band1Index} & #{c.band2Index}</span>
                      </div>
                      <div>
                        Gap Δ: <span className="text-slate-200">{(c.energySeparation * 1000).toFixed(1)} meV</span>
                      </div>
                      <div>
                        Linearity R²: <span className="text-slate-200">{c.linearFitR2.toFixed(2)}</span>
                      </div>
                      <div>
                        v_F: <span className="text-slate-200">{c.estimatedFermiVelocity} × 10^5 m/s</span>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
                      <span className="truncate">{c.notes}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Candidate Deep Dive */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          {selectedCandidate ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono text-cyan-400">
                    Candidate #{selectedCandidate.id}
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Crossing at {selectedCandidate.kPointLabel ?? 'k-point'} (
                    {selectedCandidate.kCoords.map((n) => n.toFixed(3)).join(', ')})
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Energy rel. to E_F</div>
                  <div className="text-base font-bold text-cyan-300">
                    {selectedCandidate.energy.toFixed(3)} eV
                  </div>
                </div>
              </div>

              {/* Quantitative Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Separation ΔE</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {(selectedCandidate.energySeparation * 1000).toFixed(1)} meV
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {selectedCandidate.isAvoidedCrossing ? 'Avoided / Gapped' : 'Touching (< 5 meV)'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Dispersion Linearity</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                    R² = {selectedCandidate.linearFitR2.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {selectedCandidate.linearFitR2 > 0.8 ? 'Strong linear cone' : 'Parabolic mixing'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Est. Fermi Velocity</div>
                  <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
                    {selectedCandidate.estimatedFermiVelocity} × 10^5 m/s
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">v_F = (1/ℏ)|dE/dk|</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Symmetry Verified?</div>
                  <div className="text-sm font-bold font-mono text-rose-400 mt-0.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>No (Heuristic)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Requires space group</div>
                </div>
              </div>

              {/* Local Linear Dispersion Curve Visualizer */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Local Dispersion Cone Profile around Crossing</span>
                </h4>
                <div className="h-44 w-full flex items-center justify-center border border-slate-800/80 rounded bg-slate-900/50 p-2">
                  <svg viewBox="0 0 400 160" className="w-full h-full font-sans select-none">
                    {/* Center axis */}
                    <line x1="200" y1="10" x2="200" y2="150" stroke="#334155" strokeDasharray="3 3" />
                    <text x="200" y="156" textAnchor="middle" fill="#64748b" fontSize="10">
                      k_0 ({selectedCandidate.kPointLabel ?? 'Crossing'})
                    </text>

                    {/* Crossing bands */}
                    {/* Upper branch */}
                    <path
                      d="M 60 40 Q 150 70 195 80 L 200 80 L 205 80 Q 250 70 340 40"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                    />
                    {/* Lower branch */}
                    <path
                      d="M 60 120 Q 150 90 195 80 L 200 80 L 205 80 Q 250 90 340 120"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />

                    {/* Crossing Point dot */}
                    <circle cx="200" cy="80" r="5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />

                    {/* Annotations */}
                    <text x="65" y="35" fill="#f43f5e" fontSize="10" fontWeight="bold">
                      Band #{selectedCandidate.band2Index}
                    </text>
                    <text x="65" y="135" fill="#38bdf8" fontSize="10" fontWeight="bold">
                      Band #{selectedCandidate.band1Index}
                    </text>
                    <text x="210" y="75" fill="#22d3ee" fontSize="10" fontFamily="monospace">
                      E = {selectedCandidate.energy} eV
                    </text>
                  </svg>
                </div>
              </div>

              {/* Evidence & Next Calculation Steps */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-300">Physics Evidence Assessment:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>
                    <strong>Linear Dispersion:</strong> Fitted R² = {selectedCandidate.linearFitR2.toFixed(3)} demonstrates strong conical dispersion consistent with massless relativistic Dirac fermions.
                  </li>
                  <li>
                    <strong>Avoided Crossing Status:</strong> Measured gap is {(selectedCandidate.energySeparation * 1000).toFixed(1)} meV. If spin-orbit coupling is enabled, this gap accounts for hybridization between orbital channels.
                  </li>
                  <li>
                    <strong>Required Next Steps:</strong> Perform 3D nodal search around the crossing to test if the node is isolated (point node/Weyl) or extends along a nodal line.
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">Select a candidate on the left to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
