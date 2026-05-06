import Link from "next/link"
import { PawPrint } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { HeaderClient } from "@/components/site-header-client"

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PawPrint className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg tracking-tight">Dog is OK</span>
        </Link>

        <HeaderClient isAuthed={Boolean(user)} email={user?.email ?? null} />
      </div>
    </header>
  )
}
