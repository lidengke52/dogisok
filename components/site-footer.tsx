import Link from "next/link"
import { PawPrint, Facebook, Instagram, Twitter } from "lucide-react"

const footerNav = [
  {
    title: "Explore",
    links: [
      { name: "All Articles", href: "/articles" },
      { name: "Can They Eat It?", href: "/articles?category=food" },
      { name: "Can They Do It?", href: "/articles?category=behavior" },
      { name: "Knowledge Library", href: "/articles?category=knowledge" },
    ],
  },
  {
    title: "Tools",
    links: [
      { name: "Dr. Max", href: "/consultation" },
      { name: "Disease Self-Check", href: "/disease-check" },
      { name: "Breed Guide", href: "/breeds" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <PawPrint className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg tracking-tight">Dog is OK</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Professional dog care knowledge for global pet owners. Health, behavior, nutrition and more, written by
              veterinarians and trusted by dog parents worldwide.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-[#1877F2]"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-[#E4405F]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-[#1DA1F2]"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {footerNav.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>&copy; 2026 Dog is OK. All rights reserved.</p>
          <p className="max-w-xl md:text-right">
            Medical Disclaimer: AI consultation results are informational only and do not replace professional
            veterinary diagnosis.
          </p>
        </div>
      </div>
    </footer>
  )
}
