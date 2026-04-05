export const globalCases = Array.from({ length: 90 }).map((_, i) => ({
  date: new Date(Date.now() - (90 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  cases: Math.floor(500000 + (300000 / 90) * i + (Math.random() * 50000 - 25000)),
  deaths: Math.floor(5000 + (3000 / 90) * i + (Math.random() * 500 - 250)),
}));

export const countries = {
  india: { name: "India", cases: 45000000, deaths: 530000, vaccRate: 74, riskScore: 8.2, r0: 1.34, growthRate: 15.2, color: "#ef4444" },
  usa: { name: "USA", cases: 105000000, deaths: 1150000, vaccRate: 81, riskScore: 6.5, r0: 1.12, growthRate: 5.4, color: "#f59e0b" },
  brazil: { name: "Brazil", cases: 38000000, deaths: 700000, vaccRate: 80, riskScore: 5.8, r0: 1.05, growthRate: 2.1, color: "#10b981" },
  uk: { name: "UK", cases: 24000000, deaths: 230000, vaccRate: 86, riskScore: 4.1, r0: 0.92, growthRate: -1.5, color: "#3b82f6" },
  germany: { name: "Germany", cases: 38000000, deaths: 175000, vaccRate: 78, riskScore: 4.5, r0: 0.95, growthRate: -0.8, color: "#3b82f6" },
  france: { name: "France", cases: 40000000, deaths: 167000, vaccRate: 81, riskScore: 4.2, r0: 0.91, growthRate: -2.1, color: "#3b82f6" },
  japan: { name: "Japan", cases: 33000000, deaths: 75000, vaccRate: 83, riskScore: 3.5, r0: 0.85, growthRate: -5.4, color: "#10b981" },
  south_africa: { name: "South Africa", cases: 4000000, deaths: 102000, vaccRate: 35, riskScore: 7.1, r0: 1.21, growthRate: 8.5, color: "#f59e0b" },
};

export const hotspots = [
  { rank: 1, region: "Maharashtra", country: "India", riskLevel: "Critical", riskScore: 9.4, growthRate: 28.5, r0: 1.55, trend: [100, 120, 150, 180, 220, 280, 350] },
  { rank: 2, region: "Sao Paulo", country: "Brazil", riskLevel: "High", riskScore: 8.1, growthRate: 15.2, r0: 1.32, trend: [200, 210, 225, 250, 280, 310, 330] },
  { rank: 3, region: "Florida", country: "USA", riskLevel: "High", riskScore: 7.8, growthRate: 12.4, r0: 1.25, trend: [300, 310, 315, 330, 350, 370, 400] },
  { rank: 4, region: "Gauteng", country: "South Africa", riskLevel: "High", riskScore: 7.5, growthRate: 18.1, r0: 1.35, trend: [50, 60, 75, 95, 120, 150, 180] },
  { rank: 5, region: "Tokyo", country: "Japan", riskLevel: "Medium", riskScore: 5.2, growthRate: -2.5, r0: 0.95, trend: [400, 390, 385, 370, 350, 340, 320] },
  { rank: 6, region: "London", country: "UK", riskLevel: "Low", riskScore: 3.8, growthRate: -8.1, r0: 0.85, trend: [150, 140, 125, 110, 95, 80, 70] },
  { rank: 7, region: "Bavaria", country: "Germany", riskLevel: "Low", riskScore: 3.5, growthRate: -5.4, r0: 0.88, trend: [200, 195, 185, 170, 160, 145, 135] },
  { rank: 8, region: "Ile-de-France", country: "France", riskLevel: "Low", riskScore: 3.2, growthRate: -10.5, r0: 0.82, trend: [180, 160, 145, 130, 115, 100, 85] },
  { rank: 9, region: "New York", country: "USA", riskLevel: "Medium", riskScore: 6.1, growthRate: 4.2, r0: 1.08, trend: [250, 255, 260, 270, 275, 285, 290] },
  { rank: 10, region: "Kerala", country: "India", riskLevel: "High", riskScore: 8.5, growthRate: 22.4, r0: 1.45, trend: [80, 95, 115, 140, 175, 215, 260] }
];

export const featureImportance = [
  { label: "Population Density", pct: 35, color: "#ef4444" },
  { label: "Mobility Index", pct: 25, color: "#f59e0b" },
  { label: "Vaccination Rate", pct: 20, color: "#10b981" },
  { label: "Testing Capacity", pct: 15, color: "#3b82f6" },
  { label: "Healthcare Infra", pct: 5, color: "#8b5cf6" },
];

export const modelAccuracy = [
  { month: "Sep", "LSTM": 85, "Random Forest": 78, "Transformer": 88 },
  { month: "Oct", "LSTM": 86, "Random Forest": 79, "Transformer": 90 },
  { month: "Nov", "LSTM": 88, "Random Forest": 80, "Transformer": 92 },
  { month: "Dec", "LSTM": 87, "Random Forest": 81, "Transformer": 93 },
  { month: "Jan", "LSTM": 89, "Random Forest": 80, "Transformer": 94 },
  { month: "Feb", "LSTM": 90, "Random Forest": 82, "Transformer": 95 },
  { month: "Mar", "LSTM": 91, "Random Forest": 83, "Transformer": 96 },
];