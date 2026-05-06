import { Metadata } from "next"
import { Mail, MessageSquare, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us - Dog is OK",
  description: "Get in touch with Dog is OK. We're here to help with any questions or feedback.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:px-8 lg:py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Contact Us</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Have any questions or suggestions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {/* Email Contact */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Email</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Send an email to our support team
            </p>
            <a
              href="mailto:dog@coleaze.com"
              className="text-primary hover:underline font-medium"
            >
              dog@coleaze.com
            </a>
          </div>

          {/* Quick Response */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Quick Response</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              We typically respond within 24 hours
            </p>
            <p className="text-primary font-medium">
              Average response time: 2 hours
            </p>
          </div>

          {/* Support Hours */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Support Hours</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              24/7 customer support
            </p>
            <p className="text-primary font-medium">
              Monday - Sunday 24/7
            </p>
          </div>
        </div>

        {/* Main Contact Form Section */}
        <div className="rounded-lg border border-border bg-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Send a Message</h2>
          <p className="text-muted-foreground mb-6">
            Please fill out the form below and we'll get back to you as soon as possible.
          </p>

          <form className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a subject</option>
                <option value="feedback">Feature Feedback</option>
                <option value="bug">Report a Bug</option>
                <option value="account">Account Issue</option>
                <option value="general">General Inquiry</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Please describe your question or suggestion in detail..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="rounded-lg border border-border bg-secondary/20 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Is my account secure?</h3>
              <p className="text-muted-foreground">
                Yes. We use industry-standard encryption and security measures to protect your personal information. Please see our Privacy Policy for more details.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">How accurate is the AI consultation?</h3>
              <p className="text-muted-foreground">
                Dr. Max AI consultation provides reference information but cannot replace professional veterinary diagnosis. If your pet has serious symptoms, please contact a veterinarian immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">How do I reset my password?</h3>
              <p className="text-muted-foreground">
                Click "Forgot password" on the login page and follow the instructions to reset your password. If you need help, please contact us.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">How does the referral program work?</h3>
              <p className="text-muted-foreground">
                You can invite friends to sign up for Dog is OK, and when they successfully register and use features, you can earn rewards. See the referral program for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
