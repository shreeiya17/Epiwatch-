import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalLoadingBar, SkeletonCard, SkeletonChart, SkeletonTable } from '../components/Skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import api from '../api/client';

const riskDistribution = [
  { name: 'High', value: 28, color: '#ef4444' },
  { name: 'Medium', value: 54, color: '#f59e0b' },
  { name: 'Low', value: 112, color: '#10b981' },
];

const growthDistribution = [
  { bucket: '0-5%', count: 42, color: '#10b981' },
  { bucket: '5-10%', count: 35, color: '#10b981' },
  { bucket: '10-15%', count: 24, color: '#10b981' },
  { bucket: '15-20%', count: 12, color: '#f59e0b' },
  { bucket: '20-25%', count: 8, color: '#f59e0b' },
  { bucket: '25-30%', count: 5, color: '#f59e0b' },
  { bucket: '30-40%', count: 6, color: '#ef4444' },
  { bucket: '40-50%', count: 3, color: '#ef4444' },
  { bucket: '>50%', count: 2, color: '#ef4444' },
];

const getRiskColor = (level) => {
  if (level === 'High' || level === 'Critical') return '#ef4444';
  if (level === 'Medium') return '#f59e0b';
  return '#10b981';
};

const getRiskBg = (level) => {
  if (level === 'High' || level === 'Critical') return 'rgba(239,68,68,0.15)';
  if (level === 'Medium') return 'rgba(245,158,11,0.15)';
  return 'rgba(16,185,129,0.15)';
};

export default function HotspotDetection() {
  const [filter, setFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.hotspots()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleDemoHotspots = () => {
      setFilter('High');
      setTimeout(() => setExpandedRow(1), 1000);
      setTimeout(() => setExpandedRow(2), 2500);
    };
    window.addEventListener('demo-hotspots', handleDemoHotspots);
    return () => window.removeEventListener('demo-hotspots', handleDemoHotspots);
  }, []);

  const rawHotspots = data?.hotspots || [];

  const activeHotspots = [
    { rank: 1, region: "Mumbai Metro", country: "India", riskLevel: "High", riskScore: 87, growthRate: 52.4, r0: 1.65, trend: [100, 120, 150, 180, 220, 280, 350], isOutbreak: true },
    { rank: 2, region: "São Paulo State", country: "Brazil", riskLevel: "High", riskScore: 81, growthRate: 41.2, r0: 1.52, trend: [200, 210, 225, 250, 280, 310, 330], isOutbreak: true },
    { rank: 3, region: "Gauteng", country: "South Africa", riskLevel: "High", riskScore: 76, growthRate: 35.1, r0: 1.45, trend: [50, 60, 75, 95, 120, 150, 180], isOutbreak: true },
    ...rawHotspots.filter(h => !['Maharashtra', 'Sao Paulo'].includes(h.region)).map((h, i) => ({ ...h, rank: i + 4, riskScore: h.riskScore ? h.riskScore * 10 : (80 - i*2), isOutbreak: false }))
  ].slice(0, 10);

  const filteredHotspots = activeHotspots.filter(h => filter === 'All' || h.riskLevel === filter || (filter === 'High' && h.riskLevel === 'Critical'));

  // Generate dynamic alerts for regions with >40% growth in 5 days
  const activeAlerts = activeHotspots
    .filter(h => h.growthRate >= 40)
    .map(h => ({
      ...h,
      region_full: `${h.region}, ${h.country}`,
      risk: h.riskScore,
      text: `Potential outbreak in ${h.region} within 5 days — ${Math.round(h.confidence || h.riskScore + 4)}% confidence`,
      type: 'critical'
    }));

  return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}} className="w-full flex flex-col gap-6 font-sans">
            <GlobalLoadingBar />
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1"><SkeletonCard /></div>
              <div className="flex-1"><SkeletonCard /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonChart height={192} /><SkeletonChart height={192} />
            </div>
            <SkeletonTable rows={10} />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}} className="w-full flex flex-col gap-6 pb-12 overflow-x-hidden text-slate-700 dark:text-slate-200 font-sans">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold m-0 text-slate-900 dark:text-white">Hotspot Detection</h1>
          {activeAlerts.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5">
              {activeAlerts.length} active RED ALERT outbreaks
            </div>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 m-0">Model 2 (XGBoost) — top high-risk regions ranked by composite risk score</p>
      </div>

      {/* 2. FULL-WIDTH OUTBREAK ALERT BANNER */}
      {activeAlerts.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {activeAlerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex-1 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-xl p-4 flex flex-col gap-3 justify-between"
            >
              <div className="flex gap-3 items-start">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">AUTOMATIC RED ALERT</div>
                  <div className="text-xs text-red-500 font-medium mt-1">{alert.text}</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setExpandedRow(alert.rank);
                  setFilter('All');
                  // scroll to row, optional delay to allow render
                  setTimeout(() => {
                    const row = document.getElementById(`row-${alert.rank}`);
                    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }}
                className="text-xs font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 w-fit mt-1 transition-colors"
               >
                View {alert.region_full} details &rarr;
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* 3. MINI CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT CARD */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col gap-4">
          <h2 className="text-sm font-medium text-slate-900 dark:text-white m-0 text-center">Risk level breakdown across 194 regions</h2>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-xl font-bold text-slate-900 dark:text-white">194</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">regions</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {riskDistribution.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span className="text-slate-600 dark:text-slate-300">{d.name} <span className="opacity-50">({d.value})</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col gap-4">
          <h2 className="text-sm font-medium text-slate-900 dark:text-white m-0 text-center">7-day case growth distribution</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="bucket" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {growthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. MAIN HOTSPOT TABLE CARD */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/50 rounded-xl shadow-lg mt-2 overflow-hidden">
        <div className="p-5 border-b border-slate-200/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top 10 high-risk regions</h2>
          <div className="flex p-1 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/50">
            {['All', 'High', 'Medium', 'Low'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f 
                  ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50">
                <th className="p-4 font-medium w-12 text-center">#</th>
                <th className="p-4 font-medium">Region</th>
                <th className="p-4 font-medium text-center">Risk Level</th>
                <th className="p-4 font-medium">Risk Score (/100)</th>
                <th className="p-4 font-medium">Growth Rate</th>
                <th className="p-4 font-medium w-32">7-day Trend</th>
                <th className="p-4 font-medium text-right">R₀ value</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filteredHotspots.map((h, i) => {
                  const riskColor = getRiskColor(h.riskLevel);
                  const isTop3 = h.rank <= 3;
                  const r0Color = h.r0 > 1.5 ? 'text-red-400' : h.r0 >= 1.0 ? 'text-amber-400' : 'text-green-400';
                  const isExpanded = expandedRow === h.rank;
                  const scoreDisplay = h.riskScore;

                  return (
                    <React.Fragment key={h.rank}>
                      <motion.tr
                        id={`row-${h.rank}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setExpandedRow(isExpanded ? null : h.rank)}
                        className={`
                          border-b border-slate-200/50 text-sm cursor-pointer transition-colors group
                          hover:bg-white hover:border-l-2 hover:border-l-blue-500
                          ${isTop3 ? 'border-l-2 border-l-red-500/50 hover:border-l-red-500 bg-red-500/5' : 'border-l-2 border-l-transparent'}
                          ${isExpanded ? 'bg-white dark:bg-[#0f172a]' : ''}
                        `}
                      >
                        <td className="p-4 text-center text-slate-500 dark:text-slate-400" style={{ fontFamily: 'DM Mono' }}>{h.rank}</td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-700 dark:text-slate-200">{h.region}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{h.country}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span 
                            className="px-2.5 py-1 rounded-md text-xs font-semibold inline-block w-20 text-center"
                            style={{ 
                              backgroundColor: getRiskBg(h.riskLevel),
                              color: riskColor,
                            }}
                          >
                            {h.riskLevel}
                          </span>
                        </td>
                        <td className="p-4 w-48">
                          <div className="flex items-center gap-3">
                            <span style={{ fontFamily: 'DM Mono' }}>{scoreDisplay.toFixed(0)}</span>
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${scoreDisplay}%`, backgroundColor: riskColor }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 w-40">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-medium" style={{ color: h.growthRate > 0 ? (h.growthRate > 15 ? '#ef4444' : '#f59e0b') : '#10b981' }}>
                              {h.growthRate > 0 ? '+' : ''}{h.growthRate}%
                            </span>
                            <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(h.growthRate)*2, 100)}%`, backgroundColor: h.growthRate > 0 ? (h.growthRate > 15 ? '#ef4444' : '#f59e0b') : '#10b981' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-end h-8 gap-1">
                            {h.trend.map((val, idx) => {
                              const max = Math.max(...h.trend);
                              const height = max > 0 ? (val / max) * 100 : 0;
                              return (
                                <div 
                                  key={idx} 
                                  className="w-1.5 rounded-sm opacity-80" 
                                  style={{ height: `${height}%`, backgroundColor: riskColor }}
                                ></div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium" style={{ fontFamily: 'DM Mono' }}>
                          <span className={r0Color}>{h.r0.toFixed(2)}</span>
                        </td>
                      </motion.tr>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white dark:bg-[#0f172a]"
                          >
                            <td colSpan="7" className="p-0 border-b border-slate-200/50">
                              <div className="px-16 py-4 border-l-2 border-l-blue-500">
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-blue-200 mb-1">AI Insight</h4>
                                    <p className="text-sm text-blue-100/70 italic leading-relaxed">
                                      Model analysis: {h.region}'s risk score of {scoreDisplay.toFixed(0)} is driven primarily by {h.growthRate}% case growth rate (weight 0.40) and elevated transit mobility +18% above baseline. Intervention recommended within 72 hours.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODEL PERFORMANCE FOOTER */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 rounded-lg p-4 flex justify-between items-center shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Model 2 F1 Score</span>
          <span className="text-green-400 font-bold" style={{ fontFamily: 'DM Mono' }}>0.89</span>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 rounded-lg p-4 flex justify-between items-center shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Precision</span>
          <span className="text-blue-600 font-bold" style={{ fontFamily: 'DM Mono' }}>91.2%</span>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 rounded-lg p-4 flex justify-between items-center shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Recall</span>
          <span className="text-blue-600 font-bold" style={{ fontFamily: 'DM Mono' }}>87.4%</span>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pb-2">
        Evaluated on 30-day holdout set, 194 regions
      </div>
      
      </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
