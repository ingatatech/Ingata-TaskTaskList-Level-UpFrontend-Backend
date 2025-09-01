// app/auth/set-new-password/page.tsx
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Key, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api"

const strong = (pwd: string) => /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd)

// Component that uses useSearchParams
function SetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const email = searchParams.get("email") || ""
  const otp = searchParams.get("otp") || ""
  const type = (searchParams.get("type") as "first-login" | "forgot-password") || "first-login"

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!email || !otp) {
      // If user opens this page without required params, kick them back
      router.replace("/auth/password-reset")
    }
  }, [email, otp, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!strong(newPassword)) {
      toast({
        title: "Weak password",
        description: "Use 8+ chars with uppercase, number, and special character.",
        variant: "destructive",
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      await authApi.setNewPassword(email, otp, newPassword, type)
      toast({ title: "Password updated", description: "Please sign in with your new password." })
      router.push("/login")
    } catch (err) {
      toast({
        title: "Failed to set password",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-xl border-primary/10">
      <CardHeader className="text-center pb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="font-serif text-2xl">Set New Password</CardTitle>
        <CardDescription className="text-base">
          Create a strong password to secure your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-700 flex">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
          Use at least 8 characters, 1 uppercase, 1 number, and 1 special character.
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-medium">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Create a secure password"
              className="h-11"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="font-medium">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter your password"
              className="h-11"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full font-medium h-11 mt-6" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Password"}
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
          <Key className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <CardTitle className="font-serif text-2xl">Loading...</CardTitle>
        <CardDescription className="text-base">
          Preparing password form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="h-4 bg-blue-200 animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-5 bg-muted animate-pulse rounded w-28"></div>
            <div className="h-11 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-muted animate-pulse rounded w-32"></div>
            <div className="h-11 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-11 bg-muted animate-pulse rounded mt-6"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SetNewPasswordPage() {
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
              <Link href="/auth/otp-verification">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </Link>
            </Button>
          </div>

          <Suspense fallback={<LoadingFallback />}>
            <SetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}