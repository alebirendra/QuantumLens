import test from 'node:test';
import assert from 'node:assert/strict';
import { BENCHMARK_DATASETS } from './materials';

test('BENCHMARK_DATASETS contains valid quantum materials with all required fields', () => {
  assert.ok(BENCHMARK_DATASETS.length >= 4);

  const fe3sn2 = BENCHMARK_DATASETS.find((m) => m.id === 'fe3sn2');
  assert.ok(fe3sn2, 'Fe3Sn2 dataset exists');
  assert.equal(fe3sn2?.category, 'Kagome Material');
  assert.ok(fe3sn2?.flatBandCandidates && fe3sn2.flatBandCandidates.length > 0, 'Fe3Sn2 has detected flat bands');
  assert.ok(fe3sn2?.diracCandidates && fe3sn2.diracCandidates.length > 0, 'Fe3Sn2 has detected Dirac candidates');
  assert.ok(fe3sn2?.berryCurvature, 'Fe3Sn2 has Berry curvature grid');
  assert.ok(fe3sn2?.ahcData, 'Fe3Sn2 has Anomalous Hall Conductivity data');

  const ruo2 = BENCHMARK_DATASETS.find((m) => m.id === 'ruo2');
  assert.ok(ruo2, 'RuO2 dataset exists');
  assert.equal(ruo2?.category, 'Altermagnet');
  assert.ok(ruo2?.altermagnetAnalysis, 'RuO2 has altermagnet spin splitting');
  assert.equal(ruo2?.altermagnetAnalysis?.candidateHarmonic, 'd-wave');

  const bi2se3 = BENCHMARK_DATASETS.find((m) => m.id === 'bi2se3');
  assert.ok(bi2se3, 'Bi2Se3 dataset exists');
  assert.ok(bi2se3?.socComparison, 'Bi2Se3 has SOC comparison');
  assert.ok(bi2se3?.socComparison?.gapOpenings.length !== undefined);
});
