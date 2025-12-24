
import * as XLSX from 'xlsx';

// Synonyms map for smart detection
const HEADER_MAP: Record<string, string[]> = {
  name: ['Product Name', 'Item Name', 'Description', 'Item', 'Medicine', 'Name', 'Product', 'Particulars'],
  batch: ['Batch No', 'Batch', 'Lot', 'B.No', 'BNo', 'Lot No'],
  expiry: ['Expiry Date', 'Exp Date', 'Expiry', 'Exp', 'Validity', 'Valid Upto'],
  hsn: ['HSN Code', 'HSN', 'SAC', 'HSN/SAC'],
  mrp: ['MRP', 'M.R.P.', 'Max Price', 'Maximum Retail Price', 'M.R.P'],
  purchaseRate: ['Purchase Rate', 'P.Rate', 'Cost', 'Buy Price', 'CP', 'Cost Price', 'Rate (Pur)', 'P Rate'],
  saleRate: ['Sale Rate', 'Selling Price', 'Rate', 'S.Rate', 'SP', 'Sell Price', 'Rate (Sale)', 'Billing Rate'],
  stock: ['Quantity', 'Qty', 'Stock', 'Balance', 'Opening Stock', 'Cl. Stock', 'Closing Stock', 'Units'],
  gstRate: ['GST', 'Tax', 'GST %', 'Tax Slab', 'IGST', 'Tax Rate'],
  manufacturer: ['Mfg', 'Company', 'Brand', 'Manufacturer', 'Make', 'Mkt by']
};

export const parseExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const mappedData = jsonData.map((row: any) => {
          const newRow: any = {};
          
          // Helper to find value based on synonyms
          const findValue = (key: string) => {
            const synonyms = HEADER_MAP[key];
            const rowKeys = Object.keys(row);
            
            // 1. Exact or Fuzzy Match
            for (const syn of synonyms) {
              const match = rowKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === syn.toLowerCase().replace(/[^a-z0-9]/g, ''));
              if (match) return row[match];
            }
            return undefined;
          };

          // Map fields
          newRow.name = String(findValue('name') || 'Unknown Item');
          newRow.batch = String(findValue('batch') || 'N/A');
          newRow.hsn = String(findValue('hsn') || '3004');
          newRow.manufacturer = String(findValue('manufacturer') || '');
          
          // Number cleaning
          const cleanNum = (val: any) => {
             const n = parseFloat(String(val).replace(/[^\d.-]/g, ''));
             return isNaN(n) ? 0 : n;
          };

          newRow.mrp = cleanNum(findValue('mrp'));
          newRow.purchaseRate = cleanNum(findValue('purchaseRate'));
          newRow.saleRate = cleanNum(findValue('saleRate'));
          newRow.stock = cleanNum(findValue('stock'));
          newRow.gstRate = cleanNum(findValue('gstRate')) || 5; // Default 5%
          
          // Date formatting
          const rawExp = findValue('expiry');
          if (typeof rawExp === 'number') {
             // Excel Serial Date
             const date = new Date((rawExp - 25569) * 86400 * 1000);
             newRow.expiry = date.toISOString().split('T')[0]; // YYYY-MM-DD
          } else {
             newRow.expiry = String(rawExp || '2025-12-31');
          }

          return newRow;
        });

        resolve(mappedData);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
