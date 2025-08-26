//app/components/sidebar.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth" //logout hook
import {
  Users,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Plus,
  UserPlus,
  Eye,
} from "lucide-react"

interface SubItem {
  id: string
  label: string
  icon?: any
}

interface MenuItem {
  id: string
  label: string
  icon: any
  hasDropdown?: boolean
  subItems?: SubItem[]
}

interface SidebarProps {
  userRole: "admin" | "user"
  activeSection?: string
  onSectionChange?: (section: string) => void
  onAddTask?: () => void
  onAddUser?: () => void
}

export function Sidebar({
  userRole,
  activeSection: activeSectionProp,
  onSectionChange,
  onAddTask,
  onAddUser,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState(activeSectionProp || "overview")
  const { logout } = useAuth()

  const adminMenuItems: MenuItem[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      subItems: [
        { id: "users-view", label: "View All Users", icon: Eye },
        { id: "users-add", label: "Add User", icon: UserPlus },
      ],
    },
    {
      id: "tasks",
      label: "All Tasks",
      icon: ClipboardList,
      subItems: [{ id: "tasks-view", label: "View All Tasks", icon: Eye }],
    },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const userMenuItems: MenuItem[] = [
    {
      id: "tasks",
      label: "My Tasks",
      icon: ClipboardList,
      subItems: [
        { id: "tasks-view", label: "View All Tasks", icon: Eye },
        { id: "tasks-add", label: "Add Task", icon: Plus },
      ],
    },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const menuItems = userRole === "admin" ? adminMenuItems : userMenuItems

  const handleAddTask = () => onAddTask?.()
  const handleAddUser = () => onAddUser?.()

  const toggleExpanded = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId)
  }

  const handleSubItemClick = (subItemId: string, parentId: string) => {
    if (subItemId === "users-view" || subItemId === "tasks-view") {
      setActiveSection(parentId)
      onSectionChange?.(parentId)
    } else if (subItemId === "users-add") {
      setActiveSection("users")
      onSectionChange?.("users")
      setTimeout(handleAddUser, 100)
    } else if (subItemId === "tasks-add") {
      setActiveSection("tasks")
      onSectionChange?.("tasks")
      setTimeout(handleAddTask, 100)
    }
  }

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon
    const isActive = activeSection === item.id
    const hasSubItems = (item.subItems?.length ?? 0) > 0
    const isExpanded = expandedItem === item.id

    if (isCollapsed) {
      return (
        <Button
          key={item.id}
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
            isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
            "px-2",
          )}
          onClick={() => (hasSubItems ? toggleExpanded(item.id) : handleSubItemClick(item.id, item.id))}
        >
          <Icon className="h-4 w-4" />
        </Button>
      )
    }

    if (hasSubItems) {
      return (
        <div key={item.id} className="space-y-1">
          <Button
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent group",
              isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
            )}
            onClick={() => toggleExpanded(item.id)}
          >
            <div className="flex items-center">
              <Icon className="h-4 w-4 mr-3" />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight
              className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90")}
            />
          </Button>

          {isExpanded && (
            <div className="ml-6 space-y-1 animate-slide-in-up">
              {item.subItems?.map((subItem) => {
                const SubIcon = subItem.icon
                return (
                  <Button
                    key={subItem.id}
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 py-1.5 h-auto"
                    onClick={() => handleSubItemClick(subItem.id, item.id)}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary mr-3" />
                      {SubIcon && <SubIcon className="h-3.5 w-3.5 mr-2" />}
                      <span className="text-sm font-medium">{subItem.label}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return (
      <Button
        key={item.id}
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
          isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
        )}
        onClick={() => handleSubItemClick(item.id, item.id)}
      >
        <Icon className="h-4 w-4 mr-3" />
        <span className="font-medium">{item.label}</span>
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        "h-screen sticky top-0"
      )}
    >
      {/* Sidebar Header */}
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
      <ScrollArea className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-2">{menuItems.map((item) => renderMenuItem(item))}</nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
            isCollapsed && "px-2",
          )}
          onClick={logout}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </Button>
      </div>

      <style jsx>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}