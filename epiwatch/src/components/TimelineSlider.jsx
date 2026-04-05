import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, ReferenceLine, ResponsiveContainer, XAxis
} from 'recharts';
import { Play, Pause, SkipBack, Rewind, FastForward, SkipForward, Info } from 'lucide-react';

const generateHistoricalData = () => {
  const data = [];
  const start = new Date('2020-03-01');
  
  // Wave patterns
  const waves = [
    { peak: 90,  center: 60,  width: 40  },
    { peak: 150, center: 150, width: 50  },
    { peak: 280, center: 270, width: 60  },
    { peak: 200, center: 380, width: 45  },
    { peak: 800, center: 490, width: 55  },
    { peak: 400, center: 580, width: 40  },
    { peak: 180, center: 680, width: 50  },
    { peak: 120, center: 800, width: 60  },
    { peak: 150, center: 950, width: 45  },
    { peak: 200, center: 1050,width: 40  },
  ];
  
  for (let i = 0; i < 2200; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    let cases = 20000;
    waves.forEach(wave => {
      const dist = Math.abs(i - wave.center);
      if (dist < wave.width * 2) {
        cases += wave.peak * 10000 * Math.exp(-(dist*dist)/(2*wave.width*wave.width));
      }
    });
    
    const noise = 0.85 + Math.random() * 0.3;
    cases = Math.round(cases * noise);
    
    data.push({
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      cases,
      deaths: Math.round(cases * 0.012),
      recovered: Math.round(cases * 0.88),
      dayIndex: i
    });
  }
  return data;
};

const HISTORICAL_DATA = generateHistoricalData();

const EVENTS = [
  { day: 0,    label: "COVID-19 declared pandemic" },
  { day: 90,   label: "First lockdowns worldwide" },
  { day: 150,  label: "Vaccine trials begin" },
  { day: 270,  label: "Second wave peaks" },
  { day: 365,  label: "Vaccines approved" },
  { day: 490,  label: "Delta variant emerges" },
  { day: 640,  label: "Omicron variant detected" },
  { day: 730,  label: "Endemic phase begins" },
  { day: 1095, label: "Post-pandemic recovery" },
  { day: 1460, label: "New outbreak detected" },
  { day: 1825, label: "EpiWatch predictions active" },
];

const WAVES_INFO = [
  { center: 60, width: 40, name: "Wave 1 (Initial Outbreak)", cases: "900K/day", duration: "40 days" },
  { center: 150, width: 50, name: "Wave 2 (Summer 2020)", cases: "1.5M/day", duration: "50 days" },
  { center: 270, width: 60, name: "Wave 3 (Winter 2020-21)", cases: "2.8M/day", duration: "60 days" },
  { center: 380, width: 45, name: "Wave 4 (Alpha Variant)", cases: "2.0M/day", duration: "45 days" },
  { center: 490, width: 55, name: "Wave 5 (Delta Variant)", cases: "8.0M/day", duration: "55 days" },
  { center: 580, width: 40, name: "Wave 6 (Omicron BA.1)", cases: "4.0M/day", duration: "40 days" },
  { center: 680, width: 50, name: "Wave 7 (Omicron Subvariants)", cases: "1.8M/day", duration: "50 days" },
  { center: 800, width: 60, name: "Wave 8 (2024 Resurgence)", cases: "1.2M/day", duration: "60 days" },
  { center: 950, width: 45, name: "Wave 9 (2025 Shift)", cases: "1.5M/day", duration: "45 days" },
  { center: 1050, width: 40, name: "Wave 10 (2026 Peak)", cases: "2.0M/day", duration: "40 days" }
];

export default function TimelineSlider() {
  const [sliderValue, setSliderValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  const currentData = useMemo(() => HISTORICAL_DATA[sliderValue], [sliderValue]);

  const cumulativeDeaths = useMemo(() => {
    // Avoid calculating sum of slice every render by maintaining a running total if possible, 
    // but for 2200 items, slice reduce is fast enough.
    return HISTORICAL_DATA.slice(0, sliderValue + 1).reduce((sum, d) => sum + d.deaths, 0);
  }, [sliderValue]);

  const handlePlayPause = () => {
    if (isPlaying) {
      clearInterval(playIntervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playIntervalRef.current = setInterval(() => {
        setSliderValue(prev => {
          if (prev >= 2199) {
            clearInterval(playIntervalRef.current);
            setIsPlaying(false);
            return 2199;
          }
          return prev + 1;
        });
      }, 50);
    }
  };

  useEffect(() => {
    return () => clearInterval(playIntervalRef.current);
  }, []);

  const jump = (days) => {
    setSliderValue(prev => Math.max(0, Math.min(2199, prev + days)));
  };

  const formatNumber = (num) => Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  
  // Cases color logic
  const casesColor = currentData.cases < 100000 ? 'text-emerald-500' : currentData.cases < 500000 ? 'text-amber-500' : 'text-rose-500';
  
  // Phase logic
  let phase = "STABLE ─";
  let phaseColor = "text-emerald-500";
  if (sliderValue > 5) {
    const pastCases = HISTORICAL_DATA[sliderValue - 5].cases;
    const diff = currentData.cases - pastCases;
    if (diff > 50000) {
      phase = "OUTBREAK ↑";
      phaseColor = "text-rose-500";
    } else if (diff < -50000) {
      phase = "DECLINING ↓";
      phaseColor = "text-emerald-500";
    } else if (currentData.cases > 300000) {
      phase = "PEAK ▲";
      phaseColor = "text-amber-500";
    }
  }

  // Nearest event
  const nearestEvent = useMemo(() => {
    const nearby = EVENTS.filter(e => Math.abs(e.day - sliderValue) <= 30);
    if (nearby.length > 0) {
      return nearby.reduce((prev, curr) => Math.abs(curr.day - sliderValue) < Math.abs(prev.day - sliderValue) ? curr : prev);
    }
    return null;
  }, [sliderValue]);

  // Current wave
  const currentWave = useMemo(() => {
    return WAVES_INFO.find(w => Math.abs(sliderValue - w.center) < w.width);
  }, [sliderValue]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm font-sans flex flex-col gap-6"
    >
      {/* 1. HEADER ROW */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white m-0">Epidemic Timeline</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 m-0 mt-1">Drag to rewind epidemic history 2020 → 2026</p>
        </div>
        <div className="px-4 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 font-mono text-[14px] font-semibold shadow-sm">
          {currentData.displayDate.toUpperCase()}
        </div>
      </div>

      {/* 5. MINI CONTEXT CHART & TIMELINE */}
      <div className="relative w-full flex flex-col gap-1">
        <div className="h-[100px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORICAL_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Area type="monotone" dataKey="cases" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} isAnimationActive={false} />
              <ReferenceLine x={HISTORICAL_DATA[sliderValue].date} stroke="#ef4444" strokeWidth={2} isFront={true} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2. TIMELINE SLIDER */}
        <div className="w-full relative py-2">
          <input 
            type="range" 
            min="0" 
            max="2199" 
            step="1" 
            value={sliderValue}
            onChange={(e) => setSliderValue(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${(sliderValue / 2199) * 100}%, #e2e8f0 ${(sliderValue / 2199) * 100}%)`
            }}
          />
          <style dangerouslySetContent={{__html:`
            input[type=range]::-webkit-slider-thumb {
              appearance: none;
              width: 18px;
              height: 18px;
              background: #fff;
              border: 3px solid #3b82f6;
              border-radius: 50%;
              box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
              cursor: pointer;
            }
          `}} />
        </div>
        
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-1 mt-1">
          <span>2020</span><span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span><span>2026</span>
        </div>
      </div>

      {/* 6. HISTORICAL EVENTS MARKER */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {nearestEvent && (
            <motion.div
              key={nearestEvent.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-2 shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              {nearestEvent.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. PLAYBACK CONTROLS */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => setSliderValue(0)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-[12px] font-medium transition-colors">
          <SkipBack className="w-3.5 h-3.5" /> Reset
        </button>
        <button onClick={() => jump(-30)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-[12px] font-medium transition-colors">
          <Rewind className="w-3.5 h-3.5" /> -1mo
        </button>
        <button onClick={handlePlayPause} className="flex items-center gap-1.5 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[13px] font-bold transition-all shadow-sm shadow-blue-500/30 w-28 justify-center">
          {isPlaying ? <><Pause className="w-4 h-4 fill-current" /> Pause</> : <><Play className="w-4 h-4 fill-current" /> Play</>}
        </button>
        <button onClick={() => jump(30)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-[12px] font-medium transition-colors">
          +1mo <FastForward className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setSliderValue(2199)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-[12px] font-medium transition-colors">
          Today <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. SNAPSHOT STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-[#0a0e1a] rounded-lg p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 relative overflow-hidden">
          <span className="text-[12px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Daily New Cases</span>
          <motion.span 
            key={currentData.cases}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className={`text-2xl font-bold font-mono tracking-tight ${casesColor}`}
          >
            {formatNumber(currentData.cases)}
          </motion.span>
        </div>
        
        <div className="bg-slate-50 dark:bg-[#0a0e1a] rounded-lg p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
          <span className="text-[12px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total Deaths</span>
          <motion.span 
            key={cumulativeDeaths}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold font-mono tracking-tight text-rose-500"
          >
            {formatNumber(cumulativeDeaths)}
          </motion.span>
        </div>
        
        <div className="bg-slate-50 dark:bg-[#0a0e1a] rounded-lg p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
          <span className="text-[12px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Recovery Rate</span>
          <motion.span 
            key={currentData.recovered}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold font-mono tracking-tight text-emerald-500"
          >
            {((currentData.recovered / currentData.cases) * 100).toFixed(1)}%
          </motion.span>
        </div>

        <div className="bg-slate-50 dark:bg-[#0a0e1a] rounded-lg p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 justify-center">
          <span className="text-[12px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Epidemic Phase</span>
          <motion.span 
            key={phase}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-[16px] font-bold ${phaseColor}`}
          >
            {phase}
          </motion.span>
        </div>
      </div>

      {/* 7. WAVE ANALYSIS BOX */}
      <AnimatePresence mode="wait">
        {currentWave && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border-l-4 border-l-amber-500 p-4 rounded-r-lg flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-amber-900 m-0 mb-1 tracking-tight">WAVE ANALYSIS: You are viewing {currentWave.name}</h4>
              <p className="text-[13px] text-amber-800/80 m-0 leading-relaxed">
                Peak period cases reached <span className="font-semibold">{currentWave.cases}</span> with a duration of <span className="font-semibold">{currentWave.duration}</span>.
                <br/>Additional Context: {currentWave.desc}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}