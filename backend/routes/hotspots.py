from fastapi import APIRouter
from ml.loader import get_model
import numpy as np

router = APIRouter(prefix="/hotspots", tags=["Hotspots"])

HOTSPOT_DATA = [
    {"region": "Mumbai Metro", "country": "India", "features": [1200, 1150, 0.52, 1.82, 0.68, 20800, 0.18, 8.2, 72, 0.5]},
    {"region": "Sao Paulo", "country": "Brazil", "features": [980, 940, 0.44, 1.68, 0.71, 46300, 0.15, 7.1, 68, 0.8]},
    {"region": "Gauteng", "country": "South Africa", "features": [820, 790, 0.38, 1.55, 0.44, 15200, 0.21, 5.3, 61, 0.3]},
    {"region": "Rio de Janeiro", "country": "Brazil", "features": [650, 620, 0.31, 1.48, 0.69, 17400, 0.13, 6.8, 65, 0.7]},
    {"region": "Dhaka", "country": "Bangladesh", "features": [540, 510, 0.27, 1.41, 0.41, 22400, 0.19, 4.2, 55, 0.2]},
    {"region": "Lagos", "country": "Nigeria", "features": [380, 360, 0.19, 1.29, 0.38, 15300, 0.16, 3.8, 48, 0.2]},
    {"region": "Jakarta", "country": "Indonesia", "features": [320, 305, 0.16, 1.22, 0.63, 34500, 0.12, 5.9, 52, 0.6]},
    {"region": "Karachi", "country": "Pakistan", "features": [280, 265, 0.14, 1.18, 0.39, 16100, 0.11, 4.5, 49, 0.3]},
    {"region": "New York", "country": "USA", "features": [440, 420, 0.11, 1.12, 0.87, 20200, 0.08, 9.2, 58, 1.8]},
    {"region": "Mexico City", "country": "Mexico", "features": [200, 190, 0.09, 1.07, 0.62, 21600, 0.07, 6.1, 51, 0.8]}
]

@router.get("/")
def get_hotspots():
    rf_model = get_model("xgb")
    scaler = get_model("xgb_scaler")

    hotspots = []
    active_outbreaks = 0
    level_map = {0: "Low", 1: "Medium", 2: "High"}

    for idx, region_info in enumerate(HOTSPOT_DATA):
        input_array = region_info["features"]
        input_scaled = scaler.transform([input_array])
        prediction = rf_model.predict(input_scaled)[0]
        proba = rf_model.predict_proba(input_scaled)[0]

        risk_level = level_map[int(prediction)]
        confidence = max(proba) * 100
        
        if risk_level == "High":
            active_outbreaks += 1

        growth_rate_pct = int(input_array[2] * 100)

        ai_insight = f"Model predicts {risk_level} risk with {confidence:.1f}% confidence. Primary driver: {growth_rate_pct}% case growth rate."

        # Generating mock trend array
        base = abs(growth_rate_pct) * 20
        trend = [max(10, min(5000, int(base * (1 + i*0.15)))) for i in range(7)]

        hotspots.append({
            "rank": idx + 1,
            "region": region_info["region"],
            "country": region_info["country"],
            "risk_level": risk_level,
            "risk_score": int(confidence*.9) if risk_level == "High" else int(confidence*.6),
            "confidence": round(confidence, 1),
            "growth_rate": growth_rate_pct,
            "r0": input_array[3],
            "trend": trend,
            "ai_insight": ai_insight
        })

    # Sort hotspots: High risk first, then confidence
    risk_weights = {"High": 3, "Medium": 2, "Low": 1}
    hotspots.sort(key=lambda x: (risk_weights[x["risk_level"]], x["confidence"]), reverse=True)
    for i, h in enumerate(hotspots):
        h["rank"] = i + 1

    return {
        "status": "success",
        "model_used": "RandomForestClassifier",
        "total": len(HOTSPOT_DATA),
        "active_outbreaks": active_outbreaks,
        "hotspots": hotspots
    }
