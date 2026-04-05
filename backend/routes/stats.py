from fastapi import APIRouter

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/")
def get_global_stats():
    """Returns basic global or national epidemic statistics."""
    return {
        "status": "success",
        "data": {
            "total_cases": 1500000,
            "active_cases": 45000,
            "recovered": 1400000,
            "deaths": 55000,
            "fatality_rate": 0.036
        }
    }
