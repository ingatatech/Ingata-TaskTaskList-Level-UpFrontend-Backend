"use client"

import { ReactNode, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface AdminAuthWrapperProps {
  children: ReactNode
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
      } else if (!isAdmin) {
        router.replace("/dashboard")
      }
    }
  }, [user, isLoading, isAdmin, router])

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    )
  }

  return <>{children}</>
}
