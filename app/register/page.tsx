import { redirect } from "next/navigation"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const ref = typeof params.ref === "string" ? params.ref : ""
  const target = ref ? `/login?ref=${encodeURIComponent(ref)}` : "/login"
  redirect(target)
}
