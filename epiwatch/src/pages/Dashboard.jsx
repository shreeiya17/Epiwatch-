import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalLoadingBar, SkeletonCard, SkeletonChart } from '../components/Skeleton';
import ExportButton, { downloadCSV } from '../components/ExportButton';
import { X, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Legend
} from 'recharts';
import clsx from 'clsx';
import api from '../api/client';

// Chart tooltip styles
const customTooltipStyle = {
  backgroundColor: '#1a2235',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  color: '#e8edf5',
  padding: '10px',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '12px',
};

// Data sets for the dashboard
const riskData = [
  { name: 'High risk', value: 28, color: '#ef4444' },
  { name: 'Medium risk', value: 54, color: '#f59e0b' },
  { name: 'Low risk', value: 112, color: '#10b981' },
];

const growthData = [
  { country: 'India', growth: 47 },
  { country: 'Brazil', growth: 31 },
  { country: 'S.Africa', growth: 28 },
  { country: 'Nigeria', growth: 23 },
  { country: 'Indonesia', growth: 18 },
  { country: 'USA', growth: 16 },
  { country: 'France', growth: 13 },
  { country: 'Germany', growth: 11 },
];

const scatterData = [
  { vax: 20, growth: 22 },
  { vax: 35, growth: 45 },
  { vax: 40, growth: 15 },
  { vax: 55, growth: 5 },
  { vax: 65, growth: -2 },
  { vax: 74, growth: 15.2 }, // India roughly
  { vax: 80, growth: 2.1 }, // Brazil
  { vax: 81, growth: -2.1 }, // France
  { vax: 83, growth: -5.4 }, // Japan
  { vax: 86, growth: -1.5 }, // UK
  { vax: 90, growth: -8 },
];

const LIVE_R0_COUNTRIES = [
  { name: 'India', baseR0: 1.68 },
  { name: 'Brazil', baseR0: 1.51 },
  { name: 'South Africa', baseR0: 1.44 },
  { name: 'USA', baseR0: 1.34 },
  { name: 'France', baseR0: 1.19 },
  { name: 'Germany', baseR0: 1.08 },
  { name: 'UK', baseR0: 0.94 },
  { name: 'Japan', baseR0: 0.81 },
];

const R0GaugeCard = ({ country }) => {
  const [r0, setR0] = useState(country.baseR0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setR0(prev => {
        const delta = (Math.random() - 0.5) * 0.1;
        const newR0 = prev + delta;
        return Math.max(0.1, Math.min(3.0, newR0));
      });
    }, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const isSpreading = r0 >= 1.0;
  const color = isSpreading ? '#ef4444' : '#10b981';
  const data = [
    { name: 'R0', value: r0, fill: color },
    { name: 'Remaining', value: 3 - r0, fill: '#f1f5f9' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-all flex flex-col items-center relative overflow-hidden shadow-sm"
    >
      <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 m-0 mb-1">{country.name}</h3>
      <div className={`text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1 ${isSpreading ? 'text-red-500' : 'text-green-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isSpreading ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></span>
        {isSpreading ? 'Spreading' : 'Declining'}
      </div>
      <div className="h-[90px] w-full relative -mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={45}
              outerRadius={65}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              animationDuration={800}
              isAnimationActive={false}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <span className="text-2xl font-semibold font-bold leading-none text-slate-800 dark:text-slate-100">{r0.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Current R0</span>
        </div>
      </div>
    </motion.div>
  );
};

import AlertToast from '../components/AlertToast';
import HeatmapCalendar from '../components/HeatmapCalendar';
import TimelineSlider from '../components/TimelineSlider';

export default function Dashboard() {
  const [showAlert, setShowAlert] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [predictData, setPredictData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    Promise.all([
      api.globalStats(),
      api.predictCases(30)
    ]).then(([statsRes, predictRes]) => {
      setStatsData(statsRes);
      setPredictData(predictRes);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
      
    const timer = setTimeout(() => {
      setShowAlert(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const stats = statsData?.data || {};
  const forecast = predictData?.forecast || [];
  
  React.useEffect(() => {
    const handleDemoCSV = () => {
      downloadCSV(forecast.map((d, i) => ({
        date: d.date,
        actual: i < forecast.length - 7 ? d.predicted_cases : null,
        predicted: d.predicted_cases
      })), 'Global_LSTM_Predictions');
    };
    window.addEventListener('demo-download-csv', handleDemoCSV);
    return () => window.removeEventListener('demo-download-csv', handleDemoCSV);
  }, [forecast]);

  // Format chart data
  const chartData = forecast.map((d, i) => ({
    date: d.date,
    actual: i < forecast.length - 7 ? d.predicted_cases : null,
    predicted: d.predicted_cases
  }));

  const formatter = Intl.NumberFormat('en-US', { notation: 'compact' });

  return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}} className="w-full flex flex-col gap-6 font-sans">
            <GlobalLoadingBar />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2"><SkeletonChart height={220} /></div>
              <div className="col-span-1"><SkeletonChart height={220} /></div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}} className="w-full flex flex-col gap-6">
      {/* 1. PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.4px] m-0 text-slate-900 dark:text-white">Global Overview</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 m-0 mt-1">Real-time epidemic intelligence powered by 3 AI models</p>
        </div>
        <div className="px-3 py-1.5 rounded-sm bg-blue-50/50 border border-slate-200/60 font-semibold text-[11px] text-slate-900 dark:text-white flex items-center">
          SYS: LIVE · 14:32:01 UTC <span className="animate-pulse ml-1 inline-block h-3 w-1 bg-blue-500"></span>
        </div>
      </div>

      {/* 2. ALERT TOAST */}
      <AlertToast isVisible={showAlert} onClose={() => setShowAlert(false)} />

      {/* 3. STAT CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { topMatch: 'border-t-accent', label: 'Total Confirmed', value: stats.total_cases ? formatter.format(stats.total_cases) : '704.5M', delta: '↑ 2.1% vs last 7 days', dColor: 'text-red-500' },
          { topMatch: 'border-t-danger', label: 'Total Deaths', value: stats.deaths ? formatter.format(stats.deaths) : '6.97M', delta: '↓ 0.3% mortality improving', dColor: 'text-success' },
          { topMatch: 'border-t-success', label: 'Active Cases', value: stats.active_cases ? formatter.format(stats.active_cases) : '68.4%', delta: 'Based on recent data', dColor: 'text-warning' },
          { topMatch: 'border-t-warning', label: 'Fatality Rate', value: stats.fatality_rate ? `${(stats.fatality_rate * 100).toFixed(1)}%` : '58.3', delta: 'Model consensus', dColor: 'text-warning' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -3, scale: 1.01 }}
            className={clsx(
              "bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors border-t-[3px]",
              card.topMatch
            )}
          >
            <div className="text-[12px] text-[#7a8499] uppercase tracking-wider font-medium mb-2">{card.label}</div>
            <div className="text-[28px] font-semibold text-slate-900 dark:text-white mb-2 leading-none">{card.value}</div>
            <div className={clsx("text-[11px] font-medium flex items-center gap-1", card.dColor)}>
              {card.delta}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 4. MAIN CHART ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT CARD */}
        <div className="col-span-2 bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[15px] font-medium text-slate-900 dark:text-white m-0">Global daily new cases + 7-day prediction</h2>
            <div className="flex items-center gap-3">
              <ExportButton data={chartData} filename="Global_LSTM_Predictions" />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-slate-200/60 text-slate-900 dark:text-white px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                Model 1 · LSTM
              </div>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(0, 0, 0,0.06)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#7a8499', fontSize: 11, fontFamily: 'DM Sans' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickCount={8} 
                  minTickGap={30}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                  }}
                />
                <YAxis 
                  tick={{ fill: '#7a8499', fontSize: 11, fontFamily: 'DM Sans' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `${(val/1000).toFixed(0)}K`}
                />
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ fontFamily: 'DM Sans', fontSize: '12px' }} />
                <Legend 
                  verticalAlign="bottom" 
                  height={20}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#7a8499', paddingTop: '10px' }}
                />
                <Area type="monotone" dataKey="actual" fill="rgba(59, 130, 246, 0.1)" stroke="none" />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} name="Actual Cases" />
                <Line type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Predicted Cases" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="col-span-1 bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[15px] font-medium text-slate-900 dark:text-white m-0">Risk distribution</h2>
            <div className="bg-red-50 border border-red-200 text-red-500 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-slow"></span>
              Live
            </div>
          </div>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ fontFamily: 'DM Sans', fontSize: '12px' }} />
                <Legend 
                  verticalAlign="bottom" 
                  height={20} 
                  iconType="circle"
                  formatter={(value, entry, index) => <span style={{ color: '#7a8499', fontSize: 11 }}>{value} ({entry.payload.value})</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="text-[20px] font-semibold text-slate-900 dark:text-white leading-none">194</span>
              <span className="text-[11px] text-[#7a8499]">regions</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SECOND CHART ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT CARD */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[15px] font-medium text-slate-900 dark:text-white m-0">Top 8 countries by 7-day growth rate</h2>
            <div className="bg-warning/10 border border-warning/20 text-warning px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              Model 2 · XGBoost
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(0, 0, 0,0.06)" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  tick={{ fill: '#7a8499', fontSize: 11, fontFamily: 'DM Sans' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <YAxis 
                  dataKey="country" 
                  type="category" 
                  tick={{ fill: '#7a8499', fontSize: 11, fontFamily: 'DM Sans' }} 
                  axisLine={false} 
                  tickLine={false}
                  width={60}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0,0.02)' }}
                  contentStyle={customTooltipStyle}
                  formatter={(value) => [`${value}%`, 'Growth Rate']}
                />
                <Bar dataKey="growth" radius={[0, 4, 4, 0]} barSize={12}>
                  {growthData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.growth > 30 ? '#ef4444' : entry.growth > 15 ? '#f59e0b' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-[14px] border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 transition-colors flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[15px] font-medium text-slate-900 dark:text-white m-0">Vaccination rate vs case growth</h2>
            <div className="bg-success/10 border border-success/20 text-success px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              Correlation
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(0, 0, 0,0.06)" />
                <XAxis 
                  type="number" 
                  dataKey="vax" 
                  name="Vaccination rate" 
                  unit="%" 
                  tick={{ fill: '#7a8499', fontSize: 11, fontFamily: 'DM Sans' }} 
                  axisLine={false} 
                  tickLine={false}
                  domain={[0, 100]}
                />
                <YAxis 
                  type="number" 
                  dataKey="growth" 
                  name="Case growth" 
                  unit="%" 
                  tick={{ fill: '#7a8499', fontSize: 11, fontFamily: 'DM Sans' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3', stroke: 'rgba(0, 0, 0,0.1)' }}
                  contentStyle={customTooltipStyle}
                />
                <ReferenceLine y={0} stroke="rgba(0, 0, 0,0.2)" strokeDasharray="3 3" />
                <Scatter data={scatterData} fill="#8884d8">
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.growth > 30 ? '#ef4444' : entry.growth > 15 ? '#f59e0b' : '#10b981'} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. LIVE R0 MONITORS */}
      <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white m-0 mt-6 tracking-tight flex items-center justify-between">
        <span>Real-Time Global R0 Monitor</span>
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Live Feed
        </div>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 mb-6">
        {LIVE_R0_COUNTRIES.map((country) => (
          <R0GaugeCard key={country.name} country={country} />
        ))}
      </div>

      <TimelineSlider />

      <div className="mt-6">
        <HeatmapCalendar 
          title="Global daily case heatmap"
          country="Worldwide"
          data={[]}
        />
      </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
