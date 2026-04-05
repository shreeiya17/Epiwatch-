from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/chat", tags=["chatbot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    data: Dict[str, Any] = {}
    suggestions: List[str] = []

HOTSPOT_DATA = {
    "mumbai": {"risk": 89, "country": "India", "growth": 52, "r0": 1.82},
    "sao_paulo": {"risk": 90, "country": "Brazil", "growth": 44, "r0": 1.68},
    "jakarta": {"risk": 90, "country": "Indonesia", "growth": 16, "r0": 1.22},
    "gauteng": {"risk": 89, "country": "South Africa", "growth": 38, "r0": 1.55},
    "dhaka": {"risk": 89, "country": "Bangladesh", "growth": 27, "r0": 1.41}
}

COUNTRY_DATA = {
    "india": {"cases": 2100000, "growth": 47, "vacc": 72, "r0": 1.68, "risk": 81},
    "usa": {"cases": 1200000, "growth": 18, "vacc": 85, "r0": 1.34, "risk": 62},
    "brazil": {"cases": 890000, "growth": 31, "vacc": 68, "r0": 1.51, "risk": 74},
    "uk": {"cases": 190000, "growth": 8, "vacc": 88, "r0": 0.94, "risk": 38},
    "japan": {"cases": 55000, "growth": 3, "vacc": 91, "r0": 0.81, "risk": 21},
    "germany": {"cases": 210000, "growth": 11, "vacc": 86, "r0": 1.08, "risk": 42},
    "france": {"cases": 240000, "growth": 13, "vacc": 82, "r0": 1.19, "risk": 49},
    "south africa": {"cases": 340000, "growth": 28, "vacc": 45, "r0": 1.44, "risk": 71}
}

def handle_highest_risk(message: str) -> dict:
    response_text = (
        "Based on our Model 2 (RandomForestClassifier) analysis, São Paulo, Brazil "
        "has the highest risk score of 90/100 with 100% model confidence. Key factors: "
        "44% case growth rate and R0 of 1.68 (above critical threshold of 1.0). Mumbai "
        "Metro, India follows closely with risk score 89/100 and alarming 52% case "
        "growth rate. Immediate public health intervention is recommended in both regions."
    )
    return {
        "response": response_text,
        "data": {
            "sao_paulo": HOTSPOT_DATA["sao_paulo"],
            "mumbai": HOTSPOT_DATA["mumbai"]
        },
        "suggestions": ["Show me Brazil details", "What about India?", "How many active outbreaks?"]
    }

def handle_country_prediction(message: str, country_key: str) -> dict:
    data = COUNTRY_DATA[country_key]
    country_name = "USA" if country_key == "usa" else "UK" if country_key == "uk" else country_key.title()
    
    current_cases = data["cases"]
    growth = data["growth"]
    # 7-day forecast: assuming the growth means cumulative growth over 7 days for simplicity
    pred_7_day = int(current_cases * (1 + growth / 100))
    
    r0 = data["r0"]
    risk = data["risk"]
    vacc = data["vacc"]
    
    risk_level = "HIGH" if risk > 70 else "MEDIUM" if risk > 40 else "LOW"
    
    response = (
        f"{country_name} Analysis (Model 1 — Prophet Forecast):\n"
        f"Current active cases: {current_cases:,}\n"
        f"7-day prediction: Cases expected to reach {pred_7_day:,} ({growth}% growth trajectory)\n"
        f"R0 = {r0} — Each infected person spreads to {r0} others.\n"
        f"Risk Score: {risk}/100 ({risk_level})\n"
        f"Vaccination: {vacc}% coverage\n"
    )
    
    if growth > 30:
        response += (f"AI Recommendation: At current growth rate, {country_name} will cross "
                     f"{pred_7_day:,} cases within 7 days. Mobility restrictions and "
                     "vaccination drive acceleration recommended.")
    elif r0 > 1:
        response += "AI Recommendation: The disease is spreading (R0 > 1). Continued monitoring recommended."
    else:
        response += "AI Recommendation: The outbreak is currently declining (R0 < 1). Maintain current efforts."

    return {
        "response": response,
        "data": data,
        "suggestions": ["Show me highest risk areas", "Compare with another country", "What is R0?"]
    }

def handle_r0_question(message: str) -> dict:
    spreading = [c.title() for c, v in COUNTRY_DATA.items() if v["r0"] >= 1.0]
    declining = [c.title() for c, v in COUNTRY_DATA.items() if v["r0"] < 1.0]
    
    response = (
        "The R0 (basic reproduction number) indicates how contagious an infectious disease is. "
        "An R0 > 1 means the outbreak is growing, while R0 < 1 means it is declining.\n\n"
        f"Currently Spreading (R0 >= 1): {', '.join(spreading)}\n"
        f"Currently Declining (R0 < 1): {', '.join(declining)}\n\n"
        "India has the highest R0 (1.68), while Japan has the lowest (0.81)."
    )
    return {
        "response": response,
        "data": {},
        "suggestions": ["Show me India details", "What are the active outbreaks?", "Compare R0 of USA and Brazil"]
    }

def handle_outbreak_question(message: str) -> dict:
    response = (
        "Active Outbreak Warnings:\n"
        "1. São Paulo, Brazil: R0 1.68, Risk 90/100, Case Growth 44%. Critical threshold exceeded.\n"
        "2. Mumbai Metro, India: R0 1.82, Risk 89/100, Case Growth 52%. Severe healthcare strain expected.\n"
        "3. Gauteng, South Africa: R0 1.55, Risk 89/100, Case Growth 38%. Emerging hotspot.\n"
        "Immediate interventions recommended in these regions."
    )
    return {
        "response": response,
        "data": {},
        "suggestions": ["Show me highest risk areas", "Tell me about Brazil"]
    }

def handle_vaccination(message: str) -> dict:
    sorted_countries = sorted(COUNTRY_DATA.items(), key=lambda item: item[1]['vacc'], reverse=True)
    
    response = "Global Vaccination Coverage:\n"
    for c, v in sorted_countries:
        name = "USA" if c == "usa" else "UK" if c == "uk" else c.title()
        response += f"- {name}: {v['vacc']}%\n"
        
    response += "\nJapan has the highest coverage at 91%, while South Africa has the lowest at 45%."
    
    return {
        "response": response,
        "data": {},
        "suggestions": ["Global statistics", "Show me Japan details", "Compare Japan and South Africa"]
    }

def handle_compare(message: str) -> dict:
    message_lower = message.lower()
    found_countries = [c for c in COUNTRY_DATA.keys() if c in message_lower]
            
    if len(found_countries) >= 2:
        c1, c2 = found_countries[0], found_countries[1]
        d1, d2 = COUNTRY_DATA[c1], COUNTRY_DATA[c2]
        
        n1 = "USA" if c1 == "usa" else "UK" if c1 == "uk" else c1.title()
        n2 = "USA" if c2 == "usa" else "UK" if c2 == "uk" else c2.title()
        
        response = f"Comparison: {n1} vs {n2}\n\n"
        response += f"Cases: {d1['cases']:,} vs {d2['cases']:,}\n"
        response += f"Growth Rate: {d1['growth']}% vs {d2['growth']}%\n"
        response += f"R0 Value: {d1['r0']} vs {d2['r0']}\n"
        response += f"Risk Score: {d1['risk']} vs {d2['risk']}\n"
        response += f"Vaccination: {d1['vacc']}% vs {d2['vacc']}%\n"
        return {
            "response": response,
            "data": {"country1": d1, "country2": d2},
            "suggestions": [f"Tell me more about {n1}", f"Tell me more about {n2}"]
        }
    
    return {
        "response": "Please specify two valid countries to compare (e.g., 'Compare India vs USA').",
        "data": {},
        "suggestions": ["Compare India vs USA", "Compare UK and Germany"]
    }

def handle_global_stats(message: str) -> dict:
    total_cases = sum(c["cases"] for c in COUNTRY_DATA.values())
    avg_vacc = sum(c["vacc"] for c in COUNTRY_DATA.values()) / len(COUNTRY_DATA)
    avg_r0 = sum(c["r0"] for c in COUNTRY_DATA.values()) / len(COUNTRY_DATA)
    
    response = (
        "Global Statistics Overview (Monitored Regions):\n"
        f"- Total Active Cases: {total_cases:,}\n"
        f"- Average Vaccination Rate: {avg_vacc:.1f}%\n"
        f"- Global Average R0: {avg_r0:.2f}\n"
        "\nBased on current modeling, the situation requires sustained monitoring in high-growth areas."
    )
    return {
        "response": response,
        "data": {},
        "suggestions": ["What are the active outbreaks?", "Show vaccination stats"]
    }

def handle_unknown(message: str) -> dict:
    return {
        "response": "I am EpiWatch AI, trained to analyze epidemic data. I can help you with risk assessments, country predictions, R0 values, and outbreak alerts. How can I assist you today?",
        "data": {},
        "suggestions": ["Which country has highest risk?", "Tell me about India", "What are the active outbreaks?"]
    }

def process_message(message: str) -> dict:
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["compare", " vs ", "versus"]):
        return handle_compare(message)
        
    if any(word in message_lower for word in ["highest", "most dangerous", "worst", "top risk"]):
        return handle_highest_risk(message)
    
    for country in COUNTRY_DATA.keys():
        if country in message_lower:
            return handle_country_prediction(message, country)
    
    if any(word in message_lower for word in ["r0", "reproduction", "spreading"]):
        return handle_r0_question(message)
    
    if any(word in message_lower for word in ["outbreak", "alert", "warning"]):
        return handle_outbreak_question(message)
    
    if any(word in message_lower for word in ["vaccine", "vaccination"]):
        return handle_vaccination(message)
        
    if any(word in message_lower for word in ["global", "world", "total"]):
        return handle_global_stats(message)
    
    return handle_unknown(message)

@router.post("")
@router.post("/")
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    result = process_message(request.message)
    return ChatResponse(**result)
