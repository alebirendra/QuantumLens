/**
 * QuantumLens — Core Physics Types and Data Models
 * Specialized in electronic structures, quantum materials, magnetism, and topological phenomena.
 */

export type SourceFormat = 'VASP' | 'Quantum ESPRESSO' | 'Wannier90' | 'Custom';

export type SpinChannel = 'up' | 'down' | 'noncollinear' | 'unpolarized';

export interface KPoint {
  index: number;
  label?: string; // e.g. "Γ", "K", "M", "X"
  coords: [number, number, number]; // fractional reciprocal coordinates [kx, ky, kz]
  distance: number; // accumulated distance along the reciprocal path
}

export interface OrbitalProjection {
  atom: string; // e.g., "Fe1", "Sn2"
  element: string; // e.g., "Fe", "Sn"
  orbital: string; // e.g., "s", "p", "d", "dxy", "dz2"
  weight: number; // 0.0 to 1.0
}

export interface BandPoint {
  energy: number; // in eV relative to vacuum or unshifted
  projections?: OrbitalProjection[];
  spinExpectation?: {
    sx: number;
    sy: number;
    sz: number;
  };
}

export interface Band {
  bandIndex: number;
  spinChannel: SpinChannel;
  points: BandPoint[]; // length equals number of k-points
}

export interface BandStructureData {
  systemName: string;
  sourceFormat: SourceFormat;
  sourceFiles: string[];
  eFermi: number; // in eV
  isSpinPolarized: boolean;
  hasSOC: boolean;
  latticeVectors?: number[][]; // [3][3] in Å
  reciprocalVectors?: number[][]; // [3][3] in 1/Å
  highSymmetryPoints: { index: number; label: string; distance: number }[];
  kPoints: KPoint[];
  bands: Band[];
  calculatedGap?: {
    isDirect: boolean;
    gapEnergy: number; // eV
    vbmEnergy: number;
    cbmEnergy: number;
    vbmKPoint: [number, number, number];
    cbmKPoint: [number, number, number];
  };
}

export interface DOSPoint {
  energy: number; // eV
  total: number; // states / eV / unit cell
  spinUp?: number;
  spinDown?: number;
  integrated?: number;
  projections?: { [orbitalOrAtom: string]: number };
}

export interface DOSData {
  systemName: string;
  eFermi: number;
  sourceFormat: SourceFormat;
  points: DOSPoint[];
  availableOrbitals: string[];
}

export interface DiracCandidate {
  id: string;
  kIndex: number;
  kPointLabel?: string;
  kCoords: [number, number, number];
  energy: number; // relative to EF
  band1Index: number;
  band2Index: number;
  energySeparation: number; // eV at crossing point
  estimatedFermiVelocity: number; // 10^5 m/s
  linearFitR2: number; // coefficient of determination
  isAvoidedCrossing: boolean;
  gapWithSOC?: number; // eV
  confidence: 'High' | 'Medium' | 'Candidate';
  symmetryProtectionVerified: boolean;
  notes: string;
}

export interface FlatBandCandidate {
  bandIndex: number;
  spinChannel: SpinChannel;
  bandwidth: number; // in meV or eV
  minEnergy: number; // eV rel to EF
  maxEnergy: number; // eV rel to EF
  meanEnergy: number; // eV rel to EF
  dispersionAlongSegments: { from: string; to: string; deltaE: number }[];
  dominantOrbital?: string;
  isKagomeDestructiveInterferenceCandidate: boolean;
  heuristicThresholdMeVDenom: number;
  notes: string;
}

export interface VanHoveCandidate {
  energy: number; // eV rel to EF
  dosValue: number;
  associatedKPoint?: string; // e.g. "M" in hexagonal
  associatedBandIndices: number[];
  orbitalDominance: string;
  confidence: 'High' | 'Medium' | 'Candidate';
  notes: string;
}

export interface AltermagnetSpinSplitting {
  kCoords: [number, number, number];
  kDistance: number;
  bandIndex: number;
  energyUp: number;
  energyDown: number;
  deltaE: number; // energyUp - energyDown (eV)
}

export interface AltermagnetAnalysis {
  material: string;
  magneticSpaceGroup?: string;
  hasAlternatingSign: boolean;
  candidateHarmonic: 'd-wave' | 'g-wave' | 'i-wave' | 'indeterminate';
  maxSplittingMeVEnergy: number;
  meanSplittingMeVEnergy: number;
  nodalLines: string[];
  splittings: AltermagnetSpinSplitting[];
  spinTextures2D: {
    kx: number;
    ky: number;
    sx: number;
    sy: number;
    sz: number;
    bandIndex: number;
  }[];
  symmetryDiagnostics: {
    spinGroupCandidate: string;
    allowsRelativisticSplittingOnly: boolean;
    allowsNonRelativisticSplitting: boolean;
    netMagnetizationZero: boolean;
    notes: string[];
  };
}

export interface SOCComparisonResult {
  alignedBandsCount: number;
  maxEnergyShift: number; // eV
  meanEnergyShift: number; // eV
  gapOpenings: {
    kIndex: number;
    kLabel?: string;
    kCoords: [number, number, number];
    nonSocEnergyDiff: number;
    socEnergyDiff: number;
    deltaGap: number; // soc - nonSoc
    bandLower: number;
    bandUpper: number;
    isAvoidedCrossingCreated: boolean;
  }[];
  bandInversions: {
    kPoint: string;
    energyRange: [number, number];
    bandsInvolved: number[];
    parityInversionCandidate: boolean;
    details: string;
  }[];
}

export interface BerryCurvatureData {
  plane: 'kx-ky' | 'kx-kz' | 'ky-kz';
  sliceCoord: number; // e.g. kz = 0.0
  units: string; // e.g. "Å^2" or "Bohr^2"
  gridX: number[]; // kx points
  gridY: number[]; // ky points
  omegaZ: number[][]; // values on 2D grid
  hotspots: {
    kx: number;
    ky: number;
    omegaValue: number;
    bandIndex?: number;
    energyDiffToEF?: number;
    note: string;
  }[];
  occupiedIntegralEstimate: number; // in S/cm or normalized units
}

export interface AHCData {
  material: string;
  units: string; // "S/cm"
  eFermi: number;
  chemicalPotentials: number[]; // eV relative to EF
  sigmaXY: number[]; // S/cm
  sigmaXX: number[]; // S/cm
  sigmaYZ: number[]; // S/cm
  intrinsicMechanismFraction: number; // estimated intrinsic vs extrinsic
  kMeshConvergence: {
    mesh: string; // e.g. "30x30x30", "50x50x50", "80x80x80"
    sigmaXYAtEF: number;
    converged: boolean;
  }[];
  validationChecks: {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
  }[];
}

export interface FourCategoryDiagnostic {
  directlyExtracted: {
    parameter: string;
    value: string;
    sourceFile: string;
    units: string;
  }[];
  numericallyCalculated: {
    quantity: string;
    value: string;
    method: string;
    assumptions: string;
    units: string;
  }[];
  candidatePhenomena: {
    phenomenon: string;
    candidateType: string;
    evidenceScore: 'High' | 'Medium' | 'Tentative';
    observations: string;
    requiredVerification: string;
  }[];
  conclusionsNotEstablished: {
    unsupportedClaim: string;
    reason: string;
    recommendedCalculation: string;
  }[];
}

export interface QuantumMaterialDataset {
  id: string;
  name: string;
  chemicalFormula: string;
  crystalSystem: string;
  spaceGroup: string;
  magneticState: 'Paramagnetic' | 'Ferromagnetic' | 'Antiferromagnetic' | 'Altermagnetic' | 'Nonmagnetic';
  category: 'Kagome Material' | 'Altermagnet' | 'Topological Insulator' | 'Weyl Semimetal' | '2D Material';
  description: string;
  references: string;
  bandStructure: BandStructureData;
  bandStructureNonSOC?: BandStructureData;
  dos: DOSData;
  diracCandidates?: DiracCandidate[];
  flatBandCandidates?: FlatBandCandidate[];
  vanHoveCandidates?: VanHoveCandidate[];
  altermagnetAnalysis?: AltermagnetAnalysis;
  socComparison?: SOCComparisonResult;
  berryCurvature?: BerryCurvatureData;
  ahcData?: AHCData;
  diagnostic: FourCategoryDiagnostic;
}
