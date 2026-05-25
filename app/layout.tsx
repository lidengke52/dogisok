import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { getSiteSettings } from "@/lib/site-settings"
import { GoogleAnalytics } from "@/components/google-analytics"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: settings.site_title,
    description: settings.site_description,
    keywords: settings.site_keywords,
    robots: settings.robots_index === "false" ? "noindex, nofollow" : "index, follow",
    alternates: {
      canonical: settings.canonical_url || undefined,
    },
    openGraph: {
      title: settings.site_title,
      description: settings.site_description,
      images: settings.og_image ? [{ url: settings.og_image }] : [],
      url: settings.canonical_url || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.site_title,
      description: settings.site_description,
      images: settings.og_image ? [settings.og_image] : [],
    },
    icons: {
      icon: [{ url: "data:," }],
      shortcut: [{ url: "data:," }],
      apple: [{ url: "data:," }],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSiteSettings()

  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {settings.ga_measurement_id && (
          <GoogleAnalytics measurementId={settings.ga_measurement_id} />
        )}
      </body>
    </html>
  )
}
