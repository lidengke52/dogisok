import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeatureBento } from "@/components/home/feature-bento"
import { ProductShowcase } from "@/components/home/product-showcase"
import { ClaimScrollbar } from "@/components/home/claim-scrollbar"
import { FeaturedArticles } from "@/components/home/featured-articles"
import { TrustSection } from "@/components/home/trust-section"
import { NewsletterCta } from "@/components/home/newsletter-cta"
import { ProductAdSlot } from "@/components/ads/product-ad-card"
import { getProductAdsByPlacement } from "@/lib/product-ads"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const homeAds = await getProductAdsByPlacement("home", 1)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeatureBento />
        <TrustSection />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductShowcase />
        </div>
        <ProductAdSlot ads={homeAds} />
        <ClaimScrollbar />
        <FeaturedArticles />
        <NewsletterCta />
      </main>
      <SiteFooter />
    </div>
  )
}
