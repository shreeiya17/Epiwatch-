import React from "react";
import { Menu } from "lucide-react";

export default function PageLayout({ children, sidebarOpen, setSidebarOpen }) {
  return (
    <main id="main-scroller" className="flex-1 w-full flex flex-col min-w-0 h-screen overflow-y-auto box-border">
      <div className="md:hidden flex items-center p-4 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#0f172a]">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="ml-3 font-bold text-slate-900 dark:text-white tracking-tight">EpiWatch</div>
      </div>
      <div className="p-4 md:py-8 md:px-8 w-full max-w-7xl mx-auto flex-1">
        {children}
      </div>
    </main>
  );
}                                                                                               
