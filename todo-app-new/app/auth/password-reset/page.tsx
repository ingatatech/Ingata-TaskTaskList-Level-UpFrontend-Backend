//app/auth/password-reset/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Key, ArrowLeft, Mail, AlertCircle, Clock } from "lucide-react"
import { authApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PasswordResetPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const emailFromParams = searchParams.get("email")
  const typeFromParams = (searchParams.get("type") as "first-login" | "forgot-password") || "forgot-password"
  const isFirstLogin = typeFromParams === "first-login"

  useEffect(() => {
    if (emailFromParams) {
      setEmail(emailFromParams)
    }
  }, [emailFromParams])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: "Missing Information",
        description: "Please enter your email address.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      if (isFirstLogin) {
        // 🔹 Trigger first-login OTP
        await authApi.initiateFirstLoginReset(email)
      } else {
        // 🔹 Forgot password OTP
        await authApi.forgotPassword(email)
      }
      
      setOtpSent(true)
      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code.",
      })
      
      // 🔹 Redirect to OTP verification after 2s
      setTimeout(() => {
        router.push(`/auth/otp-verification?email=${encodeURIComponent(email)}&type=${typeFromParams}`)
      }, 2000)
      
    } catch (error) {
      toast({
        title: "Failed to Send OTP",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Show OTP sent message
  if (otpSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-foreground">TaskFlow</h1>
              </Link>
              <Badge variant="secondary" className="font-medium">
                Professional Edition
              </Badge>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-green-200 bg-green-50">
              <CardHeader className="text-center pb-6">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="font-serif text-2xl text-green-800">OTP Sent Successfully</CardTitle>
                <CardDescription className="text-base text-green-700">
                  We've sent a verification code to your email address
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center text-green-600 mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">Redirecting...</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Please check your email for the OTP. You'll be redirected to the verification page shortly.
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
          </div>
        </main>
      </div>
    )
  }

  // 🔹 Default password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">TaskFlow</h1>
            </Link>
            <Badge variant="secondary" className="font-medium">
              Professional Edition
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Back to Login */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="font-medium group">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>
            </Button>
          </div>

          {/* Password Reset Card */}
          <Card className="shadow-xl border-primary/10">
            <CardHeader className="text-center pb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl">
                {isFirstLogin ? "Set Your Password" : "Reset Password"}
              </CardTitle>
              <CardDescription className="text-base">
                {isFirstLogin 
                  ? "Complete your account setup by resetting your temporary password" 
                  : "Enter your email to receive a password reset code"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFirstLogin && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center text-blue-600 mb-1">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">First Time Login</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    For security, you must change your temporary password before accessing your account.
                  </p>
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={!!emailFromParams} // Disable if email came from params
                    />
                  </div>
                  {emailFromParams && (
                    <p className="text-xs text-muted-foreground">
                      Email address is pre-filled from your login attempt
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full font-medium h-11 mt-6" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Send Verification Code"}
                </Button>
              </form>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                  <p className="text-gray-600">
                    You'll receive a 6-digit verification code that expires in 10 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
