// admin/components/admin-auth-wrapper.tsx
"use client"

import { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"

interface AdminAuthWrapperProps {
  children: ReactNode
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}