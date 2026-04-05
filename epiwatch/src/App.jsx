import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import PageLayout from "./components/PageLayout";
import { Dashboard, CountryAnalysis, RiskMap, HotspotDetection, AIInsights } from "./pages/Pages";
import CompareCountries from './pages/CompareCountries';
import { Activity, Sun, Moon } from "lucide-react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import NotificationCenter from "./components/NotificationCenter";
import DemoMode from "./components/DemoMode";

// Custom Hook for Theme
function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
}

// Wrapper for Animate Presence on Routes
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="/country" element={<ErrorBoundary><CountryAnalysis /></ErrorBoundary>} />
        <Route path="/map" element={<ErrorBoundary><RiskMap /></ErrorBoundary>} />
        <Route path="/hotspots" element={<ErrorBoundary><HotspotDetection /></ErrorBoundary>} />
        <Route path="/insights" element={<ErrorBoundary><AIInsights /></ErrorBoundary>} />
        <Route path="/compare" element={<CompareCountries />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Initializing AI models...");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setLoadingText("Loading epidemic data...");
    }, 1000);

    const finishTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div className={`app-container ${theme}`}>
      <BrowserRouter>
        <div className="fixed top-4 right-6 z-50 flex items-center justify-center gap-3">
          <DemoMode />
          <NotificationCenter />
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center backdrop-blur-sm"
            title={`Toggle ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-[100] bg-slate-50 dark:bg-[#0a0e1a] flex flex-col items-center justify-center text-slate-900 dark:text-white"
            >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.5, type: 'spring' }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Activity className="w-8 h-8 text-slate-900 dark:text-white" />
              </div>
              <div className="text-3xl font-bold tracking-tight">EpiWatch</div>
            </motion.div>
            
            <div className="flex gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity, 
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                />
              ))}
            </div>

            <motion.div
              key={loadingText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-slate-500 dark:text-slate-400 text-sm tracking-wide font-medium"
            >
              {loadingText}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          <PageLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <AnimatedRoutes />
          </PageLayout>
        </div>
      )}
      </BrowserRouter>
    </div>
  );
}
