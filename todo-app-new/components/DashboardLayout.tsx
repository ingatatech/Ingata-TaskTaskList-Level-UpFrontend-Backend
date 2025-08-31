//app/components/DashboardLayout.tsx
"use client"
import type React from "react"
import Header from "@/components/header"
import { Sidebar } from "@/components/sidebar"

interface DashboardLayoutProps {
  userRole: "admin" | "user"
  activeSection: string
  onSectionChange: (section: string) => void
  onAddTask?: () => void
  onAddUser?: () => void
  children: React.ReactNode
}

export default function DashboardLayout({
  userRole,
  activeSection,
  onSectionChange,
  onAddTask,
  onAddUser,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sidebar component - handles both mobile and desktop rendering */}
      <Sidebar
        userRole={userRole}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onAddTask={onAddTask}
        onAddUser={onAddUser}
      />

      {/* 
        Fixed Header - positioned to account for desktop sidebar width
        On mobile: spans full width (sidebar is a drawer overlay)
        On desktop: starts after the sidebar (ml-0 md:ml-16 when collapsed, md:ml-64 when expanded)
      */}
      <div className="fixed top-0 left-0 right-0 md:left-16 lg:left-64 z-20 bg-background shadow-sm">
        <Header />
      </div>

      {/* 
        Main content area - positioned to account for both header and sidebar
        On mobile: full width with top padding for header only
        On desktop: left margin for sidebar + top padding for header
      */}
      <main className="flex-1 pt-16 md:ml-16 lg:ml-64 overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  )
}