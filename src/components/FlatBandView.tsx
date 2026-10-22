import React, { useState, useMemo } from 'react';
import { FlatBandCandidate, BandStructureData } from '../types/physics';
import { detectFlatBands } from '../physics/analysis';
import { Cpu, Sliders, ShieldAlert, CheckCircle2, Sparkles, Layers, Info } from 'lucide-react';

interface FlatBandViewProps {
  initialCandidates: FlatBandCandidate[];
  bandStructure: BandStructureData;
}

export const FlatBandView: React.FC<FlatBandViewProps> = ({
  initialCandidates,
  bandStructure,
}) => {
  const [bandwidthThresholdMeV, setBandwidthThresholdMeV] = useState<number>(150);
  const [selectedBandIndex, setSelectedBandIndex] = useState<number | null>(
    initialCandidates[0]?.bandIndex ?? null
  );

  // Re-run detection dynamically as user adjusts threshold
  const candidates = useMemo(() => {
    return detectFlatBands(bandStructure, bandwidthThresholdMeV);
  }, [bandStructure, bandwidthThresholdMeV]);

  const selectedBand = useMemo(() => {
    if (!selectedBandIndex) return candidates[0] ?? null;
    return candidates.find((c) => c.bandIndex === selectedBandIndex) ?? candidates[0] ?? null;
  }, [candidates, selectedBandIndex]);

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Kagome Flat-Band Analyzer
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Destructive Interference
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Identify candidate flat and weakly dispersive bands associated with kagome lattice geometry
              </p>
            </div>
          </div>

          {/* Interactive Heuristic Threshold Slider */}
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">Bandwidth Threshold:</span>
                <span className="font-mono font-bold text-cyan-300">{bandwidthThresholdMeV} meV</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={bandwidthThresholdMeV}
                onChange={(e) => setBandwidthThresholdMeV(Number(e.target.value))}
                className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-1"
                aria-label="Bandwidth threshold in meV"
              />
            </div>
          </div>
        </div>

        {/* Heuristic Discipline Warning */}
        <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Heuristic Classification Disclaimer (Section 4.B1):</strong>{' '}
            The {bandwidthThresholdMeV} meV bandwidth threshold is a <em>user-defined heuristic</em>,
            not a universal physical criterion. A band that appears flat along a 1D high-symmetry
            cut may possess out-of-plane (k_z) dispersion or inter-layer hopping in three dimensions.
          </div>
        </div>
      </div>

      {/* Grid: Candidates Table and Detailed Kagome State Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Candidates List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">
              Candidate Flat Bands ({candidates.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Sorted by narrowest W</span>
          </div>

          {candidates.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No bands have bandwidth ≤ {bandwidthThresholdMeV} meV. Try raising the threshold slider.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {candidates.map((c) => {
                const isSelected = selectedBand?.bandIndex === c.bandIndex;
                return (
                  <div
                    key={`flat-${c.bandIndex}-${c.spinChannel}`}
                    onClick={() => setSelectedBandIndex(c.bandIndex)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500/80 shadow-md shadow-cyan-950/30'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          Band #{c.bandIndex}
                        </span>
                        {c.isKagomeDestructiveInterferenceCandidate && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Kagome CLS</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        W = {c.bandwidth} meV
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2 font-mono">
                      <div>
                        Mean Energy: <span className="text-slate-200">{c.meanEnergy.toFixed(3)} eV</span>
                      </div>
                      <div>
                        Energy Window: <span className="text-slate-200">[{c.minEnergy}, {c.maxEnergy}] eV</span>
                      </div>
                      <div className="col-span-2">
                        Orbital:{' '}
                        <span className="text-slate-300 font-sans">
                          {c.dominantOrbital ?? 'Hybridized'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          {selectedBand ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs font-mono text-cyan-400">
                    Band Index #{selectedBand.bandIndex} ({selectedBand.spinChannel.toUpperCase()})
                  </div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Kagome Localized State Candidate
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Total Bandwidth W</div>
                  <div className="text-xl font-bold text-cyan-300">
                    {selectedBand.bandwidth} meV
                  </div>
                </div>
              </div>

              {/* Segment Dispersion Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Directional Dispersion Along High-Symmetry Segments</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-900 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Path Segment</th>
                        <th className="py-2 px-3">Energy Spread ΔE</th>
                        <th className="py-2 px-3">Flatness Evaluation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono">
                      {selectedBand.dispersionAlongSegments.map((seg, idx) => (
                        <tr key={`seg-${idx}`} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 font-semibold text-white">
                            {seg.from} → {seg.to}
                          </td>
                          <td className="py-2 px-3 text-cyan-300">
                            {seg.deltaE} meV
                          </td>
                          <td className="py-2 px-3">
                            {seg.deltaE <= 50 ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Ultra-flat
                              </span>
                            ) : seg.deltaE <= 100 ? (
                              <span className="text-cyan-400">Weakly dispersive</span>
                            ) : (
                              <span className="text-amber-400">Dispersive</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Kagome Physics Destructive Interference Explanation */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Kagome Destructive Interference & Compact Localized States</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  In a 2D corner-sharing kagome geometry, quantum wavefunctions on adjacent vertices
                  exhibit alternating signs (+ψ and -ψ). Due to destructive quantum interference,
                  electrons are trapped inside localized hexagonal rings (compact localized states, CLS),
                  producing an exact flat band in tight-binding theory.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    In real crystals like Fe3Sn2 and CsV3Sb5, finite interlayer coupling, spin-orbit
                    coupling, and second-neighbor hopping introduce a residual bandwidth (typically
                    50–120 meV).
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              Select a candidate band from the left panel to inspect its directional dispersion.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
