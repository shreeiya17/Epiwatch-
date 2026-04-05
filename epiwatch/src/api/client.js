import axios from 'axios';
import { globalCases, countries, hotspots, featureImportance, modelAccuracy } from '../data/mockData';

const BASE_URL = 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

const api = {
  globalStats: async () => {
    try {
      const response = await client.get('/api/stats/');
      return response.data;
    } catch (error) {
      console.warn("API globalStats failed, falling back to mockData", error);
      // Fallback
      return {
        status: "success",
        data: {
          total_cases: 704500000,
          active_cases: 45000,
          recovered: 1400000,
          deaths: 6970000,
          fatality_rate: 0.036
        }
      };
    }
  },

  predictCases: async (days = 30) => {
    try {
      const response = await client.get(`/api/predict/cases?days=${days}`);
      // Return exact forecast format
      return response.data;
    } catch (error) {
      console.warn("API predictCases failed, falling back to mockData", error);
      // Map globalCases to prediction format mimicking backend
      const forecast = globalCases.slice(-days).map(item => ({
        date: item.date,
        predicted_cases: item.cases,
        lower: item.cases * 0.9,
        upper: item.cases * 1.1
      }));
      return {
        forecast,
        model_used: "Mock",
        status: "success"
      };
    }
  },

  hospitalLoad: async (country) => {
    try {
      const response = await client.get(`/api/predict/hospital-load?country=${country}`);
      return response.data;
    } catch (error) {
      console.warn("API hospitalLoad failed, falling back to mockData", error);
      return { insight: "No data available." };
    }
  },

  hotspots: async () => {
    try {
      const response = await client.get('/api/hotspots/');
      return response.data;
    } catch (error) {
      console.warn("API hotspots failed, falling back to mockData", error);
      return {
        status: "success",
        hotspots: hotspots // from mockData.js
      };
    }
  },

  riskMap: async () => {
    try {
      const response = await client.get('/api/risk_map/');
      return response.data;
    } catch (error) {
      console.warn("API riskMap failed, falling back to mockData", error);
      return {
        status: "success",
        data: [
          {"lat": 40.7128, "lng": -74.0060, "intensity": 0.85, "label": "New York Area"},
          {"lat": 34.0522, "lng": -118.2437, "intensity": 0.52, "label": "Los Angeles Area"}
        ]
      };
    }
  },

  mobility: async () => {
    try {
      const response = await client.get('/api/mobility/');
      return response.data;
    } catch (error) {
      console.warn("API mobility failed, falling back to mockData", error);
      return {
        status: "success",
        trends: [
          {"date": "2026-03-15", "retail": -10, "transit": -15, "workplace": -20},
          {"date": "2026-03-16", "retail": -8, "transit": -12, "workplace": -10}
        ]
      };
    }
  },

  chat: async (message) => {
    try {
      const response = await client.post('/api/chat', { message });
      return response.data;
    } catch (error) {
      console.warn("API chat failed, falling back to mockData", error);
      
      const msgLower = message.toLowerCase();
      let responseText = "I am EpiWatch AI. I can help you with risk assessments, country predictions, R0 values, and outbreak alerts. (Running in offline demo mode)";
      let suggestions = ["Which country has highest risk?", "Tell me about India", "What are the active outbreaks?"];
      
      if (msgLower.includes("highest") || msgLower.includes("worst") || msgLower.includes("top risk")) {
        responseText = "Based on our model analysis, São Paulo, Brazil has the highest risk score of 90/100. Mumbai Metro, India follows closely with a risk score of 89/100. Immediate public health intervention is recommended.";
        suggestions = ["Show me Brazil details", "What about India?", "How many active outbreaks?"];
      } else if (msgLower.includes("india")) {
        responseText = "India Analysis:\nCurrent active cases: 2,100,000\n7-day prediction: 47% growth trajectory\nR0 = 1.68 — Each infected person spreads to 1.68 others.\nRisk Score: 81/100 (HIGH)\nVaccination: 72% coverage\n\nAI Recommendation: The disease is spreading. Continued monitoring recommended.";
        suggestions = ["Compare with another country", "What is R0?"];
      } else if (msgLower.includes("usa")) {
        responseText = "USA Analysis:\nCurrent active cases: 1,200,000\n7-day prediction: 18% growth trajectory\nR0 = 1.34 — Each infected person spreads to 1.34 others.\nRisk Score: 62/100 (MEDIUM)\nVaccination: 85% coverage";
        suggestions = ["Compare with another country", "What is R0?"];
      } else if (msgLower.includes("brazil")) {
        responseText = "Brazil Analysis:\nCurrent active cases: 890,000\n7-day prediction: 31% growth trajectory\nR0 = 1.51 — Each infected person spreads to 1.51 others.\nRisk Score: 74/100 (HIGH)\nVaccination: 68% coverage";
        suggestions = ["Compare with another country", "What is R0?"];
      } else if (msgLower.includes("r0") || msgLower.includes("reproduction")) {
        responseText = "The R0 (basic reproduction number) indicates how contagious an infectious disease is. An R0 > 1 means the outbreak is growing, while R0 < 1 means it is declining.\n\nCurrently Spreading (R0 >= 1): India, USA, Brazil, South Africa, Germany, France\nCurrently Declining (R0 < 1): UK, Japan\n\nIndia has the highest R0 (1.68), while Japan has the lowest (0.81).";
        suggestions = ["Tell me about India", "Show vaccination stats"];
      } else if (msgLower.includes("outbreak") || msgLower.includes("alert")) {
        responseText = "Active Outbreak Warnings:\n1. São Paulo, Brazil: R0 1.68, Risk 90/100, Case Growth 44%.\n2. Mumbai Metro, India: R0 1.82, Risk 89/100, Case Growth 52%.\n3. Gauteng, South Africa: R0 1.55, Risk 89/100, Case Growth 38%.\nImmediate interventions recommended in these regions.";
        suggestions = ["Show me highest risk areas", "Tell me about Brazil"];
      } else if (msgLower.includes("vaccine") || msgLower.includes("vaccination")) {
        responseText = "Global Vaccination Coverage:\n- Japan: 91%\n- UK: 88%\n- Germany: 86%\n- USA: 85%\n- France: 82%\n- India: 72%\n- Brazil: 68%\n- South Africa: 45%\n\nJapan has the highest coverage, while South Africa has the lowest.";
        suggestions = ["Show me Japan details", "Compare Japan and South Africa"];
      }

      return {
        response: responseText,
        data: {},
        suggestions: suggestions
      };
    }
  }
};

export default api;
