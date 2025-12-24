
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../db';
import { Product } from '../types';
import { Search, Plus, Upload, Trash2, Edit2, X, Database, FileSpreadsheet, Zap, Search as SearchIcon } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { useThemeStore } from '../store/themeStore';
import { useSmartSearch } from '../hooks/useSmartSearch';
import { parseExcel } from '../utils/excelHelper';
import { motion } from 'framer-motion';

export const Inventory: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const { os, mode: themeMode } = useThemeStore();
  const isDark = themeMode === 'dark';
  
  // Smart Search Hook
  const { searchTerm, setSearchTerm, mode: searchMode, setMode: setSearchMode, results: products } = useSmartSearch('products');

  const { register, handleSubmit, reset, setValue } = useForm<Product>();

  useEffect(() => {
    if (editingProduct) {
      Object.keys(editingProduct).forEach((key) => {
        setValue(key as keyof Product, (editingProduct as any)[key]);
      });
    } else {
      reset({ gstRate: 5 });
    }
  }, [editingProduct, setValue, reset]);

  const onSubmit = async (data: Product) => {
    try {
      const formattedData = {
        ...data,
        mrp: Number(data.mrp),
        oldMrp: Number(data.oldMrp || data.mrp),
        purchaseRate: Number(data.purchaseRate),
        saleRate: Number(data.saleRate),
        stock: Number(data.stock),
        gstRate: Number(data.gstRate),
      };

      if (editingProduct?.id) {
        await db.products.update(editingProduct.id, formattedData);
        toast.success('Product updated');
      } else {
        await db.products.add(formattedData);
        toast.success('Product added');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (e) { toast.error('Error saving product'); }
  };

  const handleSmartImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const importedData = await parseExcel(file);
      if (importedData.length === 0) throw new Error("No valid data found");
      
      await db.products.bulkAdd(importedData);
      toast.success(`Smart Import: ${importedData.length} items added successfully!`);
      // Trigger reload of search index essentially by update
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      toast.error("Smart Import Failed. Check console.");
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  // OS Specific Styles
  const containerClass = os === 'windows' 
    ? "space-y-6" 
    : "space-y-4 pb-20"; // Android padding for FAB

  const cardClass = os === 'windows'
    ? clsx("rounded-lg border p-4 transition-all hover:bg-opacity-50", isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200")
    : clsx("rounded-[20px] p-5 shadow-sm mb-3", isDark ? "bg-[#1e1e1e]" : "bg-white");

  const btnPrimary = os === 'windows'
    ? "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-all shadow-sm"
    : "px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-medium shadow-md active:scale-95 transition-transform";

  return (
    <div className={containerClass}>
      {/* Header Area */}
      <div className={clsx("flex flex-col md:flex-row justify-between items-start md:items-center gap-4", os === 'windows' ? "p-4 backdrop-blur-md rounded-xl border border-white/10" : "")}>
        <div>
          <h2 className={clsx("font-bold", os === 'windows' ? "text-2xl" : "text-3xl")}>Inventory</h2>
          <p className={clsx("text-sm opacity-60")}>{products.length} Items Available</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <label className={clsx("cursor-pointer flex items-center justify-center gap-2", btnPrimary, "bg-slate-500")}>
            {isImporting ? <Database className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isImporting ? 'Mapping...' : 'Smart Import'}
            <input type="file" accept=".xlsx" className="hidden" onChange={handleSmartImport} disabled={isImporting} />
          </label>
          <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className={clsx("flex items-center justify-center gap-2 flex-1 md:flex-none", btnPrimary)}>
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Advanced Search Bar */}
      <div className="relative group z-10">
        <div className={clsx(
          "flex items-center gap-2 p-1 rounded-xl transition-all ring-2 ring-transparent focus-within:ring-blue-500",
          isDark ? "bg-white/5" : "bg-white border border-slate-200"
        )}>
          <SearchIcon className="ml-3 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Name, Batch, HSN..."
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
      </div>

      {/* Inventory Grid/List */}
      {os === 'windows' ? (
        <div className="rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-black/20">
           <table className="w-full text-left text-sm">
             <thead className={clsx("border-b", isDark ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-50 text-slate-500")}>
               <tr>
                 <th className="p-3 font-semibold">Product</th>
                 <th className="p-3 font-semibold">Batch</th>
                 <th className="p-3 font-semibold text-right">Stock</th>
                 <th className="p-3 font-semibold text-right">Rate</th>
                 <th className="p-3 text-center">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-white/5">
               {products.map(p => (
                 <tr key={p.id} className="hover:bg-blue-50/10 transition-colors">
                   <td className="p-3 font-medium">{p.name} <span className="text-[10px] opacity-50 block">{p.hsn}</span></td>
                   <td className="p-3 font-mono text-xs opacity-70">{p.batch}</td>
                   <td className="p-3 text-right">
                      <span className={clsx("px-2 py-0.5 rounded text-xs", p.stock < 50 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                        {p.stock}
                      </span>
                   </td>
                   <td className="p-3 text-right font-bold text-blue-600">₹{p.saleRate}</td>
                   <td className="p-3 flex justify-center gap-2">
                      <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}><Edit2 className="w-4 h-4 opacity-50 hover:opacity-100" /></button>
                      <button onClick={() => db.products.delete(p.id!)}><Trash2 className="w-4 h-4 text-red-500 opacity-50 hover:opacity-100" /></button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map(p => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={p.id} className={cardClass}>
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="font-bold text-lg">{p.name}</h3>
                   <p className="text-xs opacity-60">Batch: {p.batch} • Exp: {p.expiry}</p>
                 </div>
                 <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", p.stock < 50 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                   Stock: {p.stock}
                 </span>
               </div>
               <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                  <div>
                    <span className="text-xs opacity-50 block">Selling Rate</span>
                    <span className="text-xl font-bold text-blue-600">₹{p.saleRate}</span>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 bg-slate-100 dark:bg-white/10 rounded-xl"><Edit2 className="w-5 h-5" /></button>
                     <button onClick={() => db.products.delete(p.id!)} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal - Adaptive */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={clsx(
              "w-full max-w-lg max-h-[90vh] overflow-y-auto",
              os === 'windows' ? "bg-white dark:bg-[#2b2b2b] rounded-lg shadow-2xl border dark:border-white/10" : "bg-white dark:bg-[#1e1e1e] rounded-[32px]"
            )}
          >
            <div className="p-6 border-b dark:border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">Product Details</h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 space-y-1">
                   <label className="text-xs font-bold uppercase opacity-50">Name</label>
                   <input {...register('name')} className={clsx("w-full p-3 rounded-lg bg-transparent border focus:border-blue-500 outline-none", isDark ? "border-white/20" : "border-slate-200")} placeholder="Product Name" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold uppercase opacity-50">Batch</label>
                   <input {...register('batch')} className={clsx("w-full p-3 rounded-lg bg-transparent border focus:border-blue-500 outline-none", isDark ? "border-white/20" : "border-slate-200")} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold uppercase opacity-50">Expiry</label>
                   <input {...register('expiry')} className={clsx("w-full p-3 rounded-lg bg-transparent border focus:border-blue-500 outline-none", isDark ? "border-white/20" : "border-slate-200")} placeholder="YYYY-MM-DD" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold uppercase opacity-50">MRP</label>
                   <input type="number" step="0.01" {...register('mrp')} className={clsx("w-full p-3 rounded-lg bg-transparent border focus:border-blue-500 outline-none", isDark ? "border-white/20" : "border-slate-200")} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold uppercase opacity-50">Sale Rate</label>
                   <input type="number" step="0.01" {...register('saleRate')} className={clsx("w-full p-3 rounded-lg bg-transparent border focus:border-blue-500 outline-none", isDark ? "border-white/20" : "border-slate-200")} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold uppercase opacity-50">Stock</label>
                   <input type="number" {...register('stock')} className={clsx("w-full p-3 rounded-lg bg-transparent border focus:border-blue-500 outline-none", isDark ? "border-white/20" : "border-slate-200")} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold uppercase opacity-50">GST %</label>
                   <select {...register('gstRate')} className={clsx("w-full p-3 rounded-lg bg-transparent border focus:border-blue-500 outline-none", isDark ? "border-white/20 bg-[#2b2b2b]" : "border-slate-200")}>
                     <option value={5}>5%</option>
                     <option value={12}>12%</option>
                     <option value={18}>18%</option>
                     <option value={0}>0%</option>
                   </select>
                 </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold opacity-60 hover:opacity-100">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Save Item</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
