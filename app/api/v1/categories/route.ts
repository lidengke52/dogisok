import { NextResponse } from "next/server"
import { apiCorsHeaders } from "@/lib/api-auth"

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: apiCorsHeaders() })
}

export async function GET() {
  const categories = [
    { slug: "food",     label: "Can Eat",    description: "What dogs can and cannot eat" },
    { slug: "behavior", label: "Can Do",     description: "Dog behavior & training" },
    { slug: "knowledge",label: "Knowledge",  description: "General dog care knowledge" },
    { slug: "breed",    label: "Breed Guide",description: "Dog breed guides & comparisons" },
    { slug: "health",   label: "Health",     description: "Dog health & veterinary advice" },
  ]
  return NextResponse.json({ data: categories }, { headers: apiCorsHeaders() })
}
