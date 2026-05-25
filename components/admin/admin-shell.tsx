"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  Stethoscope,
  ShieldAlert,
  Pill,
  Dog,
  Users,
  Gift,
  Package,
  ShoppingBag,
  ExternalLink,
  Menu,
  X,
  LogOut,
  Sparkles,
  SearchCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/account/actions"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "概览",
    items: [{ href: "/admin", label: "控制台", icon: LayoutDashboard }],
  },
  {
    title: "内容运营",
    items: [
      { href: "/admin/articles", label: "文章管理", icon: FileText },
      { href: "/admin/product-ads", label: "首页广告位", icon: Megaphone },
      { href: "/admin/featured-cases", label: "问诊精选案例", icon: Stethoscope },
      { href: "/admin/featured-disease-cases", label: "自查精选案例", icon: ShieldAlert },
    ],
  },
  {
    title: "数据库",
    items: [
      { href: "/admin/medications", label: "药品库", icon: Pill },
      { href: "/admin/breeds", label: "犬种库", icon: Dog },
    ],
  },
  {
    title: "用户与订单",
    items: [
      { href: "/admin/users", label: "用户管理", icon: Users },
      { href: "/admin/gift-claims", label: "礼品申领", icon: Gift },
      { href: "/admin/product-claims", label: "产品申领", icon: Package },
      { href: "/admin/products", label: "商品/赠品库", icon: ShoppingBag },
    ],
  },
  {
    title: "系统设置",
    items: [
      { href: "/admin/seo", label: "SEO & 流量统计", icon: SearchCheck },
      { href: "/admin/ai-config/dr-max", label: "Dr.Max AI 配置", icon: Sparkles },
      { href: "/admin/ai-config/disease-check", label: "疾病自查 AI 配置", icon: ShieldAlert },
    ],
  },
]

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin"
  return pathname === href || pathname.startsWith(href + "/")
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.external && <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-14 items-center border-b border-border px-5">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <span>管理后台</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav pathname={pathname} />
        </div>
        <div className="border-t border-border p-3">
          <div className="rounded-md bg-muted/60 px-3 py-2 text-xs">
            <p className="text-muted-foreground">已登录</p>
            <p className="mt-0.5 truncate font-medium text-foreground" title={email}>
              {email}
            </p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" className="mt-2 w-full justify-start gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              退出登录
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-5">
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="font-semibold">
                管理后台
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="关闭">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-border p-3">
              <p className="px-1 pb-2 text-xs text-muted-foreground truncate">{email}</p>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <LogOut className="h-4 w-4" />
                  退出登录
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile only) */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="菜单">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">管理后台</span>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
