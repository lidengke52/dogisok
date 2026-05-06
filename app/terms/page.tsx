import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Dog is OK",
  description: "Terms of Service for Dog is OK website and services.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:px-8 lg:py-16">
        <article className="prose prose-sm max-w-none dark:prose-invert">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
            <p className="mt-2 text-muted-foreground">Last Updated: Jan 6, 2026</p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-6 my-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">Quick Navigation</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#service-description" className="text-primary hover:underline">1. Service Description</a></li>
              <li><a href="#acceptance" className="text-primary hover:underline">2. Acceptance of Terms</a></li>
              <li><a href="#registration" className="text-primary hover:underline">3. User Registration and Account Security</a></li>
              <li><a href="#referral" className="text-primary hover:underline">4. Referral Program</a></li>
              <li><a href="#conduct" className="text-primary hover:underline">5. User Code of Conduct</a></li>
              <li><a href="#disclaimer" className="text-primary hover:underline">6-9. Disclaimers & Liability</a></li>
              <li><a href="#contact" className="text-primary hover:underline">13. Contact Information</a></li>
            </ul>
          </div>

          <p className="text-base leading-relaxed text-foreground">
            Welcome to the Dog is OK Website (hereinafter referred to as "this Website" or "Dog is OK"). This Website 
            is operated by ChoHeel Co., Ltd (hereinafter referred to as "we", "the Company", or "the Platform").
          </p>

          <p className="text-base text-muted-foreground font-semibold">
            Please read these Terms of Service carefully before using this Website. By accessing, browsing, or using 
            any content, features, or services of this Website (including registering an account, using AI consultation, 
            and participating in the referral program), you agree to comply with these Terms of Service and all supplementary terms.
          </p>

          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 p-4 my-8">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Important:</strong> If you do not agree with these terms, please do not use this Website.
            </p>
          </div>

          <section id="service-description" className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Service Description</h2>
            <p>
              Dog is OK provides the following information and services (collectively referred to as "Services") for pet owners:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Dog breeds, training, behavior, health, and care:</strong> Articles, guides, tools, and community content, for general pet-keeping knowledge reference only.</li>
              <li><strong>Dog Medication Self-Check / Dog Disease Self-Check:</strong> Interactive self-assessment tools to help users understand possible medication information or symptom directions; they do not provide diagnosis or treatment advice.</li>
              <li><strong>Dr.Max Pet Doctor AI Consultation:</strong> An AI-powered Q&A service that generates preliminary reference information based on user input.</li>
              <li><strong>Referral Registration Program:</strong> Each registered user can obtain a unique referral link and referral code. After successfully referring 20 new users who meet the conditions, the referrer can receive a specified product for free.</li>
            </ul>
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 p-4 mt-4">
              <p className="text-sm text-red-900 dark:text-red-100">
                <strong>Disclaimer:</strong> None of the above services constitute professional veterinary diagnosis, treatment, 
                or prescription. Your relationship with an actual veterinarian is not affected by this Website.
              </p>
            </div>
          </section>

          <section id="acceptance" className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Acceptance of Terms</h2>
            <p>You confirm that:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>You are at least 18 years old, or have obtained parental/guardian consent</li>
              <li>All information you provide is true, accurate, and complete</li>
              <li>You will review terms updates from time to time. Continued use constitutes acceptance of the updated terms</li>
            </ul>
          </section>

          <section id="registration" className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. User Registration and Account Security</h2>
            <p>Registration is required to use certain features such as Dr.Max consultation, medication self-check, and referral program.</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>You must provide a valid email address and successfully receive a 6-digit verification code for registration and login</li>
              <li>Each user may only have one account. You may not transfer, lend, or sell your account to others</li>
              <li>You are responsible for all activities under your account. If you discover unauthorized use, please contact us immediately</li>
              <li>We reserve the right to refuse registration or close any account without prior notice</li>
            </ul>
          </section>

          <section id="referral" className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Referral Links and Referral Code Program</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4.1 How to Participate</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Log in and obtain your unique link or referral code from the "Referral Rewards" page</li>
              <li>Share it with individuals who have not yet registered for Dog is OK</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4.2 Reward Conditions</h3>
            <p>The referrer can receive a specified product for free when all of the following conditions are met:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>The referred user completes registration via your unique link or by entering your referral code</li>
              <li>The referred user is a genuine and valid individual user (same device, same email/phone number can only count once)</li>
              <li>The referred user uses Dr.Max consultation or completes a disease self-check at least once within 7 days after their first registration</li>
              <li>Both parties' accounts are in normal status (not suspended or frozen)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4.3 Reward Limitations</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Each referrer can receive a maximum of 1 free product (may be adjusted for different campaign periods)</li>
              <li>Each referred user can only be credited to one referrer</li>
              <li>Free products cannot be exchanged for cash or transferred</li>
              <li>Products are limited in stock and available on a first-come, first-served basis. If a product is out of stock, we reserve the right to replace it with an equivalent or better product</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4.4 Prohibited Behaviors</h3>
            <p>The following behaviors will result in forfeiture of referral rewards and may lead to account suspension:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Self-registering multiple accounts for self-referral</li>
              <li>Bulk posting referral codes on public websites, spam, or black-market channels</li>
              <li>Any fraudulent, false, or misleading referral activities</li>
            </ul>
          </section>

          <section id="conduct" className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. User Code of Conduct</h2>
            <p>You agree not to use this Website to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Upload, post, or share any illegal, infringing, obscene, defamatory, or malicious content</li>
              <li>Impersonate a veterinarian or provide false medical advice</li>
              <li>Interfere with servers or circumvent security measures</li>
              <li>Collect other users' information without permission</li>
              <li>Use automated scripts, crawlers, or bots to access this Website</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Content Submission and Intellectual Property</h2>
            <p>
              Content (text, images, etc.) you submit through comments, forums, or feedback grants us a royalty-free, 
              worldwide, sublicensable, non-exclusive license to use, operate, and improve the services.
            </p>
            <p className="mt-4">
              All original content on this Website (articles, logos, interface design, self-check tool logic, etc.) is 
              owned by us and protected by copyright laws. Reproduction or redistribution without written permission is prohibited.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Third-Party Links and AI Consultation Disclaimer</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7.1 Third-Party Links</h3>
            <p>
              This Website may contain links to third-party websites. We do not assume any responsibility for third-party 
              content, privacy policies, or practices.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7.2 Dr.Max Consultation Special Disclaimer</h3>
            <p>
              Dr.Max Pet Doctor AI Consultation is an auxiliary information tool based on artificial intelligence and 
              publicly available data. It does not constitute veterinary practice.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>AI responses may contain errors, be outdated, or incomplete</li>
              <li>Do not rely solely on AI consultation for diagnosis, treatment, or delaying seeking help from a real veterinarian</li>
              <li>If your dog shows emergency symptoms (such as difficulty breathing, severe bleeding, seizures, etc.), please contact a nearby pet hospital or emergency center immediately</li>
              <li>By using Dr.Max, you understand and agree that we are not responsible for any direct or indirect consequences arising from the use of AI consultation</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8. Medication Self-Check and Disease Self-Check Disclaimer</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Medication Self-Check:</strong> This is an information retrieval tool only and does not provide medication advice. 
                All medication use must follow prescriptions from a licensed veterinarian
              </li>
              <li>
                <strong>Disease Self-Check:</strong> This matches symptoms to possible disease directions based on symptoms; it does not 
                represent a final diagnosis. Self-check results are for reference only and cannot replace a veterinarian's physical 
                examination and testing
              </li>
              <li>You should use self-check results as reference material for communication with your veterinarian, not as a basis for treatment decisions</li>
            </ul>
          </section>

          <section id="disclaimer" className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">9. Disclaimer and Limitation of Liability</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">9.1 "As Is" Provision</h3>
            <p>
              This service and all content are provided on an "as is" and "as available" basis. We do not guarantee that the 
              service is uninterrupted, error-free, virus-free, nor do we guarantee the accuracy, reliability of AI consultation 
              or self-check results.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">9.2 Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by applicable law, we and our affiliates, employees shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Direct, indirect, incidental, special, or consequential damages (including pet health loss, data loss, loss of profits) arising from the use or inability to use this service</li>
              <li>Any consequences arising from reliance on AI consultation, self-check tools, or user-provided information</li>
              <li>Any malicious content propagated by third parties through this Website</li>
            </ul>
            <p className="mt-4">
              <strong>Aggregate Liability:</strong> Your total claims arising from disputes related to this service shall not exceed 
              $100 USD or the fees you paid to this Website in the past 6 months (whichever is lower).
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">10. Indemnification</h2>
            <p>You agree to indemnify and hold the Company harmless from any claims, losses, liabilities, or expenses (including reasonable attorneys' fees) arising from:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Your breach of these Terms of Service</li>
              <li>Your misuse of AI consultation or self-check tools</li>
              <li>Your fraudulent activities through the referral program</li>
              <li>Your infringement of third-party rights</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">11. Changes to Services and Termination</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>We reserve the right to modify, suspend, or terminate all or part of this Website's services at any time without prior notice</li>
              <li>If you violate these terms, we may immediately terminate your account and cancel all unclaimed referral rewards</li>
              <li>Upon any termination, Sections 7, 8, 9, and 10 shall continue to be effective</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">12. Applicable Law and Dispute Resolution</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>These terms are governed by the laws of the jurisdiction where the Company is based, without regard to conflict of law principles</li>
              <li>Any dispute shall first be resolved through friendly negotiation; if negotiation fails, it shall be resolved through litigation in the courts with jurisdiction at the location of the Company's principal place of business</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">13. Miscellaneous</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Entire Agreement:</strong> These terms constitute the entire agreement between you and us and supersede all prior oral or written communications</li>
              <li><strong>Severability:</strong> If any part of these terms is found to be invalid or unenforceable, the remaining parts shall continue to be in full force and effect</li>
              <li><strong>Waiver:</strong> Our failure to enforce any right shall not constitute a waiver of that right</li>
            </ul>
          </section>

          <section id="contact" className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Contact Information</h2>
            <p>
              For questions or to report violations, please contact us at:{" "}
              <a href="mailto:dog@coleaze.com" className="text-primary hover:underline font-semibold">
                dog@coleaze.com
              </a>
            </p>
            <p className="mt-4">
              Please check this page regularly for updates. Continuing to use the Dog is OK website means that you accept 
              the current version of the terms of service.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © Dog is OK — Making Every Dog Healthier and Happier.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}
