"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Articles", href: "/articles" },
  { name: "Can Eat", href: "/articles?category=can-eat" },
  { name: "Breeds", href: "/breeds" },
  { name: "Self-Check", href: "/disease-check" },
  { name: "Medications", href: "/medication-check" },
  { name: "Dr. Max", href: "/consultation" },
  { name: "About", href: "/about" },
]

export function HeaderClient({ isAuthed, email }: { isAuthed: boolean; email: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {isAuthed ? (
          <Button variant="outline" size="sm" className="hidden md:inline-flex gap-1.5" asChild>
            <Link href="/account">
              <User className="h-4 w-4" />
              {email?.split("@")[0] ?? "Account"}
            </Link>
          </Button>
        ) : (
          <Button size="sm" className="hidden md:inline-flex" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        )}

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-16 border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3" aria-label="Mobile">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {isAuthed ? (
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/account">My account</Link>
                </Button>
              ) : (
                <Button size="sm" className="flex-1" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
