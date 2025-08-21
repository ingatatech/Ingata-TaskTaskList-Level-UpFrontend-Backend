"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { StatsGrid } from "@/components/stats-grid"
import { SearchFilters } from "@/components/search-filters"
import { StatusBadge } from "@/components/status-badge"
import { DataTable } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, ClipboardList, UserPlus, Mail, Edit, Trash2, Eye, TrendingUp, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { userAPI, adminTaskAPI } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"


// These interfaces define the shape of your data.
// They are unchanged from your original code.
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

// This interface is an assumption about the API response structure.
// We are assuming the API will return a list of data and a total count.
interface PaginatedApiResponse<T> {
  data?: T[]
  tasks?: T[] // Add this for task-specific responses
  totalItems?: number
  message?: string
  success?: boolean
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [taskSearchTerm, setTaskSearchTerm] = useState("")
  const [taskStatusFilter, setTaskStatusFilter] = useState("all")
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all")
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("")
  const [adminName, setAdminName] = useState("Admin User")
  const [adminEmail, setAdminEmail] = useState("admin@taskflow.com")

  const [editUserDialog, setEditUserDialog] = useState(false)
  const [viewUserDialog, setViewUserDialog] = useState(false)
  const [viewTaskDialog, setViewTaskDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editUserName, setEditUserName] = useState("")
  const [editUserEmail, setEditUserEmail] = useState("")
  const [editUserRole, setEditUserRole] = useState("")
  const [editUserStatus, setEditUserStatus] = useState("")

  // State to hold users for the current page
  const [users, setUsers] = useState<User[]>([])
  // State to hold tasks for the current page
  const [allTasks, setAllTasks] = useState<Task[]>([])

  // New state to hold the total count for all users and tasks
  const [totalUsersCount, setTotalUsersCount] = useState(0)
  const [totalTasksCount, setTotalTasksCount] = useState(0)
  
  // Pagination state for users
  const [usersCurrentPage, setUsersCurrentPage] = useState(1)
  const [usersPerPage] = useState(5)

  // Pagination state for tasks
  const [tasksCurrentPage, setTasksCurrentPage] = useState(1)
  const [tasksPerPage] = useState(5)

  // Add error states
  const [usersError, setUsersError] = useState<string | null>(null)
  const [tasksError, setTasksError] = useState<string | null>(null)

  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Fetches users from the API with pagination, search, and filtering.
   * This function now expects the API to return a total count of items.
   */
  const fetchUsers = async () => {
    setIsLoading(true)
    setUsersError(null)
    try {
      const response = await userAPI.getUsers(usersCurrentPage, usersPerPage, {
        email: searchTerm,
        status: filterStatus === "all" ? undefined : filterStatus,
      })
      
      console.log("Users API response:", response) // Debug log
      
      // Check if response is valid
      if (!response) {
        throw new Error("No response from server")
      }
      
      // Handle your API response format: { total, page, limit, data }
     setUsers((response?.data || []) as any[])
      setTotalUsersCount(response.total || 0) // Use 'total' not 'totalItems'
      
      console.log("Set users:", response.data?.length, "Total count:", response.total) // Debug log
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setUsersError(error instanceof Error ? error.message : "Failed to fetch users")
      setUsers([])
      setTotalUsersCount(0)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Fetches all tasks from the API with pagination, search, and filtering.
   * This function now expects the API to return a total count of items.
   */
  const fetchAllTasks = async () => {
    setIsLoading(true)
    setTasksError(null)
    try {
      const filters = {
        title: taskSearchTerm || undefined,
        status: taskStatusFilter === "all" ? undefined : taskStatusFilter,
        // Note: Your API doesn't support priority filtering yet
        // priority: taskPriorityFilter === "all" ? undefined : taskPriorityFilter,
      };

      console.log("Fetching tasks with filters:", filters) // Debug log

      const response = await adminTaskAPI.getAllTasks(tasksCurrentPage, tasksPerPage, filters)
      
      console.log("Tasks API response:", response) // Debug log
      
      // Check if response is valid
      if (!response) {
        throw new Error("No response from server")
      }
      
      // Handle your API response format: { total, page, limit, data }
      setAllTasks((response?.data as any[]) || [])  
      setTotalTasksCount(response.total || 0) // Use 'total' not 'totalItems'
      
      console.log("Set tasks:", response.data?.length, "Total count:", response.total) // Debug log
      
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      setTasksError(error instanceof Error ? error.message : "Failed to fetch tasks")
      setAllTasks([])
      setTotalTasksCount(0)
      toast({
        title: "Error",
        description: "Failed to fetch tasks. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Effect hook to fetch users whenever pagination, search, or filters change.
  useEffect(() => {
    if (user?.role === "admin" && (activeSection === "overview" || activeSection === "users")) {
      fetchUsers()
    }
  }, [user, usersCurrentPage, searchTerm, filterStatus, activeSection])

  // Effect hook to fetch tasks whenever pagination, search, or filters change.
  useEffect(() => {
    if (user?.role === "admin" && (activeSection === "overview" || activeSection === "tasks")) {
      fetchAllTasks()
    }
  }, [user, tasksCurrentPage, taskSearchTerm, taskStatusFilter, activeSection]) // Removed taskPriorityFilter

  // Reset pagination when switching sections or changing filters
  useEffect(() => {
    setUsersCurrentPage(1)
  }, [searchTerm, filterStatus])

  useEffect(() => {
    setTasksCurrentPage(1)
  }, [taskSearchTerm, taskStatusFilter]) // Removed taskPriorityFilter

  // Reset all states when switching sections
  useEffect(() => {
    if (activeSection === "users") {
      setSearchTerm("")
      setFilterStatus("all")
      setUsersCurrentPage(1)
    } else if (activeSection === "tasks") {
      setTaskSearchTerm("")
      setTaskStatusFilter("all")
      // setTaskPriorityFilter("all") // Removed since not supported by backend
      setTasksCurrentPage(1)
    }
  }, [activeSection])

  // No change to other functions, they remain the same.
  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail || !newUserRole) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await userAPI.createUser(newUserEmail, newUserRole as "admin" | "user")

      setNewUserName("")
      setNewUserEmail("")
      setNewUserRole("")

      toast({
        title: "User Added",
        description: "OTP invitation sent successfully. User will receive login credentials via email.",
      })

      // Refresh users list after adding a new user
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser || !selectedUser.id) {
      toast({
        title: "Error",
        description: "No user selected for update",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await userAPI.updateUser(String(selectedUser.id), {
        email: editUserEmail,
        role: editUserRole as "admin" | "user",
        status: editUserStatus as "active" | "inactive",
      })

      setEditUserDialog(false)
      toast({
        title: "User Updated",
        description: "User information has been successfully updated.",
      })

      // Refresh users list after updating a user
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      setIsLoading(true)
      await userAPI.deleteUser(String(userId))

      toast({
        title: "User Deleted",
        description: "User has been successfully removed from the system.",
        variant: "destructive",
      })

      // Refresh users list after deleting a user
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setViewUserDialog(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditUserName(user.name ?? "")
    setEditUserEmail(user.email)
    setEditUserRole(user.role)
    setEditUserStatus(user.status)
    setEditUserDialog(true)
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setViewTaskDialog(true)
  }

  // These stats now use the total counts fetched from the API
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

  const renderOverview = () => (
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

  const renderUserManagement = () => {
    // Calculate pagination for users
    const totalUsersPages = Math.ceil(totalUsersCount / usersPerPage)

    return (
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Manage users, send OTP invitations, and monitor activity"
          actionButton={{
            label: "Add User",
            icon: <UserPlus className="h-4 w-4 mr-2" />,
            trigger: (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="font-medium">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-serif">Create New User</DialogTitle>
                    <DialogDescription>Send an OTP invitation to create a new user account</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Full Name</Label>
                      <Input
                        id="user-name"
                        placeholder="Enter full name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email Address</Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="Enter email address"
                        className="pl-10 h-11"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Role</Label>
                      <Select value={newUserRole} onValueChange={setNewUserRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddUser} className="w-full font-medium" disabled={isLoading}>
                      <Mail className="h-4 w-4 mr-2" />
                      {isLoading ? "Sending..." : "Send OTP Invitation"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ),
          }}
        />

        <SearchFilters
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search users by email or role..."
          filters={[
            {
              value: filterStatus,
              onValueChange: setFilterStatus,
              placeholder: "Filter by status",
              options: [
                { value: "all", label: "All Users" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
        />

        {usersError ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive mb-2">Failed to load users</p>
                <Button onClick={fetchUsers} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : isLoading && users.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <DataTable
              title="Users"
              description="Manage user accounts and permissions"
              columns={[
                { key: "email", label: "Email" },
                { key: "role", label: "Role" },
                { key: "status", label: "Status" },
                { key: "tasks", label: "Tasks" },
                { key: "createdAt", label: "Created" },
                { key: "actions", label: "Actions", className: "text-right" },
              ]}
              data={users}
              renderCell={(user, column) => {
                switch (column.key) {
                  case "email":
                    return <span className="font-medium">{String(user?.email || "No email")}</span>
                  case "role":
                    return <span className="capitalize">{String(user?.role || "user")}</span>
                  case "status":
                    return <StatusBadge status={(user?.status as "active" | "inactive") || "inactive"} />
                  case "tasks":
                    return <span>{String(user?.tasks || 0)}</span>
                  case "createdAt":
                    return <span>{String(user?.createdAt || "Unknown")}</span>
                  case "actions":
                    return (
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user?.email || "this user"}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  if (user?.id) {
                                    handleDeleteUser(user.id)
                                  }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )
                  default:
                    return <span></span>
                }
              }}
            />

            {/* User Pagination */}
            {totalUsersPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={usersCurrentPage}
                  totalPages={totalUsersPages}
                  onPageChange={setUsersCurrentPage}
                  itemsPerPage={usersPerPage}
                  totalItems={totalUsersCount}
                />
              </div>
            )}
          </>
        )}

        <Dialog open={viewUserDialog} onOpenChange={setViewUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">User Details</DialogTitle>
              <DialogDescription>View user information and activity</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.name ?? "Not Available"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedUser.status} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Role</Label>
                    <p className="text-sm text-muted-foreground capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tasks</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.tasks}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.createdAt}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Edit User</DialogTitle>
              <DialogDescription>Update user information and settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-user-name">Full Name</Label>
                <Input id="edit-user-name" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-email">Email Address</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-role">Role</Label>
                <Select value={editUserRole} onValueChange={setEditUserRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-status">Status</Label>
                <Select value={editUserStatus} onValueChange={setEditUserStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateUser} className="w-full font-medium" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // TASK MANAGEMENT - FIXED VERSION
  const renderTaskManagement = () => {
    // Calculate pagination for tasks - use the total count from API
    const totalTasksPages = Math.ceil(totalTasksCount / tasksPerPage)

    return (
      <div className="space-y-6">
        <PageHeader title="All Tasks" description="Monitor and manage tasks across all users" />

        <SearchFilters
          searchValue={taskSearchTerm}
          onSearchChange={setTaskSearchTerm}
          searchPlaceholder="Search tasks..."
          filters={[
            {
              value: taskStatusFilter,
              onValueChange: setTaskStatusFilter,
              placeholder: "Filter by status",
              options: [
                { value: "all", label: "All Tasks" },
                { value: "pending", label: "Pending" },
                { value: "completed", label: "Completed" },
              ],
            },
            // Temporarily removed priority filter since backend doesn't support it
            // {
            //   value: taskPriorityFilter,
            //   onValueChange: setTaskPriorityFilter,
            //   placeholder: "Filter by priority",
            //   options: [
            //     { value: "all", label: "All Priorities" },
            //     { value: "high", label: "High" },
            //     { value: "medium", label: "Medium" },
            //     { value: "low", label: "Low" },
            //   ],
            // },
          ]}
        />

        {tasksError ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive mb-2">Failed to load tasks</p>
                <p className="text-sm text-muted-foreground mb-4">{tasksError}</p>
                <Button onClick={fetchAllTasks} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : isLoading && allTasks.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            </CardContent>
          </Card>
        ) : allTasks.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No tasks found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {taskSearchTerm || taskStatusFilter !== "all" || taskPriorityFilter !== "all"
                ? "Try adjusting your search filters"
                : "Tasks will appear here once users create them"}
            </p>
          </div>
        ) : (
          <>
            <DataTable
              title="Tasks Overview"
              description="All tasks across the platform"
              columns={[
                { key: "title", label: "Task" },
                { key: "user", label: "User" },
                { key: "status", label: "Status" },
                { key: "createdAt", label: "Created" },
                { key: "actions", label: "Actions", className: "text-right" },
              ]}
              data={allTasks}
              renderCell={(task, column) => {
                switch (column.key) {
                  case "title":
                    return <span className="font-medium">{String(task?.title || "Untitled Task")}</span>;
                  case "user":
                    return <span className="text-sm">{String(task?.user?.email || task?.user || "Unknown User")}</span>;
                  case "status":
                    return <StatusBadge status={(task?.status as "pending" | "completed") || "pending"} />;
                  case "createdAt":
                    return <span className="text-sm">{String(task?.createdAt || "Unknown")}</span>;
                  case "actions":
                    return (
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewTask(task)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  default:
                    return null
                }
              }}
            />

            {/* Task Pagination */}
            {totalTasksPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={tasksCurrentPage}
                  totalPages={totalTasksPages}
                  onPageChange={setTasksCurrentPage}
                  itemsPerPage={tasksPerPage}
                  totalItems={totalTasksCount}
                />
              </div>
            )}
          </>
        )}

        {/* Task Details Dialog */}
        <Dialog open={viewTaskDialog} onOpenChange={setViewTaskDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Task Details</DialogTitle>
              <DialogDescription>View task information and details</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground">{selectedTask.title}</p>
                </div>
                {selectedTask.description && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Assigned User</Label>
                    <p className="text-sm text-muted-foreground">{(selectedTask.user as any)?.email || selectedTask.user}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedTask.status} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">{selectedTask.createdAt}</p>
                  </div>
                  {selectedTask.dueDate && (
                    <div>
                      <Label className="text-sm font-medium">Due Date</Label>
                      <p className="text-sm text-muted-foreground">{selectedTask.dueDate}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview()
      case "users":
        return renderUserManagement()
      case "tasks":
        return renderTaskManagement()
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-foreground">Admin Profile</h2>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Profile Settings</CardTitle>
                <CardDescription>Manage your admin account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                </div>
                <Button>Update Profile</Button>
              </CardContent>
            </Card>
          </div>
        )
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-foreground">Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">System Settings</CardTitle>
                <CardDescription>Configure platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">System settings panel coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  // Add error boundary for the whole component
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  )
}