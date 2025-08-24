// app/auth/otp-verification/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Shield, ArrowLeft, Mail, KeyRound } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api"

export default function OtpVerificationPage() {
  const searchParams = useSearchParams()
  const emailFromParams = searchParams.get("email") || ""
  const typeFromParams = (searchParams.get("type") as "first-login" | "forgot-password") || "first-login"

  const [email, setEmail] = useState(emailFromParams)
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (emailFromParams) setEmail(emailFromParams)
  }, [emailFromParams])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !otp) return

    setIsLoading(true)
    try {
      await authApi.verifyOtp(email, otp, typeFromParams)
      toast({ title: "OTP verified", description: "Continue to set a new password." })
      // Pass OTP forward (server re-checks it on set-new-password)
      router.push(`/auth/set-new-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&type=${typeFromParams}`)
    } catch (err) {
      toast({
        title: "Verification failed",
        description: err instanceof Error ? err.message : "Invalid or expired code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">TaskFlow</h1>
            </Link>
            <Badge variant="secondary" className="font-medium">Professional Edition</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <Button asChild variant="ghost" className="font-medium group">
              <Link href="/auth/password-reset">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </Link>
            </Button>
          </div>

          <Card className="shadow-xl border-primary/10">
            <CardHeader className="text-center pb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl">Verify Your Email</CardTitle>
              <CardDescription className="text-base">
                Enter the 6-digit code we sent to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
  id="email"
  type="email"
  placeholder="you@example.com"
  className="pl-10 h-11"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  disabled // 🔹 email cannot be changed, always from login or URL
/>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="font-medium">Verification Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit code"
                      className="pl-10 text-center text-lg tracking-widest h-11"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full font-medium h-11 mt-6" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
