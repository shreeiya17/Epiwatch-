import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { GlobalLoadingBar, SkeletonCard, SkeletonChart } from '../components/Skeleton';
import ExportButton from '../components/ExportButton';
import { ChevronDown, Activity, AlertCircle, PlaySquare, Hexagon, Syringe } from 'lucide-react';
import WhatIfScenarios from '../components/WhatIfScenarios';
import {
  ComposedChart,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
  Legend
} from 'recharts';

const VACC_BASE = {
  india:        { cases: 2100000, current_vacc: 72, r0: 1.68 },
  usa:          { cases: 1200000, current_vacc: 85, r0: 1.34 },
  brazil:       { cases: 890000,  current_vacc: 68, r0: 1.51 },
  uk:           { cases: 190000,  current_vacc: 88, r0: 0.94 },
  germany:      { cases: 210000,  current_vacc: 86, r0: 1.08 },
  france:       { cases: 240000,  current_vacc: 82, r0: 1.19 },
  japan:        { cases: 55000,   current_vacc: 91, r0: 0.81 },
  south_africa: { cases: 340000,  current_vacc: 45, r0: 1.44 }
};

const MORTALITY_DATA = {
  india: {
    monthly: [
      { month:"Oct", deaths:18200, recovered:1650000 },
      { month:"Nov", deaths:16800, recovered:1720000 },
      { month:"Dec", deaths:15400, recovered:1780000 },
      { month:"Jan", deaths:19600, recovered:1820000 },
      { month:"Feb", deaths:22100, recovered:1860000 },
      { month:"Mar", deaths:25200, recovered:1850000 },
    ],
    total_deaths: 117300,
    total_recovered: 10680000,
    fatality_rate: 1.2,
    recovery_rate: 88.1
  },
  usa: {
    monthly: [
      { month:"Oct", deaths:12400, recovered:980000 },
      { month:"Nov", deaths:11200, recovered:1020000 },
      { month:"Dec", deaths:10800, recovered:1060000 },
      { month:"Jan", deaths:13600, recovered:1080000 },
      { month:"Feb", deaths:14100, recovered:1070000 },
      { month:"Mar", deaths:14400, recovered:1080000 },
    ],
    total_deaths: 76500,
    total_recovered: 6290000,
    fatality_rate: 1.2,
    recovery_rate: 90.0
  },
  brazil: {
    monthly: [
      { month:"Oct", deaths:8200, recovered:720000 },
      { month:"Nov", deaths:8900, recovered:740000 },
      { month:"Dec", deaths:9400, recovered:760000 },
      { month:"Jan", deaths:10100, recovered:770000 },
      { month:"Feb", deaths:10400, recovered:775000 },
      { month:"Mar", deaths:10680, recovered:783200 },
    ],
    total_deaths: 57680,
    total_recovered: 4548200,
    fatality_rate: 1.2,
    recovery_rate: 88.0
  },
  uk: {
    monthly: [
      { month:"Oct", deaths:1800, recovered:158000 },
      { month:"Nov", deaths:1900, recovered:162000 },
      { month:"Dec", deaths:2000, recovered:166000 },
      { month:"Jan", deaths:2100, recovered:170000 },
      { month:"Feb", deaths:2200, recovered:172000 },
      { month:"Mar", deaths:2280, recovered:174800 },
    ],
    total_deaths: 12280,
    total_recovered: 1002800,
    fatality_rate: 1.2,
    recovery_rate: 92.0
  },
  germany: {
    monthly: [
      { month:"Oct", deaths:1900, recovered:174000 },
      { month:"Nov", deaths:2000, recovered:178000 },
      { month:"Dec", deaths:2100, recovered:183000 },
      { month:"Jan", deaths:2200, recovered:187000 },
      { month:"Feb", deaths:2300, recovered:190000 },
      { month:"Mar", deaths:2520, recovered:193200 },
    ],
    total_deaths: 13020,
    total_recovered: 1105200,
    fatality_rate: 1.2,
    recovery_rate: 91.0
  },
  france: {
    monthly: [
      { month:"Oct", deaths:2100, recovered:196000 },
      { month:"Nov", deaths:2300, recovered:202000 },
      { month:"Dec", deaths:2500, recovered:208000 },
      { month:"Jan", deaths:2600, recovered:213000 },
      { month:"Feb", deaths:2700, recovered:217000 },
      { month:"Mar", deaths:2880, recovered:220800 },
    ],
    total_deaths: 15080,
    total_recovered: 1256800,
    fatality_rate: 1.2,
    recovery_rate: 90.0
  },
  japan: {
    monthly: [
      { month:"Oct", deaths:420, recovered:46000 },
      { month:"Nov", deaths:480, recovered:47500 },
      { month:"Dec", deaths:520, recovered:48800 },
      { month:"Jan", deaths:560, recovered:49500 },
      { month:"Feb", deaths:600, recovered:50500 },
      { month:"Mar", deaths:660, recovered:51700 },
    ],
    total_deaths: 3240,
    total_recovered: 294000,
    fatality_rate: 1.2,
    recovery_rate: 94.0
  },
  south_africa: {
    monthly: [
      { month:"Oct", deaths:2800, recovered:258000 },
      { month:"Nov", deaths:3100, recovered:268000 },
      { month:"Dec", deaths:3400, recovered:276000 },
      { month:"Jan", deaths:3700, recovered:284000 },
      { month:"Feb", deaths:3900, recovered:291000 },
      { month:"Mar", deaths:4080, recovered:299200 },
    ],
    total_deaths: 20980,
    total_recovered: 1676200,
    fatality_rate: 1.2,
    recovery_rate: 85.0
  }
};

import HeatmapCalendar from '../components/HeatmapCalendar';
import clsx from 'clsx';
import api from '../api/client';

const COUNTRY_STATIC = {
  india:        { name: "India", cases: 2100000, vacc: "72%", risk: "81", r0: 1.68, growth: "47%", color: "#ef4444" },
  usa:          { name: "USA", cases: 1200000, vacc: "85%", risk: "62", r0: 1.34, growth: "18%", color: "#f59e0b" },
  brazil:       { name: "Brazil", cases: 890000,  vacc: "68%", risk: "74", r0: 1.51, growth: "31%", color: "#ef4444" },
  uk:           { name: "UK", cases: 190000,  vacc: "88%", risk: "38", r0: 0.94, growth: "8%",  color: "#10b981" },
  germany:      { name: "Germany", cases: 210000,  vacc: "86%", risk: "42", r0: 1.08, growth: "11%", color: "#f59e0b" },
  france:       { name: "France", cases: 240000,  vacc: "82%", risk: "49", r0: 1.19, growth: "13%", color: "#f59e0b" },
  japan:        { name: "Japan", cases: 55000,   vacc: "91%", risk: "21", r0: 0.81, growth: "3%",  color: "#10b981" },
  south_africa: { name: "South Africa", cases: 340000,  vacc: "45%", risk: "71", r0: 1.44, growth: "28%", color: "#ef4444" }
};

const customTooltipStyle = {
  backgroundColor: '#1a2235',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  color: '#e8edf5',
  padding: '10px',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '12px',
};

// Generates fake 30-day historical data tailored per country for charts
const generateCountryHistory = (baseCases, growthRate, r0) => {
  return Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    const isPrediction = i >= 23; 
    let multiplier = 1 + (growthRate / 100) * (i / 30);
    if (isPrediction) multiplier *= (r0 > 1 ? 1.05 : 0.95);
    
    return {
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      actual: isPrediction ? null : Math.floor((baseCases / 30) * multiplier),
      predicted: isPrediction ? Math.floor((baseCases / 30) * multiplier) : null,
      r0Trend: r0 + (Math.sin(i / 2) * 0.1) - (isPrediction ? (growthRate > 0 ? -0.05 : 0.05) : 0),
      transit: -20 + (Math.sin(i / 3) * 10) + (r0 * 2),
      workplace: -15 + (Math.cos(i / 4) * 8) + (r0 * 3),
      retail: -10 + (Math.sin(i / 2) * 12) + (r0 * 4), 
    };
  });
};

const generateVaxData = (currentRate) => {
  return Array.from({ length: 7 }).map((_, i) => {
    return {
      month: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i],
      rate: Math.max(0, currentRate - (6 - i) * 3 + (Math.random() * 2)),
    };
  });
};

const CountUp = ({ to, isDecimals, colorClass }) => {
  const [val, setVal] = useState(0);
  
  useEffect(() => {
    setVal(0);
    const controls = animate(0, to, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        setVal(value);
      }
    });
    return () => controls.stop();
  }, [to]);

  return (
    <span className={colorClass}>
      {isDecimals ? val.toFixed(2) : Math.floor(val).toLocaleString()}
    </span>
  );
};

export default function CountryAnalysis() {
  const [selectedCountry, setSelectedCountry] = useState('india');
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleDemoSelect = (event) => {
      // Simulate click select
      setSelectedCountry('india');
      setTimeout(() => setSelectedCountry('usa'), 500);
      setTimeout(() => setSelectedCountry('india'), 1000); // end on india for dramatic effect
    };
    window.addEventListener('demo-select-country', handleDemoSelect);
    return () => window.removeEventListener('demo-select-country', handleDemoSelect);
  }, []);
  const [mobilityValue, setMobilityValue] = useState(0);
  const [vaccIncrease, setVaccIncrease] = useState(0);

  useEffect(() => {
    const handleDemoVaccine = () => {
      let v = 0;
      const iv = setInterval(() => {
        setVaccIncrease((prev) => {
          if (prev >= 20) { clearInterval(iv); return 20; }
          return prev + 1;
        });
      }, 50);
    };
    
    const handleDemoMobility = () => {
      let m = 0;
      const im = setInterval(() => {
        setMobilityValue((prev) => {
          if (prev >= 40) { clearInterval(im); return 40; }
          return prev + 2;
        });
      }, 50);
    };
    
    window.addEventListener('demo-simulate-vaccination', handleDemoVaccine);
    window.addEventListener('demo-simulate-mobility', handleDemoMobility);
    return () => {
      window.removeEventListener('demo-simulate-vaccination', handleDemoVaccine);
      window.removeEventListener('demo-simulate-mobility', handleDemoMobility);
    }
  }, []);

  const [forecastData, setForecastData] = useState([]);
  const [simChartData, setSimChartData] = useState([]);
  const [hospitalLoadData, setHospitalLoadData] = useState(null);

  const mortalityData = useMemo(() => 
    MORTALITY_DATA[selectedCountry] || MORTALITY_DATA.india,
    [selectedCountry]
  );

  const mortalityTrendInfo = useMemo(() => {
    const data = mortalityData.monthly;
    const lastMonth = data[5].deaths;
    const prevMonth = data[4].deaths;
    const trend = lastMonth > prevMonth ? 'increasing' : 'declining';
    const change = Math.abs(((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1);
    return { trend, change };
  }, [mortalityData]);

  useEffect(() => {
    fetchCountryData(selectedCountry);
    setVaccIncrease(0);
  }, [selectedCountry]);

  // VACCINATION SIMULATOR LOGIC
  const vaccStats = useMemo(() => {
    const base = VACC_BASE[selectedCountry] || VACC_BASE['india'];
    const reduction = (vaccIncrease / 100) * 64; 
    const reducedCases = Math.round(base.cases * (1 - reduction / 100));
    const newR0 = Math.max(0.1, parseFloat((base.r0 - (vaccIncrease / 10) * 0.08).toFixed(2)));
    const casesPrevented = base.cases - reducedCases;
    const livesSaved = Math.round(casesPrevented * 0.02);
    
    return {
      base,
      reduction: reduction.toFixed(1),
      reducedCases,
      newR0,
      livesSaved,
      casesPrevented,
      newVacc: base.current_vacc + vaccIncrease
    };
  }, [vaccIncrease, selectedCountry]);

  const vaccChartData = useMemo(() => {
    const base = VACC_BASE[selectedCountry] || VACC_BASE['india'];
    const staticData = COUNTRY_STATIC[selectedCountry] || COUNTRY_STATIC['india'];
    const cGrowth = parseFloat(staticData.growth || 0) / 100;
    const reducedGrowth = cGrowth * (1 - vaccIncrease / 100 * 0.5);
    
    const data = [];
    let currentTraj = base.cases;
    let boostedTraj = vaccStats.reducedCases;
    
    for (let i = 1; i <= 7; i++) {
        currentTraj = Math.floor(currentTraj * (1 + cGrowth / 7));
        boostedTraj = Math.floor(boostedTraj * (1 + reducedGrowth / 7));
        data.push({
          day: i,
          current: currentTraj,
          boosted: boostedTraj
        });
    }
    return data;
  }, [vaccStats, selectedCountry, vaccIncrease]);

  useEffect(() => {
    updateSimulation(mobilityValue);
  }, [mobilityValue, forecastData, countryData]);

  const fetchCountryData = async (country) => {
    setLoading(true);
    setHospitalLoadData(null);
    try {
      const formattedCountryName = COUNTRY_STATIC[country]?.name || country;
      
      const [casesRes, loadRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/predict/cases?country=${formattedCountryName}`),
        api.hospitalLoad(formattedCountryName)
      ]);
      
      const data = await casesRes.json();
      setCountryData(data);
      if (data.forecast) setForecastData(data.forecast);
      
      if (loadRes) {
        setHospitalLoadData(loadRes);
      }
    } catch (err) {
      console.error('API failed, using static data:', err);
      setCountryData(COUNTRY_STATIC[country]);
      
      // Fallback static hospital data
      const baseOcc = country === 'india' ? 0.65 : country === 'usa' ? 0.72 : 0.6;
      const forecast = Array.from({length: 30}).map((_, i) => ({
        day: i,
        icu_occupancy_pct: Math.min(100, Math.round((baseOcc * 100) + i * 1.5)),
        hospital_occupancy_pct: Math.min(100, Math.round((baseOcc * 100) + i * 1.2)),
        icu_available: Math.floor(25000 * (1 - baseOcc))
      }));
      setHospitalLoadData({
        insight: `WARNING: ${COUNTRY_STATIC[country]?.name || country} ICU capacity will reach 80% in ${Math.max(0, Math.floor((80 - baseOcc*100) / 1.5))} days.`,
        total_icu_beds: 25000,
        forecast: forecast
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSimulation = (val) => {
    const currentCountry = countryData || COUNTRY_STATIC[selectedCountry] || COUNTRY_STATIC['india'];
    const cCases = parseInt(currentCountry.cases || 0);
    const cGrowth = parseFloat(currentCountry.growth || 0);
    const cR0 = parseFloat(currentCountry.r0 || 0);

    const fakeBase = generateCountryHistory(cCases, cGrowth, cR0);
    const cData = fakeBase.map((item, i) => {
      if (i >= 23 && forecastData[i - 23]) {
        return {
          ...item,
          predicted: forecastData[i - 23].predicted_cases || item.predicted
        };
      }
      return item;
    });

    const newData = cData.slice(23).map((d, i) => {
      const basePred = d.predicted || cData[22]?.actual || 0;
      const extraEffect = 1 + ((val / 100) * (i * 0.15));
      return {
        ...d,
        baseline: basePred,
        simulated: Math.floor(basePred * extraEffect)
      };
    });
    setSimChartData(newData);
  };

  const currentCountry = countryData || COUNTRY_STATIC[selectedCountry] || COUNTRY_STATIC['india'];

  const cCases = parseInt(currentCountry.cases || 0);
  const cGrowth = parseFloat(currentCountry.growth || 0);
  const cR0 = parseFloat(currentCountry.r0 || 0);
  const cRisk = parseFloat(currentCountry.risk || 0);
  const cVacc = parseInt(currentCountry.vacc || 0);
  const cColor = currentCountry.color || "#ef4444";
  const cName = currentCountry.name || (selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1));

  const fakeBase = generateCountryHistory(cCases, cGrowth, cR0);
  const chartData = fakeBase.map((item, i) => {
    if (i >= 23 && forecastData[i - 23]) {
      return {
        ...item,
        predicted: forecastData[i - 23].predicted_cases || item.predicted
      };
    }
    return item;
  });

  const vaxData = generateVaxData(cVacc);

  const fullComposedData = [...chartData];
  if (fullComposedData[22]) {
    fullComposedData[22] = { ...fullComposedData[22], predicted: fullComposedData[22].actual };
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}} className="w-full flex flex-col gap-6">
            <GlobalLoadingBar />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SkeletonChart /><SkeletonChart />
            </div>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}} className="w-full flex flex-col gap-6 pb-12">
          {/* 1. PAGE HEADER */}
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.4px] m-0 text-slate-900 dark:text-white">Country Analysis</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 m-0 mt-1">7-day forecasts, transmission rate, and mobility impact by region</p>
          </div>

          {/* 2. COUNTRY SELECTOR */}
          <div className="relative w-max">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="appearance-none bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-600/50 text-slate-900 dark:text-white px-[14px] py-[10px] pr-10 rounded-[10px] min-w-[280px] outline-none font-medium focus:border-slate-200/60 transition-colors duration-200 cursor-pointer"
            >
              {Object.entries(COUNTRY_STATIC).map(([key, data]) => (
                <option key={key} value={key}>{data.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </div>
          </div>

          {/* 3. DYNAMIC STAT CARDS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCountry}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {/* Card 1 */}
              <div className="bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors">
                <div className="text-[12px] text-[#7a8499] uppercase tracking-wider font-medium mb-2">Active Cases</div>
                <div className="text-[28px] font-semibold text-slate-900 dark:text-white mb-2 leading-none">
                  <CountUp to={cCases} isDecimals={false} colorClass="text-slate-900 dark:text-white" />
                </div>
                <div className={clsx("text-[11px] font-medium flex items-center gap-1", cGrowth > 0 ? "text-red-500" : "text-success")}>
                  {cGrowth > 0 ? '↑' : '↓'} {Math.abs(cGrowth)}% vs last period
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors">
                <div className="text-[12px] text-[#7a8499] uppercase tracking-wider font-medium mb-2">Risk Score</div>
                <div className={clsx(
                  "text-[28px] font-semibold mb-2 leading-none",
                  cRisk > 60 ? "text-red-500" : (cRisk > 30 ? "text-warning" : "text-success")
                )}>
                  <CountUp to={cRisk} isDecimals={false} colorClass="inherit" /> / 100
                </div>
                <div className="text-[11px] font-medium text-[#7a8499] flex items-center gap-1">
                  Composite vulnerability index
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors">
                <div className="text-[12px] text-[#7a8499] uppercase tracking-wider font-medium mb-2">Vaccination Rate</div>
                <div className="text-[28px] font-semibold text-success mb-2 leading-none">
                  <CountUp to={cVacc} isDecimals={false} colorClass="inherit" />%
                </div>
                <div className="text-[11px] font-medium text-[#7a8499] flex items-center gap-1">
                  Fully vaccinated population
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors">
                <div className="text-[12px] text-[#7a8499] uppercase tracking-wider font-medium mb-2">Reproduction R₀</div>
                <div className={clsx(
                  "text-[28px] font-semibold mb-2 leading-none",
                  cR0 > 1.0 ? "text-red-500" : "text-success"
                )}>
                  <CountUp to={cR0} isDecimals={true} colorClass="inherit" />
                </div>
                <div className={clsx("text-[11px] font-medium flex items-center gap-1", cR0 > 1.0 ? "text-red-500" : "text-success")}>
                  {cR0 > 1.0 ? "Virus is spreading" : "Virus is declining"}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 4. CHART ROW 1 */}
          <AnimatePresence mode="wait">
          <motion.div
            key={`chart1-${selectedCountry}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* LEFT CARD */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[15px] font-medium text-slate-900 dark:text-white m-0">Actual vs Predicted Cases</h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-slate-200/60 text-slate-900 dark:text-white px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5">
                  <Activity className="w-3 h-3" />
                  LSTM · 7-day ahead
                </div>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={fullComposedData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cColor} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={cColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(0, 0, 0,0.06)" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: '#7a8499', fontSize: 11, fontFamily: 'DM Sans' }} 
                      axisLine={false} 
                      tickLine={false}
                      tickCount={10}
                    />
                    <YAxis 
                      tick={{ fill: '#7a8499', fontSize: 11, fontFamily: 'DM Sans' }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(val) => `${(val/1000).toFixed(1)}K`}
                    />
                    <Tooltip 
                      contentStyle={customTooltipStyle} 
                      formatter={(val, name) => [`${(val/1000).toFixed(1)}K cases`, name === 'actual' ? 'Actual' : 'Predicted']}
                      labelFormatter={(lbl) => `Day ${lbl}`}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#7a8499', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="actual" fill="url(#colorArea)" stroke="none" />
                    <Line type="monotone" dataKey="actual" stroke={cColor} strokeWidth={2} dot={false} name="Past Actual" />
                    <Line type="monotone" dataKey="predicted" stroke="#a78bfa" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#a78bfa', strokeWidth: 0 }} activeDot={{ r: 5 }} name="AI Prediction" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="col-span-1 bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[15px] font-medium text-slate-900 dark:text-white m-0">Transmission Rate R₀</h2>
                <div className="bg-purple/10 border border-purple/20 text-purple px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5 flex-shrink-0">
                  <Hexagon className="w-3 h-3" />
                  Model 3 · Gradient Boosting
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center pt-2">
                <div className={clsx(
                  "text-[48px] font-semibold font-bold leading-none tracking-tight",
                  cR0 > 1.0 ? "text-red-500" : "text-success"
                )}>
                   <CountUp to={cR0} isDecimals={true} colorClass="inherit" />
                </div>
                <div className="text-[12px] text-[#7a8499] mt-3 text-center max-w-[80%]">
                  Reproduction number — R₀ &gt; 1 means spreading
                </div>
              </div>

              <div className="h-[100px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Line 
                      type="monotone" 
                      dataKey="r0Trend" 
                      stroke={cR0 > 1.0 ? "#ef4444" : "#10b981"} 
                      strokeWidth={2} 
                      dot={false} 
                    />
                    <ReferenceLine y={1.0} stroke="rgba(0, 0, 0,0.2)" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
          </AnimatePresence>

          {/* 5. CHART ROW 2 */}
          <AnimatePresence mode="wait">
          <motion.div
            key={`chart2-${selectedCountry}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* HOSPITAL LOAD CARD */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[15px] font-medium text-slate-900 dark:text-white m-0">ICU & Hospital Capacity Forecast</h2>
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5 shrink-0">
                  <AlertCircle className="w-3 h-3" />
                  Load Predictor
                </div>
              </div>
              
              <div className="flex-1 flex flex-col pt-1">
                 {hospitalLoadData ? (
                   <>
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4 flex gap-2.5 items-start">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[13px] font-medium text-red-600 m-0">{hospitalLoadData.insight}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 dark:bg-[#0a0e1a] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total ICU Beds</div>
                        <div className="text-lg font-semibold font-bold text-slate-800 dark:text-slate-100">{hospitalLoadData.total_icu_beds.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#0a0e1a] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Available Today</div>
                        <div className="text-lg font-semibold font-bold text-slate-800 dark:text-slate-100">{hospitalLoadData.forecast[0]?.icu_available.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="h-[120px] w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hospitalLoadData.forecast} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid stroke="rgba(0, 0, 0,0.04)" vertical={false} />
                          <XAxis dataKey="day" tick={{ fill: '#7a8499', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `+${v}d`} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#7a8499', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                          <Tooltip contentStyle={customTooltipStyle} formatter={(val) => `${val}% occupancy`} labelFormatter={(l) => `Day +${l}`} />
                          <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Critical (80%)', fill: '#ef4444', fontSize: 10 }} />
                          <Line type="monotone" dataKey="icu_occupancy_pct" stroke="#ef4444" strokeWidth={2} dot={false} name="ICU Demand" />
                          <Line type="monotone" dataKey="hospital_occupancy_pct" stroke="#f59e0b" strokeWidth={2} dot={false} name="Gen. Bed Demand" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                   </>
                 ) : (
                   <div className="flex-1 flex justify-center items-center text-slate-500 dark:text-slate-400 text-sm">
                     Loading hospital data...
                   </div>
                 )}
              </div>
            </div>

            {/* VACCINATION CARD */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[15px] font-medium text-slate-900 dark:text-white m-0">Vaccination Progress</h2>
                <div className="bg-success/10 border border-success/20 text-success px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5 shrink-0">
                  <Activity className="w-3 h-3" />
                  OWID Data
                </div>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vaxData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(0, 0, 0,0.06)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#7a8499', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#7a8499', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(0, 0, 0,0.05)' }} formatter={v => `${v.toFixed(1)}%`} />
                    <ReferenceLine y={70} stroke="rgba(16,185,129,0.5)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Herd immunity threshold', fill: '#10b981', fontSize: 10, offset: 5 }} />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {vaxData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.rate > 60 ? '#10b981' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
          </AnimatePresence>

          {/* 6. MORTALITY RATIO CARD */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`mortality-${selectedCountry}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="w-full bg-white dark:bg-[#0f172a] p-6 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-6"
            >
              {/* CARD HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white m-0 tracking-tight">Death vs Recovery ratio</h2>
                  <p className="text-[13px] text-[#7a8499] m-0 mt-1.5">Monthly comparison of outcomes</p>
                </div>
                <div className="flex items-center gap-3">
                  <ExportButton data={mortalityData.monthly} filename={`${selectedCountry}_mortality`} />
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-2 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                    6-month trend
                  </div>
                </div>
              </div>

              {/* TOP SUMMARY ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-[#0a0e1a] border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="text-[24px] font-bold text-rose-500 font-mono">
                    <CountUp to={mortalityData.fatality_rate} isDecimals={true} colorClass="inherit" />%
                  </div>
                  <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase mt-1">Fatality Rate</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">case fatality rate</div>
                </div>
                
                <div className="bg-slate-50 dark:bg-[#0a0e1a] border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="text-[24px] font-bold text-emerald-500 font-mono">
                    <CountUp to={mortalityData.recovery_rate} isDecimals={true} colorClass="inherit" />%
                  </div>
                  <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase mt-1">Recovery Rate</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">successfully recovered</div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0a0e1a] border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="text-[24px] font-bold text-amber-500 font-mono">
                     <CountUp to={COUNTRY_STATIC[selectedCountry]?.cases - mortalityData.total_recovered - mortalityData.total_deaths} isDecimals={false} colorClass="inherit" />
                  </div>
                  <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase mt-1">Active Cases</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">still in treatment</div>
                </div>
              </div>

              {/* MAIN STACKED BAR CHART & RATIO VISUALIZATION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                
                <div className="w-full flex justify-center flex-col shrink-0 min-w-0">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mortalityData.monthly} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(0,0,0,0.04)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#7a8499', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#7a8499', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                        <Tooltip 
                          contentStyle={customTooltipStyle}
                          formatter={(value, name) => [value.toLocaleString(), name]}
                          cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        />
                        <Legend iconType="square" wrapperStyle={{ fontSize: '11px', color: '#7a8499' }} />
                        <Bar dataKey="recovered" stackId="a" name="Recovered" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="deaths" stackId="a" name="Deaths" fill="#f43f5e" radius={[0, 0, 4, 4]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="w-full flex justify-center flex-col gap-5 shrink-0 min-w-0">
                  {/* RATIO BAR */}
                  <div className="w-full">
                    <div className="flex justify-between text-[13px] font-semibold mb-2">
                       <span className="text-slate-700 dark:text-slate-200">Recovery ratio</span>
                       <span className="text-emerald-500">{mortalityData.recovery_rate}%</span>
                    </div>
                    <div className="h-4 w-full bg-rose-500 rounded-lg overflow-hidden flex shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${mortalityData.recovery_rate}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-emerald-500 rounded-r-sm"
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
                       {mortalityData.total_recovered.toLocaleString()} recovered vs {mortalityData.total_deaths.toLocaleString()} deaths
                    </div>
                  </div>

                  {/* GLOBAL AVERAGE COMPARISON */}
                  <div className="bg-slate-50 dark:bg-[#0a0e1a] p-4 rounded-xl border border-slate-100 dark:border-slate-800 w-full">
                    <div className="flex flex-col gap-3">
                       <div>
                         <div className="flex justify-between text-[12px] font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                           <span>{COUNTRY_STATIC[selectedCountry]?.name} fatality rate: {mortalityData.fatality_rate}%</span>
                         </div>
                         <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={clsx("h-full rounded-full", mortalityData.fatality_rate < 2.1 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${(mortalityData.fatality_rate / 3) * 100}%` }} />
                         </div>
                       </div>
                       <div>
                         <div className="flex justify-between text-[12px] font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                           <span>Global average: 2.1%</span>
                         </div>
                         <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-slate-400" style={{ width: `${(2.1 / 3) * 100}%` }} />
                         </div>
                       </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center text-[11px] font-semibold">
                       {mortalityData.fatality_rate < 2.1 ? (
                         <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">{COUNTRY_STATIC[selectedCountry]?.name} fatality rate is BELOW global average ✓</span>
                       ) : (
                         <span className="text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full">{COUNTRY_STATIC[selectedCountry]?.name} fatality rate is ABOVE global average ✗</span>
                       )}
                    </div>
                  </div>
                </div>

              </div>

              {/* BOTTOM INSIGHTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className={clsx("bg-white dark:bg-[#0f172a] border p-4 rounded-xl shadow-sm border-l-4", mortalityTrendInfo.trend === 'declining' ? "border-l-emerald-500 border-slate-200 dark:border-slate-700/50" : "border-l-rose-500 border-slate-200 dark:border-slate-700/50")}>
                   <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                     <Activity className="w-3.5 h-3.5" /> Trend Analysis
                   </h4>
                   <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed m-0 font-medium">
                     Deaths are <span className={mortalityTrendInfo.trend === 'declining' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>{mortalityTrendInfo.trend}</span> by <span className="font-bold">{mortalityTrendInfo.change}%</span> compared to last month. 
                     Recovery rate of <span className="font-bold">{mortalityData.recovery_rate}%</span> indicates {mortalityData.recovery_rate > 90 ? 'excellent healthcare response.' : mortalityData.recovery_rate > 85 ? 'adequate medical capacity.' : 'healthcare system under pressure.'}
                   </p>
                </div>

                <div className="bg-blue-50/70 border border-blue-100 dark:border-blue-900/30 border-l-4 border-l-blue-500 p-4 rounded-xl shadow-sm relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-200/40 rounded-full blur-2xl"></div>
                   <h4 className="text-[11px] uppercase tracking-wider font-bold text-blue-800 dark:text-blue-300 mb-2 relative z-10 flex items-center gap-1.5">
                     <Hexagon className="w-3.5 h-3.5" /> AI Insight
                   </h4>
                   <p className="text-[13px] text-blue-900/90 leading-relaxed m-0 font-medium relative z-10">
                     <span className="font-bold">{COUNTRY_STATIC[selectedCountry]?.name}</span> shows <span className="font-bold">{mortalityData.recovery_rate}%</span> recovery rate with <span className="font-bold">{mortalityData.fatality_rate}%</span> case fatality. 
                     {mortalityData.recovery_rate > 90 ? ' Strong healthcare infrastructure evident.' : ' Healthcare capacity improvement needed.'} 
                     Monthly deaths <span className={mortalityTrendInfo.trend === 'declining' ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-rose-700 dark:text-rose-400 font-bold"}>{mortalityTrendInfo.trend}</span> trend suggests {mortalityTrendInfo.trend === 'declining' ? 'improving epidemic control.' : 'escalating outbreak pressure.'}
                   </p>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* WHAT-IF SCENARIOS */}
          <WhatIfScenarios country={selectedCountry} />

          {/* 7. MOBILITY SPREAD SIMULATOR CARD */}
          <AnimatePresence mode="wait">
          <motion.div 
            key={`sim-${selectedCountry}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-white dark:bg-[#0f172a] p-6 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-5 mt-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white m-0 tracking-tight">Mobility Spread Simulator</h2>
                <p className="text-[13px] text-[#7a8499] m-0 mt-1.5 max-w-2xl">
                  Drag the slider to simulate how increasing population mobility affects predicted cases over the next 7 days.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 text-red-500 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-2 shrink-0">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-slow"></span>
                Interactive · Model 1
              </div>
            </div>

            <div className="flex items-center gap-6 mt-2 bg-black/5 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="font-semibold text-slate-900 dark:text-white text-[15px] font-semibold shrink-0 w-16 text-right">
                +{mobilityValue}%
              </div>
              <input 
                type="range" 
                min="0" 
                max="80" 
                value={mobilityValue}
                onChange={(e) => setMobilityValue(parseInt(e.target.value))}
                className="flex-1 h-2 bg-white3 rounded-lg appearance-none cursor-pointer accent-accent"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(mobilityValue/80)*100}%, #e2e8f0 ${(mobilityValue/80)*100}%, #e2e8f0 100%)`
                }}
              />
              <style>{`
                input[type=range]::-webkit-slider-thumb {
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                }
              `}</style>
            </div>

            <div className="h-[140px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart key={`sim-chart-${mobilityValue}`} data={simChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(0, 0, 0,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#7a8499', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7a8499', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(val) => Math.floor(val).toLocaleString()} />
                  <Line type="monotone" dataKey="baseline" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2, fill: '#3b82f6', strokeWidth: 0 }} name="Baseline Prediction" isAnimationActive={false} />
                  <Line type="monotone" dataKey="simulated" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} name={`+${mobilityValue}% Mobility`} isAnimationActive={true} animationDuration={400} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <motion.div 
              key={mobilityValue}
              initial={{ opacity: 0.5, x: -5 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#0f172a] border-l-[3px] border-slate-200/60 rounded-r-lg p-4 mt-2 shadow-sm"
            >
              <div className="flex gap-3">
                <PlaySquare className="text-slate-900 dark:text-white w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-[13px] text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white font-semibold">Model insight:</strong> A {mobilityValue}% mobility increase is projected to add <span className="text-red-500 font-semibold">~{simChartData.length > 0 ? Math.floor((simChartData[simChartData.length-1].simulated - simChartData[simChartData.length-1].baseline) * 5.2).toLocaleString() : 0}</span> additional cases over 7 days, based on historical correlation data for {cName}.
                </p>
              </div>
            </motion.div>
          </motion.div>
          </AnimatePresence>

          {/* 7. VACCINATION IMPACT SIMULATOR CARD */}
          <motion.div 
            key={`vacc-${selectedCountry}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-white dark:bg-[#0f172a] p-6 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-6 mt-2"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white m-0 tracking-tight">Vaccination impact simulator</h2>
                <p className="text-[13px] text-[#7a8499] m-0 mt-1.5 max-w-2xl">
                  Simulate how increasing vaccination coverage affects projected cases and transmission rates.
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-2 shrink-0">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <Syringe className="w-3 h-3" /> Interactive · Model insight
              </div>
            </div>

            {/* Current Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-[#0a0e1a] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current Vaccination</div>
                <div className="text-lg font-semibold font-bold text-slate-800 dark:text-slate-100">{vaccStats.base.current_vacc}%</div>
              </div>
              <div className="bg-slate-50 dark:bg-[#0a0e1a] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current R₀</div>
                <div className={`text-lg font-semibold font-bold ${vaccStats.base.r0 > 1.0 ? 'text-red-500' : 'text-green-500'}`}>{vaccStats.base.r0}</div>
              </div>
              <div className="bg-slate-50 dark:bg-[#0a0e1a] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current Cases</div>
                <div className="text-lg font-semibold font-bold text-slate-800 dark:text-slate-100">{vaccStats.base.cases.toLocaleString()}</div>
              </div>
            </div>

            {/* Slider Section */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-medium text-slate-800 dark:text-slate-100">Increase vaccination coverage by</span>
                <span className="text-[16px] font-bold text-green-600">+{vaccIncrease}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="30" step="1" 
                value={vaccIncrease}
                onChange={(e) => setVaccIncrease(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(vaccIncrease/30)*100}%, #e2e8f0 ${(vaccIncrease/30)*100}%, #e2e8f0 100%)`
                }}
              />
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[12px] text-slate-500 dark:text-slate-400">New coverage: {vaccStats.newVacc}%</span>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex items-center">
                  <motion.div className="h-full bg-green-500 rounded-l-full relative" animate={{ width: `${vaccStats.newVacc}%` }} transition={{ type: "spring", stiffness: 100 }}></motion.div>
                </div>
              </div>
            </div>

            {/* Impact Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className="text-2xl font-bold text-green-500 mb-1">-{vaccStats.reduction}%</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Projected case reduction</div>
                <div className="text-[13px] text-slate-700 dark:text-slate-200 font-semibold">
                  Cases: {vaccStats.base.cases.toLocaleString()} &rarr; {vaccStats.reducedCases.toLocaleString()}
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden">
                <div className={`text-2xl font-bold mb-1 ${vaccStats.newR0 > 1 ? 'text-red-500' : 'text-green-500'}`}>
                  {vaccStats.newR0}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">New reproduction number</div>
                <div className="text-[13px] text-slate-700 dark:text-slate-200 flex items-center gap-1 font-semibold">
                  {vaccStats.base.r0} &rarr; {vaccStats.newR0}
                  {vaccIncrease > 0 && <span className="text-green-500 ml-1">&darr;</span>}
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {vaccStats.livesSaved > 0 ? '+' : ''}{vaccStats.livesSaved.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Estimated additional recoveries</div>
                <div className="text-[13px] text-slate-700 dark:text-slate-200 font-semibold">
                  From {vaccStats.casesPrevented.toLocaleString()} prevented cases
                </div>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="h-[160px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={vaccChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(0, 0, 0,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#7a8499', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `+${v}d`} />
                  <YAxis tick={{ fill: '#7a8499', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #10b981', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val, name) => [val.toLocaleString(), name]}
                    labelFormatter={(l) => `Day +${l}`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#7a8499', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="current" fill="rgba(239, 68, 68, 0.05)" stroke="none" />
                  <Area type="monotone" dataKey="boosted" fill="rgba(16, 185, 129, 0.2)" stroke="none" />
                  <Line type="monotone" dataKey="current" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Current trajectory" />
                  <Line type="monotone" dataKey="boosted" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} name="With vaccination boost" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* AI Insight Box */}
            <div className="bg-white dark:bg-[#0f172a] border-l-[3px] border-l-[#10b981] rounded-lg rounded-l-none p-[14px]">
              <p className="text-[#e2e8f0] text-[13px] italic m-0 tracking-wide leading-relaxed">
                {vaccIncrease === 0 && "Adjust the slider to see vaccination impact."}
                {vaccIncrease > 0 && vaccIncrease <= 10 && `A ${vaccIncrease}% vaccination increase would reduce cases by ${vaccStats.reduction}% and bring R0 from ${vaccStats.base.r0} to ${vaccStats.newR0}. Moderate impact expected.`}
                {vaccIncrease > 10 && vaccIncrease <= 20 && `Significant impact: ${vaccIncrease}% more vaccination coverage projects ${vaccStats.reduction}% fewer cases. R0 drops to ${vaccStats.newR0} — ${vaccStats.newR0 < 1 ? 'below critical threshold!' : 'approaching control threshold.'}`}
                {vaccIncrease > 20 && `Major intervention: ${vaccIncrease}% vaccination boost could prevent ${vaccStats.casesPrevented.toLocaleString()} cases and save an estimated ${vaccStats.livesSaved.toLocaleString()} lives. R0 = ${vaccStats.newR0} — ${vaccStats.newR0 < 1 ? 'epidemic would decline!' : 'still spreading but slowing.'}`}
              </p>
            </div>
            
          </motion.div>

          <HeatmapCalendar
            title={`${COUNTRY_STATIC[selectedCountry]?.name} daily case heatmap`}
            country={COUNTRY_STATIC[selectedCountry]?.name}
            data={forecastData.map(f => ({
              date: f.date,
              cases: f.predicted_cases
            }))}
          />

        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
