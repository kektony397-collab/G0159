
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../db';
import { Party } from '../types';
import { Search, Plus, Trash2, Edit2, X, Phone, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeStore } from '../store/themeStore';
import { useSmartSearch } from '../hooks/useSmartSearch';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const Parties: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  
  const { os, mode: themeMode } = useThemeStore();
  const isDark = themeMode === 'dark';
  
  // Smart Search Hook
  const { searchTerm, setSearchTerm, mode: searchMode, setMode: setSearchMode, results: parties } = useSmartSearch('parties');

  const { register, handleSubmit, reset, setValue } = useForm<Party>();

  React.useEffect(() => {
    if (editingParty) {
      Object.keys(editingParty).forEach((key) => {
        setValue(key as keyof Party, (editingParty as any)[key]);
      });
    } else {
      reset({ type: 'WHOLESALE' });
    }
  }, [editingParty, setValue, reset]);

  const onSubmit = async (data: Party) => {
    try {
      if (editingParty?.id) {
        await db.parties.update(editingParty.id, data);
        toast.success('Party updated');
      } else {
        await db.parties.add(data);
        toast.success('Party added');
      }
      setIsModalOpen(false);
      setEditingParty(null);
      reset();
    } catch (error) {
      toast.error('Error saving party');
    }
  };

  return (
    <div className={clsx(os === 'windows' ? "space-y-6" : "space-y-4 pb-20")}>
       <div className={clsx("flex justify-between items-center", os === 'windows' ? "p-4 backdrop-blur-md rounded-xl border border-white/10" : "")}>
        <div>
          <h2 className={clsx("font-bold", os === 'windows' ? "text-2xl" : "text-3xl")}>Parties</h2>
          <p className="opacity-60">{parties.length} Contacts</p>
        </div>
        
        <button 
            onClick={() => { setEditingParty(null); setIsModalOpen(true); }}
            className={clsx(
              "flex items-center gap-2 bg-blue-600 text-white font-bold transition-all",
              os === 'windows' ? "px-4 py-2 rounded-md hover:bg-blue-700" : "px-6 py-3 rounded-2xl shadow-lg active:scale-95"
            )}
          >
            <Plus className="w-5 h-5" /> New Party
        </button>
      </div>

      {/* Search */}
      <div className={clsx(
          "flex items-center gap-2 p-1 rounded-xl transition-all ring-2 ring-transparent focus-within:ring-blue-500",
          isDark ? "bg-white/5" : "bg-white border border-slate-200"
        )}>
        <Search className="ml-3 opacity-50 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by Name, GST, or Phone..."
          className="w-full bg-transparent border-none focus:ring-0 p-3 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
            onClick={() => setSearchMode(searchMode === 'fast' ? 'accurate' : 'fast')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors mr-1",
              searchMode === 'fast' ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
            )}
          >
            {searchMode === 'fast' ? <Zap className="w-3 h-3" /> : <Search className="w-3 h-3" />}
            {searchMode === 'fast' ? 'Fuzzy' : 'Exact'}
        </button>
      </div>

      <div className={clsx("grid gap-4", os === 'windows' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
        {parties.map((party: Party) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={party.id} 
            className={clsx(
              "group p-5 transition-all relative overflow-hidden",
              os === 'windows' 
                ? "rounded-xl border hover:shadow-lg bg-white dark:bg-white/5 border-slate-200 dark:border-white/10" 
                : "rounded-[24px] shadow-sm bg-white dark:bg-[#1e1e1e]"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{party.name}</h3>
                <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", party.type === 'RETAIL' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800")}>
                  {party.type || 'WHOLESALE'}
                </span>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => { setEditingParty(party); setIsModalOpen(true); }} className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg text-blue-600"><Edit2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm opacity-70">
              {party.gstin && (
                <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> {party.gstin}</div>
              )}
              {party.phone && (
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {party.phone}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={clsx(
              "w-full max-w-lg max-h-[90vh] overflow-y-auto",
              os === 'windows' ? "bg-white dark:bg-[#2b2b2b] rounded-lg shadow-2xl" : "bg-white dark:bg-[#1e1e1e] rounded-[32px]"
            )}
          >
            <div className="p-6 border-b dark:border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingParty ? 'Edit Party' : 'Add New Party'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <input {...register('name')} className={clsx("w-full p-4 rounded-xl bg-slate-50 dark:bg-black/20 font-bold outline-none", isDark && "text-white")} placeholder="Party Name" />
                <div className="grid grid-cols-2 gap-4">
                   <select {...register('type')} className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 outline-none">
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="RETAIL">Retail</option>
                  </select>
                  <input {...register('phone')} className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 outline-none" placeholder="Phone" />
                </div>
                <input {...register('gstin')} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-black/20 outline-none" placeholder="GSTIN" />
                <input {...register('email')} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-black/20 outline-none" placeholder="Email" />
                <textarea {...register('address')} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-black/20 outline-none" placeholder="Full Address" />
              
              <div className="flex justify-end pt-4">
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700">Save Contact</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
