import joblib
import os
from fastapi import HTTPException

models = {}
model_metadata = {}

MODEL_PATH = "models/"

def load_models():
    global models, model_metadata
    
    # Load lstm_model.pkl (Prophet model)
    try:
        models['lstm_model'] = joblib.load(os.path.join(MODEL_PATH, 'lstm_model.pkl'))
        model_metadata['lstm_model'] = {'type': 'Prophet', 'task': 'case forecasting'}
    except Exception as e:
        models['lstm_model'] = None
        print(f"Warning: Could not load lstm_model.pkl: {e}")

    # Load gb_model.pkl (RandomForestRegressor)
    try:
        models['gb_model'] = joblib.load(os.path.join(MODEL_PATH, 'gb_model.pkl'))
        model_metadata['gb_model'] = {'type': 'RandomForestRegressor', 'task': 'transmission rate R0'}
    except Exception as e:
        models['gb_model'] = None
        print(f"Warning: Could not load gb_model.pkl: {e}")

    try:
        models["xgb"] = joblib.load(MODEL_PATH + "xgb_model.pkl")
        models["xgb_scaler"] = joblib.load(MODEL_PATH + "xgb_scaler.pkl")
    except Exception as e:
        models["xgb"] = None
        models["xgb_scaler"] = None
        print(f"Warning: Could not load xgb models: {e}")

    loaded_count = sum(1 for k, m in models.items() if m is not None and not k.endswith('_scaler'))
    print(f"Loaded {loaded_count}/3 models successfully")

def get_model(name: str):
    if name not in models or models[name] is None:
        raise HTTPException(status_code=503, detail=f"Model {name} is not loaded")
    return models[name]

def is_models_loaded() -> bool:
    return models.get('lstm_model') is not None and models.get('gb_model') is not None and models.get('xgb') is not None
