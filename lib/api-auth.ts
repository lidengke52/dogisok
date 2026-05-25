import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/api-keys"

export async function authenticateApiRequest(
  req: NextRequest
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const authHeader = req.headers.get("authorization")
  const apiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!apiKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing Authorization header. Use: Authorization: Bearer <api_key>" },
        { status: 401 }
      ),
    }
  }

  const valid = await verifyApiKey(apiKey)
  if (!valid) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid or revoked API key." },
        { status: 403 }
      ),
    }
  }

  return { ok: true }
}

export function apiCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Content-Type": "application/json",
  }
}
