---
title: QuantumLens - Quantum Materials & Electronic Structure Analysis
emoji: ⚛️
colorFrom: indigo
colorTo: cyan
sdk: streamlit
sdk_version: "1.38.0"
app_file: app.py
pinned: false
license: mit
---

# QuantumLens — Quantum Materials & Electronic-Structure Analysis Platform

**QuantumLens** is a computational physics analysis platform specializing in electronic structures, quantum materials, unconventional magnetism (altermagnets, frustrated kagome systems), and topological phenomena.

The platform bridges computational electronic-structure codes (**VASP**, **Quantum ESPRESSO**, **Wannier90**, **WannierBerri**) with reliable, reproducible, physics-aware visualization and diagnostics.

---

## 🎯 Core Scientific Mission & Principles

**Core principle:** QuantumLens rigorously distinguishes between:
1. **Directly extracted numerical data** (source files, raw parameters, units)
2. **Numerically calculated quantities** (deterministic algorithms, assumptions, formulas)
3. **Candidate physical phenomena** (heuristics, evidence scores, required checks)
4. **Conclusions not established** (explicit caveats: e.g., a band crossing $\neq$ proved Dirac point without symmetry proof; spin splitting $\neq$ proved altermagnetism without real-space spin group analysis; an SOC gap $\neq$ topological insulator without $Z_2$ invariant; 1D path $\neq$ complete 3D Fermi surface).

---

## 🛠️ Technology Architecture

### 1. Scientific Core: Python (`quantumlens/`)
- **NumPy & SciPy:** Pure numerical computation, least-squares dispersion regression, and tensor operations.
- **Modular Data Parsers (`quantumlens/core/parsers.py`):**
  - **VASP:** `EIGENVAL`, `DOSCAR`, `vasprun.xml`, `PROCAR`.
  - **Quantum ESPRESSO:** `bands.dat`, `dos.dat`, `pw.x` outputs.
  - **Wannier90:** `wannier90_band.dat`, `wannier90_hr.dat`, `ahc.dat`.
- **Physics Engine (`quantumlens/core/analysis.py`):**
  - Dirac candidate crossing search with $v_F$ Fermi velocity and $R^2$ linearity.
  - Kagome flat-band detection with directional dispersion and bandwidth thresholds.
  - Altermagnetic momentum-dependent spin splitting $\Delta E(\mathbf{k}) = E_\uparrow(\mathbf{k}) - E_\downarrow(\mathbf{k})$.
  - Spin-Orbit Coupling (SOC) gap openings $\Delta_{SOC}$ and band inversions.
  - Four-Category Diagnostic Engine.
- **FastAPI Backend (`quantumlens/api/main.py`):** REST API endpoints exposing all analysis functions.
- **Automated Tests (`tests/`):** Python unit tests executable with standard `unittest` or `pytest`.

### 2. Interactive Deployments: Streamlit & Hugging Face (`app.py`, `streamlit_app.py`)
- Turnkey deployment to **Hugging Face Spaces** and **Streamlit Community Cloud**.
- Interactive Plotly band structure plotting, van Hove singularity detection, 2D altermagnetic splitting contours, 3D Fermi surfaces, Berry curvature hotspots, and exportable Markdown/JSON reports.

### 3. Web Interface: React & TypeScript (`src/`)
- React 19 SPA with Tailwind CSS, Three.js 3D Fermi Surface rendering, responsive layouts, and interactive SVG analyzers.

---

## 🚀 Quickstart Guide

### Option A: Run Streamlit Application (Local / Hugging Face Spaces)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Launch Streamlit
streamlit run app.py
```
*The app will be available at `http://localhost:8501`.*

---

### Option B: Deploy to Hugging Face Spaces

1. Create a new Space on [Hugging Face](https://huggingface.co/spaces) with **Streamlit** SDK (or Docker SDK).
2. Clone your space repository:
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
   ```
3. Copy `app.py`, `requirements.txt`, `quantumlens/`, and `README.md` into the space repository.
4. Push to Hugging Face:
   ```bash
   git add .
   git commit -m "Deploy QuantumLens to Hugging Face Spaces"
   git push origin main
   ```
*Hugging Face automatically builds and launches the application!*

---

### Option C: Run FastAPI Scientific Backend

```bash
uvicorn quantumlens.api.main:app --host 0.0.0.0 --port 8000 --reload
```
*Interactive API Swagger docs available at `http://localhost:8000/docs`.*

---

### Option D: Run Automated Unit Tests

```bash
# Run Python physics tests
python3 -m unittest discover -s tests

# Run TypeScript/Node.js tests
npx tsx --test src/physics/*.test.ts src/data/*.test.ts
```

---

### Option E: Run React / Three.js Frontend

```bash
npm install
npm run dev
```
*The React applet is served on `http://localhost:3000`.*

---

## 🔬 Supported Workspaces & Modules

1. **Band Structure Explorer:** Arbitrary $\mathbf{k}$-paths, high-symmetry labels, spin channels, orbital projections.
2. **Density of States (DOS):** Total, spin-resolved, and PDOS curves with van Hove saddle-point candidate markers.
3. **Dirac & Band-Crossing Analyzer:** Linear cone regression ($R^2$, $v_F$), avoided crossings, and symmetry protection caveats.
4. **Kagome Flat-Band Analyzer:** Heuristic bandwidth slider, directional path dispersion, compact localized state (CLS) physics.
5. **Altermagnet & Spin-Splitting Analyzer:** 2D reciprocal splitting maps ($d$-wave nodal lines), vector spin textures $\langle S_z\rangle$, spin group diagnostics.
6. **SOC Quantitative Evaluator:** Dual Non-SOC vs. SOC alignment, gap openings $\Delta_{SOC}$, band inversion detection.
7. **Fermi Surface Explorer:** Interactive 3D WebGL isosurfaces, chemical potential offset slider, 2D slice plane cuts ($k_z = 0, \pi/c$).
8. **Berry Curvature Analyzer:** 2D $\Omega_z(k_x, k_y)$ field, hotspot identification, positive/negative cancellation analysis.
9. **Anomalous Hall Conductivity (AHC):** Intrinsic Kubo formula $\sigma_{xy}(\mu)$ curves, tensor components ($\sigma_{xx}, \sigma_{xy}, \sigma_{yz}$), $\mathbf{k}$-mesh convergence audit.
10. **Magnetic Symmetry:** Magnetic space groups and spin symmetry classification.
11. **Convergence Validator:** Numerical quality audit of plane-wave cutoffs, k-mesh densities, smearing parameters, and Wannier spread.
12. **Four-Category Scientific Diagnostic Engine:** Separation of directly extracted data, calculated quantities, candidate phenomena, and unproven claims. Exportable to Markdown and JSON.

---

## 📄 License
MIT License. Open for researchers and students in computational condensed matter physics and quantum materials.
