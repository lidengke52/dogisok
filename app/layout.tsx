import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Dog is OK — Professional Dog Care Knowledge for Global Pet Owners",
  description:
    "Health, Behavior, Nutrition & more — everything you need to know. Plus Dr. Max for instant guidance, trusted by dog parents worldwide.",
  icons: {
    icon: [{ url: "data:," }],
    shortcut: [{ url: "data:," }],
    apple: [{ url: "data:," }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
