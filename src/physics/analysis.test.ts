import test from 'node:test';
import assert from 'node:assert/strict';
import {
  linearFit,
  detectDiracPoints,
  detectFlatBands,
  calculateAltermagnetSpinSplitting,
  compareSOCvsNonSOC,
  generateFourCategoryDiagnostic,
} from './analysis';
import { BandStructureData } from '../types/physics';

test('linearFit correctly calculates slope, intercept and R^2', () => {
  const x = [0, 1, 2, 3, 4];
  const y = [1, 3, 5, 7, 9]; // y = 2x + 1
  const fit = linearFit(x, y);

  assert.equal(Math.round(fit.slope), 2);
  assert.equal(Math.round(fit.intercept), 1);
  assert.equal(Math.round(fit.r2), 1);
});

test('linearFit handles single point safely', () => {
  const fit = linearFit([1], [5]);
  assert.equal(fit.slope, 0);
  assert.equal(fit.intercept, 5);
  assert.equal(fit.r2, 0);
});

// Mock band structure with a Dirac crossing at k=2
const mockBandStructure: BandStructureData = {
  systemName: 'Fe3Sn2 (Mock Kagome)',
  sourceFormat: 'VASP',
  sourceFiles: ['vasprun.xml'],
  eFermi: 0.0,
  isSpinPolarized: false,
  hasSOC: false,
  highSymmetryPoints: [
    { index: 0, label: 'Γ', distance: 0 },
    { index: 2, label: 'K', distance: 1.0 },
    { index: 4, label: 'M', distance: 2.0 },
  ],
  kPoints: [
    { index: 0, label: 'Γ', coords: [0, 0, 0], distance: 0.0 },
    { index: 1, coords: [0.15, 0.15, 0], distance: 0.5 },
    { index: 2, label: 'K', coords: [0.333, 0.333, 0], distance: 1.0 },
    { index: 3, coords: [0.4, 0.35, 0], distance: 1.5 },
    { index: 4, label: 'M', coords: [0.5, 0, 0], distance: 2.0 },
  ],
  bands: [
    {
      bandIndex: 1,
      spinChannel: 'up',
      points: [
        { energy: -0.8 },
        { energy: -0.4 },
        { energy: 0.0 }, // crosses band 2 at k=2
        { energy: -0.4 },
        { energy: -0.8 },
      ],
    },
    {
      bandIndex: 2,
      spinChannel: 'up',
      points: [
        { energy: 0.8 },
        { energy: 0.4 },
        { energy: 0.01 }, // crossing point
        { energy: 0.4 },
        { energy: 0.8 },
      ],
    },
    {
      bandIndex: 3,
      spinChannel: 'up',
      // flat band
      points: [
        { energy: 1.20 },
        { energy: 1.21 },
        { energy: 1.22 },
        { energy: 1.21 },
        { energy: 1.20 },
      ],
    },
  ],
};

test('detectDiracPoints detects crossing at K point and flags candidate status', () => {
  const diracPoints = detectDiracPoints(mockBandStructure, { gapThresholdEV: 0.05 });
  assert.ok(diracPoints.length >= 1, 'Should detect at least 1 crossing');

  const crossing = diracPoints[0];
  assert.equal(crossing.kIndex, 2);
  assert.equal(crossing.band1Index, 1);
  assert.equal(crossing.band2Index, 2);
  assert.ok(crossing.linearFitR2 > 0.8, 'Linearity R2 should be high for linear cone');
  assert.equal(crossing.symmetryProtectionVerified, false, 'Must not claim verified without symmetry proof');
});

test('detectFlatBands detects weakly dispersive band within threshold', () => {
  const flatBands = detectFlatBands(mockBandStructure, 100); // 100 meV threshold
  assert.equal(flatBands.length, 1);
  assert.equal(flatBands[0].bandIndex, 3);
  assert.ok(flatBands[0].bandwidth <= 50, 'Bandwidth should be around 20 meV');
  assert.equal(flatBands[0].dispersionAlongSegments.length, 2);
});

test('calculateAltermagnetSpinSplitting detects momentum-dependent splitting', () => {
  const altermagnetBands: BandStructureData = {
    systemName: 'RuO2 (d-wave Altermagnet)',
    sourceFormat: 'VASP',
    sourceFiles: ['EIGENVAL'],
    eFermi: 0.0,
    isSpinPolarized: true,
    hasSOC: false,
    highSymmetryPoints: [
      { index: 0, label: 'Γ', distance: 0 },
      { index: 2, label: 'M', distance: 1 },
      { index: 4, label: 'X', distance: 2 },
    ],
    kPoints: [
      { index: 0, label: 'Γ', coords: [0, 0, 0], distance: 0 },
      { index: 1, coords: [0.25, 0, 0], distance: 0.5 },
      { index: 2, label: 'M', coords: [0.5, 0.5, 0], distance: 1.0 },
      { index: 3, coords: [0.5, 0.25, 0], distance: 1.5 },
      { index: 4, label: 'X', coords: [0.5, 0, 0], distance: 2.0 },
    ],
    bands: [
      {
        bandIndex: 1,
        spinChannel: 'up',
        points: [
          { energy: 0.0 },
          { energy: 0.5 }, // spin up higher here (+0.3 eV)
          { energy: 0.0 }, // nodal point at M
          { energy: -0.3 }, // spin up lower here (-0.4 eV)
          { energy: 0.0 },
        ],
      },
      {
        bandIndex: 1,
        spinChannel: 'down',
        points: [
          { energy: 0.0 },
          { energy: 0.2 },
          { energy: 0.0 }, // nodal point at M
          { energy: 0.1 },
          { energy: 0.0 },
        ],
      },
    ],
  };

  const analysis = calculateAltermagnetSpinSplitting(altermagnetBands);
  assert.equal(analysis.hasAlternatingSign, true, 'Should detect alternating sign of spin splitting');
  assert.equal(analysis.candidateHarmonic, 'd-wave');
  assert.ok(analysis.maxSplittingMeVEnergy >= 300, 'Max splitting should be >= 300 meV');
  assert.equal(analysis.symmetryDiagnostics.netMagnetizationZero, true);
});

test('compareSOCvsNonSOC detects gap opening at crossing and band inversion', () => {
  const nonSoc = mockBandStructure;
  const soc: BandStructureData = {
    ...mockBandStructure,
    hasSOC: true,
    bands: [
      {
        bandIndex: 1,
        spinChannel: 'noncollinear',
        points: [
          { energy: -0.8 },
          { energy: -0.4 },
          { energy: -0.05 }, // gap opened!
          { energy: -0.4 },
          { energy: -0.8 },
        ],
      },
      {
        bandIndex: 2,
        spinChannel: 'noncollinear',
        points: [
          { energy: 0.8 },
          { energy: 0.4 },
          { energy: 0.06 }, // gap opened!
          { energy: 0.4 },
          { energy: 0.8 },
        ],
      },
    ],
  };

  const socComp = compareSOCvsNonSOC(nonSoc, soc);
  assert.ok(socComp.gapOpenings.length >= 1, 'Should detect SOC gap opening at k=2');
  assert.ok(socComp.gapOpenings[0].deltaGap > 0.05, 'SOC opened a gap > 50 meV');
});

test('generateFourCategoryDiagnostic produces all 4 mandatory categories', () => {
  const diag = generateFourCategoryDiagnostic('Fe3Sn2', 'Kagome Material', mockBandStructure);
  assert.ok(diag.directlyExtracted.length >= 3, 'Must contain directly extracted parameters');
  assert.ok(diag.numericallyCalculated.length >= 2, 'Must contain numerically calculated quantities');
  assert.ok(diag.conclusionsNotEstablished.length >= 3, 'Must contain strict scientific caveats');
});
