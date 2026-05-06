import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Users,
  FileText,
  Pill,
  Megaphone,
  Stethoscope,
  ShieldAlert,
  Gift,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export const metadata = { title: "控制台 · 管理后台" }

async function loadStats() {
  const supabase = await createClient()
  const headOnly = { count: "exact" as const, head: true }

  const [
    profilesRes,
    articlesTotalRes,
    articlesPubRes,
    medicationsRes,
    medicationsForbiddenRes,
    giftPendingRes,
    giftAllRes,
    productClaimsRes,
    productAdsActiveRes,
    featuredCasesRes,
    featuredDiseaseRes,
    productsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*", headOnly),
    supabase.from("articles").select("*", headOnly),
    supabase.from("articles").select("*", headOnly).eq("published", true),
    supabase.from("medications").select("*", headOnly),
    supabase.from("medications").select("*", headOnly).eq("category", "forbidden"),
    supabase.from("gift_claims").select("*", headOnly).eq("status", "pending"),
    supabase.from("gift_claims").select("*", headOnly),
    supabase.from("product_claims").select("*", headOnly),
    supabase.from("product_ads").select("*", headOnly).eq("is_active", true),
    supabase.from("featured_cases").select("*", headOnly).eq("is_active", true),
    supabase.from("featured_disease_cases").select("*", headOnly).eq("is_active", true),
    supabase.from("products").select("*", headOnly),
  ])

  return {
    profiles: profilesRes.count ?? 0,
    articlesTotal: articlesTotalRes.count ?? 0,
    articlesPublished: articlesPubRes.count ?? 0,
    medications: medicationsRes.count ?? 0,
    medicationsForbidden: medicationsForbiddenRes.count ?? 0,
    giftPending: giftPendingRes.count ?? 0,
    giftAll: giftAllRes.count ?? 0,
    productClaims: productClaimsRes.count ?? 0,
    productAdsActive: productAdsActiveRes.count ?? 0,
    featuredCases: featuredCasesRes.count ?? 0,
    featuredDisease: featuredDiseaseRes.count ?? 0,
    products: productsRes.count ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  if (!(await isAdmin(user.id))) redirect("/")

  const stats = await loadStats()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">控制台</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance">
          欢迎回来
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          这里汇总了平台的关键运营数据和管理入口。左侧导航可快速进入对应模块。
        </p>
      </header>

      {/* KPI Row */}
      <section aria-labelledby="kpi-heading" className="mb-10">
        <h2 id="kpi-heading" className="sr-only">
          关键指标
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <KpiCard
            label="注册用户"
            value={stats.profiles}
            hint="含邀请关系"
            icon={<Users className="h-4 w-4" />}
            href="/admin/users"
          />
          <KpiCard
            label="药品库"
            value={stats.medications}
            hint={`其中禁用 ${stats.medicationsForbidden}`}
            icon={<Pill className="h-4 w-4" />}
            href="/admin/medications"
          />
          <KpiCard
            label="文章总数"
            value={stats.articlesTotal}
            hint={`已发布 ${stats.articlesPublished}`}
            icon={<FileText className="h-4 w-4" />}
            href="/admin/articles"
          />
          <KpiCard
            label="待处理礼品申领"
            value={stats.giftPending}
            hint={`累计 ${stats.giftAll}`}
            icon={<Gift className="h-4 w-4" />}
            href="/admin/gift-claims"
            highlight={stats.giftPending > 0}
          />
          <KpiCard
            label="产品申领"
            value={stats.productClaims}
            hint="转链型免费领取"
            icon={<Package className="h-4 w-4" />}
            href="/admin/product-claims"
          />
          <KpiCard
            label="启用广告位"
            value={stats.productAdsActive}
            hint="首页 / 文章 / 问诊"
            icon={<Megaphone className="h-4 w-4" />}
            href="/admin/product-ads"
          />
          <KpiCard
            label="问诊精选"
            value={stats.featuredCases}
            hint="启用中"
            icon={<Stethoscope className="h-4 w-4" />}
            href="/admin/featured-cases"
          />
          <KpiCard
            label="自查精选"
            value={stats.featuredDisease}
            hint="启用中"
            icon={<ShieldAlert className="h-4 w-4" />}
            href="/admin/featured-disease-cases"
          />
        </div>
      </section>

      {/* Function Sections */}
      <section className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="内容运营"
          description="发布文章、配置广告位、维护问诊与自查精选展示。"
          actions={[
            { href: "/admin/articles/new", label: "撰写新文章" },
            { href: "/admin/product-ads/new", label: "新增广告" },
          ]}
          links={[
            { href: "/admin/articles", label: "文章管理", icon: FileText, count: stats.articlesTotal },
            { href: "/admin/product-ads", label: "首页广告位", icon: Megaphone, count: stats.productAdsActive },
            { href: "/admin/featured-cases", label: "问诊精选案例", icon: Stethoscope, count: stats.featuredCases },
            {
              href: "/admin/featured-disease-cases",
              label: "自查精选案例",
              icon: ShieldAlert,
              count: stats.featuredDisease,
            },
          ]}
        />

        <SectionCard
          title="药品数据库"
          description={`已收录 ${stats.medications} 条药品资料，支持 CSV / Excel 批量导入与中文表头识别。`}
          actions={[
            { href: "/admin/medications/new", label: "新增药品" },
            { href: "/admin/medications/import", label: "批量导入" },
          ]}
          links={[{ href: "/admin/medications", label: "药品库", icon: Pill, count: stats.medications }]}
        />

        <SectionCard
          title="用户与订单"
          description="查看注册用户、处理礼品与产品申领、维护赠品商品库。"
          actions={[{ href: "/admin/users", label: "查看用户" }]}
          links={[
            { href: "/admin/users", label: "用户管理", icon: Users, count: stats.profiles },
            {
              href: "/admin/gift-claims",
              label: "礼品申领",
              icon: Gift,
              count: stats.giftAll,
              badge: stats.giftPending,
            },
            { href: "/admin/product-claims", label: "产品申领", icon: Package, count: stats.productClaims },
            { href: "/admin/products", label: "商品 / 赠品库", icon: ShoppingBag, count: stats.products },
          ]}
        />
      </section>
    </div>
  )
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  href,
  highlight = false,
}: {
  label: string
  value: number
  hint?: string
  icon: React.ReactNode
  href: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</span>
        {highlight && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <TrendingUp className="h-3 w-3" />
            待处理
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Link>
  )
}

type SectionLink = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
  badge?: number
}

function SectionCard({
  title,
  description,
  actions,
  links,
}: {
  title: string
  description: string
  actions: { href: string; label: string }[]
  links: SectionLink[]
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {actions.map((a) => (
            <Button key={a.href} asChild size="sm" variant="default">
              <Link href={a.href}>{a.label}</Link>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {links.map((l) => {
            const Icon = l.icon
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate font-medium text-foreground">{l.label}</span>
                  {l.badge !== undefined && l.badge > 0 && (
                    <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      待 {l.badge}
                    </span>
                  )}
                  {l.count !== undefined && (
                    <span className="text-xs tabular-nums text-muted-foreground">{l.count}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
