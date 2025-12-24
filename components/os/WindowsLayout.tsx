
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, FileText, Settings, Search, Grid } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const WindowsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  const navItems = [
    { label: 'Home', path: '/', icon: LayoutDashboard },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Billing', path: '/billing', icon: ShoppingCart },
    { label: 'Parties', path: '/parties', icon: Users },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Config', path: '/settings', icon: Settings },
  ];

  return (
    <div className={clsx(
      "min-h-screen font-['Segoe_UI'] flex flex-col transition-colors duration-300 bg-cover bg-center",
      isDark ? "bg-slate-900" : "bg-[#f3f3f3]"
    )} style={{ backgroundImage: isDark ? 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' : 'none' }}>
      
      {/* Content Area (Window) */}
      <main className="flex-1 p-4 overflow-hidden flex flex-col h-[calc(100vh-48px)]">
         <div className={clsx(
           "flex-1 rounded-t-xl overflow-y-auto win-scroll border shadow-2xl backdrop-blur-2xl transition-all",
           isDark ? "bg-black/60 border-white/10 text-white" : "bg-white/80 border-white/40 text-slate-900"
         )}>
           <div className="max-w-[1600px] mx-auto p-6 animate-in fade-in zoom-in-95 duration-300">
             {children}
           </div>
         </div>
      </main>

      {/* Windows 11 Taskbar */}
      <footer className={clsx(
        "h-12 flex justify-center items-center gap-2 backdrop-blur-xl border-t z-50",
        isDark ? "bg-black/80 border-white/10" : "bg-white/85 border-slate-200"
      )}>
        <button className="p-2 hover:bg-white/10 rounded-md transition-all group active:scale-90">
            <Grid className="w-5 h-5 text-blue-500" />
        </button>
        
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="relative group">
              <div className={clsx(
                "p-2 rounded-md transition-all duration-200 hover:bg-white/10 active:scale-90 flex items-center justify-center w-10 h-10",
                active && "bg-white/10"
              )}>
                <item.icon className={clsx(
                  "w-5 h-5 transition-colors",
                  active ? "text-blue-500" : isDark ? "text-white" : "text-slate-700"
                )} />
              </div>
              {active && (
                <motion.div layoutId="active-indicator" className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
              )}
              {/* Tooltip */}
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                {item.label}
              </div>
            </Link>
          )
        })}
        
        <div className="h-6 w-px bg-slate-400/30 mx-2"></div>
        
        <div className="px-3 flex flex-col items-end justify-center h-full cursor-default">
            <span className={clsx("text-[10px] font-bold", isDark ? "text-white" : "text-slate-800")}>
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            <span className={clsx("text-[8px]", isDark ? "text-slate-300" : "text-slate-500")}>
              {new Date().toLocaleDateString()}
            </span>
        </div>
      </footer>
    </div>
  );
};
