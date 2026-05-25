import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { MissVetChat } from "@/components/consultation/miss-vet-chat"

export const dynamic = "force-dynamic"

export default async function ConsultationChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/consultation/chat")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <MissVetChat />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
