import { NavLink } from "react-router-dom";
import { Activity, Globe, Map as MapIcon, ShieldAlert, Cpu, GitCompare } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { path: "/", label: "Dashboard", icon: Activity },
  { path: "/country", label: "Country Analysis", icon: Globe },
  { path: "/map", label: "Risk Map", icon: MapIcon },
  { path: "/hotspots", label: "Hotspot Detection", icon: ShieldAlert },
  { path: "/insights", label: "AI Insights", icon: Cpu },
  { path: "/compare", label: "Compare", icon: GitCompare },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed md:sticky top-0 h-screen inset-y-0 left-0 z-50 w-[220px] bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-700/50 transform transition-transform duration-300 ease-in-out flex-shrink-0 flex flex-col md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">EpiWatch</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium text-sm",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-50merald-500 ring-4 ring-emerald-50 whitespace-nowrap" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
