// admin/overview/page.tsx
"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { StatsGrid } from "@/components/stats-grid"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, TrendingUp, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { userAPI, adminTaskAPI } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface User {
  id: number | string
  name?: string | null
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  tasks: number
  createdAt: string
}

interface Task {
  id: number | string
  title: string
  description?: string | null
  status: "pending" | "completed"
  priority: "low" | "medium" | "high"
  user: string
  createdAt: string
  dueDate?: string | null
}

export default function OverviewPage() {
  const [users, setUsers] = useState<User[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [totalUsersCount, setTotalUsersCount] = useState(0)
  const [totalTasksCount, setTotalTasksCount] = useState(0)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  const fetchUsers = async () => {
    setIsLoading(true)
    setUsersError(null)
    try {
      const response = await userAPI.getUsers(1, 5, {})
      
      if (!response) {
        throw new Error("No response from server")
      }
      
      setUsers((response?.data || []) as any[])
      setTotalUsersCount(response.total || 0)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setUsersError(error instanceof Error ? error.message : "Failed to fetch users")
      setUsers([])
      setTotalUsersCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllTasks = async () => {
    setIsLoading(true)
    setTasksError(null)
    try {
      const response = await adminTaskAPI.getAllTasks(1, 5, {})
      
      if (!response) {
        throw new Error("No response from server")
      }
      
      setAllTasks((response?.data as any[]) || [])  
      setTotalTasksCount(response.total || 0)
      
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      setTasksError(error instanceof Error ? error.message : "Failed to fetch tasks")
      setAllTasks([])
      setTotalTasksCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers()
      fetchAllTasks()
    }
  }, [user])

  const stats = {
    totalUsers: totalUsersCount || 0,
    activeUsers: users.filter((u) => u && u.status === "active").length || 0,
    totalTasks: totalTasksCount || 0,
    completedTasks: allTasks.filter((t) => t && t.status === "completed").length || 0,
    pendingTasks: allTasks.filter((t) => t && t.status === "pending").length || 0,
  }

  const overviewStats = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      trend: "+12%",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      trend: "+8%",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: <ClipboardList className="h-4 w-4 text-muted-foreground" />,
      trend: "+23%",
    },
    {
      title: "Completion Rate",
      value: stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : "0%",
      icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
      trend: "+5%",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" description="Monitor your platform's performance and user activity" />

      <StatsGrid stats={overviewStats} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {usersError ? (
              <div className="flex items-center justify-center p-4 text-destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>Failed to load users</span>
              </div>
            ) : (
              <div className="space-y-4">
                {users.slice(0, 3).map((user) => (
                  <div key={user?.id || Math.random()} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user?.name || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
                    </div>
                    <StatusBadge status={(user?.status as "active" | "inactive") || "inactive"} />
                  </div>
                ))}
                {users.length === 0 && !isLoading && (
                  <p className="text-center text-muted-foreground py-4">No users found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Task Status</CardTitle>
            <CardDescription>Current task distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksError ? (
              <div className="flex items-center justify-center p-4 text-destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>Failed to load tasks</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Completed</span>
                  </div>
                  <span className="font-medium">{stats.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-secondary" />
                    <span>Pending</span>
                  </div>
                  <span className="font-medium">{stats.pendingTasks}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}