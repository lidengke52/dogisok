import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { getSiteSettings } from "@/lib/site-settings"
import { SeoSettingsForm } from "@/components/admin/seo-settings-form"

export const dynamic = "force-dynamic"

export default async function SeoSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login?redirect=/admin/seo")
  if (!(await isAdmin(user.id))) redirect("/")

  const settings = await getSiteSettings()

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">SEO &amp; 流量统计</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          配置全站搜索引擎优化参数和 Google Analytics 流量统计代码
        </p>
      </div>

      <SeoSettingsForm initial={settings} />
    </div>
  )
}
