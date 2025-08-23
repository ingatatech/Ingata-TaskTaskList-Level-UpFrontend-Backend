// dashboard/page.tsx (Main Dashboard Orchestrator)
"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { MyTasksSection } from "./components/MyTasksSection"
import { ProfileSection } from "./components/ProfileSection"
import { SettingsSection } from "./components/SettingsSection"

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState("tasks")
  const { logout } = useAuth()

  const renderContent = () => {
    switch (activeSection) {
      case "tasks":
        return <MyTasksSection />
      case "profile":
        return <ProfileSection />
      case "settings":
        return <SettingsSection />
      default:
        return <MyTasksSection />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        userRole="user" 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onLogout={logout}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  )
}
