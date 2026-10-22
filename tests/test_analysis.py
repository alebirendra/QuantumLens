import unittest
from quantumlens.core.models import BandStructure, Band, BandPoint, KPoint, HighSymmetryPoint
from quantumlens.core.analysis import (
    linear_fit,
    detect_dirac_points,
    detect_flat_bands,
    calculate_altermagnet_splitting,
    compare_soc_vs_nonsoc,
    generate_four_category_diagnostic,
)

class TestAnalysis(unittest.TestCase):
    def setUp(self):
        self.k_points = [
            KPoint(index=0, coords=(0.0, 0.0, 0.0), distance=0.0, label='Γ'),
            KPoint(index=1, coords=(0.2, 0.0, 0.0), distance=0.5),
            KPoint(index=2, coords=(0.33, 0.33, 0.0), distance=1.0, label='K'),
            KPoint(index=3, coords=(0.4, 0.2, 0.0), distance=1.5),
            KPoint(index=4, coords=(0.5, 0.0, 0.0), distance=2.0, label='M'),
        ]
        self.high_sym = [
            HighSymmetryPoint(index=0, label='Γ', distance=0.0),
            HighSymmetryPoint(index=2, label='K', distance=1.0),
            HighSymmetryPoint(index=4, label='M', distance=2.0),
        ]
        self.bs = BandStructure(
            system_name="Mock Material",
            source_format="VASP",
            source_files=["vasprun.xml"],
            e_fermi=0.0,
            is_spin_polarized=False,
            has_soc=False,
            high_symmetry_points=self.high_sym,
            k_points=self.k_points,
            bands=[
                Band(band_index=1, spin_channel='up', points=[
                    BandPoint(energy=-0.8), BandPoint(energy=-0.4), BandPoint(energy=0.0), BandPoint(energy=-0.4), BandPoint(energy=-0.8)
                ]),
                Band(band_index=2, spin_channel='up', points=[
                    BandPoint(energy=0.8), BandPoint(energy=0.4), BandPoint(energy=0.01), BandPoint(energy=0.4), BandPoint(energy=0.8)
                ]),
                Band(band_index=3, spin_channel='up', points=[
                    BandPoint(energy=1.20), BandPoint(energy=1.21), BandPoint(energy=1.22), BandPoint(energy=1.21), BandPoint(energy=1.20)
                ]),
            ]
        )

    def test_linear_fit(self):
        x = [0.0, 1.0, 2.0, 3.0, 4.0]
        y = [1.0, 3.0, 5.0, 7.0, 9.0]
        slope, intercept, r2 = linear_fit(x, y)
        self.assertAlmostEqual(slope, 2.0)
        self.assertAlmostEqual(intercept, 1.0)
        self.assertAlmostEqual(r2, 1.0)

    def test_detect_dirac_points(self):
        crossings = detect_dirac_points(self.bs, gap_threshold_ev=0.05)
        self.assertGreaterEqual(len(crossings), 1)
        crossing = crossings[0]
        self.assertEqual(crossing.k_index, 2)
        self.assertGreater(crossing.linear_fit_r2, 0.8)
        self.assertFalse(crossing.symmetry_protection_verified)

    def test_detect_flat_bands(self):
        flat = detect_flat_bands(self.bs, threshold_mev=100.0)
        self.assertEqual(len(flat), 1)
        self.assertEqual(flat[0].band_index, 3)
        self.assertLessEqual(flat[0].bandwidth_mev, 50.0)

    def test_calculate_altermagnet_splitting(self):
        spin_bs = BandStructure(
            system_name="RuO2 Test",
            source_format="VASP",
            source_files=["EIGENVAL"],
            e_fermi=0.0,
            is_spin_polarized=True,
            has_soc=False,
            high_symmetry_points=self.high_sym,
            k_points=self.k_points,
            bands=[
                Band(band_index=1, spin_channel='up', points=[
                    BandPoint(energy=0.0), BandPoint(energy=0.4), BandPoint(energy=0.0), BandPoint(energy=-0.3), BandPoint(energy=0.0)
                ]),
                Band(band_index=1, spin_channel='down', points=[
                    BandPoint(energy=0.0), BandPoint(energy=0.1), BandPoint(energy=0.0), BandPoint(energy=0.2), BandPoint(energy=0.0)
                ]),
            ]
        )
        alt = calculate_altermagnet_splitting(spin_bs)
        self.assertTrue(alt.has_alternating_sign)
        self.assertEqual(alt.candidate_harmonic, 'd-wave')
        self.assertGreaterEqual(alt.max_splitting_mev, 300.0)

    def test_four_category_diagnostic(self):
        diag = generate_four_category_diagnostic("Fe3Sn2", "Kagome Material", self.bs)
        self.assertGreaterEqual(len(diag.directly_extracted), 3)
        self.assertGreaterEqual(len(diag.numerically_calculated), 1)
        self.assertGreaterEqual(len(diag.conclusions_not_established), 3)

if __name__ == '__main__':
    unittest.main()
