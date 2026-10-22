import React, { useState } from 'react';
import { FourCategoryDiagnostic, QuantumMaterialDataset } from '../types/physics';
import {
  FileText,
  Copy,
  Check,
  Download,
  ShieldAlert,
  Database,
  Calculator,
  Sparkles,
  AlertOctagon,
} from 'lucide-react';

interface DiagnosticReportViewProps {
  material: QuantumMaterialDataset;
  diagnostic: FourCategoryDiagnostic;
}

export const DiagnosticReportView: React.FC<DiagnosticReportViewProps> = ({
  material,
  diagnostic,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Generate markdown report
  const generateMarkdownReport = () => {
    let md = `# QuantumLens Scientific Diagnostic Report\n\n`;
    md += `**Material:** ${material.name} (${material.chemicalFormula})\n`;
    md += `**Crystal System:** ${material.crystalSystem} | **Space Group:** ${material.spaceGroup}\n`;
    md += `**Category:** ${material.category} | **Magnetic State:** ${material.magneticState}\n`;
    md += `**References:** ${material.references}\n\n`;
    md += `---\n\n`;

    md += `## 1. Directly Extracted Data\n`;
    diagnostic.directlyExtracted.forEach((d) => {
      md += `- **${d.parameter}:** \`${d.value}\` (Source: ${d.sourceFile}, Units: ${d.units})\n`;
    });
    md += `\n`;

    md += `## 2. Numerically Calculated Quantities\n`;
    diagnostic.numericallyCalculated.forEach((c) => {
      md += `### ${c.quantity}\n`;
      md += `- **Value:** \`${c.value}\`\n`;
      md += `- **Method:** ${c.method}\n`;
      md += `- **Assumptions:** ${c.assumptions}\n\n`;
    });

    md += `## 3. Candidate Physical Phenomena\n`;
    diagnostic.candidatePhenomena.forEach((p) => {
      md += `### ${p.phenomenon} [${p.evidenceScore} Confidence]\n`;
      md += `- **Type:** ${p.candidateType}\n`;
      md += `- **Numerical Evidence:** ${p.observations}\n`;
      md += `- **Required Verification:** ${p.requiredVerification}\n\n`;
    });

    md += `## 4. Conclusions Not Established (Scientific Caution)\n`;
    diagnostic.conclusionsNotEstablished.forEach((u) => {
      md += `### ⚠️ ${u.unsupportedClaim}\n`;
      md += `- **Physical Reason:** ${u.reason}\n`;
      md += `- **Recommended Calculation:** ${u.recommendedCalculation}\n\n`;
    });

    return md;
  };

  const handleCopy = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMD = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QuantumLens_Report_${material.name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(
      {
        material: material.name,
        formula: material.chemicalFormula,
        timestamp: new Date().toISOString(),
        diagnostic,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QuantumLens_Report_${material.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Four-Category Scientific Diagnostic & Interpretation Engine
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Section 10 Rigor
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Separating directly extracted data, calculated quantities, candidate phenomena, and unproven claims
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleDownloadMD}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Section 10 */}
      <div className="space-y-4">
        {/* Category 1: Directly Extracted Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Database className="w-4 h-4" />
            <span>1. Directly Extracted Data (Source Provenance)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Extracted Parameter</th>
                  <th className="py-2 px-3">Numerical Value</th>
                  <th className="py-2 px-3">Source File Provenance</th>
                  <th className="py-2 px-3">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {diagnostic.directlyExtracted.map((d, i) => (
                  <tr key={`de-${i}`} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-slate-200 font-sans font-medium">{d.parameter}</td>
                    <td className="py-2 px-3 text-cyan-300 font-bold">{d.value}</td>
                    <td className="py-2 px-3 text-slate-400">{d.sourceFile}</td>
                    <td className="py-2 px-3 text-slate-400">{d.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category 2: Numerically Calculated Quantities */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Calculator className="w-4 h-4" />
            <span>2. Numerically Calculated Quantities (Deterministic Algorithms)</span>
          </div>
          <div className="space-y-2.5">
            {diagnostic.numericallyCalculated.map((c, i) => (
              <div key={`nc-${i}`} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-bold text-white font-sans">{c.quantity}</span>
                  <span className="text-indigo-300 font-bold">{c.value}</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5 font-sans">
                  <div>
                    <strong className="text-slate-300">Algorithm:</strong> {c.method}
                  </div>
                  <div>
                    <strong className="text-slate-300">Assumptions:</strong> {c.assumptions}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 3: Candidate Physical Phenomena */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Sparkles className="w-4 h-4" />
            <span>3. Candidate Physical Phenomena (Heuristic Detections)</span>
          </div>
          <div className="space-y-3">
            {diagnostic.candidatePhenomena.map((p, i) => (
              <div key={`cp-${i}`} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm">{p.phenomenon}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {p.evidenceScore} Confidence
                  </span>
                </div>
                <div className="text-slate-300 text-[11px]">
                  <strong>Evidence:</strong> {p.observations}
                </div>
                <div className="text-slate-400 text-[11px] border-t border-slate-800 pt-1">
                  <strong className="text-slate-300">Required Next Check:</strong> {p.requiredVerification}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 4: Conclusions Not Established */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm border-b border-slate-800 pb-2">
            <AlertOctagon className="w-4 h-4" />
            <span>4. Conclusions Not Established (Scientific Caution & Strict Caveats)</span>
          </div>
          <div className="space-y-3">
            {diagnostic.conclusionsNotEstablished.map((u, i) => (
              <div key={`cne-${i}`} className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/60 text-xs space-y-1.5">
                <div className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{u.unsupportedClaim}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Physical Reason:</strong> {u.reason}
                </p>
                <div className="text-[11px] text-cyan-300 bg-slate-950/80 p-2 rounded border border-slate-800 font-mono">
                  Recommended Verification: {u.recommendedCalculation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
