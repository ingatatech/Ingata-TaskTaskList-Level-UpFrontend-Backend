// app/admin/page.tsx
"use client"

import { useState, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { AdminAuthWrapper } from "./components/admin-auth-wrapper"
import Header from "@/components/header"
import OverviewPage from "./overview/page"
import UserManagementPage from "./users/page"
import TaskManagementPage from "./tasks/page"
import ProfilePage from "./profile/page"
import SettingsPage from "./settings/page"

interface UserManagementRef {
  triggerAddUser: () => void
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const userManagementRef = useRef<UserManagementRef>(null)

  const handleAddUser = () => userManagementRef.current?.triggerAddUser()

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewPage />
      case "users":
        return <UserManagementPage ref={userManagementRef} />
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
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex flex-1">
          <Sidebar
            userRole="admin"
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onAddUser={handleAddUser}
          />
          {/* scroll only inside main */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{renderContent()}</div>
          </main>
        </div>
      </div>
    </AdminAuthWrapper>
  )
}
