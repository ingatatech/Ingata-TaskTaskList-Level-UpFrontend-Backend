// admin/page.tsx - Main admin page (updated to handle user management sub-items)
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

// Define ref types for components
interface UserManagementRef {
  triggerAddUser: () => void
}

interface TaskManagementRef {
  triggerAddTask: () => void
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const userManagementRef = useRef<UserManagementRef>(null)
  const taskManagementRef = useRef<TaskManagementRef>(null)

  const handleAddUser = () => {
    console.log("handleAddUser called in AdminDashboard") // Debug log
    if (userManagementRef.current) {
      console.log("Calling triggerAddUser on ref") // Debug log
      userManagementRef.current.triggerAddUser()
    } else {
      console.log("userManagementRef.current is null") // Debug log
    }
  }

  const handleAddTask = () => {
    console.log("handleAddTask called in AdminDashboard") // Debug log
    if (taskManagementRef.current) {
      console.log("Calling triggerAddTask on ref") // Debug log
      taskManagementRef.current.triggerAddTask()
    } else {
      console.log("taskManagementRef.current is null") // Debug log
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewPage />
      case "users":
        return <UserManagementPage ref={userManagementRef} />
      case "tasks":
        return <TaskManagementPage  />
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
            onAddUser={handleAddUser} // Pass the handler to Sidebar
            onAddTask={handleAddTask} // Pass the task handler to Sidebar
          />
          <main className="flex-1 overflow-auto">
            <div className="p-6">{renderContent()}</div>
          </main>
        </div>
      </div>
    </AdminAuthWrapper>
  )
}