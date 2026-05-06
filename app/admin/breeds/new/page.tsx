import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { BreedForm } from "@/components/admin/breed-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "新增品种 · 管理后台" }

export default async function NewBreedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">新增品种</h1>
      <BreedForm mode="create" />
    </div>
  )
}
