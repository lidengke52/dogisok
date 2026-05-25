import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Heart, Shield, Users, Zap, BookOpen, Stethoscope, Share2, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Dog is OK — Our Mission & Team",
  description: "Learn about Dog is OK, our mission to empower dog owners with reliable pet care information and AI tools.",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border/40 bg-gradient-to-br from-primary/5 via-background to-background py-12 md:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6 text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
                Every Dog Deserves to Be <span className="text-primary">OK</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Professional, timely, and trustworthy health care for your beloved companion
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 md:py-16 border-b border-border/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  At Dog is OK, we believe:
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 text-primary mt-1">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <p className="text-lg">
                      <strong>Every dog owner deserves a readily available "pet care brain trust"</strong>
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 text-primary mt-1">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <p className="text-lg">
                      <strong>Every dog deserves care that combines science with compassion</strong>
                    </p>
                  </li>
                </ul>
              </div>

              <div className="bg-accent/50 rounded-lg p-6 md:p-8 border border-border/40">
                <h3 className="text-xl font-semibold mb-4">The Problem We Solve</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Pet owners often face a dilemma: A typical vet visit can be time-consuming and costly, while online information is full of unreliable sources that are hard to distinguish. We founded Dog is OK to fill this gap — a free dog health and lifestyle platform that combines a knowledge base + AI tools + community incentives.
                </p>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                <strong>Our mission is simple:</strong> Through reliable information, intelligent tools, and a warm community, we empower every dog owner to confidently care for their beloved pet, and to receive guidance promptly when professional help is truly needed.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-12 md:py-16 border-b border-border/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight mb-12">What Dog is OK Can Do for You and Your Dog</h2>

            <div className="space-y-8">
              {/* Feature 1 */}
              <div className="border border-border/40 rounded-lg p-6 md:p-8 hover:border-primary/40 transition-colors">
                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0 text-primary">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold">Comprehensive Dog Care Encyclopedia</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Breed Database • Training Guides • Behavior Interpretation • Health & Care
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• 300+ dog breeds with complete profiles</li>
                  <li>• Step-by-step training guides from basics to advanced</li>
                  <li>• Understanding behavior patterns and solutions</li>
                  <li>• Vaccination schedules, nutrition planning, and grooming</li>
                  <li>• All written by veterinary advisors and certified trainers</li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="border border-border/40 rounded-lg p-6 md:p-8 hover:border-primary/40 transition-colors">
                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0 text-primary">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold">Self-Check Tools</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Quick assessment tools for medications and symptoms
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• <strong>Medication Self-Check:</strong> Learn about uses, dosages, side effects</li>
                  <li>• <strong>Disease Self-Check:</strong> Analyze symptoms and get severity ratings</li>
                  <li>• Perfect for nights, holidays, or when you can't reach a vet immediately</li>
                  <li>• Helps you make initial assessments and avoid unnecessary anxiety</li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="border border-border/40 rounded-lg p-6 md:p-8 hover:border-primary/40 transition-colors">
                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0 text-primary">
                    <Stethoscope className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold">Dr.Max Pet Doctor AI</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  24/7 AI pet doctor assistant exclusively designed for dogs
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Chat-like interface for describing your concerns</li>
                  <li>• Get preliminary analysis and care suggestions</li>
                  <li>• Guidance on whether in-person vet visit is needed</li>
                  <li>• Based on large-scale canine medical data and AI models</li>
                </ul>
              </div>

              {/* Feature 4 */}
              <div className="border border-border/40 rounded-lg p-6 md:p-8 hover:border-primary/40 transition-colors">
                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0 text-primary">
                    <Share2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold">Referral Rewards Program</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Knowledge has value, sharing has rewards
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Each user gets a unique referral link and code</li>
                  <li>• Share with friends and earn rewards when they sign up</li>
                  <li>• Earn free dog care products (treats, toys, grooming supplies)</li>
                  <li>• Currently 1 per person, gifting campaigns adjusted regularly</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* About ChoHeel */}
        <section className="py-12 md:py-16 border-b border-border/40 bg-accent/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight mb-6">About ChoHeel Co., Ltd.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Dog is OK is a core brand under ChoHeel Co., Ltd., an innovative company dedicated to pet health technology and education, headquartered in Colorado, USA.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The company brings together pet medical consultants, data scientists, canine behavior experts, and content planning teams, committed to combining cutting-edge artificial intelligence technology with evidence-based veterinary knowledge to create digital tools that are truly useful for pet owners.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 md:py-16 border-b border-border/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight mb-12">Our Team</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Behind Dog is OK is a group of people who love dogs:
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-lg border border-border/40">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold">Dr. Emily Jane — Chief Veterinary Advisor</h4>
                  <p className="text-sm text-muted-foreground">Licensed veterinarian with 10 years of small animal clinical experience</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg border border-border/40">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold">Max Chen — AI Product Lead</h4>
                  <p className="text-sm text-muted-foreground">Former medical AI algorithm engineer with 15 years of dog-keeping experience</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg border border-border/40">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold">Trainer Ly — Behavior and Training Editor-in-Chief</h4>
                  <p className="text-sm text-muted-foreground">National Senior Dog Trainer, CPDT certified</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg border border-border/40">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold">And every "pet parent" on our team</h4>
                  <p className="text-sm text-muted-foreground">Content, operations, and engineering teams united by love for dogs</p>
                </div>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mt-8 leading-relaxed">
              <em>We do not see ourselves as a cold platform, but as your partner in dog ownership.</em>
            </p>
          </div>
        </section>

        {/* Why Trust Section */}
        <section className="py-12 md:py-16 border-b border-border/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight mb-12">Why Trust Dog is OK?</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-border/40 p-6">
                <div className="flex gap-3 mb-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-lg">Reliable Content</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  All text and self-check logic are reviewed by our veterinary team — no fabrication, no exaggeration.
                </p>
              </div>

              <div className="rounded-lg border border-border/40 p-6">
                <div className="flex gap-3 mb-3">
                  <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-lg">Free-First Approach</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Core features (breed database, articles, self-check, Dr.Max) are permanently free.
                </p>
              </div>

              <div className="rounded-lg border border-border/40 p-6">
                <div className="flex gap-3 mb-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-lg">Privacy Respect</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  We rigorously protect your pet health data and personal information — we do not sell data to third parties.
                </p>
              </div>

              <div className="rounded-lg border border-border/40 p-6">
                <div className="flex gap-3 mb-3">
                  <Stethoscope className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-lg">No Replacement for Diagnosis</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  We consistently uphold that AI cannot replace a real veterinarian, guiding users to seek timely professional care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-primary/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Join Us and Make "Dog is OK" a Reality</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Whether you are a new dog parent or an experienced owner looking to improve your pet care skills, Dog is OK welcomes you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                Get Started Free
              </Link>
              <Link href="/dr-max" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border bg-background text-foreground font-semibold hover:bg-accent transition-colors">
                Try Dr.Max
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
