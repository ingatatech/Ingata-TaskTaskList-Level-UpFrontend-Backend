// app/auth/password-reset/page.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Mail, ArrowLeft, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api"

// Component that uses useSearchParams
function PasswordResetForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Determine flow type: first-login or forgot-password
  const typeFromParams = (searchParams.get("type") as "first-login" | "forgot-password") || "forgot-password"
  const isFirstLogin = typeFromParams === "first-login"
  const emailFromParams = searchParams.get("email")

  useEffect(() => {
    if (emailFromParams) setEmail(emailFromParams)
  }, [emailFromParams])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({ title: "Missing Email", description: "Enter your email address.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      if (isFirstLogin) {
        await authApi.initiateFirstLoginReset(email)
      } else {
        await authApi.forgotPassword(email)
      }

      setOtpSent(true)
      toast({ title: "OTP Sent", description: "Check your email for the verification code." })

      setTimeout(() => {
        router.push(`/auth/otp-verification?email=${encodeURIComponent(email)}&type=${typeFromParams}`)
      }, 2000)
    } catch (err) {
      toast({
        title: "Failed to Send OTP",
        description: err instanceof Error ? err.message : "Try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (otpSent) {
    return (
      <Card className="shadow-xl border-green-200 bg-green-50 text-center">
        <CardHeader>
          <CardTitle className="text-green-800 font-serif text-2xl">OTP Sent Successfully</CardTitle>
          <CardDescription className="text-green-700">
            We've sent a 6-digit verification code to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center text-green-600 mb-2">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium">Redirecting...</span>
            </div>
            <p className="text-sm text-green-700">
              Please check your email for the OTP. You'll be redirected shortly.
            </p>
          </div>
          <Button 
            onClick={() => router.push(`/auth/otp-verification?email=${encodeURIComponent(email)}&type=${typeFromParams}`)}
            className="w-full font-medium h-11"
          >
            Continue to Verification
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Default form
  return (
    <Card className="shadow-xl border-primary/10">
      <CardHeader className="text-center pb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="font-serif text-2xl">
          {isFirstLogin ? "Set Your Password" : "Forgot Password"}
        </CardTitle>
        <CardDescription className="text-base">
          {isFirstLogin 
            ? "Complete your account setup by changing your temporary password." 
            : "Enter your email to receive a password reset code."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isFirstLogin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-700 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
            For security, you must change your temporary password before accessing your account.
          </div>
        )}

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!emailFromParams}
            />
            {emailFromParams && (
              <p className="text-xs text-muted-foreground">Email is pre-filled from your login attempt</p>
            )}
          </div>

          <Button type="submit" className="w-full font-medium h-11 mt-6" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send Verification Code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <Card className="shadow-xl border-primary/10">
      <CardHeader className="text-center pb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <CardTitle className="font-serif text-2xl">Loading...</CardTitle>
        <CardDescription className="text-base">
          Preparing password reset form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-5 bg-muted animate-pulse rounded w-28"></div>
            <div className="h-11 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-11 bg-muted animate-pulse rounded mt-6"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PasswordResetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">TaskFlow</h1>
          </Link>
          <Badge variant="secondary" className="font-medium">Professional Edition</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="font-medium group">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>
            </Button>
          </div>

          <Suspense fallback={<LoadingFallback />}>
            <PasswordResetForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}