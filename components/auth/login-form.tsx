"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Mail, KeyRound, Gift, ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Step = "email" | "otp"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/account"
  const refFromUrl = (searchParams.get("ref") || "").toUpperCase()

  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [inviteCode, setInviteCode] = useState(refFromUrl)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (refFromUrl) setInviteCode(refFromUrl)
  }, [refFromUrl])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  async function sendOtp(e?: FormEvent) {
    e?.preventDefault()
    setError(null)
    if (!email) return
    setLoading(true)
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: inviteCode.trim() ? { referral_code: inviteCode.trim().toUpperCase() } : undefined,
      },
    })
    setLoading(false)
    if (otpError) {
      setError(otpError.message)
      return
    }
    setStep("otp")
    setCooldown(60)
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (otp.length < 6) {
      setError("Please enter the 6-digit code")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email",
    })
    setLoading(false)
    if (verifyError) {
      setError(verifyError.message)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  if (step === "email") {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in or create account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a 6-digit code. No password needed.
        </p>

        <form onSubmit={sendOtp} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite" className="flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5 text-accent" />
              Invite code <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="invite"
              type="text"
              autoComplete="off"
              placeholder="ABCD1234"
              className="font-mono uppercase tracking-wider"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={12}
            />
            {refFromUrl && (
              <p className="text-xs text-primary">Invite code auto-filled from your friend&apos;s link</p>
            )}
          </div>

          {error && (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading || !email}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Sending..." : "Send verification code"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStep("email")
          setOtp("")
          setError(null)
        }}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Use a different email
      </button>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
      </p>

      <form onSubmit={verifyOtp} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="otp">Verification code</Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              className="pl-9 font-mono text-lg tracking-[0.5em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading || otp.length < 6}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Verifying..." : "Verify and continue"}
        </Button>

        <div className="flex items-center justify-center text-xs text-muted-foreground">
          {cooldown > 0 ? (
            <span>Resend code in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={() => sendOtp()}
              className="text-primary underline-offset-2 hover:underline"
            >
              Resend code
            </button>
          )}
        </div>
      </form>
    </>
  )
}
