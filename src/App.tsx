/**
 * QuantumLens — Quantum Materials & Advanced Electronic-Structure Platform
 * Specializing in electronic structures, quantum materials, magnetism, and topological phenomena.
 */

import React, { useState } from 'react';
import { BENCHMARK_DATASETS } from './data/materials';
import { QuantumMaterialDataset, DiracCandidate, VanHoveCandidate } from './types/physics';
import { Navbar, ActiveTab } from './components/Navbar';
import { BandStructurePlot } from './components/BandStructurePlot';
import { DOSPlot } from './components/DOSPlot';
import { DiracAnalysisView } from './components/DiracAnalysisView';
import { FlatBandView } from './components/FlatBandView';
import { AltermagnetView } from './components/AltermagnetView';
import { SOCComparisonView } from './components/SOCComparisonView';
import { FermiSurfaceView } from './components/FermiSurfaceView';
import { BerryCurvatureView } from './components/BerryCurvatureView';
import { AHCView } from './components/AHCView';
import { MagneticSymmetryView } from './components/MagneticSymmetryView';
import { ConvergenceValidator } from './components/ConvergenceValidator';
import { DiagnosticReportView } from './components/DiagnosticReportView';
import { DataUploaderModal } from './components/DataUploaderModal';
import {
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  AlertOctagon,
  ChevronRight,
  Atom,
} from 'lucide-react';

export default function App() {
  const [materials, setMaterials] = useState<QuantumMaterialDataset[]>(BENCHMARK_DATASETS);
  const [selectedMaterial, setSelectedMaterial] = useState<QuantumMaterialDataset>(BENCHMARK_DATASETS[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('band-structure');
  const [selectedBandIndex, setSelectedBandIndex] = useState<number | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);

  // When a crossing is selected in Band Structure, route to Dirac tab
  const handleSelectDiracCandidate = (c: DiracCandidate) => {
    setActiveTab('dirac');
  };

  // When a van Hove singularity is selected in DOS, route to Flat Band or Band Structure
  const handleSelectVanHove = (vhs: VanHoveCandidate) => {
    setActiveTab('dos');
  };

  const handleDatasetLoaded = (newDataset: QuantumMaterialDataset) => {
    setMaterials((prev) => [newDataset, ...prev]);
    setSelectedMaterial(newDataset);
    setActiveTab('band-structure');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        materials={materials}
        selectedMaterial={selectedMaterial}
        onSelectMaterial={setSelectedMaterial}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenUploader={() => setIsUploaderOpen(true)}
      />

      {/* Main Material Summary Header */}
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                  {selectedMaterial.name}
                </h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  {selectedMaterial.category}
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  {selectedMaterial.magneticState}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl truncate">
                {selectedMaterial.description}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Space Group:</span>{' '}
              <span className="text-white font-bold">{selectedMaterial.spaceGroup}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Band Gap:</span>{' '}
              <span className="text-cyan-300 font-bold">
                {selectedMaterial.bandStructure.calculatedGap?.gapEnergy
                  ? `${selectedMaterial.bandStructure.calculatedGap.gapEnergy.toFixed(3)} eV`
                  : '0.000 eV (Metallic)'}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Source:</span>{' '}
              <span className="text-emerald-400 font-bold">
                {selectedMaterial.bandStructure.sourceFormat}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'band-structure' && (
          <div className="space-y-6">
            <BandStructurePlot
              data={selectedMaterial.bandStructure}
              diracCandidates={selectedMaterial.diracCandidates}
              onSelectCandidate={handleSelectDiracCandidate}
              selectedBandIndex={selectedBandIndex}
              onSelectBandIndex={setSelectedBandIndex}
            />

            {/* Accompanying Aligned DOS if available */}
            {selectedMaterial.dos.points.length > 0 && (
              <DOSPlot
                data={selectedMaterial.dos}
                vanHoveCandidates={selectedMaterial.vanHoveCandidates}
                onSelectVanHove={handleSelectVanHove}
              />
            )}
          </div>
        )}

        {activeTab === 'dos' && (
          <DOSPlot
            data={selectedMaterial.dos}
            vanHoveCandidates={selectedMaterial.vanHoveCandidates}
            onSelectVanHove={handleSelectVanHove}
          />
        )}

        {activeTab === 'dirac' && (
          <DiracAnalysisView
            candidates={selectedMaterial.diracCandidates ?? []}
            bandStructure={selectedMaterial.bandStructure}
            socBandStructure={selectedMaterial.bandStructureNonSOC}
          />
        )}

        {activeTab === 'flat-band' && (
          <FlatBandView
            initialCandidates={selectedMaterial.flatBandCandidates ?? []}
            bandStructure={selectedMaterial.bandStructure}
          />
        )}

        {activeTab === 'altermagnet' && (
          selectedMaterial.altermagnetAnalysis ? (
            <AltermagnetView
              analysis={selectedMaterial.altermagnetAnalysis}
              bandStructure={selectedMaterial.bandStructure}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Non-Altermagnetic Material</h3>
              <p className="text-xs max-w-md mx-auto">
                {selectedMaterial.name} does not exhibit alternating collinear momentum spin splitting.
                Switch to <strong className="text-cyan-300">RuO₂</strong> in the top dropdown to inspect
                d-wave altermagnetism.
              </p>
            </div>
          )
        )}

        {activeTab === 'soc-comparison' && (
          selectedMaterial.socComparison && selectedMaterial.bandStructureNonSOC ? (
            <SOCComparisonView
              comparison={selectedMaterial.socComparison}
              nonSocData={selectedMaterial.bandStructureNonSOC}
              socData={selectedMaterial.bandStructure}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Dual Calculation Dataset Required</h3>
              <p className="text-xs max-w-md mx-auto">
                SOC comparison requires both scalar-relativistic (Non-SOC) and fully relativistic (SOC)
                calculations. Switch to <strong className="text-cyan-300">Bi₂Se₃</strong> or{' '}
                <strong className="text-cyan-300">Fe₃Sn₂</strong> to view aligned comparisons.
              </p>
            </div>
          )
        )}

        {activeTab === 'fermi-surface' && (
          <FermiSurfaceView material={selectedMaterial} />
        )}

        {activeTab === 'berry-curvature' && (
          <BerryCurvatureView
            berryData={selectedMaterial.berryCurvature}
            material={selectedMaterial}
          />
        )}

        {activeTab === 'ahc' && (
          <AHCView
            ahcData={selectedMaterial.ahcData}
            material={selectedMaterial}
          />
        )}

        {activeTab === 'magnetic-symmetry' && (
          <MagneticSymmetryView material={selectedMaterial} />
        )}

        {activeTab === 'convergence' && (
          <ConvergenceValidator material={selectedMaterial} />
        )}

        {activeTab === 'reports' && (
          <DiagnosticReportView
            material={selectedMaterial}
            diagnostic={selectedMaterial.diagnostic}
          />
        )}
      </main>

      {/* Upload Calculation Modal */}
      <DataUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      {/* Scientific Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400">QuantumLens</span>
            <span>—</span>
            <span>Computational Physics Analysis for Quantum Materials & Magnetism</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Provably Grounded in VASP, Quantum ESPRESSO, and Wannier90 Workflows
          </div>
        </div>
      </footer>
    </div>
  );
}
