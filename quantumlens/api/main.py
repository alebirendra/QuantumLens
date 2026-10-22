"""
QuantumLens: FastAPI Scientific Backend
REST API endpoints exposing VASP/QE/Wannier parsers, physics analysis, and benchmarks.
"""

from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from ..core.benchmarks import get_fe3sn2_benchmark, get_ruo2_benchmark
from ..core.parsers import parse_vasp_eigenval, parse_vasp_doscar, parse_wannier_band_dat
from ..core.analysis import (
    detect_dirac_points,
    detect_flat_bands,
    calculate_altermagnet_splitting,
    compare_soc_vs_nonsoc,
    generate_four_category_diagnostic,
)

app = FastAPI(
    title="QuantumLens Scientific Analysis API",
    description="Computational physics backend for electronic structures, quantum materials, magnetism, and topological phenomena.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BENCHMARKS = {
    "fe3sn2": get_fe3sn2_benchmark,
    "ruo2": get_ruo2_benchmark,
}

@app.get("/")
def root():
    return {
        "platform": "QuantumLens",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs"
    }

@app.get("/api/materials")
def list_materials():
    return [
        {"id": "fe3sn2", "name": "Fe3Sn2", "category": "Kagome Material", "magnetic_state": "Ferromagnetic"},
        {"id": "ruo2", "name": "RuO2", "category": "Altermagnet", "magnetic_state": "Altermagnetic"},
    ]

@app.get("/api/materials/{material_id}")
def get_material(material_id: str):
    if material_id not in BENCHMARKS:
        raise HTTPException(status_code=404, detail=f"Material '{material_id}' not found.")
    data = BENCHMARKS[material_id]()
    # Convert dataclasses to serializable dicts
    return {
        "id": data["id"],
        "name": data["name"],
        "formula": data["formula"],
        "category": data["category"],
        "description": data["description"],
        "references": data["references"],
        "diagnostic": data["diagnostic"].__dict__,
    }

@app.post("/api/parse/vasp/eigenval")
def api_parse_eigenval(payload: Dict[str, str] = Body(...)):
    content = payload.get("content", "")
    system_name = payload.get("system_name", "Uploaded Material")
    if not content:
        raise HTTPException(status_code=400, detail="Missing EIGENVAL content.")
    try:
        bs = parse_vasp_eigenval(content, system_name)
        dirac = detect_dirac_points(bs)
        flat = detect_flat_bands(bs)
        altermagnet = calculate_altermagnet_splitting(bs) if bs.is_spin_polarized else None
        diagnostic = generate_four_category_diagnostic(system_name, "Custom", bs, dirac, flat, altermagnet)
        return {
            "system_name": bs.system_name,
            "bands_count": len(bs.bands),
            "kpoints_count": len(bs.k_points),
            "is_spin_polarized": bs.is_spin_polarized,
            "dirac_candidates_count": len(dirac),
            "flat_bands_count": len(flat),
            "diagnostic": diagnostic.__dict__,
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
