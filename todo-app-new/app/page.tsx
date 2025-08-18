"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Users, ClipboardList, Shield, Mail, Key, ArrowRight, Star, Zap } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("login")
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [otpForm, setOtpForm] = useState({ otp: "", newPassword: "", confirmPassword: "" })

  const scrollToAuth = () => {
    const authSection = document.getElementById("auth-section")
    if (authSection) {
      authSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">TaskFlow</h1>
            </div>
            <Badge variant="secondary" className="font-medium">
              Professional Edition
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                Trusted by 10,000+ Teams
              </Badge>
            </div>
            <h2 className="text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
              Modern Task Management
              <span className="block text-primary">Made Simple</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Streamline your productivity with secure OTP authentication, intuitive dashboards, and powerful task
              management features designed for modern teams.
            </p>
            <div className="flex justify-center mt-8">
              <Button size="lg" className="font-medium group" onClick={scrollToAuth}>
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="text-center">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Secure Authentication</CardTitle>
                <CardDescription className="text-base">
                  OTP-based user creation and password reset with enterprise-grade security protocols
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="text-center">
                <div className="h-16 w-16 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-secondary/20 transition-colors">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="font-serif text-xl">User Management</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive admin tools for managing users, roles, permissions, and team collaboration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="text-center">
                <div className="h-16 w-16 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-accent/20 transition-colors">
                  <ClipboardList className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-serif text-xl">Task Management</CardTitle>
                <CardDescription className="text-base">
                  Create, organize, and track tasks with advanced filtering, pagination, and progress analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="bg-card/50 rounded-2xl p-8 mb-16 border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">50K+</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          {/* Authentication Section */}
          <Card id="auth-section" className="max-w-lg mx-auto shadow-xl border-primary/10">
            <CardHeader className="text-center pb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl">Get Started</CardTitle>
              <CardDescription className="text-base">
                Access your dashboard or verify your account to begin managing tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="font-medium">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="otp" className="font-medium">
                    Verify OTP
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-11"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10 h-11"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button className="w-full font-medium h-11 mt-6">Sign In</Button>
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    New user? Check your email for OTP verification
                  </p>
                </TabsContent>

                <TabsContent value="otp" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="font-medium">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="text-center text-lg tracking-widest h-11"
                      maxLength={6}
                      value={otpForm.otp}
                      onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="font-medium">
                      Set New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Create a secure password"
                      className="h-11"
                      value={otpForm.newPassword}
                      onChange={(e) => setOtpForm({ ...otpForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="h-11"
                      value={otpForm.confirmPassword}
                      onChange={(e) => setOtpForm({ ...otpForm, confirmPassword: e.target.value })}
                    />
                  </div>
                  <Button className="w-full font-medium h-11 mt-6">Verify & Set Password</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Demo Links */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <Button variant="outline" size="lg" asChild className="font-medium group bg-transparent">
              <a href="/admin">
                Admin Dashboard Demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild className="font-medium group bg-transparent">
              <a href="/dashboard">
                User Dashboard Demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 TaskFlow. Built with modern web technologies for optimal performance.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
