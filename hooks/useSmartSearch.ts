
import { useState, useEffect } from 'react';
import { createIndex } from '../utils/searchEngine';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useSmartSearch = (collectionName: 'products' | 'parties') => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'fast' | 'accurate'>('fast');
  const [results, setResults] = useState<any[]>([]);
  const [index, setIndex] = useState<any>(null);

  // Load all data for indexing
  // Note: For extremely large datasets (>50k), we should paginate this query too, 
  // but for client-side search <10k, loading into memory is acceptable if we limit rendering.
  const allData = useLiveQuery(() => (db as any)[collectionName].toArray(), [collectionName]);

  // Build Index
  useEffect(() => {
    if (allData && allData.length > 0) {
      // Run indexing in a timeout to unblock main thread allowing UI to paint first
      const t = setTimeout(() => {
        const idx = createIndex();
        allData.forEach((item: any) => idx.add(item));
        setIndex(idx);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [allData]);

  // Perform Search
  useEffect(() => {
    if (!allData) return;

    // 1. Empty Search: Return top 100 items only to prevent rendering freeze
    if (!searchTerm.trim()) {
      setResults(allData.slice(0, 100));
      return;
    }

    // 2. Fast Search (Fuzzy)
    if (mode === 'fast' && index) {
      const matches = index.search(searchTerm, { limit: 100 }); // Limit search results at source
      const ids = new Set<number>();
      matches.forEach((fieldResult: any) => {
          fieldResult.result.forEach((id: number) => ids.add(id));
      });
      
      const matchedItems = allData.filter((item: any) => ids.has(item.id));
      setResults(matchedItems);
    } 
    // 3. Accurate Search (Exact)
    else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = allData.filter((item: any) => {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(lowerTerm)
        );
      });
      // Limit accurate results to 100 to prevent crash on broad queries (e.g. "a")
      setResults(filtered.slice(0, 100));
    }
  }, [searchTerm, mode, allData, index]);

  return { searchTerm, setSearchTerm, mode, setMode, results };
};
