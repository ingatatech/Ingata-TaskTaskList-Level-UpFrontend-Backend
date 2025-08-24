"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Shield, ArrowLeft, Mail, Key, KeyRound } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function VerifyOtpPage() {
  const [otpForm, setOtpForm] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" })
  const { verifyOtp, isLoading } = useAuth()
  const router = useRouter()

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpForm.email || !otpForm.otp || !otpForm.newPassword) return

    if (otpForm.newPassword !== otpForm.confirmPassword) {
      // You could add a toast here for password mismatch
      return
    }

    try {
      await verifyOtp(otpForm.email, otpForm.otp, otpForm.newPassword)
      // Reset form and redirect to login
      setOtpForm({ email: "", otp: "", newPassword: "", confirmPassword: "" })
      router.push("/login")
    } catch (error) {
      // Error is handled by the useAuth hook with toast
    }
  }

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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Back to Home */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="font-medium group">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* OTP Verification Card */}
          <Card className="shadow-xl border-primary/10">
            <CardHeader className="text-center pb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl">Verify Your Account</CardTitle>
              <CardDescription className="text-base">
                Enter the verification code sent to your email and set your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp-email" className="font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-11"
                      value={otpForm.email}
                      onChange={(e) => setOtpForm({ ...otpForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp" className="font-medium">
                    Verification Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="pl-10 text-center text-lg tracking-widest h-11"
                      maxLength={6}
                      value={otpForm.otp}
                      onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="font-medium">
                    Set New Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Create a secure password"
                      className="pl-10 h-11"
                      value={otpForm.newPassword}
                      onChange={(e) => setOtpForm({ ...otpForm, newPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 h-11"
                      value={otpForm.confirmPassword}
                      onChange={(e) => setOtpForm({ ...otpForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full font-medium h-11 mt-6" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Set Password"}
                </Button>
              </form>

              {/* Additional Options */}
              <div className="mt-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?
                </p>
                <Button asChild variant="outline" className="w-full font-medium">
                  <Link href="/login">
                    Sign In Instead
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}