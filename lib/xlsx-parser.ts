import { read, utils } from 'xlsx';

export interface BreedRow {
  cn_name?: string;
  name?: string;
  summary?: string;
  origin?: string;
  lifespan?: string;
  weight?: string;
  height?: string;
  temperament?: string;
  care_notes?: string;
  common_health?: string;
  group_name?: string;
  size?: string;
  trainability?: number;
  shedding?: number;
  exercise?: number;
  good_with_kids?: boolean;
}

/**
 * Parse XLSX/CSV file and return breed records
 */
export async function parseBreedFile(file: File): Promise<BreedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = utils.sheet_to_json<BreedRow>(worksheet, {
          header: 1,
          defval: '',
        });

        // Skip header row and process data
        const breeds: BreedRow[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as any[];
          if (!row[0]) continue; // Skip empty rows
          
          breeds.push({
            cn_name: row[0]?.toString().trim() || '',
            name: row[1]?.toString().trim() || '',
            summary: row[2]?.toString().trim() || '',
            origin: row[3]?.toString().trim() || '',
            lifespan: row[4]?.toString().trim() || '',
            weight: row[5]?.toString().trim() || '',
            height: row[6]?.toString().trim() || '',
            temperament: row[7]?.toString().trim() || '',
            care_notes: row[8]?.toString().trim() || '',
            common_health: row[9]?.toString().trim() || '',
            group_name: row[10]?.toString().trim() || '',
            size: row[11]?.toString().trim() || '',
            trainability: parseInt(row[12]) || 0,
            shedding: parseInt(row[13]) || 0,
            exercise: parseInt(row[14]) || 0,
            good_with_kids: row[15]?.toString().toLowerCase() === 'yes',
          });
        }

        resolve(breeds);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convert breed name to slug (URL-friendly format)
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
}

/**
 * Parse array string from CSV (e.g. "item1, item2, item3")
 */
export function parseArrayField(value: string): string[] {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}
