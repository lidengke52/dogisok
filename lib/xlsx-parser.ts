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

        // 读取表头行，自动识别列索引
        const headerRow = (rows[0] as any[]).map((h: any) =>
          h?.toString().toLowerCase().trim()
        )
        console.log("[v0] Header row:", headerRow)

        // 列名关键词映射
        const colIndex = (keywords: string[]) => {
          const idx = headerRow.findIndex((h) =>
            keywords.some((k) => h.includes(k))
          )
          return idx >= 0 ? idx : -1
        }

        // 根据表头自动定位列，找不到时按位置回退
        const iCn       = colIndex(['中文', 'chinese name', 'cn_name'])
        const iName     = colIndex(['英文', 'english name', 'name', 'breed'])
        const iSummary  = colIndex(['描述', 'summary', 'description'])
        const iOrigin   = colIndex(['原产', 'origin', 'country'])
        const iLifespan = colIndex(['寿命', 'lifespan', 'life'])
        const iWeight   = colIndex(['体重', 'weight'])
        const iHeight   = colIndex(['身高', 'height'])
        const iTemp     = colIndex(['性格', 'temperament', 'character'])
        const iCare     = colIndex(['护理', 'care'])
        const iHealth   = colIndex(['疾病', 'health', 'disease'])
        const iGroup    = colIndex(['分类', 'group', 'grouping'])
        const iSize     = colIndex(['体型', 'size', 'body'])
        const iTrain    = colIndex(['训练', 'train'])
        const iShed     = colIndex(['掉毛', 'shed'])
        const iExercise = colIndex(['运动', 'exercise'])
        const iKids     = colIndex(['孩子', 'kids', 'children'])

        const get = (row: any[], auto: number, fallback: number) => {
          const idx = auto >= 0 ? auto : fallback
          return row[idx]?.toString().trim() || ''
        }

        // Skip header row and process data
        const breeds: BreedRow[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as any[];
          // 跳过空行（第一列和第二列都为空）
          if (!row[0] && !row[1]) continue;
          
          breeds.push({
            cn_name:     get(row, iCn,       0),
            name:        get(row, iName,     1),
            summary:     get(row, iSummary,  2),
            origin:      get(row, iOrigin,   3),
            lifespan:    get(row, iLifespan, 4),
            weight:      get(row, iWeight,   5),
            height:      get(row, iHeight,   6),
            temperament: get(row, iTemp,     7),
            care_notes:  get(row, iCare,     8),
            common_health: get(row, iHealth, 9),
            group_name:  normalizeGroup(get(row, iGroup,    10)),
            size:        normalizeSize(get(row, iSize,      11)),
            trainability: parseInt(get(row, iTrain,    12)) || 3,
            shedding:     parseInt(get(row, iShed,     13)) || 3,
            exercise:     parseInt(get(row, iExercise, 14)) || 3,
            good_with_kids: /yes|true|1|是/.test(
              get(row, iKids, 15).toLowerCase()
            ),
          });
        }

        console.log("[v0] Parsed breeds count:", breeds.length)
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
