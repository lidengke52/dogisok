export const metadata = {
  title: "Privacy Policy",
  description: "Dog is Ok Privacy Policy - How we collect, use, and protect your personal information",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: May 6, 2026 | Effective Date: May 6, 2026
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#introduction" className="text-primary hover:underline">1. Introduction</a></li>
            <li><a href="#information-collection" className="text-primary hover:underline">2. Information We Collect</a></li>
            <li><a href="#how-we-use" className="text-primary hover:underline">3. How We Use Your Information</a></li>
            <li><a href="#how-we-share" className="text-primary hover:underline">4. How We Share and Disclose Your Information</a></li>
            <li><a href="#privacy-rights" className="text-primary hover:underline">5. Your Privacy Rights</a></li>
            <li><a href="#cookies" className="text-primary hover:underline">6. Cookies and Similar Technologies</a></li>
            <li><a href="#data-storage" className="text-primary hover:underline">7. Data Storage and Transfer</a></li>
            <li><a href="#data-security" className="text-primary hover:underline">8. Data Security</a></li>
            <li><a href="#third-party-links" className="text-primary hover:underline">9. Third-Party Links</a></li>
            <li><a href="#childrens-privacy" className="text-primary hover:underline">10. Children's Privacy</a></li>
            <li><a href="#jurisdiction" className="text-primary hover:underline">11. Additional Terms for Specific Jurisdictions</a></li>
            <li><a href="#changes" className="text-primary hover:underline">12. Changes to This Privacy Policy</a></li>
            <li><a href="#contact" className="text-primary hover:underline">13. How to Contact Us</a></li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* 1. Introduction */}
          <section id="introduction">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Dog is Ok ("this Website," "we," or "our") respects and is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use this Website (including dogisok.net and all its subdomains) and the various services provided through this Website (including dog breed, training, behavior, health, and care information; dog medication self-check tool; dog disease self-check tool; Dr.Max Pet Doctor AI consultation; and referral registration program, etc.).
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              This Privacy Policy is intended to provide you with a thorough understanding of how we handle personal information and the rights you have, in accordance with applicable data protection laws and regulations. By accessing or using this Website, you agree to all the terms of this Privacy Policy. If you do not agree with this policy, please do not use this Website or any of our services.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section id="information-collection">
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We may collect the following categories of information when you use this Website and our services:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">2.1 Information You Actively Provide</h3>
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  When you register an account or use various features of this Website, we may collect:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li><strong>Account Information:</strong> Your name, email address, phone number, personal address, username, and password, used to create and manage your account.</li>
                  <li><strong>Pet Information:</strong> Basic information about your dog, including breed, age, weight, gender, health condition, medical history, previous diagnostic records, medication records, etc.</li>
                  <li><strong>AI Consultation Information:</strong> The symptom descriptions, health questions, and related photos you input when interacting with the Dr.Max Pet Doctor AI consultation.</li>
                  <li><strong>Self-Check Tool Input:</strong> Medication names, symptom keywords, or self-check questionnaire results you enter when using our diagnostic tools.</li>
                  <li><strong>Referral Program Information:</strong> Referral records, including your unique referral link, referral code, and information about new users you successfully refer.</li>
                  <li><strong>Feedback and Communication:</strong> Any information you send to us through customer service, surveys, or user feedback.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2.2 Information Collected Automatically (Usage Data)</h3>
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  When you visit this Website, we may automatically collect specific information through cookies, pixel tags, and other technologies:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li><strong>Device and Browser Information:</strong> Device type, operating system version, browser type and version, device identifiers, IP address, etc.</li>
                  <li><strong>Usage Activity Information:</strong> Pages you visit, links you click, time spent, search queries, referring/exiting pages, etc.</li>
                  <li><strong>Location Information:</strong> Approximate geographical location inferred from your IP address, used to comply with applicable regional regulations.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2.3 Information from Third Parties</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you log in to this Website through a third-party platform (such as a social media account), we may receive certain personal information (such as username, avatar, etc.) from these platforms, depending on your privacy settings.
                </p>
              </div>
            </div>
          </section>

          {/* 3. How We Use Your Information */}
          <section id="how-we-use">
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We use the collected information for the following purposes:
            </p>
            <ul className="space-y-4 text-sm text-muted-foreground ml-4">
              <li><strong>Service Provision and Account Management:</strong> Creating and maintaining your account; providing you with various content; as well as medication self-check, disease self-check, and Dr.Max consultation services.</li>
              <li><strong>AI Service Improvement:</strong> Using conversation data and pet health information to train and optimize our artificial intelligence models. We may use anonymized aggregated data for analysis.</li>
              <li><strong>Referral Reward Processing:</strong> Calculating and distributing free product rewards based on users' referral activity records; preventing fraud and abuse.</li>
              <li><strong>Personalized Experience:</strong> Recommending relevant articles, tools, and products based on your browsing history and pet information.</li>
              <li><strong>Communication and Notifications:</strong> Sending you service updates, important notices, security alerts, and administrative information related to your account.</li>
              <li><strong>Analysis and Improvement:</strong> Analyzing user usage trends; evaluating the effectiveness of website content; improving user experience and performance.</li>
              <li><strong>Security and Compliance:</strong> Detecting, investigating, and preventing fraud or illegal activities; complying with legal obligations; and enforcing our Terms of Service.</li>
            </ul>
          </section>

          {/* 4. How We Share and Disclose Your Information */}
          <section id="how-we-share">
            <h2 className="text-2xl font-bold mb-4">4. How We Share and Disclose Your Information</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We do not sell your personal information. We may only share or disclose your information in the following limited circumstances:
            </p>
            <ul className="space-y-4 text-sm text-muted-foreground ml-4">
              <li><strong>Service Providers:</strong> We may share your information with trusted third-party service providers (such as website hosting, AI chat platforms, data analytics services, email marketing tools, etc.).</li>
              <li><strong>AI Service Providers:</strong> Your consultation content may be transmitted to third-party AI service providers for real-time processing to generate responses.</li>
              <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or similar corporate transaction, your personal information may be transferred as part of the transaction assets.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information when we believe disclosure is necessary to comply with legal obligations, government requests, or judicial proceedings.</li>
              <li><strong>With Your Consent:</strong> We may share your information for other purposes with your explicit consent.</li>
            </ul>
          </section>

          {/* 5. Your Privacy Rights */}
          <section id="privacy-rights">
            <h2 className="text-2xl font-bold mb-4">5. Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Depending on the data protection laws in your jurisdiction (such as GDPR, CCPA), you have the following rights:
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground ml-4">
              <li><strong>Right of Access:</strong> You have the right to request access to the personal information we hold about you.</li>
              <li><strong>Right of Rectification:</strong> You have the right to request correction or supplementation of inaccurate information.</li>
              <li><strong>Right of Erasure ("Right to be Forgotten"):</strong> Under certain circumstances, you have the right to request that we delete your personal information.</li>
              <li><strong>Right to Restrict Processing:</strong> Under certain circumstances, you have the right to request that we restrict how we process your personal information.</li>
              <li><strong>Right to Data Portability:</strong> You have the right to receive your personal information in a structured, commonly used, and machine-readable format.</li>
              <li><strong>Right to Object:</strong> You have the right to object to our processing of your personal information based on legitimate interests.</li>
              <li><strong>Right to Withdraw Consent:</strong> If our processing is based on your consent, you have the right to withdraw that consent at any time.</li>
              <li><strong>Right Not to Be Subject to Automated Decision-Making:</strong> You have the right not to be subject to decisions based solely on automated processing.</li>
            </ul>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              <strong>How to Exercise Your Rights:</strong> Please submit your request through the contact information in Section 13. We will respond within 30 days. You may also apply to cancel your account by contacting customer service through the Website.
            </p>
          </section>

          {/* 6. Cookies and Similar Technologies */}
          <section id="cookies">
            <h2 className="text-2xl font-bold mb-4">6. Cookies and Similar Technologies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What are Cookies?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cookies are small text files stored on your device by websites, containing detailed information about your browsing activities on the website.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How We Use Cookies:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li><strong>Essential Cookies:</strong> Ensuring the normal operation of core website functions (such as user login and page navigation).</li>
                  <li><strong>Analytics/Performance Cookies:</strong> Helping us understand how visitors interact with the website.</li>
                  <li><strong>Functional Cookies:</strong> Remembering your preferences to provide a more personalized experience.</li>
                  <li><strong>Targeting/Advertising Cookies:</strong> Used to show you third-party advertisements that may interest you.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Your Choices:</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Most browsers allow you to manage cookie settings. You may choose to reject all or certain types of cookies. Please note that disabling certain cookies may cause some features of the website to not function properly.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Data Storage and Transfer */}
          <section id="data-storage">
            <h2 className="text-2xl font-bold mb-4">7. Data Storage and Transfer</h2>
            <ul className="space-y-4 text-sm text-muted-foreground ml-4">
              <li><strong>Storage Location:</strong> Your personal information will be stored on secure servers operated by us and our service providers, located within the United States.</li>
              <li><strong>Storage Period:</strong> We will only retain your personal information for the period necessary to fulfill the purposes described in this Privacy Policy. When personal information is no longer needed, we will delete or anonymize it within 90 days.</li>
              <li><strong>International Transfers:</strong> If you are located in regions with different data protection laws, your information may be transferred to countries with different standards. We will take appropriate safeguards such as standard contractual clauses.</li>
            </ul>
          </section>

          {/* 8. Data Security */}
          <section id="data-security">
            <h2 className="text-2xl font-bold mb-4">8. Data Security</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              We are committed to protecting the security of your personal information. We employ commercially reasonable technical, administrative, and physical security measures (including encrypted transmission protocols SSL/TLS, access controls, firewalls, regular security audits, etc.) to protect your information from unauthorized access, use, disclosure, alteration, or destruction.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Please note that despite these measures, no method of transmission over the Internet or electronic storage is 100% secure. Therefore, we cannot guarantee the absolute security of your information.
            </p>
          </section>

          {/* 9. Third-Party Links */}
          <section id="third-party-links">
            <h2 className="text-2xl font-bold mb-4">9. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              For your convenience, this Website may contain links to third-party websites. When you click these links to leave our Website, the third-party website will apply its own privacy policy, security practices, and terms of service. We do not assume any responsibility for the content or privacy practices of these third-party websites. We recommend that you read their privacy policies before providing personal information.
            </p>
          </section>

          {/* 10. Children's Privacy */}
          <section id="childrens-privacy">
            <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Website is intended for adult users (aged 18 and older). We do not knowingly collect personal information from children under 13 (or under 16 in certain jurisdictions). If we discover that we have inadvertently collected such information, we will take reasonable steps to delete it from our systems immediately. If you believe we may hold any information from or about children under 13, please notify us through the contact information in Section 13.
            </p>
          </section>

          {/* 11. Additional Terms for Specific Jurisdictions */}
          <section id="jurisdiction">
            <h2 className="text-2xl font-bold mb-4">11. Additional Terms for Specific Jurisdictions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">11.1 California Residents (CCPA)</h3>
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  If you are a California resident, the California Consumer Privacy Act (CCPA) grants you additional rights, including:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>The right to know what categories of personal information we have collected about you</li>
                  <li>The right to know the categories of sources of personal information</li>
                  <li>The right to know the business or commercial purposes for collecting personal information</li>
                  <li>The right to know the categories of third parties with whom we share personal information</li>
                  <li>The right to opt out of the sale of your personal information (we do not sell personal information to third parties)</li>
                  <li>The right not to be discriminated against for exercising any rights under the CCPA</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">11.2 European Economic Area / UK Residents (GDPR)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you are located in the European Economic Area (EEA) or the United Kingdom, the General Data Protection Regulation (GDPR) grants you additional rights. In addition to the rights listed in Section 5, you have the right to lodge a complaint with your local data protection supervisory authority.
                </p>
              </div>
            </div>
          </section>

          {/* 12. Changes to This Privacy Policy */}
          <section id="changes">
            <h2 className="text-2xl font-bold mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time time. When we make material changes, we will notify you by email (to the email address specified in your account) or by posting a prominent notice on this Website. You should check this page regularly for any changes. The revised Privacy Policy will take effect upon posting on the Website. Continued use of this Website after the changes take effect constitutes your acceptance of the revised Privacy Policy.
            </p>
          </section>

          {/* 13. How to Contact Us */}
          <section id="contact" className="pb-12">
            <h2 className="text-2xl font-bold mb-4">13. How to Contact Us</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              If you have any questions, comments, or requests regarding this Privacy Policy, please contact us through the following methods:
            </p>
            <div className="rounded-lg border border-border bg-card p-6 mb-6">
              <p className="text-sm">
                <strong>Email:</strong> <a href="mailto:dog@coleaze.com" className="text-primary hover:underline">dog@coleaze.com</a>
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              If you have unresolved concerns about the processing of your personal information, or believe we have processed your data without appropriately notifying you, you have the right to lodge a complaint with the data protection authority in your country or region.
            </p>
          </section>

          {/* Important Disclaimer */}
          <section className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6">
            <h3 className="text-lg font-bold mb-3 text-yellow-900">Important Disclaimer</h3>
            <p className="text-sm text-yellow-800 leading-relaxed">
              The information and services provided by this Website, including but not limited to the dog medication self-check tool, dog disease self-check tool, and Dr.Max Pet Doctor AI consultation, are for educational and informational reference only and do not constitute professional veterinary medical advice, diagnosis, or treatment plans. This Website does not establish a veterinarian-client-patient relationship. For any pet health concerns, please always consult a licensed veterinarian. In case of emergency symptoms, please contact the nearest pet hospital or emergency center immediately.
            </p>
          </section>

          {/* Footer Note */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © Dog is Ok — Making Every Dog Healthier and Happier.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
