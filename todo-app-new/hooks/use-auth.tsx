// app/hooks/use-auth.tsx
"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authApi, type User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  verifyOtp: (email: string, otp: string, type?: "first-login" | "forgot-password") => Promise<void>
  setNewPassword: (email: string, otp: string, newPassword: string, type?: "first-login" | "forgot-password") => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.login(email, password)

      if (response?.requiresPasswordReset && response?.isFirstLogin) {
        toast({ title: "First login detected", description: "Please reset your password." })
        window.location.href = `/auth/password-reset?email=${encodeURIComponent(email)}&type=first-login`
        return
      }

      const userData: User = {
        id: response.id || "temp-id",
        email,
        role: response.role,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setToken(response.token)
      setUser(userData)
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(userData))

      toast({ title: "Login successful", description: `Redirecting to ${response.role} dashboard...` })
      setTimeout(() => {
        window.location.href = response.role === "admin" ? "/admin" : "/dashboard"
      }, 800)
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async (email: string, otp: string, type: "first-login" | "forgot-password" = "first-login") => {
    try {
      setIsLoading(true)
      await authApi.verifyOtp(email, otp, type)
      toast({ title: "OTP verified", description: "Continue to set a new password." })
    } catch (error) {
      toast({
        title: "OTP verification failed",
        description: error instanceof Error ? error.message : "Invalid or expired OTP",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const setNewPassword = async (email: string, otp: string, newPassword: string, type: "first-login" | "forgot-password" = "first-login") => {
    try {
      setIsLoading(true)
      await authApi.setNewPassword(email, otp, newPassword, type)
      toast({ title: "Password set successfully", description: "You can now log in with your new password." })
    } catch (error) {
      toast({
        title: "Failed to set password",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({ title: "Logged out", description: "You have been successfully logged out." })
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        verifyOtp,
        setNewPassword,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
