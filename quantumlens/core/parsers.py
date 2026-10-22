"""
QuantumLens: Scientific File Parsers (Python)
Parsers for VASP (EIGENVAL, DOSCAR), Quantum ESPRESSO (bands.dat), and Wannier90 (wannier90_band.dat).
"""

import math
from typing import Optional, List, Tuple
from .models import (
    BandStructure,
    Band,
    BandPoint,
    KPoint,
    HighSymmetryPoint,
    DOSData,
    DOSPoint,
)

def parse_vasp_eigenval(content: str, system_name: Optional[str] = None) -> BandStructure:
    """
    Parse VASP EIGENVAL output file.
    Supports collinear non-spin-polarized (ISPIN=1) and spin-polarized (ISPIN=2).
    """
    lines = [line.strip() for line in content.strip().splitlines() if line.strip()]
    if len(lines) < 6:
        raise ValueError("EIGENVAL content too short to contain valid VASP header.")

    # Line 1: NIONS NIONS NIONS ISPIN
    line1 = lines[0].split()
    ispin = int(line1[3]) if len(line1) > 3 else 1
    is_spin = (ispin == 2)

    calc_name = system_name or (lines[4] if len(lines) > 4 else "VASP Calculation")

    # Line 6: NELECT, NKPTS, NBANDS
    line6 = lines[5].split()
    nkpts = int(line6[1])
    nbands = int(line6[2])

    bands_up = [Band(band_index=i + 1, spin_channel='up' if is_spin else 'unpolarized', points=[]) for i in range(nbands)]
    bands_down = [Band(band_index=i + 1, spin_channel='down', points=[]) for i in range(nbands)] if is_spin else []

    k_points: List[KPoint] = []
    line_idx = 6
    accumulated_dist = 0.0
    prev_coords: Optional[Tuple[float, float, float]] = None

    for k in range(nkpts):
        if line_idx >= len(lines):
            break
        k_tokens = lines[line_idx].split()
        line_idx += 1
        kx, ky, kz = float(k_tokens[0]), float(k_tokens[1]), float(k_tokens[2])
        coords = (kx, ky, kz)

        if prev_coords is not None:
            dkx = coords[0] - prev_coords[0]
            dky = coords[1] - prev_coords[1]
            dkz = coords[2] - prev_coords[2]
            accumulated_dist += math.sqrt(dkx * dkx + dky * dky + dkz * dkz)
        prev_coords = coords

        label = 'Γ' if k == 0 else ('K' if k == nkpts // 2 else ('M' if k == nkpts - 1 else None))
        k_points.append(KPoint(index=k, coords=coords, distance=round(accumulated_dist, 5), label=label))

        for b in range(nbands):
            if line_idx >= len(lines):
                break
            b_tokens = lines[line_idx].split()
            line_idx += 1
            e_up = float(b_tokens[1])
            bands_up[b].points.append(BandPoint(energy=e_up))
            if is_spin and len(b_tokens) >= 3:
                e_down = float(b_tokens[2])
                bands_down[b].points.append(BandPoint(energy=e_down))

    all_bands = bands_up + bands_down if is_spin else bands_up

    high_sym = [
        HighSymmetryPoint(index=0, label='Γ', distance=0.0),
        HighSymmetryPoint(index=nkpts // 2, label='K', distance=k_points[nkpts // 2].distance if k_points else 1.0),
        HighSymmetryPoint(index=nkpts - 1, label='M', distance=accumulated_dist),
    ]

    return BandStructure(
        system_name=calc_name,
        source_format='VASP',
        source_files=['EIGENVAL'],
        e_fermi=0.0,
        is_spin_polarized=is_spin,
        has_soc=False,
        high_symmetry_points=high_sym,
        k_points=k_points,
        bands=all_bands,
    )

def parse_vasp_doscar(content: str, system_name: Optional[str] = None) -> DOSData:
    """
    Parse VASP DOSCAR output file.
    Extracts total and spin-resolved electronic density of states.
    """
    lines = [line.strip() for line in content.strip().splitlines() if line.strip()]
    if len(lines) < 6:
        raise ValueError("DOSCAR content too short to contain valid VASP header.")

    line6 = lines[5].split()
    nedos = int(line6[2])
    e_fermi = float(line6[3])

    points: List[DOSPoint] = []
    is_spin = False

    for i in range(nedos):
        idx = 6 + i
        if idx >= len(lines):
            break
        tokens = [float(t) for t in lines[idx].split()]
        if len(tokens) >= 3:
            energy = tokens[0]
            if len(tokens) >= 5:
                is_spin = True
                up = tokens[1]
                down = tokens[2]
                points.append(DOSPoint(
                    energy=energy,
                    total=up + down,
                    spin_up=up,
                    spin_down=down,
                    integrated=tokens[3] + tokens[4],
                ))
            else:
                points.append(DOSPoint(
                    energy=energy,
                    total=tokens[1],
                    integrated=tokens[2],
                ))

    return DOSData(
        system_name=system_name or "VASP DOS",
        e_fermi=e_fermi,
        source_format='VASP',
        points=points,
        available_orbitals=['Total'] + (['Spin-Up', 'Spin-Down'] if is_spin else []),
    )

def parse_wannier_band_dat(content: str, system_name: Optional[str] = None) -> BandStructure:
    """
    Parse Wannier90 band structure interpolation (wannier90_band.dat).
    """
    lines = content.splitlines()
    bands: List[Band] = []
    k_dist_map = {}
    current_points: List[BandPoint] = []
    current_dists: List[float] = []
    band_idx = 1

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            if current_points:
                bands.append(Band(band_index=band_idx, spin_channel='unpolarized', points=current_points))
                band_idx += 1
                current_points = []
                current_dists = []
            continue

        parts = line.split()
        if len(parts) >= 2:
            try:
                dist = float(parts[0])
                energy = float(parts[1])
                current_points.append(BandPoint(energy=energy))
                current_dists.append(dist)
                if dist not in k_dist_map:
                    k_dist_map[dist] = len(k_dist_map)
            except ValueError:
                continue

    if current_points:
        bands.append(Band(band_index=band_idx, spin_channel='unpolarized', points=current_points))

    sorted_dists = sorted(k_dist_map.keys())
    k_points = [
        KPoint(index=idx, coords=(d, 0.0, 0.0), distance=d)
        for idx, d in enumerate(sorted_dists)
    ]

    high_sym = [
        HighSymmetryPoint(index=0, label='Γ', distance=0.0),
        HighSymmetryPoint(index=len(k_points) // 2, label='K', distance=k_points[len(k_points) // 2].distance if k_points else 1.0),
        HighSymmetryPoint(index=len(k_points) - 1, label='M', distance=k_points[-1].distance if k_points else 2.0),
    ]

    return BandStructure(
        system_name=system_name or "Wannier90 Interpolation",
        source_format='Wannier90',
        source_files=['wannier90_band.dat'],
        e_fermi=0.0,
        is_spin_polarized=False,
        has_soc=False,
        high_symmetry_points=high_sym,
        k_points=k_points,
        bands=bands,
    )
