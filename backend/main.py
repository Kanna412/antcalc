from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="AntCalc API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your Vercel URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Physics ──────────────────────────────────────────────────────────────────

SPEED_OF_LIGHT = 299_792_458  # m/s


def calculate_wavelength(freq_mhz: float, velocity_factor: float) -> float:
    return (SPEED_OF_LIGHT * velocity_factor) / (freq_mhz * 1e6)


def calculate_dipole(freq_mhz: float, vf: float) -> dict:
    wl = calculate_wavelength(freq_mhz, vf)
    half = wl / 2
    return {
        "type": "Half-Wave Dipole",
        "wavelength_m": wl,
        "total_m": half,
        "total_ft": half * 3.28084,
        "arm_m": half / 2,
        "arm_ft": (half / 2) * 3.28084,
        "impedance": "~73 Ω",
        "gain_dbi": 2.15,
    }


def calculate_monopole(freq_mhz: float, vf: float) -> dict:
    wl = calculate_wavelength(freq_mhz, vf)
    length = wl / 4
    return {
        "type": "Quarter-Wave Monopole",
        "wavelength_m": wl,
        "total_m": length,
        "total_ft": length * 3.28084,
        "arm_m": length,
        "arm_ft": length * 3.28084,
        "impedance": "~35 Ω",
        "gain_dbi": 5.15,
    }


def radiation_pattern(antenna: str) -> list[dict]:
    theta = np.linspace(0, 2 * np.pi, 360)
    eps = 1e-9
    sin_t = np.sin(np.clip(theta, eps, np.pi - eps))
    if antenna == "dipole":
        pat = np.abs(np.cos(np.pi / 2 * np.cos(theta)) / sin_t)
    else:
        pat = np.abs(np.cos(np.pi / 4 * np.cos(theta)) / sin_t)
    pat = np.nan_to_num(pat, nan=0.0)
    mx = pat.max() or 1
    pat /= mx
    return [{"theta": float(t), "r": float(r)} for t, r in zip(theta, pat)]


# ── Request / Response models ─────────────────────────────────────────────────

class CalcRequest(BaseModel):
    freq_mhz: float
    velocity_factor: float = 0.95
    antenna: str = "dipole"   # "dipole" | "monopole"


class SweepRequest(BaseModel):
    start_mhz: float
    stop_mhz: float
    velocity_factor: float = 0.95
    antenna: str = "dipole"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "AntCalc API is running"}


@app.post("/calculate")
def calculate(req: CalcRequest):
    if not (1e-6 <= req.freq_mhz <= 300_000):
        raise HTTPException(400, "Frequency must be between 0.000001 and 300000 MHz")
    if not (0.01 <= req.velocity_factor <= 1.0):
        raise HTTPException(400, "Velocity factor must be between 0.01 and 1.00")

    calc = calculate_dipole if req.antenna == "dipole" else calculate_monopole
    result = calc(req.freq_mhz, req.velocity_factor)
    pattern = radiation_pattern(req.antenna)
    return {**result, "pattern": pattern}


@app.post("/sweep")
def sweep(req: SweepRequest):
    if req.start_mhz >= req.stop_mhz:
        raise HTTPException(400, "start_mhz must be less than stop_mhz")

    freqs = np.linspace(req.start_mhz, req.stop_mhz, 300).tolist()
    calc = calculate_dipole if req.antenna == "dipole" else calculate_monopole
    lengths = [calc(f, req.velocity_factor)["total_m"] for f in freqs]
    return {"freqs": freqs, "lengths": lengths}
