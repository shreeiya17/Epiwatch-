from fastapi import APIRouter

router = APIRouter(prefix="/risk_map", tags=["Risk Map"])

REGIONS_DATA = [
  {"id":1,"region":"Mumbai Metro","country":"India",
   "lat":19.0760,"lng":72.8777,"risk_score":89,
   "risk_level":"High","active_cases":1200000,
   "growth_rate":52,"vaccination_pct":68,"r0":1.82,
   "color":"#ef4444","radius":40},
  {"id":2,"region":"São Paulo","country":"Brazil",
   "lat":-23.5505,"lng":-46.6333,"risk_score":90,
   "risk_level":"High","active_cases":980000,
   "growth_rate":44,"vaccination_pct":71,"r0":1.68,
   "color":"#ef4444","radius":38},
  {"id":3,"region":"Gauteng","country":"South Africa",
   "lat":-26.2041,"lng":28.0473,"risk_score":89,
   "risk_level":"High","active_cases":820000,
   "growth_rate":38,"vaccination_pct":44,"r0":1.55,
   "color":"#ef4444","radius":35},
  {"id":4,"region":"Jakarta","country":"Indonesia",
   "lat":-6.2088,"lng":106.8456,"risk_score":90,
   "risk_level":"High","active_cases":560000,
   "growth_rate":16,"vaccination_pct":63,"r0":1.22,
   "color":"#ef4444","radius":32},
  {"id":5,"region":"Dhaka","country":"Bangladesh",
   "lat":23.8103,"lng":90.4125,"risk_score":89,
   "risk_level":"High","active_cases":540000,
   "growth_rate":27,"vaccination_pct":41,"r0":1.41,
   "color":"#ef4444","radius":30},
  {"id":6,"region":"Lagos","country":"Nigeria",
   "lat":6.5244,"lng":3.3792,"risk_score":88,
   "risk_level":"High","active_cases":380000,
   "growth_rate":19,"vaccination_pct":38,"r0":1.29,
   "color":"#ef4444","radius":28},
  {"id":7,"region":"Rio de Janeiro","country":"Brazil",
   "lat":-22.9068,"lng":-43.1729,"risk_score":81,
   "risk_level":"High","active_cases":650000,
   "growth_rate":31,"vaccination_pct":69,"r0":1.48,
   "color":"#ef4444","radius":33},
  {"id":8,"region":"Karachi","country":"Pakistan",
   "lat":24.8607,"lng":67.0011,"risk_score":58,
   "risk_level":"Medium","active_cases":280000,
   "growth_rate":14,"vaccination_pct":39,"r0":1.18,
   "color":"#f59e0b","radius":24},
  {"id":9,"region":"Cairo","country":"Egypt",
   "lat":30.0444,"lng":31.2357,"risk_score":55,
   "risk_level":"Medium","active_cases":310000,
   "growth_rate":15,"vaccination_pct":52,"r0":1.25,
   "color":"#f59e0b","radius":21},
  {"id":10,"region":"New York","country":"USA",
   "lat":40.7128,"lng":-74.0060,"risk_score":58,
   "risk_level":"Medium","active_cases":440000,
   "growth_rate":11,"vaccination_pct":87,"r0":1.12,
   "color":"#f59e0b","radius":22},
  {"id":11,"region":"Mexico City","country":"Mexico",
   "lat":19.4326,"lng":-99.1332,"risk_score":58,
   "risk_level":"Medium","active_cases":200000,
   "growth_rate":9,"vaccination_pct":62,"r0":1.07,
   "color":"#f59e0b","radius":20},
  {"id":12,"region":"Paris","country":"France",
   "lat":48.8566,"lng":2.3522,"risk_score":49,
   "risk_level":"Medium","active_cases":240000,
   "growth_rate":13,"vaccination_pct":82,"r0":1.19,
   "color":"#f59e0b","radius":18},
  {"id":13,"region":"Berlin","country":"Germany",
   "lat":52.5200,"lng":13.4050,"risk_score":42,
   "risk_level":"Medium","active_cases":210000,
   "growth_rate":11,"vaccination_pct":86,"r0":1.08,
   "color":"#f59e0b","radius":16},
  {"id":14,"region":"London","country":"UK",
   "lat":51.5074,"lng":-0.1278,"risk_score":38,
   "risk_level":"Low","active_cases":190000,
   "growth_rate":8,"vaccination_pct":88,"r0":0.94,
   "color":"#10b981","radius":15},
  {"id":15,"region":"Tokyo","country":"Japan",
   "lat":35.6762,"lng":139.6503,"risk_score":21,
   "risk_level":"Low","active_cases":55000,
   "growth_rate":3,"vaccination_pct":91,"r0":0.81,
   "color":"#10b981","radius":10}
]

@router.get("/")
def get_risk_map():
    high = len([r for r in REGIONS_DATA if r["risk_level"]=="High"])
    medium = len([r for r in REGIONS_DATA if r["risk_level"]=="Medium"])
    low = len([r for r in REGIONS_DATA if r["risk_level"]=="Low"])
    avg_r0 = round(sum(r["r0"] for r in REGIONS_DATA)/len(REGIONS_DATA),2)
    return {
        "status": "success",
        "total_regions": len(REGIONS_DATA),
        "summary": {
            "high_risk": high,
            "medium_risk": medium,
            "low_risk": low,
            "avg_r0": avg_r0,
            "active_outbreaks": len([r for r in REGIONS_DATA 
                                     if r["risk_score"] > 75])
        },
        "regions": REGIONS_DATA
    }

@router.get("/geojson")
def get_geojson():
    features = []
    for r in REGIONS_DATA:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [r["lng"], r["lat"]]
            },
            "properties": r
        })
    return {"type": "FeatureCollection", "features": features}
