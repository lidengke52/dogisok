export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.dogisok.net"
).replace(/\/$/, "")

export function getArticleUrl(slug: string) {
  return `${SITE_URL}/articles/${slug}`
}
