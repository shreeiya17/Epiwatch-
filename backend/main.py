from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from ml.loader import load_models, is_models_loaded

# Note: You need to create these modules to avoid ImportErrors
try:
    from routes import stats, predict, hotspots, risk_map, mobility
    from routes.chatbot import router as chatbot_router
except ImportError:
    pass

load_dotenv()

app = FastAPI(title="EpiWatch API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    load_models()
    print("EpiWatch API started")

try:
    app.include_router(stats.router, prefix="/api")
    app.include_router(predict.router, prefix="/api")
    app.include_router(hotspots.router, prefix="/api")
    app.include_router(risk_map.router, prefix="/api")
    app.include_router(mobility.router, prefix="/api")
    app.include_router(chatbot_router, prefix="/api")
except NameError:
    print("Warning: One or more routers are missing and were not included.")    

@app.get("/")
async def root():
    return {
        "status": "running",
        "message": "EpiWatch API", 
        "models": ["Prophet", "RandomForestRegressor"],
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "models_loaded": is_models_loaded()
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
    )







