// admin/page.tsx - Main admin page (fixed to use single sidebar)
"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AdminAuthWrapper } from "./components/admin-auth-wrapper"
import Header from "@/components/header"
import OverviewPage from "./overview/page"
import UserManagementPage from "./users/page"
import TaskManagementPage from "./tasks/page"
import ProfilePage from "./profile/page"
import SettingsPage from "./settings/page"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewPage />
      case "users":
        return <UserManagementPage />
      case "tasks":
        return <TaskManagementPage />
      case "profile":
        return <ProfilePage />
      case "settings":
        return <SettingsPage />
      default:
        return <OverviewPage />
    }
  }

  return (
    <AdminAuthWrapper>
    <div className="flex flex-col h-screen bg-background">
        <Header />
      <div className="flex h-screen bg-background">
        <Sidebar
          userRole="admin"
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">{renderContent()}</div>
        </main>
        </div>
    </div>
    </AdminAuthWrapper>
  )
}
