import React, { useState } from 'react';
import { Upload, X, FileCode, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { QuantumMaterialDataset } from '../types/physics';
import { parseVaspEigenval, parseVaspDoscar, parseQuantumEspressoBands, parseWannierBandDat } from '../physics/parsers';
import {
  detectDiracPoints,
  detectFlatBands,
  detectVanHoveSingularities,
  calculateAltermagnetSpinSplitting,
  generateFourCategoryDiagnostic,
} from '../physics/analysis';

interface DataUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (dataset: QuantumMaterialDataset) => void;
}

export const DataUploaderModal: React.FC<DataUploaderModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
}) => {
  const [fileType, setFileType] = useState<'vasp-eigenval' | 'vasp-doscar' | 'qe-bands' | 'wannier-band'>('vasp-eigenval');
  const [systemName, setSystemName] = useState<string>('Custom Material');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const handleProcessData = () => {
    if (!fileContent.trim()) {
      setErrorMsg('Please select a file or paste file content.');
      return;
    }

    try {
      setErrorMsg(null);
      if (fileType === 'vasp-eigenval') {
        const bandData = parseVaspEigenval(fileContent, systemName);
        const dirac = detectDiracPoints(bandData);
        const flat = detectFlatBands(bandData);
        const altermagnet = bandData.isSpinPolarized ? calculateAltermagnetSpinSplitting(bandData) : undefined;
        const diagnostic = generateFourCategoryDiagnostic(systemName, 'Kagome Material', bandData, {
          dirac,
          flat,
          altermagnet,
        });

        const newDataset: QuantumMaterialDataset = {
          id: `custom-${Date.now()}`,
          name: systemName,
          chemicalFormula: systemName,
          crystalSystem: 'User Uploaded',
          spaceGroup: 'From EIGENVAL',
          magneticState: bandData.isSpinPolarized ? 'Ferromagnetic' : 'Nonmagnetic',
          category: 'Kagome Material',
          description: `User-uploaded VASP calculation from ${fileName || 'EIGENVAL'}.`,
          references: 'User-provided calculation data.',
          bandStructure: bandData,
          dos: {
            systemName: `${systemName} DOS`,
            eFermi: bandData.eFermi,
            sourceFormat: 'VASP',
            availableOrbitals: ['Total'],
            points: [],
          },
          diracCandidates: dirac,
          flatBandCandidates: flat,
          altermagnetAnalysis: altermagnet,
          diagnostic,
        };
        onDatasetLoaded(newDataset);
        onClose();
      } else if (fileType === 'qe-bands') {
        const bandData = parseQuantumEspressoBands(fileContent, systemName);
        const dirac = detectDiracPoints(bandData);
        const flat = detectFlatBands(bandData);
        const diagnostic = generateFourCategoryDiagnostic(systemName, 'Topological Insulator', bandData, {
          dirac,
          flat,
        });

        const newDataset: QuantumMaterialDataset = {
          id: `custom-${Date.now()}`,
          name: systemName,
          chemicalFormula: systemName,
          crystalSystem: 'User Uploaded',
          spaceGroup: 'From QE output',
          magneticState: 'Nonmagnetic',
          category: 'Topological Insulator',
          description: `User-uploaded Quantum ESPRESSO calculation from ${fileName || 'bands.dat'}.`,
          references: 'User-provided calculation data.',
          bandStructure: bandData,
          dos: {
            systemName: `${systemName} DOS`,
            eFermi: bandData.eFermi,
            sourceFormat: 'Quantum ESPRESSO',
            availableOrbitals: ['Total'],
            points: [],
          },
          diracCandidates: dirac,
          flatBandCandidates: flat,
          diagnostic,
        };
        onDatasetLoaded(newDataset);
        onClose();
      } else if (fileType === 'wannier-band') {
        const bandData = parseWannierBandDat(fileContent, systemName);
        const dirac = detectDiracPoints(bandData);
        const flat = detectFlatBands(bandData);
        const diagnostic = generateFourCategoryDiagnostic(systemName, 'Weyl Semimetal', bandData, {
          dirac,
          flat,
        });

        const newDataset: QuantumMaterialDataset = {
          id: `custom-${Date.now()}`,
          name: systemName,
          chemicalFormula: systemName,
          crystalSystem: 'User Uploaded',
          spaceGroup: 'Wannier90',
          magneticState: 'Nonmagnetic',
          category: 'Weyl Semimetal',
          description: `User-uploaded Wannier90 band interpolation from ${fileName || 'wannier90_band.dat'}.`,
          references: 'User-provided calculation data.',
          bandStructure: bandData,
          dos: {
            systemName: `${systemName} DOS`,
            eFermi: 0.0,
            sourceFormat: 'Wannier90',
            availableOrbitals: ['Total'],
            points: [],
          },
          diracCandidates: dirac,
          flatBandCandidates: flat,
          diagnostic,
        };
        onDatasetLoaded(newDataset);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error parsing uploaded scientific file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Upload Scientific Calculation</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close upload modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Format & Target Software:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFileType('vasp-eigenval')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                  fileType === 'vasp-eigenval'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div>VASP EIGENVAL</div>
                <div className="text-[10px] text-slate-500">K-points & eigenvalues</div>
              </button>
              <button
                type="button"
                onClick={() => setFileType('qe-bands')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                  fileType === 'qe-bands'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div>Quantum ESPRESSO</div>
                <div className="text-[10px] text-slate-500">bands.dat / pw.x</div>
              </button>
              <button
                type="button"
                onClick={() => setFileType('wannier-band')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                  fileType === 'wannier-band'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div>Wannier90</div>
                <div className="text-[10px] text-slate-500">wannier90_band.dat</div>
              </button>
              <button
                type="button"
                onClick={() => setFileType('vasp-doscar')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                  fileType === 'vasp-doscar'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div>VASP DOSCAR</div>
                <div className="text-[10px] text-slate-500">Total & PDOS</div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Material Label:</label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Kagome bilayer Fe3Sn2"
            />
          </div>

          {/* File Picker or Drop */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Choose File:</label>
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center bg-slate-950/50">
              <input
                type="file"
                id="file-input"
                onChange={handleFileUpload}
                className="hidden"
                accept=".dat,.xml,.txt,*"
              />
              <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center">
                <FileCode className="w-8 h-8 text-cyan-400 mb-2" />
                <span className="text-sm font-semibold text-white">
                  {fileName ? fileName : 'Click to select calculation file'}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">Supports text and raw outputs</span>
              </label>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessData}
            disabled={!fileContent}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white cursor-pointer shadow-md shadow-cyan-900/30"
          >
            Parse & Run Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
