import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Sign-in required to upload images." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 8 MB or smaller." }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF, or HEIC images are allowed." }, { status: 400 })
    }

    // Use a per-user prefix so admins can audit by owner if needed.
    const safeName = file.name.replace(/[^\w.\-]+/g, "_")
    const pathname = `disease-check/${user.id}/${Date.now()}-${safeName}`

    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: true,
    })

    return NextResponse.json({
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: file.size,
      name: file.name,
    })
  } catch (error) {
    console.error("[disease-check/upload] error:", error)
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}
