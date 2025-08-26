//app/layout.tsx
"use client"

import { ReactNode, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState("overview")

  useEffect(() => {
    if (pathname.includes("/admin/users")) {
      setActiveSection("users")
    } else if (pathname.includes("/admin/tasks")) {
      setActiveSection("tasks")
    } else if (pathname.includes("/admin/profile")) {
      setActiveSection("profile")
    } else if (pathname.includes("/admin/settings")) {
      setActiveSection("settings")
    } else {
      setActiveSection("overview")
    }
  }, [pathname])

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">
            Please log in to access the admin dashboard.
          </p>
        </div>
      </div>
    )
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-background">
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
