import React, { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function DemoMode() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    { name: "Viewing Global Dashboard", path: "/" },
    { name: "Downloading Global CSV", path: "/", event: "demo-download-csv" },
    { name: "Selecting Country", path: "/country", event: "demo-select-country" },
    { name: "Running Predictions", path: "/country", event: "demo-run-prediction" },
    { name: "Simulating Mobility", path: "/country", event: "demo-simulate-mobility" },
    { name: "Simulating Vaccination", path: "/country", event: "demo-simulate-vaccination" },
    { name: "Comparing Countries", path: "/compare", event: "demo-compare" },
    { name: "Checking AI Insights", path: "/insights", event: "demo-insights" },
    { name: "Detecting Hotspots", path: "/hotspots", event: "demo-hotspots" },
    { name: "Analyzing Risk Map", path: "/map", event: "demo-zoom-map" },
    { name: "Demo Complete", path: "/" }
  ];

  useEffect(() => {
    // Flag to allow early breakout if user STOPS demo
    let isActiveRef = isActive;

    const runDemo = async () => {
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const getScroller = () => document.getElementById('main-scroller');

      try {
        // Step 1: Dashboard
        setCurrentStep(1);
        navigate('/');
        await wait(2500); if (!isActiveRef) return;

        // Step 2: Download CSV
        setCurrentStep(2);
        window.dispatchEvent(new CustomEvent('demo-download-csv'));
        await wait(1500); if (!isActiveRef) return;

        // Step 3: Country Selection
        setCurrentStep(3);
        navigate('/country');
        await wait(1000); if (!isActiveRef) return;
        window.dispatchEvent(new CustomEvent('demo-select-country', { detail: 'India' }));
        await wait(2500); if (!isActiveRef) return;

        // Step 4: Run Prediction (WhatIfScenarios)
        setCurrentStep(4);
        window.dispatchEvent(new CustomEvent('demo-run-prediction'));
        const scroller = getScroller();
        if(scroller) {
          try { scroller.scrollTo({ top: 300, behavior: 'smooth' }); } catch(e) {}
        }
        await wait(3500); if (!isActiveRef) return;

        // Step 5: Simulate Mobility
        setCurrentStep(5);
        if(scroller) {
          try { scroller.scrollTo({ top: 600, behavior: 'smooth' }); } catch(e) {}
        }
        window.dispatchEvent(new CustomEvent('demo-simulate-mobility'));
        await wait(2500); if (!isActiveRef) return;
        
        // Step 6: Simulate Vaccination
        setCurrentStep(6);
        if(scroller) {
          try { scroller.scrollTo({ top: 900, behavior: 'smooth' }); } catch(e) {}
        }
        window.dispatchEvent(new CustomEvent('demo-simulate-vaccination'));
        await wait(2500); if (!isActiveRef) return;

        // Step 7: Compare Countries
        setCurrentStep(7);
        navigate('/compare');
        await wait(1000); if (!isActiveRef) return;
        window.dispatchEvent(new CustomEvent('demo-compare'));
        await wait(3500); if (!isActiveRef) return;

        // Step 8: AI Insights
        setCurrentStep(8);
        navigate('/insights');
        await wait(1500); if (!isActiveRef) return;
        window.dispatchEvent(new CustomEvent('demo-insights'));
        await wait(4000); if (!isActiveRef) return;

        // Step 9: Hotspots
        setCurrentStep(9);
        navigate('/hotspots');
        await wait(1000); if (!isActiveRef) return;
        window.dispatchEvent(new CustomEvent('demo-hotspots'));
        await wait(3500); if (!isActiveRef) return;

        // Step 10: Map
        setCurrentStep(10);
        navigate('/map');
        await wait(1500); if (!isActiveRef) return;
        window.dispatchEvent(new CustomEvent('demo-zoom-map'));
        await wait(4500); if (!isActiveRef) return;

        // Step 11: End Demo
        setCurrentStep(11);
        navigate('/');
        setTimeout(() => { if (isActiveRef) setIsActive(false); }, 2000);
      } catch (e) {
        console.error('Demo interrupted', e);
        setIsActive(false);
      }
    };

    if (isActive) {
      runDemo();
    }

    return () => {
      isActiveRef = false; // ensure we stop the sequence
    };
  }, [isActive]);

  const toggleDemo = () => {
    setIsActive(!isActive);
    if (!isActive) setCurrentStep(0);
  };

  return (
    <>
      <button
        onClick={toggleDemo}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all shadow-md backdrop-blur-sm border ${
          isActive 
            ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 animate-pulse' 
            : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
        }`}
        title="Automated Demo"
      >
        {isActive ? <Square size={16} /> : <Play size={16} />}
        <span className="text-[13px]">{isActive ? "Stop Demo" : "Demo Mode"}</span>
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[100] bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4"
          >
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Auto-Pilot Active</span>
              <span className="text-sm font-medium">{steps[currentStep - 1]?.name || "Initializing..."}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
