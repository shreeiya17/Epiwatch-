import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalLoadingBar, SkeletonCard, SkeletonMap, SkeletonTable } from '../components/Skeleton';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './RiskMap.css';
import L from 'leaflet';
import clsx from 'clsx';
import { AlertTriangle } from 'lucide-react';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FALLBACK = [
  {id:1,region:"Mumbai Metro",country:"India",
   lat:19.0760,lng:72.8777,risk_score:89,
   risk_level:"High",active_cases:1200000,
   growth_rate:52,vaccination_pct:68,r0:1.82,
   color:"#ef4444",radius:40},
  {id:2,region:"São Paulo",country:"Brazil",
   lat:-23.5505,lng:-46.6333,risk_score:90,
   risk_level:"High",active_cases:980000,
   growth_rate:44,vaccination_pct:71,r0:1.68,
   color:"#ef4444",radius:38},
  {id:3,region:"Gauteng",country:"South Africa",
   lat:-26.2041,lng:28.0473,risk_score:89,
   risk_level:"High",active_cases:820000,
   growth_rate:38,vaccination_pct:44,r0:1.55,
   color:"#ef4444",radius:35},
  {id:4,region:"Jakarta",country:"Indonesia",
   lat:-6.2088,lng:106.8456,risk_score:90,
   risk_level:"High",active_cases:560000,
   growth_rate:16,vaccination_pct:63,r0:1.22,
   color:"#ef4444",radius:32},
  {id:5,region:"Dhaka",country:"Bangladesh",
   lat:23.8103,lng:90.4125,risk_score:89,
   risk_level:"High",active_cases:540000,
   growth_rate:27,vaccination_pct:41,r0:1.41,
   color:"#ef4444",radius:30},
  {id:6,region:"Lagos",country:"Nigeria",
   lat:6.5244,lng:3.3792,risk_score:88,
   risk_level:"High",active_cases:380000,
   growth_rate:19,vaccination_pct:38,r0:1.29,
   color:"#ef4444",radius:28},
  {id:7,region:"Rio de Janeiro",country:"Brazil",
   lat:-22.9068,lng:-43.1729,risk_score:81,
   risk_level:"High",active_cases:650000,
   growth_rate:31,vaccination_pct:69,r0:1.48,
   color:"#ef4444",radius:33},
  {id:8,region:"Karachi",country:"Pakistan",
   lat:24.8607,lng:67.0011,risk_score:58,
   risk_level:"Medium",active_cases:280000,
   growth_rate:14,vaccination_pct:39,r0:1.18,
   color:"#f59e0b",radius:24},
  {id:9,region:"Cairo",country:"Egypt",
   lat:30.0444,lng:31.2357,risk_score:55,
   risk_level:"Medium",active_cases:310000,
   growth_rate:15,vaccination_pct:52,r0:1.25,
   color:"#f59e0b",radius:21},
  {id:10,region:"New York",country:"USA",
   lat:40.7128,lng:-74.0060,risk_score:58,
   risk_level:"Medium",active_cases:440000,
   growth_rate:11,vaccination_pct:87,r0:1.12,
   color:"#f59e0b",radius:22},
  {id:11,region:"Mexico City",country:"Mexico",
   lat:19.4326,lng:-99.1332,risk_score:58,
   risk_level:"Medium",active_cases:200000,
   growth_rate:9,vaccination_pct:62,r0:1.07,
   color:"#f59e0b",radius:20},
  {id:12,region:"Paris",country:"France",
   lat:48.8566,lng:2.3522,risk_score:49,
   risk_level:"Medium",active_cases:240000,
   growth_rate:13,vaccination_pct:82,r0:1.19,
   color:"#f59e0b",radius:18},
  {id:13,region:"Berlin",country:"Germany",
   lat:52.5200,lng:13.4050,risk_score:42,
   risk_level:"Medium",active_cases:210000,
   growth_rate:11,vaccination_pct:86,r0:1.08,
   color:"#f59e0b",radius:16},
  {id:14,region:"London",country:"UK",
   lat:51.5074,lng:-0.1278,risk_score:38,
   risk_level:"Low",active_cases:190000,
   growth_rate:8,vaccination_pct:88,r0:0.94,
   color:"#10b981",radius:15},
  {id:15,region:"Tokyo",country:"Japan",
   lat:35.6762,lng:139.6503,risk_score:21,
   risk_level:"Low",active_cases:55000,
   growth_rate:3,vaccination_pct:91,r0:0.81,
   color:"#10b981",radius:10}
];

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.flyTo(center, zoom, {
    duration: 1.5
  });
  return null;
}

export default function RiskMap() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  useEffect(() => {
    const handleDemoZoom = (e) => {
      setMapCenter([38, -97]); // US
      setMapZoom(4);
      setTimeout(() => {
        setMapCenter([20, 77]); // IN
        setMapZoom(5);
      }, 2500);
    };
    window.addEventListener('demo-zoom-map', handleDemoZoom);
    return () => window.removeEventListener('demo-zoom-map', handleDemoZoom);
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/risk_map/')
      .then(r => r.json())
      .then(data => {
        setRegions(data.regions || data || FALLBACK);
        setLoading(false);
      })
      .catch(() => {
        setRegions(FALLBACK);
        setLoading(false);
      });
  }, []);

  // Compute stats safely before return
  const totalRegions = regions.length;
  const highRisk = regions.filter(r => r.risk_level === "High").length;
  const activeOutbreaks = regions.filter(r => r.risk_score > 75).length;
  const avgR0 = regions.length > 0 
    ? (regions.reduce((acc, r) => acc + r.r0, 0) / regions.length).toFixed(2) 
    : 0;
  
  const sortedRegions = [...regions].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}} className="w-full flex flex-col gap-6 font-sans">
            <GlobalLoadingBar />
            <SkeletonMap />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <SkeletonTable rows={15} />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}} className="w-full flex flex-col gap-6 pb-12 text-slate-800 dark:text-slate-100">
      
      <style>{`
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background-color: #ffffff !important;
          color: #334155 !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>

      {/* 1. PAGE HEADER */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-[24px] font-bold text-slate-900 dark:text-white m-0 tracking-tight">Global Risk Map</h1>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 m-0 mt-1">Real-time outbreak risk — Model 2 predictions</p>
        </div>
        
        <div className="flex gap-4 p-3 bg-white dark:bg-[#0f172a] shadow-sm border border-slate-200 dark:border-slate-700/50 rounded-full">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            <span className="text-[12px] text-slate-700 dark:text-slate-200 font-medium">High risk (60+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
            <span className="text-[12px] text-slate-700 dark:text-slate-200 font-medium">Medium risk (30-60)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[12px] text-slate-700 dark:text-slate-200 font-medium">Low risk (&lt;30)</span>
          </div>
        </div>
      </motion.div>

      {/* 2. RISK FORMULA CARD */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-white dark:bg-[#0f172a] p-5 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 m-0 uppercase tracking-wide">Risk score formula</h2>
          </div>
          <div className="bg-white dark:bg-[#0f172a] p-[16px] rounded-lg border border-slate-100 dark:border-slate-800 font-semibold text-[13px] text-blue-600 leading-[1.6]">
            Risk Score = 0.40 × case_growth<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 0.30 × mobility_index<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 0.20 × population_density<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 0.10 × (1 − vaccination_rate)
          </div>
        </div>
      </motion.div>

      {/* 3. LEAFLET MAP */}
      <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col gap-4">
        <h2 className="text-[16px] font-medium text-slate-800 dark:text-slate-100 m-0">Interactive risk overlay</h2>
        
        <div style={{ height: '500px', width: '100%' }} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50 relative z-0">
          <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            style={{ height: '100%', width: '100%', backgroundColor: '#f8fafc' }}
            scrollWheelZoom={true}
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {regions.map((region) => (
              <CircleMarker
                key={region.id}
                center={[region.lat, region.lng]}
                radius={region.radius}
                pathOptions={{
                  color: region.color,
                  fillColor: region.color,
                  fillOpacity: 0.7,
                  weight: 2
                }}
              >
                <Popup>
                  <div style={{ backgroundColor: '#ffffff', color: '#334155', padding: '16px' }}>
                    <h3 className="m-0 text-lg font-bold text-slate-900 dark:text-white mb-2">{region.region}, {region.country}</h3>
                    <hr className="border-slate-200 dark:border-slate-700/50 my-3" />
                    <p className="m-0 mb-1.5 text-sm text-slate-600 dark:text-slate-300">Risk Score: <strong className="text-slate-900 dark:text-white text-base">{region.risk_score}</strong>/100</p>
                    <p className="m-0 mb-1.5 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                       Risk Level: 
                       <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${region.color}15`, color: region.color, border: `1px solid ${region.color}40` }}>
                         {region.risk_level}
                       </span>
                    </p>
                    <p className="m-0 mb-1.5 text-sm text-slate-600 dark:text-slate-300">Active Cases: <strong className="text-slate-900 dark:text-white">{region.active_cases.toLocaleString()}</strong></p>
                    <p className="m-0 mb-1.5 text-sm text-slate-600 dark:text-slate-300">7-day Growth: <strong className="text-red-500">+{region.growth_rate}%</strong></p>
                    <p className="m-0 mb-1.5 text-sm text-slate-600 dark:text-slate-300">R0: <strong className="text-slate-900 dark:text-white">{region.r0}</strong></p>
                    <p className="m-0 text-sm text-slate-600 dark:text-slate-300">Vaccination: <strong className="text-slate-900 dark:text-white">{region.vaccination_pct}%</strong></p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* 4. MINI STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Regions", value: totalRegions, color: "text-slate-800 dark:text-slate-100" },
          { label: "High Risk Zones", value: highRisk, color: "text-[#ef4444]" },
          { label: "Active Outbreaks", value: activeOutbreaks, color: "text-[#ef4444]", dot: true },
          { label: "Avg Global R₀", value: avgR0, color: "text-[#f59e0b]" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-[#0f172a] p-5 shadow-sm rounded-[14px] border border-slate-200 dark:border-slate-700/50 flex flex-col justify-center items-center text-center"
          >
            <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1.5">{stat.label}</div>
            <div className={clsx("text-[26px] font-bold font-semibold flex items-center gap-2", stat.color)}>
              {stat.dot && <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse-slow"></span>}
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 5. REGIONS TABLE */}
      <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-[14px] border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700/50">
          <h2 className="text-[16px] font-medium text-slate-900 dark:text-white m-0">Regional risk breakdown</h2>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-white dark:bg-[#0f172a]">
                <th className="p-4 font-semibold">#</th>
                <th className="p-4 font-semibold">Region</th>
                <th className="p-4 font-semibold">Country</th>
                <th className="p-4 font-semibold">Risk Level</th>
                <th className="p-4 font-semibold">Risk Score</th>
                <th className="p-4 font-semibold">Active Cases</th>
                <th className="p-4 font-semibold">Growth</th>
                <th className="p-4 font-semibold">R0</th>
              </tr>
            </thead>
            <tbody>
              {sortedRegions.map((region, idx) => (
                <motion.tr 
                  key={region.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(0, 0, 0,0.03)" }}
                  className="border-b border-slate-200 dark:border-slate-700/50 transition-colors"
                >
                  <td className="p-4 text-[13px] text-slate-500 dark:text-slate-400 font-semibold">{idx + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {region.risk_score > 75 && <AlertTriangle className="w-4 h-4 text-[#ef4444] animate-pulse-slow" />}
                      <span className="text-[14px] font-medium text-slate-900 dark:text-white">{region.region}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[13px] text-slate-600 dark:text-slate-300">{region.country}</td>
                  <td className="p-4">
                    <div 
                      className="inline-flex items-center px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${region.color}20`, color: region.color, border: `1px solid ${region.color}40` }}
                    >
                      {region.risk_level}
                    </div>
                  </td>
                  <td className="p-4 text-[14px] font-semibold font-bold" style={{ color: region.color }}>{region.risk_score}</td>
                  <td className="p-4 text-[13px] text-slate-600 dark:text-slate-300 font-semibold">{region.active_cases.toLocaleString()}</td>
                  <td className="p-4 text-[13px] font-medium text-[#ef4444] font-semibold">+{region.growth_rate}%</td>
                  <td className="p-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300">{region.r0}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
