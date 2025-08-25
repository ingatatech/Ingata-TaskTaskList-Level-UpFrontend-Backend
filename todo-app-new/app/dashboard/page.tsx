// dashboard/page.tsx (Main Dashboard Orchestrator)
"use client"

import { useState, useRef } from "react"
import Header from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { MyTasksSection } from "./components/MyTasksSection"
import { ProfileSection } from "./components/ProfileSection"
import { SettingsSection } from "./components/SettingsSection"

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState("tasks")
  const { logout } = useAuth()
  
  // Create a ref to access MyTasksSection methods
  const myTasksSectionRef = useRef<{ triggerAddTask: () => void }>(null)

  const handleAddTaskFromSidebar = () => {
    console.log("Add task triggered from sidebar") // Debug log
    
    // Ensure we're on the tasks section first
    if (activeSection !== "tasks") {
      setActiveSection("tasks")
      // Wait for the section to render, then trigger the dialog
      setTimeout(() => {
        if (myTasksSectionRef.current) {
          myTasksSectionRef.current.triggerAddTask()
        }
      }, 200)
    } else {
      // We're already on tasks section, trigger immediately
      if (myTasksSectionRef.current) {
        myTasksSectionRef.current.triggerAddTask()
      }
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "tasks":
        return <MyTasksSection ref={myTasksSectionRef} />
      case "profile":
        return <ProfileSection />
      case "settings":
        return <SettingsSection />
      default:
        return <MyTasksSection ref={myTasksSectionRef} />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
  <Header />
  <div className="flex flex-1 bg-background">   {/* use flex-1 instead of h-screen */}
    <Sidebar
      userRole="user"
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onAddTask={handleAddTaskFromSidebar}
    />
    <main className="flex-1 overflow-y-auto">   {/* only vertical scroll */}
      <div className="p-6">{renderContent()}</div>
    </main>
  </div>
</div>

  )
}