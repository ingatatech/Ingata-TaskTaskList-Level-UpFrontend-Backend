"use client"

import { useState, useRef } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { MyTasksSection } from "@/app/dashboard/components/MyTasksSection"
import { ProfileSection } from "@/app/dashboard/components/ProfileSection"
import { SettingsSection } from "@/app/dashboard/components/SettingsSection"

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState("tasks")

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
        return <ProfileSection  />
      case "settings":
        return <SettingsSection />
      default:
        return <MyTasksSection ref={myTasksSectionRef} />
    }
  }

  return (
    <DashboardLayout
      userRole="user"
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onAddTask={handleAddTaskFromSidebar}
    >
      {renderContent()}
    </DashboardLayout>
  )
}
