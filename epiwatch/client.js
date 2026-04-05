const BASE = "http://127.0.0.1:8000";

export const api = {
  globalStats: () => 
    fetch(`${BASE}/api/stats/`).then(r => r.json()),
  
  predictCases: () => 
    fetch(`${BASE}/api/predict/cases`).then(r => r.json()),
  
  hotspots: () => 
    fetch(`${BASE}/api/hotspots/`).then(r => r.json()),
  
  riskMap: () => 
    fetch(`${BASE}/api/risk_map/`).then(r => r.json()),

  mobility: () => 
    fetch(`${BASE}/api/mobility/`).then(r => r.json()),
};