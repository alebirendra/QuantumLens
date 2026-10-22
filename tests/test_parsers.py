import unittest
from quantumlens.core.parsers import parse_vasp_eigenval, parse_vasp_doscar, parse_wannier_band_dat

class TestParsers(unittest.TestCase):
    def test_parse_vasp_eigenval(self):
        sample = """
        1 1 1 2
        10.0 0 0 0 0
        0.0
        CAR
        Fe3Sn2 Test
        10 2 2

        0.0 0.0 0.0 0.5
        1 -1.50 -1.30
        2  0.20  0.40

        0.5 0.0 0.0 0.5
        1 -0.80 -0.70
        2  0.90  1.00
        """
        bs = parse_vasp_eigenval(sample, "Fe3Sn2")
        self.assertEqual(bs.system_name, "Fe3Sn2")
        self.assertTrue(bs.is_spin_polarized)
        self.assertEqual(len(bs.k_points), 2)
        self.assertEqual(len(bs.bands), 4) # 2 bands * 2 spin
        self.assertEqual(bs.bands[0].spin_channel, 'up')
        self.assertEqual(bs.bands[2].spin_channel, 'down')
        self.assertEqual(bs.bands[0].points[0].energy, -1.50)
        self.assertEqual(bs.bands[2].points[0].energy, -1.30)

    def test_parse_vasp_doscar(self):
        sample = """
        1.0
        1.0
        1.0
        1.0
        1.0
        10.0 -10.0 2 0.0 1.0
        -1.0 1.5 1.2 0.5 0.4
         0.0 2.5 2.1 1.5 1.4
        """
        dos = parse_vasp_doscar(sample, "Test DOS")
        self.assertEqual(dos.system_name, "Test DOS")
        self.assertEqual(dos.e_fermi, 0.0)
        self.assertEqual(len(dos.points), 2)
        self.assertEqual(dos.points[1].total, 4.6)
        self.assertEqual(dos.points[1].spin_up, 2.5)

    def test_parse_wannier_band_dat(self):
        sample = """
        0.000 -1.200
        0.500  0.100

        0.000  0.500
        0.500  1.400
        """
        bs = parse_wannier_band_dat(sample, "Wannier Test")
        self.assertEqual(len(bs.bands), 2)
        self.assertEqual(len(bs.k_points), 2)
        self.assertEqual(bs.bands[0].points[1].energy, 0.100)

if __name__ == '__main__':
    unittest.main()
