import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { BreedForm } from "@/components/admin/breed-form"
import { getBreed } from "@/lib/breeds"

export const dynamic = "force-dynamic"
export const metadata = { title: "编辑品种 · 管理后台" }

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function EditBreedPage({ params }: PageProps) {
  const { slug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const breed = await getBreed(slug)
  if (!breed) notFound()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">编辑品种</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">/breeds/{breed.slug}</p>
      </div>
      <BreedForm mode="edit" breed={breed} slug={slug} />
    </div>
  )
}
