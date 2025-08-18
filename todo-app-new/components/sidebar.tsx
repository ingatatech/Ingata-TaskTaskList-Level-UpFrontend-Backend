"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Users, ClipboardList, User, LogOut, Menu, X, Settings, BarChart3, CheckCircle2 } from "lucide-react"

interface SidebarProps {
  userRole: "admin" | "user"
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ userRole, activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const adminMenuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "User Management", icon: Users },
    { id: "tasks", label: "All Tasks", icon: ClipboardList },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const userMenuItems = [
    { id: "tasks", label: "My Tasks", icon: ClipboardList },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const menuItems = userRole === "admin" ? adminMenuItems : userMenuItems

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sidebar-foreground">TaskFlow</h2>
              <Badge variant="secondary" className="text-xs">
                {userRole === "admin" ? "Admin" : "User"}
              </Badge>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                  activeSection === item.id &&
                    "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                  isCollapsed && "px-2",
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
            isCollapsed && "px-2",
          )}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  )
}
