
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, FileText, Settings, Grid, Power, UserCircle } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const WindowsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { mode } = useThemeStore();
  const [startOpen, setStartOpen] = useState(false);
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
      isDark ? "bg-[#202020]" : "bg-[#f3f3f3]"
    )} style={{ backgroundImage: isDark ? 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' : 'none' }}>
      
      {/* Content Area (Window) */}
      <main className="flex-1 p-3 overflow-hidden flex flex-col h-[calc(100vh-48px)]">
         <div className={clsx(
           "flex-1 rounded-xl overflow-y-auto win-scroll border shadow-2xl backdrop-blur-3xl transition-all",
           isDark ? "bg-black/40 border-white/10 text-white" : "bg-white/70 border-white/60 text-slate-900"
         )}>
           <div className="max-w-[1600px] mx-auto p-6 animate-in fade-in zoom-in-95 duration-300">
             {children}
           </div>
         </div>
      </main>

      {/* Windows 11 Start Menu (Popover) */}
      <AnimatePresence>
        {startOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={clsx(
              "fixed bottom-14 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-lg shadow-2xl border z-50 p-6 flex flex-col backdrop-blur-3xl",
              isDark ? "bg-[#1c1c1c]/95 border-white/10 text-white" : "bg-white/95 border-slate-200 text-slate-900"
            )}
          >
            <div className="mb-4">
               <input type="text" placeholder="Type here to search" className={clsx("w-full p-2 rounded border bg-transparent", isDark ? "border-white/20 focus:border-blue-500" : "border-slate-300 focus:border-blue-500")} />
            </div>
            <div className="flex-1 grid grid-cols-4 gap-4 content-start">
               {navItems.map(item => (
                 <Link key={item.path} to={item.path} onClick={() => setStartOpen(false)} className="flex flex-col items-center gap-2 p-3 hover:bg-white/10 rounded-md transition-colors">
                    <div className={clsx("p-2 rounded-md", isDark ? "bg-white/5" : "bg-slate-100")}>
                      <item.icon className={clsx("w-6 h-6", isDark ? "text-blue-400" : "text-blue-600")} />
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                 </Link>
               ))}
            </div>
            <div className={clsx("mt-auto pt-4 border-t flex justify-between items-center", isDark ? "border-white/10" : "border-slate-200")}>
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">GD</div>
                 <span className="text-sm font-semibold">Gopi Admin</span>
               </div>
               <button className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded"><Power className="w-5 h-5" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Windows 11 Taskbar */}
      <footer className={clsx(
        "h-12 flex justify-center items-center gap-1.5 backdrop-blur-3xl border-t z-50",
        isDark ? "bg-[#1c1c1c]/90 border-white/5" : "bg-[#f3f3f3]/90 border-white/60"
      )}>
        <button 
          onClick={() => setStartOpen(!startOpen)}
          className={clsx(
             "p-2 rounded-md transition-all group active:scale-90 hover:bg-white/10",
             startOpen && "bg-white/10"
          )}
        >
            <Grid className="w-5 h-5 text-blue-500" />
        </button>
        
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setStartOpen(false)} className="relative group">
              <div className={clsx(
                "p-2 rounded-md transition-all duration-200 hover:bg-white/10 active:scale-95 flex items-center justify-center w-10 h-10",
                active && "bg-white/10 shadow-sm"
              )}>
                <item.icon className={clsx(
                  "w-5 h-5 transition-colors",
                  active ? "text-blue-500" : isDark ? "text-white/90" : "text-slate-600"
                )} />
              </div>
              {active && (
                <motion.div layoutId="active-indicator" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-blue-500 rounded-full" />
              )}
              {/* Tooltip */}
              <div className={clsx(
                "absolute bottom-14 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border shadow-lg translate-y-2 group-hover:translate-y-0",
                isDark ? "bg-[#2b2b2b] border-black text-white" : "bg-white border-slate-200 text-slate-800"
              )}>
                {item.label}
              </div>
            </Link>
          )
        })}
        
        <div className="h-5 w-px bg-slate-400/20 mx-2"></div>
        
        <div className="px-3 flex flex-col items-end justify-center h-full cursor-default select-none">
            <span className={clsx("text-[11px] font-semibold leading-none mb-0.5", isDark ? "text-white" : "text-slate-800")}>
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            <span className={clsx("text-[10px] leading-none", isDark ? "text-slate-400" : "text-slate-600")}>
              {new Date().toLocaleDateString()}
            </span>
        </div>
      </footer>
    </div>
  );
};
