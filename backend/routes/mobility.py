from fastapi import APIRouter

router = APIRouter(prefix="/mobility", tags=["Mobility"])

@router.get("/")
def get_mobility_data():
    """Returns mock mobility trend index data."""
    return {
        "status": "success",
        "trends": [
            {"date": "2026-03-15", "retail": -10, "transit": -15, "workplace": -20},
            {"date": "2026-03-16", "retail": -8, "transit": -12, "workplace": -10},
            {"date": "2026-03-17", "retail": -5, "transit": -5, "workplace": -5},
            {"date": "2026-03-18", "retail": -2, "transit": 0, "workplace": 5},
            {"date": "2026-03-19", "retail": 5, "transit": 10, "workplace": 15},
            {"date": "2026-03-20", "retail": 12, "transit": 15, "workplace": 25},
            {"date": "2026-03-21", "retail": 10, "transit": 8, "workplace": 5}
        ]
    }
