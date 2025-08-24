//app/login/page.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mail, Key, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      toast({ title: "Missing Information", description: "Enter email and password.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
      // login function already redirects based on role
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
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
          <div className="mb-8">
            <Button asChild variant="ghost" className="font-medium group">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </Button>
          </div>

          <Card className="shadow-xl border-primary/10">
            <CardHeader className="text-center pb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to access your dashboard</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      className="pl-10 h-11"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      className="pl-10 h-11"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center text-blue-600 mb-1">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">New User?</span>
                  </div>
                  <p className="text-blue-700">First-time login requires a password reset.</p>
                </div>
                <div className="flex space-x-2">
                  <Button asChild variant="outline" className="flex-1 font-medium">
                    <Link href="/auth/forgot-password">Forgot Password</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
