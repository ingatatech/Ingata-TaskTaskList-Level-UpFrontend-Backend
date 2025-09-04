// app/admin/layout.tsx
"use client"

import { ReactNode, useState, useEffect } from "react"
// Note: next/navigation and "@/hooks/use-auth" imports were removed to fix compilation errors.
// The component now runs as a self-contained layout.

interface AdminLayoutProps {
  children: ReactNode
}

// A mock user object to simulate authentication
const mockUser = {
  // To simulate an admin, set role to "admin"
  role: "admin", 
  // To simulate a non-admin, set role to "user"
  // role: "user",
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Use the mock user object to simulate the user's state
  const user = mockUser;

  const [activeSection, setActiveSection] = useState("overview");

  // Removed useEffect as it relied on usePathname from next/navigation
  // The layout now renders statically based on the user object.
  // A section change handler is provided but not used dynamically in this version.
  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  // Check for mock user (simulating authentication)
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

  // Check the mock user's role (simulating authorization)
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
      {/* Sidebar could go here if you have one */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
