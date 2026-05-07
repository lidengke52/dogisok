const { put } = require('@vercel/blob')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[v0] 缺少 Supabase 环境变量')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function uploadBreedImages() {
  const breeds = [
    { slug: 'chinese-small-dog-shaanxi', file: 'chinese-small-dog-shaanxi.jpg' },
    { slug: 'russian-wolfhound', file: 'russian-wolfhound.jpg' },
  ]

  for (const breed of breeds) {
    try {
      const filePath = path.join(process.cwd(), 'public/breeds', breed.file)
      const fileBuffer = await fs.readFile(filePath)
      const filename = `breeds/${Date.now()}-${breed.slug}.jpg`

      console.log(`[v0] 上传 ${breed.slug}...`)
      const blob = await put(filename, fileBuffer, {
        access: 'private',
        contentType: 'image/jpeg',
      })

      console.log(`[v0] 已上传: ${blob.url}`)

      // 更新数据库
      const { error } = await supabase
        .from('breeds')
        .update({ image: blob.url })
        .eq('slug', breed.slug)

      if (error) {
        console.error(`[v0] 更新 ${breed.slug} 失败:`, error)
      } else {
        console.log(`[v0] 已更新 ${breed.slug} 的图片 URL`)
      }
    } catch (err) {
      console.error(`[v0] 处理 ${breed.slug} 出错:`, err)
    }
  }

  console.log('[v0] 完成！')
}

uploadBreedImages().catch(console.error)
