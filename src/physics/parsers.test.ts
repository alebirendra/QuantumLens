import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVaspEigenval, parseVaspDoscar, parseWannierBandDat } from './parsers';

test('parseVaspEigenval parses spin-polarized VASP EIGENVAL content', () => {
  const sampleEigenval = `
  1  1  1  2
  10.0 0 0 0 0
  0.0
  CAR
  Fe3Sn2 Kagome
  10  3  2

  0.000 0.000 0.000 0.333
  1  -1.250  -1.100
  2   0.450   0.600

  0.333 0.333 0.000 0.333
  1  -0.100  -0.050
  2   0.020   0.080

  0.500 0.000 0.000 0.334
  1  -0.800  -0.750
  2   0.900   0.950
  `;

  const parsed = parseVaspEigenval(sampleEigenval, 'Fe3Sn2');
  assert.equal(parsed.systemName, 'Fe3Sn2');
  assert.equal(parsed.isSpinPolarized, true);
  assert.equal(parsed.kPoints.length, 3);
  assert.equal(parsed.bands.length, 4); // 2 bands * 2 spin channels
  assert.equal(parsed.bands[0].spinChannel, 'up');
  assert.equal(parsed.bands[2].spinChannel, 'down');
  assert.equal(parsed.bands[0].points[0].energy, -1.25);
  assert.equal(parsed.bands[2].points[0].energy, -1.10);
});

test('parseVaspDoscar parses total and spin-resolved DOS', () => {
  const sampleDoscar = `
   1.0
   1.0
   1.0
   1.0
   1.0
   10.0 -10.0 3 0.500 1.0
   -2.000 0.400 0.350 0.750 0.700
    0.000 1.800 1.200 2.550 1.900
    2.000 0.200 0.150 2.750 2.050
  `;

  const parsed = parseVaspDoscar(sampleDoscar, 'Fe3Sn2 DOS');
  assert.equal(parsed.systemName, 'Fe3Sn2 DOS');
  assert.equal(parsed.eFermi, 0.5);
  assert.equal(parsed.points.length, 3);
  assert.equal(parsed.points[1].energy, 0.0);
  assert.equal(parsed.points[1].total, 3.0); // 1.8 + 1.2
  assert.equal(parsed.points[1].spinUp, 1.8);
  assert.equal(parsed.points[1].spinDown, 1.2);
});

test('parseWannierBandDat parses multi-band distance-energy columns', () => {
  const sampleWannier = `
  0.00000   -1.50000
  0.50000   -0.50000
  1.00000    0.20000

  0.00000    0.10000
  0.50000    0.80000
  1.00000    1.40000
  `;

  const parsed = parseWannierBandDat(sampleWannier, 'Wannier Band');
  assert.equal(parsed.bands.length, 2);
  assert.equal(parsed.bands[0].points.length, 3);
  assert.equal(parsed.bands[1].points.length, 3);
  assert.equal(parsed.bands[0].points[2].energy, 0.2);
  assert.equal(parsed.bands[1].points[0].energy, 0.1);
});
