
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
  const allData = useLiveQuery(() => (db as any)[collectionName].toArray(), [collectionName]);

  // Build Index
  useEffect(() => {
    if (allData && allData.length > 0) {
      const idx = createIndex();
      allData.forEach((item: any) => idx.add(item));
      setIndex(idx);
    }
  }, [allData]);

  // Perform Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(allData || []);
      return;
    }

    if (!allData) return;

    if (mode === 'fast' && index) {
      // FlexSearch
      const searchResultIds = index.search(searchTerm, { limit: 50 }).map((r: any) => r.id);
      // FlexSearch returns IDs or objects depending on config. Assuming IDs based on common usage, but our config uses `store: true` so it might return docs.
      // With `store: true` in FlexSearch.Document, result is [{field: 'name', result: [id1, id2]}]
      
      // Let's rely on filtering allData by the IDs returned if using simple index, 
      // OR simpler: just use filter for accurate and FlexSearch for fuzzy.
      
      // Re-implementing simplified logic for robustness:
      const matches = index.search(searchTerm, { limit: 50 });
      // FlexSearch Document search returns grouped results.
      // Flattening:
      const ids = new Set<number>();
      matches.forEach((fieldResult: any) => {
          fieldResult.result.forEach((id: number) => ids.add(id));
      });
      
      setResults(allData.filter((item: any) => ids.has(item.id)));
    } else {
      // Accurate (Exact Substring)
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = allData.filter((item: any) => {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(lowerTerm)
        );
      });
      setResults(filtered);
    }
  }, [searchTerm, mode, allData, index]);

  return { searchTerm, setSearchTerm, mode, setMode, results };
};
