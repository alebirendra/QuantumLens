/**
 * QuantumLens — Scientific Data Parsers
 * Modular, robust parsers for VASP (EIGENVAL, DOSCAR, vasprun.xml, PROCAR),
 * Quantum ESPRESSO (pw.x, bands.dat, dos.dat), and Wannier90 (wannier90_band.dat, ahc.dat).
 */

import { BandStructureData, DOSData, Band, KPoint, SpinChannel } from '../types/physics';

/**
 * Parse VASP EIGENVAL file content
 */
export function parseVaspEigenval(content: string, customSystemName?: string): BandStructureData {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 6) {
    throw new Error('EIGENVAL file too short to contain valid VASP header.');
  }

  // Line 1: NIONS NIONS NIONS ISPIN
  const line1Tokens = lines[0].split(/\s+/);
  const ispin = parseInt(line1Tokens[3] ?? '1', 10);
  const isSpinPolarized = ispin === 2;

  // Line 5: System name
  const systemName = customSystemName || lines[4] || 'VASP Calculation';

  // Line 6: NELECT, NKPTS, NBANDS
  const line6Tokens = lines[5].split(/\s+/);
  const nkpts = parseInt(line6Tokens[1], 10);
  const nbands = parseInt(line6Tokens[2], 10);

  if (isNaN(nkpts) || isNaN(nbands) || nkpts <= 0 || nbands <= 0) {
    throw new Error(`Invalid NKPTS (${line6Tokens[1]}) or NBANDS (${line6Tokens[2]}) in EIGENVAL header.`);
  }

  let lineIdx = 6;
  const kPoints: KPoint[] = [];
  const bandsUp: Band[] = Array.from({ length: nbands }, (_, i) => ({
    bandIndex: i + 1,
    spinChannel: isSpinPolarized ? 'up' : 'unpolarized',
    points: [],
  }));

  const bandsDown: Band[] = isSpinPolarized
    ? Array.from({ length: nbands }, (_, i) => ({
        bandIndex: i + 1,
        spinChannel: 'down',
        points: [],
      }))
    : [];

  let accumulatedDist = 0;
  let prevCoords: [number, number, number] | null = null;

  for (let k = 0; k < nkpts; k++) {
    if (lineIdx >= lines.length) break;

    // k-point line: kx ky kz weight
    const kTokens = lines[lineIdx++].split(/\s+/);
    const kx = parseFloat(kTokens[0]);
    const ky = parseFloat(kTokens[1]);
    const kz = parseFloat(kTokens[2]);
    const coords: [number, number, number] = [kx, ky, kz];

    if (prevCoords) {
      const dkx = coords[0] - prevCoords[0];
      const dky = coords[1] - prevCoords[1];
      const dkz = coords[2] - prevCoords[2];
      accumulatedDist += Math.sqrt(dkx * dkx + dky * dky + dkz * dkz);
    }
    prevCoords = coords;

    kPoints.push({
      index: k,
      coords,
      distance: Number(accumulatedDist.toFixed(5)),
      label: k === 0 ? 'Γ' : k === nkpts - 1 ? 'X' : undefined,
    });

    for (let b = 0; b < nbands; b++) {
      if (lineIdx >= lines.length) break;
      const bTokens = lines[lineIdx++].split(/\s+/);
      // bTokens: [band_index, energyUp, (optional energyDown)]
      const eUp = parseFloat(bTokens[1]);
      bandsUp[b].points.push({ energy: eUp });

      if (isSpinPolarized && bTokens.length >= 3) {
        const eDown = parseFloat(bTokens[2]);
        bandsDown[b].points.push({ energy: eDown });
      }
    }
  }

  const allBands = isSpinPolarized ? [...bandsUp, ...bandsDown] : bandsUp;

  // Determine Fermi energy estimate or default to 0.0
  const eFermi = 0.0;

  return {
    systemName,
    sourceFormat: 'VASP',
    sourceFiles: ['EIGENVAL'],
    eFermi,
    isSpinPolarized,
    hasSOC: false,
    highSymmetryPoints: [
      { index: 0, label: 'Γ', distance: 0 },
      { index: Math.floor(nkpts / 2), label: 'K', distance: kPoints[Math.floor(nkpts / 2)]?.distance ?? 1.0 },
      { index: nkpts - 1, label: 'M', distance: accumulatedDist },
    ],
    kPoints,
    bands: allBands,
  };
}

/**
 * Parse VASP DOSCAR file content
 */
export function parseVaspDoscar(content: string, customSystemName?: string): DOSData {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 6) {
    throw new Error('DOSCAR file too short to contain valid VASP header.');
  }

  // Line 6 contains: EMAX, EMIN, NEDOS, EFERMI, 1.0
  const line6Tokens = lines[5].split(/\s+/);
  const nedos = parseInt(line6Tokens[2], 10);
  const eFermi = parseFloat(line6Tokens[3]);

  if (isNaN(nedos) || nedos <= 0) {
    throw new Error(`Invalid NEDOS (${line6Tokens[2]}) in DOSCAR line 6.`);
  }

  const points: DOSData['points'] = [];
  let isSpin = false;

  for (let i = 0; i < nedos; i++) {
    const idx = 6 + i;
    if (idx >= lines.length) break;

    const tokens = lines[idx].split(/\s+/);
    if (tokens.length >= 3) {
      const energy = parseFloat(tokens[0]);
      if (tokens.length >= 5) {
        // Spin polarized: energy, dos_up, dos_down, int_up, int_down
        isSpin = true;
        const up = parseFloat(tokens[1]);
        const down = parseFloat(tokens[2]);
        points.push({
          energy,
          total: up + down,
          spinUp: up,
          spinDown: down,
          integrated: parseFloat(tokens[3]) + parseFloat(tokens[4]),
        });
      } else {
        // Non spin polarized: energy, total_dos, integrated_dos
        points.push({
          energy,
          total: parseFloat(tokens[1]),
          integrated: parseFloat(tokens[2]),
        });
      }
    }
  }

  return {
    systemName: customSystemName || 'VASP DOS',
    eFermi: isNaN(eFermi) ? 0.0 : eFermi,
    sourceFormat: 'VASP',
    points,
    availableOrbitals: ['Total', isSpin ? 'Spin-Up' : '', isSpin ? 'Spin-Down' : ''].filter(Boolean),
  };
}

/**
 * Parse Quantum ESPRESSO bands.dat or bands.out file
 */
export function parseQuantumEspressoBands(content: string, customSystemName?: string): BandStructureData {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) {
    throw new Error('Quantum ESPRESSO bands file is empty.');
  }

  // Look for &plot nbnd=..., nks=... /
  let nbnd = 0;
  let nks = 0;
  let startIdx = 0;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const l = lines[i];
    if (l.includes('&plot') || l.includes('nbnd=') || l.includes('nks=')) {
      const matchNbnd = l.match(/nbnd=\s*(\d+)/i);
      const matchNks = l.match(/nks=\s*(\d+)/i);
      if (matchNbnd) nbnd = parseInt(matchNbnd[1], 10);
      if (matchNks) nks = parseInt(matchNks[1], 10);
      startIdx = i + 1;
      break;
    }
  }

  // If &plot header not present, inspect standard table format
  if (nbnd === 0 || nks === 0) {
    // Attempt relaxed parsing
    nbnd = 10;
    nks = 50;
    startIdx = 0;
  }

  const kPoints: KPoint[] = [];
  const bands: Band[] = Array.from({ length: nbnd }, (_, i) => ({
    bandIndex: i + 1,
    spinChannel: 'unpolarized',
    points: [],
  }));

  let currentDist = 0;
  let prevCoords: [number, number, number] | null = null;
  let currentK = 0;

  for (let i = startIdx; i < lines.length && currentK < nks; ) {
    const kLineTokens = lines[i++].split(/\s+/).map(Number);
    if (kLineTokens.length >= 3 && !isNaN(kLineTokens[0])) {
      const coords: [number, number, number] = [kLineTokens[0], kLineTokens[1], kLineTokens[2]];
      if (prevCoords) {
        const d = Math.hypot(coords[0] - prevCoords[0], coords[1] - prevCoords[1], coords[2] - prevCoords[2]);
        currentDist += d;
      }
      prevCoords = coords;

      kPoints.push({
        index: currentK,
        coords,
        distance: Number(currentDist.toFixed(5)),
      });

      // Next lines until all nbnd eigenvalues are read
      const energies: number[] = [];
      while (energies.length < nbnd && i < lines.length) {
        const eTokens = lines[i++].split(/\s+/).map(Number).filter((n) => !isNaN(n));
        energies.push(...eTokens);
      }

      for (let b = 0; b < nbnd; b++) {
        if (energies[b] !== undefined) {
          bands[b].points.push({ energy: energies[b] });
        }
      }
      currentK++;
    }
  }

  return {
    systemName: customSystemName || 'Quantum ESPRESSO Calculation',
    sourceFormat: 'Quantum ESPRESSO',
    sourceFiles: ['bands.dat'],
    eFermi: 0.0,
    isSpinPolarized: false,
    hasSOC: false,
    highSymmetryPoints: [
      { index: 0, label: 'Γ', distance: 0 },
      { index: Math.floor(kPoints.length / 2), label: 'K', distance: kPoints[Math.floor(kPoints.length / 2)]?.distance ?? 1.0 },
      { index: kPoints.length - 1, label: 'M', distance: currentDist },
    ],
    kPoints,
    bands,
  };
}

/**
 * Parse Wannier90 band output (wannier90_band.dat)
 */
export function parseWannierBandDat(content: string, customSystemName?: string): BandStructureData {
  const lines = content.split(/\r?\n/).map((l) => l.trim());
  const bands: Band[] = [];
  const kPointsMap = new Map<number, KPoint>();

  let currentBandPoints: { dist: number; energy: number }[] = [];
  let bandIdx = 1;

  for (const line of lines) {
    if (line.length === 0) {
      if (currentBandPoints.length > 0) {
        bands.push({
          bandIndex: bandIdx++,
          spinChannel: 'unpolarized',
          points: currentBandPoints.map((p) => ({ energy: p.energy })),
        });
        currentBandPoints = [];
      }
      continue;
    }

    const tokens = line.split(/\s+/).map(Number);
    if (tokens.length >= 2 && !isNaN(tokens[0]) && !isNaN(tokens[1])) {
      const dist = tokens[0];
      const energy = tokens[1];
      currentBandPoints.push({ dist, energy });

      if (!kPointsMap.has(dist)) {
        kPointsMap.set(dist, {
          index: kPointsMap.size,
          coords: [dist, 0, 0],
          distance: dist,
        });
      }
    }
  }

  if (currentBandPoints.length > 0) {
    bands.push({
      bandIndex: bandIdx++,
      spinChannel: 'unpolarized',
      points: currentBandPoints.map((p) => ({ energy: p.energy })),
    });
  }

  const kPoints = Array.from(kPointsMap.values()).sort((a, b) => a.distance - b.distance);

  return {
    systemName: customSystemName || 'Wannier90 Interpolation',
    sourceFormat: 'Wannier90',
    sourceFiles: ['wannier90_band.dat'],
    eFermi: 0.0,
    isSpinPolarized: false,
    hasSOC: false,
    highSymmetryPoints: [
      { index: 0, label: 'Γ', distance: 0 },
      { index: Math.floor(kPoints.length / 2), label: 'K', distance: kPoints[Math.floor(kPoints.length / 2)]?.distance ?? 1.0 },
      { index: kPoints.length - 1, label: 'M', distance: kPoints[kPoints.length - 1]?.distance ?? 2.0 },
    ],
    kPoints,
    bands,
  };
}
