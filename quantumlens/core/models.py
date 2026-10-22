"""
QuantumLens: Core Scientific Data Models
Data structures for electronic structures, density of states, Dirac/Weyl candidate crossings,
flat bands, altermagnetic spin splitting, SOC comparison, Berry curvature, and AHC.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Any

@dataclass
class KPoint:
    index: int
    coords: Tuple[float, float, float]
    distance: float
    label: Optional[str] = None

@dataclass
class OrbitalProjection:
    atom: str
    element: str
    orbital: str
    weight: float

@dataclass
class BandPoint:
    energy: float
    projections: List[OrbitalProjection] = field(default_factory=list)
    sx: Optional[float] = None
    sy: Optional[float] = None
    sz: Optional[float] = None

@dataclass
class Band:
    band_index: int
    spin_channel: str  # 'up', 'down', 'noncollinear', 'unpolarized'
    points: List[BandPoint] = field(default_factory=list)

@dataclass
class HighSymmetryPoint:
    index: int
    label: str
    distance: float

@dataclass
class BandGap:
    is_direct: bool
    gap_energy: float
    vbm_energy: float
    cbm_energy: float
    vbm_kpoint: Tuple[float, float, float]
    cbm_kpoint: Tuple[float, float, float]

@dataclass
class BandStructure:
    system_name: str
    source_format: str  # 'VASP', 'Quantum ESPRESSO', 'Wannier90', 'Custom'
    source_files: List[str]
    e_fermi: float
    is_spin_polarized: bool
    has_soc: bool
    high_symmetry_points: List[HighSymmetryPoint]
    k_points: List[KPoint]
    bands: List[Band]
    calculated_gap: Optional[BandGap] = None
    lattice_vectors: Optional[List[List[float]]] = None
    reciprocal_vectors: Optional[List[List[float]]] = None

@dataclass
class DOSPoint:
    energy: float
    total: float
    spin_up: Optional[float] = None
    spin_down: Optional[float] = None
    integrated: Optional[float] = None
    projections: Dict[str, float] = field(default_factory=dict)

@dataclass
class DOSData:
    system_name: str
    e_fermi: float
    source_format: str
    points: List[DOSPoint]
    available_orbitals: List[str] = field(default_factory=list)

@dataclass
class DiracCandidate:
    id: str
    k_index: int
    k_coords: Tuple[float, float, float]
    energy: float  # eV relative to EF
    band1_index: int
    band2_index: int
    energy_separation: float  # eV
    estimated_fermi_velocity: float  # in 10^5 m/s
    linear_fit_r2: float
    is_avoided_crossing: bool = False
    k_point_label: Optional[str] = None
    confidence: str = 'Candidate'  # 'High', 'Medium', 'Candidate'
    symmetry_protection_verified: bool = False
    notes: str = ""

@dataclass
class SegmentDispersion:
    from_label: str
    to_label: str
    delta_e_mev: float

@dataclass
class FlatBandCandidate:
    band_index: int
    spin_channel: str
    bandwidth_mev: float
    min_energy: float
    max_energy: float
    mean_energy: float
    dispersion_along_segments: List[SegmentDispersion]
    dominant_orbital: Optional[str] = None
    is_kagome_cls_candidate: bool = False
    heuristic_threshold_mev: float = 150.0
    notes: str = ""

@dataclass
class VanHoveCandidate:
    energy: float
    dos_value: float
    associated_kpoint: str
    associated_bands: List[int]
    orbital_dominance: str
    confidence: str
    notes: str

@dataclass
class AltermagnetSplittingPoint:
    k_coords: Tuple[float, float, float]
    k_distance: float
    band_index: int
    energy_up: float
    energy_down: float
    delta_e: float

@dataclass
class SpinTexture2D:
    kx: float
    ky: float
    sx: float
    sy: float
    sz: float
    band_index: int = 1

@dataclass
class AltermagnetAnalysis:
    material: str
    candidate_harmonic: str  # 'd-wave', 'g-wave', 'i-wave'
    has_alternating_sign: bool
    max_splitting_mev: float
    mean_splitting_mev: float
    nodal_lines: List[str]
    splittings: List[AltermagnetSplittingPoint]
    spin_textures_2d: List[SpinTexture2D]
    spin_group_candidate: str
    allows_non_relativistic_splitting: bool
    net_magnetization_zero: bool
    notes: List[str]

@dataclass
class GapOpening:
    k_index: int
    k_coords: Tuple[float, float, float]
    non_soc_diff: float
    soc_diff: float
    delta_gap: float
    band_lower: int
    band_upper: int
    k_label: Optional[str] = None

@dataclass
class BandInversion:
    k_point: str
    bands_involved: List[int]
    energy_range: Tuple[float, float]
    parity_inversion_candidate: bool
    details: str

@dataclass
class SOCComparisonResult:
    aligned_bands_count: int
    max_energy_shift_ev: float
    mean_energy_shift_ev: float
    gap_openings: List[GapOpening]
    band_inversions: List[BandInversion]

@dataclass
class BerryHotspot:
    kx: float
    ky: float
    omega_value: float
    band_index: Optional[int] = None
    energy_diff_to_ef: Optional[float] = None
    note: str = ""

@dataclass
class BerryCurvatureData:
    plane: str  # 'kx-ky'
    slice_coord: float  # kz = 0.0
    units: str  # 'Å^2'
    grid_x: List[float]
    grid_y: List[float]
    omega_z: List[List[float]]
    hotspots: List[BerryHotspot]
    occupied_integral_estimate: float

@dataclass
class MeshConvergence:
    mesh: str
    sigma_xy: float
    converged: bool

@dataclass
class ValidationCheck:
    name: str
    status: str  # 'pass', 'warning', 'fail'
    message: str

@dataclass
class AHCData:
    material: str
    units: str
    e_fermi: float
    chemical_potentials: List[float]
    sigma_xy: List[float]
    sigma_xx: List[float]
    sigma_yz: List[float]
    k_mesh_convergence: List[MeshConvergence]
    validation_checks: List[ValidationCheck]

@dataclass
class FourCategoryDiagnostic:
    directly_extracted: List[Dict[str, str]]
    numerically_calculated: List[Dict[str, str]]
    candidate_phenomena: List[Dict[str, str]]
    conclusions_not_established: List[Dict[str, str]]
