import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { api_url, api_key, model } = await request.json()

    if (!api_url || !api_key || !model) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 测试 API 连接
    const testPayload = {
      model,
      messages: [
        {
          role: "user",
          content: "test",
        },
      ],
      stream: false,
      max_tokens: 10,
    }

    const response = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${api_key}`,
      },
      body: JSON.stringify(testPayload),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[Dr.Max] API test failed:", error)
      return NextResponse.json(
        { error: `API returned status ${response.status}: ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    if (!data.choices) {
      return NextResponse.json(
        { error: "Invalid API response format" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, message: "Connection successful!" })
  } catch (error) {
    console.error("[Dr.Max] Connection test failed:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Connection test failed",
      },
      { status: 500 }
    )
  }
}
