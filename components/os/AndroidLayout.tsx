
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, Signal, Wifi, Battery } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const AndroidLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  const navItems = [
    { label: 'Home', path: '/', icon: LayoutDashboard },
    { label: 'Stock', path: '/inventory', icon: Package },
    { label: 'Bill', path: '/billing', icon: ShoppingCart },
    { label: 'Party', path: '/parties', icon: Users },
  ];

  return (
    <div className={clsx(
      "min-h-screen font-['Roboto'] flex flex-col transition-colors duration-300",
      isDark ? "bg-black text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Android Status Bar */}
      <div className={clsx(
        "h-8 flex justify-between items-center px-4 text-[10px] font-medium z-50 sticky top-0 backdrop-blur-md select-none",
        isDark ? "text-white bg-black/50" : "text-slate-800 bg-white/50"
      )}>
        <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        <div className="flex gap-1.5 items-center">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-3.5 h-3.5" />
        </div>
      </div>

      <main className="flex-1 pb-24 overflow-y-auto android-scroll">
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4"
        >
           {children}
        </motion.div>
      </main>

      {/* Android Bottom Navigation (Material 3 Style) */}
      <nav className={clsx(
        "fixed bottom-0 left-0 right-0 h-20 pb-4 pt-2 px-4 flex justify-between items-center z-50",
        isDark ? "bg-[#1e1e1e] border-t border-white/5" : "bg-white border-t border-slate-100"
      )}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 w-16 group relative select-none">
              <div className={clsx(
                "w-16 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                active ? (isDark ? "bg-[#004a77]" : "bg-[#c2e7ff]") : "bg-transparent"
              )}>
                <item.icon className={clsx(
                  "w-6 h-6 z-10 transition-colors",
                  active ? (isDark ? "text-[#c2e7ff]" : "text-[#001d35]") : (isDark ? "text-slate-400" : "text-slate-500")
                )} />
              </div>
              <span className={clsx(
                "text-[11px] font-medium transition-colors",
                active ? (isDark ? "text-[#c2e7ff]" : "text-[#001d35]") : (isDark ? "text-slate-400" : "text-slate-500")
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
        <Link to="/settings" className="flex flex-col items-center gap-1 w-16 select-none">
           <div className={clsx(
             "w-16 h-8 rounded-full flex items-center justify-center transition-all",
             location.pathname === '/settings' ? (isDark ? "bg-[#004a77]" : "bg-[#c2e7ff]") : "bg-transparent"
           )}>
             <Settings className={clsx("w-6 h-6", location.pathname === '/settings' ? (isDark ? "text-[#c2e7ff]" : "text-[#001d35]") : "text-slate-500")} />
           </div>
           <span className={clsx("text-[11px] font-medium", location.pathname === '/settings' ? (isDark ? "text-[#c2e7ff]" : "text-[#001d35]") : "text-slate-500")}>Config</span>
        </Link>
      </nav>
    </div>
  );
};
