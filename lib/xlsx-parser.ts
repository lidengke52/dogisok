import { read, utils } from 'xlsx';

/** 将 CSV 里的分组值标准化为系统允许的值
 * 支持：hound / Hound / HOUND / NON-sporting / non-sporting / Non-Sporting 等
 */
function normalizeGroup(raw: string): string {
  const map: Record<string, string> = {
    sporting: 'Sporting',
    herding: 'Herding',
    working: 'Working',
    toy: 'Toy',
    terrier: 'Terrier',
    hound: 'Hound',
    'non-sporting': 'Non-Sporting',
    nonsporting: 'Non-Sporting',
    'non sporting': 'Non-Sporting',
  }
  return map[raw.toLowerCase().replace(/\s+/g, ' ').trim()] ?? 'Non-Sporting'
}

/** 将 CSV 里的体型值标准化：small/medium/large -> Small/Medium/Large */
function normalizeSize(raw: string): string {
  const map: Record<string, string> = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
  }
  return map[raw.toLowerCase().trim()] ?? 'Medium'
}

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
            // 精确映射：NON-sporting / hound / working 等 -> 系统允许的值
            group_name: normalizeGroup(row[10]?.toString() || ''),
            size: normalizeSize(row[11]?.toString() || ''),
            trainability: parseInt(row[12]) || 3,
            shedding: parseInt(row[13]) || 3,
            exercise: parseInt(row[14]) || 3,
            good_with_kids: /yes|true|1|是/.test(row[15]?.toString().toLowerCase() || ''),
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
