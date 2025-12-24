
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../db';
import { CompanyProfile } from '../types';
import { Save, Building2, Monitor, Smartphone, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeStore } from '../store/themeStore';
import clsx from 'clsx';

export const Settings: React.FC = () => {
  const { register, handleSubmit, setValue } = useForm<CompanyProfile>();
  const { os, setOs, mode, toggleMode } = useThemeStore();
  const isDark = mode === 'dark';

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await db.settings.get(1); 
      if (settings) {
        Object.keys(settings).forEach((key) => {
          setValue(key as keyof CompanyProfile, (settings as any)[key]);
        });
      }
    };
    loadSettings();
  }, [setValue]);

  const onSubmit = async (data: CompanyProfile) => {
    try {
      await db.settings.put({ ...data, id: 1 });
      toast.success('System Configuration Updated');
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  const cardClass = clsx(
    "p-6 border transition-all",
    os === 'windows' ? "rounded-xl shadow-sm bg-white dark:bg-white/5 border-slate-200 dark:border-white/10" : "rounded-[28px] bg-white dark:bg-[#1e1e1e] border-transparent"
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold">Settings</h2>
           <p className="opacity-60">System & Appearance</p>
        </div>
        <button onClick={toggleMode} className="p-3 bg-slate-200 dark:bg-white/10 rounded-full">
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      {/* OS Switcher */}
      <div className={cardClass}>
        <h3 className="text-lg font-bold mb-4">Operating System Mode</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setOs('windows')}
            className={clsx(
              "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
              os === 'windows' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-transparent bg-slate-50 dark:bg-white/5"
            )}
          >
            <Monitor className="w-8 h-8 text-blue-500" />
            <span className="font-bold">Windows 11</span>
          </button>
          <button 
            onClick={() => setOs('android')}
            className={clsx(
              "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
              os === 'android' ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-transparent bg-slate-50 dark:bg-white/5"
            )}
          >
            <Smartphone className="w-8 h-8 text-green-500" />
            <span className="font-bold">Android 11</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold">Company Identity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase opacity-50 mb-2 block">Legal Name</label>
              <input {...register('companyName')} className="w-full rounded-xl bg-slate-50 dark:bg-black/20 p-4 font-bold border-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase opacity-50 mb-2 block">GSTIN</label>
              <input {...register('gstin')} className="w-full rounded-xl bg-slate-50 dark:bg-black/20 p-4 font-mono border-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase opacity-50 mb-2 block">Contact Phone</label>
              <input {...register('phone')} className="w-full rounded-xl bg-slate-50 dark:bg-black/20 p-4 border-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className={clsx(
            "flex items-center gap-2 text-white font-bold shadow-xl transition-all",
            os === 'windows' ? "px-8 py-3 bg-blue-600 rounded-md hover:bg-blue-700" : "px-10 py-4 bg-blue-600 rounded-full hover:scale-105 active:scale-95"
          )}>
            <Save className="w-5 h-5" /> SAVE SETTINGS
          </button>
        </div>
      </form>
    </div>
  );
};
