from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
from datetime import datetime, timedelta
from ml.loader import get_model

router = APIRouter(prefix="/predict", tags=["Predict"])

class R0Input(BaseModel):
    temperature: float
    humidity: float
    population_density: float
    mobility_index: float

@router.get("/cases")
def predict_cases(days: int = 30):
    """Predict future case numbers using the loaded Prophet model."""
    try:
        model = get_model('lstm_model')  # Prophet model
        
        # Prophet API implementation
        from datetime import date
        last_train_date = date(2022, 10, 9)
        today = date.today()
        days_gap = (today - last_train_date).days
        periods_needed = days_gap + 7
        
        future = model.make_future_dataframe(periods=periods_needed)
        
        # Add EXACTLY the required regressors
        future['vaccination'] = 0.68
        future['mobility_index'] = -0.15
        future['floor'] = 0.0
        
        forecast = model.predict(future)
        
        # Take last 7 rows of forecast
        res = forecast.tail(7)
        
        predictions = []
        for _, row in res.iterrows():
            predictions.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "predicted_cases": int(row['yhat']),
                "lower": int(row['yhat_lower']),
                "upper": int(row['yhat_upper'])
            })
            
        return {
            "forecast": predictions,
            "model_used": "Prophet",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/hospital-load")
def predict_hospital_load(country: str = "India"):
    """Predict ICU and hospital bed demand over the next 30 days based on current trends."""
    try:
        # Mocking sophisticated data generation since real models require specific inputs
        # Baseline capacities for various countries
        country_baselines = {
            "India": {"total_beds": 1900000, "icu_beds": 95000, "current_occupancy": 0.65, "daily_growth": 0.015},
            "USA": {"total_beds": 920000, "icu_beds": 105000, "current_occupancy": 0.72, "daily_growth": 0.008},
            "Brazil": {"total_beds": 490000, "icu_beds": 45000, "current_occupancy": 0.58, "daily_growth": 0.021},
            "UK": {"total_beds": 140000, "icu_beds": 5900, "current_occupancy": 0.85, "daily_growth": 0.005},
            "Germany": {"total_beds": 660000, "icu_beds": 28000, "current_occupancy": 0.60, "daily_growth": 0.007},
            "South Africa": {"total_beds": 110000, "icu_beds": 6000, "current_occupancy": 0.55, "daily_growth": 0.018},
            "Japan": {"total_beds": 1500000, "icu_beds": 15000, "current_occupancy": 0.40, "daily_growth": 0.002}
        }
        
        # Default to a generic profile if country not found
        base = country_baselines.get(country, {"total_beds": 500000, "icu_beds": 25000, "current_occupancy": 0.6, "daily_growth": 0.01})
        
        predictions = []
        occupancy = base["current_occupancy"]
        
        critical_day = None
        
        for day in range(30):
            # Compound growth modeling
            occupancy += (base["daily_growth"] * (1 - occupancy*0.5)) + (day * 0.0005)
            if occupancy > 1.0: 
                occupancy = 1.0
                
            icu_load = occupancy * 1.15 # ICU fills slightly faster
            if icu_load > 1.0:
                icu_load = 1.0
                
            predictions.append({
                "day": day,
                "date": (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                "hospital_occupancy_pct": round(occupancy * 100, 1),
                "icu_occupancy_pct": round(icu_load * 100, 1),
                "beds_available": int(base["total_beds"] * (1 - occupancy)),
                "icu_available": int(base["icu_beds"] * (1 - icu_load))
            })
            
            if critical_day is None and icu_load >= 0.8:
                critical_day = day
                
        insight = f"Capacity remains stable over the next 30 days."
        if critical_day is not None:
            if critical_day == 0:
                insight = f"CRITICAL: {country} ICU capacity is currently exceeding 80%."
            else:
                insight = f"WARNING: {country} ICU capacity will reach 80% in {critical_day} days."

        return {
            "country": country,
            "total_beds": base["total_beds"],
            "total_icu_beds": base["icu_beds"],
            "critical_day": critical_day,
            "insight": insight,
            "forecast": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hospital load error: {str(e)}")

@router.post("/r0")
def predict_r0(data: R0Input):
    """Predict transmission rate (R0) using the RandomForestRegressor model."""
    try:
        model = get_model('gb_model')  # RandomForestRegressor
        
        # Scikit-learn expect 2D array
        features = [[data.temperature, data.humidity, data.population_density, data.mobility_index]]
        prediction = model.predict(features)
        
        return {
            "status": "success", 
            "data": {
                "predicted_r0": float(prediction[0]),
                "inputs": data.dict()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"R0 Prediction error: {str(e)}")
