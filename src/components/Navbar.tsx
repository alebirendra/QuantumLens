import React from 'react';
import {
  Layers,
  Activity,
  Atom,
  Compass,
  Cpu,
  GitCompare,
  Globe,
  Radio,
  FileText,
  ShieldCheck,
  Upload,
  Sparkles,
} from 'lucide-react';
import { QuantumMaterialDataset } from '../types/physics';

export type ActiveTab =
  | 'band-structure'
  | 'dos'
  | 'dirac'
  | 'flat-band'
  | 'altermagnet'
  | 'soc-comparison'
  | 'fermi-surface'
  | 'berry-curvature'
  | 'ahc'
  | 'magnetic-symmetry'
  | 'convergence'
  | 'reports';

interface NavbarProps {
  materials: QuantumMaterialDataset[];
  selectedMaterial: QuantumMaterialDataset;
  onSelectMaterial: (material: QuantumMaterialDataset) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenUploader: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  materials,
  selectedMaterial,
  onSelectMaterial,
  activeTab,
  onSelectTab,
  onOpenUploader,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'band-structure', label: '1. Band Structure', icon: <Layers className="w-4 h-4" /> },
    { id: 'dos', label: '2. Density of States', icon: <Activity className="w-4 h-4" /> },
    { id: 'dirac', label: '3. Dirac & Crossings', icon: <Atom className="w-4 h-4" /> },
    { id: 'flat-band', label: '4. Kagome Flat Bands', icon: <Cpu className="w-4 h-4" />, badge: 'Kagome' },
    { id: 'altermagnet', label: '5. Altermagnetism', icon: <Compass className="w-4 h-4" />, badge: 'Spin' },
    { id: 'soc-comparison', label: '6. SOC Comparison', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'fermi-surface', label: '7. Fermi Surface (3D)', icon: <Globe className="w-4 h-4" /> },
    { id: 'berry-curvature', label: '8. Berry Curvature', icon: <Radio className="w-4 h-4" /> },
    { id: 'ahc', label: '9. Anomalous Hall', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'magnetic-symmetry', label: '10. Magnetic Symmetry', icon: <Compass className="w-4 h-4" /> },
    { id: 'convergence', label: '11. Convergence', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'reports', label: '12. Scientific Report', icon: <FileText className="w-4 h-4" />, badge: '4-Cat' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950 text-slate-100 sticky top-0 z-40 shadow-lg">
      {/* Top Branding Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-950/50">
            <Atom className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-white font-mono">QuantumLens</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                v1.0 Physics Core
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Quantum Materials & Advanced Electronic-Structure Platform
            </p>
          </div>
        </div>

        {/* Material Selection and Upload */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
            <label htmlFor="material-select" className="text-xs font-medium text-slate-400">
              Material:
            </label>
            <select
              id="material-select"
              aria-label="Select benchmark quantum material"
              className="bg-transparent text-sm text-cyan-300 font-medium focus:outline-none cursor-pointer"
              value={selectedMaterial.id}
              onChange={(e) => {
                const found = materials.find((m) => m.id === e.target.value);
                if (found) onSelectMaterial(found);
              }}
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.chemicalFormula} — {m.category}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenUploader}
            aria-label="Upload VASP or Quantum ESPRESSO calculation files"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm shadow-cyan-900/40 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Calculation</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </div>

      {/* 12-Section Navigation Bar */}
      <nav
        aria-label="Analysis modules"
        className="px-3 flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 bg-slate-900/60 backdrop-blur"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/90 text-white shadow-sm shadow-indigo-900/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
