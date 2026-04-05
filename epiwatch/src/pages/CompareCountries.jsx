import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
} from 'recharts';
import { Activity, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Chart tooltip styles matching dashboard
const customTooltipStyle = {
  backgroundColor: '#1a2235',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  color: '#e8edf5',
  padding: '10px',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '12px',
};

const COUNTRY_DATA = {
  india:        { name:"India", cases:2100000, 
                  growth:47, vacc:72, r0:1.68, 
                  risk:81, color:"#ef4444",
                  deaths:25200, recovered:1850000 },
  usa:          { name:"United States", cases:1200000, 
                  growth:18, vacc:85, r0:1.34, 
                  risk:62, color:"#3b82f6",
                  deaths:14400, recovered:1080000 },
  brazil:       { name:"Brazil", cases:890000, 
                  growth:31, vacc:68, r0:1.51, 
                  risk:74, color:"#f59e0b",
                  deaths:10680, recovered:783200 },
  uk:           { name:"United Kingdom", cases:190000, 
                  growth:8, vacc:88, r0:0.94, 
                  risk:38, color:"#10b981",
                  deaths:2280, recovered:174800 },
  germany:      { name:"Germany", cases:210000, 
                  growth:11, vacc:86, r0:1.08, 
                  risk:42, color:"#8b5cf6",
                  deaths:2520, recovered:193200 },
  france:       { name:"France", cases:240000, 
                  growth:13, vacc:82, r0:1.19, 
                  risk:49, color:"#ec4899",
                  deaths:2880, recovered:220800 },
  japan:        { name:"Japan", cases:55000, 
                  growth:3, vacc:91, r0:0.81, 
                  risk:21, color:"#14b8a6",
                  deaths:660, recovered:51700 },
  south_africa: { name:"South Africa", cases:340000, 
                  growth:28, vacc:45, r0:1.44, 
                  risk:71, color:"#f43f5e",
                  deaths:4080, recovered:299200 }
};

export default function CompareCountries() {
  const [countryA, setCountryA] = useState('india');
  const [countryB, setCountryB] = useState('brazil');

  React.useEffect(() => {
    const handleDemoCompare = () => {
      setCountryA('usa');
      setTimeout(() => setCountryB('germany'), 1000);
      setTimeout(() => setCountryA('india'), 2000);
    };
    window.addEventListener('demo-compare', handleDemoCompare);
    return () => window.removeEventListener('demo-compare', handleDemoCompare);
  }, []);

  const cntryA = useMemo(() => COUNTRY_DATA[countryA], [countryA]);
  const cntryB = useMemo(() => COUNTRY_DATA[countryB], [countryB]);

  const winner = useMemo(() => 
    cntryA.risk < cntryB.risk ? cntryA.name : cntryB.name
  , [cntryA, cntryB]);

  const winnerObj = cntryA.risk < cntryB.risk ? cntryA : cntryB;
  const vaccBetter = cntryA.vacc > cntryB.vacc ? (cntryA.risk < cntryB.risk ? 'higher' : 'lower') : (cntryB.vacc > cntryA.vacc ? 'higher' : 'lower');
  const best_metric = cntryA.risk < cntryB.risk ? 'risk mitigation' : (cntryA.vacc > cntryB.vacc ? 'vaccination' : 'containment');
  const r0Winner = cntryA.r0 < cntryB.r0 ? cntryA.name : cntryB.name;

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = -14; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      let aActual = null;
      let aPredicted = null;
      let bActual = null;
      let bPredicted = null;

      if (i <= 0) {
        aActual = Math.round(cntryA.cases * (0.85 + (i + 14) * 0.01));
        bActual = Math.round(cntryB.cases * (0.85 + (i + 14) * 0.01));
        if (i === 0) {
          aPredicted = aActual;
          bPredicted = bActual;
        }
      } else {
        aPredicted = Math.round(cntryA.cases * (1 + (cntryA.growth / 100) * (i / 7)));
        bPredicted = Math.round(cntryB.cases * (1 + (cntryB.growth / 100) * (i / 7)));
      }

      data.push({
        date: dateStr,
        aActual,
        aPredicted,
        bActual,
        bPredicted,
        isFuture: i > 0
      });
    }
    return data;
  }, [cntryA, cntryB]);

  const radarData = useMemo(() => [
    { metric: 'Case Growth', A: cntryA.growth, B: cntryB.growth, fullMark: 100 },
    { metric: 'Vaccination Rate', A: cntryA.vacc, B: cntryB.vacc, fullMark: 100 },
    { metric: 'Risk Score', A: cntryA.risk, B: cntryB.risk, fullMark: 100 },
    { metric: 'R0 (normalized)', A: Math.min(cntryA.r0 * 30, 100), B: Math.min(cntryB.r0 * 30, 100), fullMark: 100 },
    { metric: 'Recovery Rate', A: (cntryA.recovered / cntryA.cases) * 100, B: (cntryB.recovered / cntryB.cases) * 100, fullMark: 100 },
    { metric: 'Population Impact', A: cntryA.risk * 0.8, B: cntryB.risk * 0.8, fullMark: 100 }
  ], [cntryA, cntryB]);

  const barData = useMemo(() => [
    { name: cntryA.name, deaths: cntryA.deaths, recovered: cntryA.recovered },
    { name: cntryB.name, deaths: cntryB.deaths, recovered: cntryB.recovered }
  ], [cntryA, cntryB]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const MetricWinner = ({ valA, valB, format = formatNumber, higherIsBetter = true, label }) => {
    const aWins = higherIsBetter ? valA >= valB : valA <= valB;
    const winnerName = aWins ? cntryA.name : cntryB.name;
    const formattedA = typeof format === 'function' ? format(valA) : valA;
    const formattedB = typeof format === 'function' ? format(valB) : valB;
    return (
      <div className="text-xs text-blue-700 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 py-1.5 px-2 rounded-md mt-3 text-center font-medium shadow-sm w-full block transition-colors">
        {cntryA.name}: <span className="font-semibold">{formattedA}</span> vs {cntryB.name}: <span className="font-semibold">{formattedB}</span> → <span className="font-bold underline decoration-blue-300 underline-offset-2">{winnerName} ✓</span>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }} 
      className="w-full flex flex-col gap-6 font-sans text-slate-900 dark:text-white pb-10 pt-2"
    >
      {/* 1. PAGE HEADER */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.4px] m-0 text-slate-900 dark:text-white">Country Comparison</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 m-0 mt-1">Compare epidemic trajectories across two regions directly</p>
        </div>
      </div>

      {/* 2. COUNTRY SELECTOR ROW */}
      <div className="flex items-center justify-between bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative transition-all">
        <div className="w-[40%]">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wider">Country A</label>
          <select 
            value={countryA} 
            onChange={e => setCountryA(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-slate-700/50 p-2.5 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm text-[14px]"
          >
            {Object.entries(COUNTRY_DATA).map(([key, data]) => (
              <option key={key} value={key}>{data.name}</option>
            ))}
          </select>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-slate-700/50 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 shadow-sm text-sm z-10 font-mono tracking-tighter">
          VS
        </div>

        <div className="w-[40%]">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wider">Country B</label>
          <select 
            value={countryB} 
            onChange={e => setCountryB(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-slate-700/50 p-2.5 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm text-[14px]"
          >
            {Object.entries(COUNTRY_DATA).map(([key, data]) => (
              <option key={key} value={key}>{data.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. COMPARISON STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country A Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Active Cases', valA: cntryA.cases, higherIsBetter: false },
            { label: 'Risk Score', valA: cntryA.risk, higherIsBetter: false, format: v => v + '/100' },
            { label: 'R0 Value', valA: cntryA.r0, higherIsBetter: false, format: v => v },
            { label: 'Vaccination Rate', valA: cntryA.vacc, higherIsBetter: true, format: v => v + '%' }
          ].map((stat, idx) => (
            <div key={`a-${idx}`} className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full opacity-80" style={{ backgroundColor: cntryA.color }}></div>
              <div className="text-slate-500 dark:text-slate-400 text-[13px] font-medium mb-1">{stat.label}</div>
              <div className="text-[22px] tracking-tight font-bold text-slate-800 dark:text-slate-100">
                {typeof stat.format === 'function' ? stat.format(stat.valA) : formatNumber(stat.valA)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Country B Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Active Cases', valA: cntryA.cases, valB: cntryB.cases, higherIsBetter: false },
            { label: 'Risk Score', valA: cntryA.risk, valB: cntryB.risk, higherIsBetter: false, format: v => v + '/100' },
            { label: 'R0 Value', valA: cntryA.r0, valB: cntryB.r0, higherIsBetter: false, format: v => v },
            { label: 'Vaccination Rate', valA: cntryA.vacc, valB: cntryB.vacc, higherIsBetter: true, format: v => v + '%' }
          ].map((stat, idx) => (
            <div key={`b-${idx}`} className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full opacity-80" style={{ backgroundColor: cntryB.color }}></div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 text-[13px] font-medium mb-1">{stat.label}</div>
                <div className="text-[22px] tracking-tight font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {typeof stat.format === 'function' ? stat.format(stat.valB) : formatNumber(stat.valB)}
                </div>
              </div>
              <MetricWinner valA={stat.valA} valB={stat.valB} higherIsBetter={stat.higherIsBetter} format={stat.format} label={stat.label} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. SIDE BY SIDE PREDICTION CHART */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 mb-6">7-Day Case Forecast</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatNumber} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={customTooltipStyle}
                itemStyle={{ color: '#e8edf5', fontSize: '13px' }}
              />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} iconType="circle" iconSize={8} />
              <ReferenceLine x={chartData[14].date} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#64748b', fontSize: 11 }} />
              
              <Line type="monotone" dataKey="aActual" name={`${cntryA.name} Actual`} stroke={cntryA.color} strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="aPredicted" name={`${cntryA.name} Predicted`} stroke={cntryA.color} strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="bActual" name={`${cntryB.name} Actual`} stroke={cntryB.color} strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="bPredicted" name={`${cntryB.name} Predicted`} stroke={cntryB.color} strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 5. RADAR CHART COMPARISON */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 mb-2">Multi-metric Risk Assessment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name={cntryA.name} dataKey="A" stroke={cntryA.color} strokeWidth={2} fill={cntryA.color} fillOpacity={0.2} />
              <Radar name={cntryB.name} dataKey="B" stroke={cntryB.color} strokeWidth={2} fill={cntryB.color} fillOpacity={0.2} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip contentStyle={customTooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
        {/* 6. GROWTH RATE COMPARISON BAR */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 mb-6">Growth & Control Metrics</h3>
          <div className="space-y-6">
            {[
              { label: 'Case Growth', key: 'growth', max: 100, suffix: '%' },
              { label: 'Vaccination Rate', key: 'vacc', max: 100, suffix: '%' },
              { label: 'Reproduction No. (R0)', key: 'r0', max: 3, suffix: '' }
            ].map(metric => (
              <div key={metric.key}>
                <div className="flex justify-between text-[12px] font-medium mb-2 items-center">
                  <span className="text-slate-700 dark:text-slate-200">{cntryA.name}: <span className="font-bold text-slate-900 dark:text-white">{cntryA[metric.key]}{metric.suffix}</span></span>
                  <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50 dark:bg-[#0a0e1a] px-2 py-0.5 rounded-sm border border-slate-100 dark:border-slate-800">{metric.label}</span>
                  <span className="text-slate-700 dark:text-slate-200">{cntryB.name}: <span className="font-bold text-slate-900 dark:text-white">{cntryB[metric.key]}{metric.suffix}</span></span>
                </div>
                <div className="flex h-2.5 gap-1.5">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden flex justify-end shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${(cntryA[metric.key] / metric.max) * 100}%`,
                        backgroundColor: cntryA.color 
                      }} 
                    />
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${(cntryB[metric.key] / metric.max) * 100}%`,
                        backgroundColor: cntryB.color 
                      }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. DEATH VS RECOVERY COMPARISON */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 mb-4">Outcomes: Recovered vs Deaths</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatNumber} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={customTooltipStyle}
                itemStyle={{ color: '#e8edf5' }}
                cursor={{fill: '#f1f5f9'}}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="recovered" name="Recovered" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="deaths" name="Deaths" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. AI COMPARISON INSIGHT BOX */}
      <div className="bg-blue-50/70 border border-blue-100 dark:border-blue-900/30 border-l-4 border-l-blue-500 p-6 rounded-xl shadow-sm relative overflow-hidden mt-2">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-200/40 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 shadow-sm">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-[14px] font-bold text-blue-900 dark:text-blue-200 tracking-tight">AI COMPARATIVE INSIGHT</h3>
        </div>
        <p className="text-blue-800/90 leading-relaxed text-[13px] relative z-10 w-[90%]">
          <span className="font-semibold block mb-2 text-blue-900/90">Comparative Analysis: {cntryA.name} vs {cntryB.name}</span>
          <span className="font-bold text-blue-700">{winner}</span> shows better epidemic control with a lower risk score (<span className="font-semibold">{winnerObj.risk}/100</span>) and <span className="font-semibold">{vaccBetter}</span> vaccination coverage.<br /><br />
          Key difference: {cntryA.name} <span className="font-medium">R0={cntryA.r0}</span> vs {cntryB.name} <span className="font-medium">R0={cntryB.r0}</span>. <span className="font-bold text-blue-700">{r0Winner}</span> is currently in the proper decline phase.<br /><br />
          <span className="font-semibold text-blue-900/90">Recommendation:</span> <span className="text-blue-800 dark:text-blue-300 bg-white/60 px-2 py-0.5 rounded border border-blue-200 font-medium ml-1 shadow-sm leading-7">
            {winnerObj.name === cntryA.name ? cntryB.name : cntryA.name} should study {winnerObj.name}'s {best_metric} strategy.
          </span>
        </p>
      </div>

    </motion.div>
  );
}
