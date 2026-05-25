import { NextRequest, NextResponse } from 'next/server'
import { read, utils } from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

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

function normalizeSize(raw: string): string {
  const map: Record<string, string> = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
  }
  return map[raw.toLowerCase().trim()] ?? 'Medium'
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = read(buffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' })

    if (rows.length < 2) {
      return NextResponse.json({ error: '文件内容为空' }, { status: 400 })
    }

    // 读取表头，自动识别列索引
    const headerRow = (rows[0] as any[]).map((h: any) => h?.toString().toLowerCase().trim())

    const colIndex = (keywords: string[]) => {
      const idx = headerRow.findIndex((h: string) => keywords.some((k) => h.includes(k)))
      return idx >= 0 ? idx : -1
    }

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

    const breeds = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as any[]
      if (!row[0] && !row[1]) continue

      breeds.push({
        cn_name:       get(row, iCn,       0),
        name:          get(row, iName,     1),
        summary:       get(row, iSummary,  2),
        origin:        get(row, iOrigin,   3),
        lifespan:      get(row, iLifespan, 4),
        weight:        get(row, iWeight,   5),
        height:        get(row, iHeight,   6),
        temperament:   get(row, iTemp,     7),
        care_notes:    get(row, iCare,     8),
        common_health: get(row, iHealth,   9),
        group_name:    normalizeGroup(get(row, iGroup,    10)),
        size:          normalizeSize(get(row, iSize,      11)),
        trainability:  parseInt(get(row, iTrain,    12)) || 3,
        shedding:      parseInt(get(row, iShed,     13)) || 3,
        exercise:      parseInt(get(row, iExercise, 14)) || 3,
        good_with_kids: /yes|true|1|是/.test(get(row, iKids, 15).toLowerCase()),
      })
    }

    return NextResponse.json({ breeds, total: breeds.length })
  } catch (error) {
    console.error('[v0] Parse error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '解析失败' },
      { status: 500 }
    )
  }
}
