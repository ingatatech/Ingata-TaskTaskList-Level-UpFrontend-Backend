"use client"

import { useState } from "react"
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
import { Users, ClipboardList, UserPlus, Mail, Edit, Trash2, Eye, TrendingUp, CheckCircle2, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [editUserName, setEditUserName] = useState("")
  const [editUserEmail, setEditUserEmail] = useState("")
  const [editUserRole, setEditUserRole] = useState("")
  const [editUserStatus, setEditUserStatus] = useState("")

  const [usersCurrentPage, setUsersCurrentPage] = useState(1)
  const [usersPerPage] = useState(5)

  const [tasksCurrentPage, setTasksCurrentPage] = useState(1)
  const [tasksPerPage] = useState(5)

  const { toast } = useToast()

  // Mock data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      role: "user",
      tasks: 12,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "active",
      role: "user",
      tasks: 8,
      createdAt: "2024-01-20",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      status: "inactive",
      role: "user",
      tasks: 3,
      createdAt: "2024-02-01",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      status: "active",
      role: "user",
      tasks: 15,
      createdAt: "2024-02-05",
    },
    {
      id: 5,
      name: "David Brown",
      email: "david@example.com",
      status: "active",
      role: "user",
      tasks: 7,
      createdAt: "2024-02-08",
    },
    {
      id: 6,
      name: "Emily Davis",
      email: "emily@example.com",
      status: "inactive",
      role: "user",
      tasks: 4,
      createdAt: "2024-02-10",
    },
    {
      id: 7,
      name: "Alex Martinez",
      email: "alex@example.com",
      status: "active",
      role: "user",
      tasks: 11,
      createdAt: "2024-02-12",
    },
    {
      id: 8,
      name: "Lisa Anderson",
      email: "lisa@example.com",
      status: "active",
      role: "user",
      tasks: 9,
      createdAt: "2024-02-14",
    },
  ])

  const allTasks = [
    {
      id: 1,
      title: "Complete project proposal",
      user: "John Doe",
      status: "completed",
      priority: "high",
      createdAt: "2024-02-15",
    },
    {
      id: 2,
      title: "Review design mockups",
      user: "Jane Smith",
      status: "pending",
      priority: "medium",
      createdAt: "2024-02-14",
    },
    {
      id: 3,
      title: "Update documentation",
      user: "Mike Johnson",
      status: "pending",
      priority: "low",
      createdAt: "2024-02-13",
    },
    {
      id: 4,
      title: "Implement user authentication",
      user: "Sarah Wilson",
      status: "pending",
      priority: "high",
      createdAt: "2024-02-12",
    },
    {
      id: 5,
      title: "Create database schema",
      user: "David Brown",
      status: "completed",
      priority: "medium",
      createdAt: "2024-02-11",
    },
    {
      id: 6,
      title: "Design landing page",
      user: "Emily Davis",
      status: "pending",
      priority: "low",
      createdAt: "2024-02-10",
    },
    {
      id: 7,
      title: "Setup CI/CD pipeline",
      user: "Alex Martinez",
      status: "completed",
      priority: "high",
      createdAt: "2024-02-09",
    },
    {
      id: 8,
      title: "Write unit tests",
      user: "Lisa Anderson",
      status: "pending",
      priority: "medium",
      createdAt: "2024-02-08",
    },
  ]

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setViewUserDialog(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditUserName(user.name)
    setEditUserEmail(user.email)
    setEditUserRole(user.role)
    setEditUserStatus(user.status)
    setEditUserDialog(true)
  }

  const handleUpdateUser = () => {
    setUsers(
      users.map((user) =>
        user.id === selectedUser.id
          ? { ...user, name: editUserName, email: editUserEmail, role: editUserRole, status: editUserStatus }
          : user,
      ),
    )
    setEditUserDialog(false)
    toast({
      title: "User Updated",
      description: "User information has been successfully updated.",
    })
  }

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId))
    toast({
      title: "User Deleted",
      description: "User has been successfully removed from the system.",
      variant: "destructive",
    })
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setViewTaskDialog(true)
  }

  const handleAddUser = () => {
    if (!newUserName || !newUserEmail || !newUserRole) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const newUser = {
      id: users.length + 1,
      name: newUserName,
      email: newUserEmail,
      status: "active",
      role: newUserRole,
      tasks: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setUsers([...users, newUser])
    setNewUserName("")
    setNewUserEmail("")
    setNewUserRole("")

    toast({
      title: "User Added",
      description: "OTP invitation sent successfully. User will receive login credentials via email.",
    })
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    totalTasks: 1247,
    completedTasks: 892,
    pendingTasks: 355,
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
      value: "71.5%",
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
            <div className="space-y-4">
              {users.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <StatusBadge status={user.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Task Status</CardTitle>
            <CardDescription>Current task distribution</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderUserManagement = () => {
    const filteredUsers = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || user.status === filterStatus
      return matchesSearch && matchesStatus
    })

    const totalUsersPages = Math.ceil(filteredUsers.length / usersPerPage)
    const paginatedUsers = filteredUsers.slice((usersCurrentPage - 1) * usersPerPage, usersCurrentPage * usersPerPage)

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
                    <Button onClick={handleAddUser} className="w-full font-medium">
                      <Mail className="h-4 w-4 mr-2" />
                      Send OTP Invitation
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
          searchPlaceholder="Search users..."
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

        <DataTable
          title="Users"
          description="Manage user accounts and permissions"
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "status", label: "Status" },
            { key: "tasks", label: "Tasks" },
            { key: "createdAt", label: "Created" },
            { key: "actions", label: "Actions", className: "text-right" },
          ]}
          data={paginatedUsers}
          renderCell={(user, column) => {
            switch (column.key) {
              case "name":
                return <span className="font-medium">{user.name}</span>
              case "email":
                return user.email
              case "status":
                return <StatusBadge status={user.status} />
              case "tasks":
                return user.tasks
              case "createdAt":
                return user.createdAt
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
                            Are you sure you want to delete {user.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
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
                return null
            }
          }}
        />

        <Pagination
          currentPage={usersCurrentPage}
          totalPages={totalUsersPages}
          onPageChange={setUsersCurrentPage}
          itemsPerPage={usersPerPage}
          totalItems={filteredUsers.length}
        />

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
                    <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
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
              <Button onClick={handleUpdateUser} className="w-full font-medium">
                Update User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const renderTaskManagement = () => {
    const filteredTasks = allTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.user.toLowerCase().includes(taskSearchTerm.toLowerCase())
      const matchesStatus = taskStatusFilter === "all" || task.status === taskStatusFilter
      const matchesPriority = taskPriorityFilter === "all" || task.priority === taskPriorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })

    const totalTasksPages = Math.ceil(filteredTasks.length / tasksPerPage)
    const paginatedTasks = filteredTasks.slice((tasksCurrentPage - 1) * tasksPerPage, tasksCurrentPage * tasksPerPage)

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
            {
              value: taskPriorityFilter,
              onValueChange: setTaskPriorityFilter,
              placeholder: "Filter by priority",
              options: [
                { value: "all", label: "All Priorities" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ],
            },
          ]}
        />

        <DataTable
          title="Tasks Overview"
          description="All tasks across the platform"
          columns={[
            { key: "title", label: "Task" },
            { key: "user", label: "User" },
            { key: "status", label: "Status" },
            { key: "priority", label: "Priority" },
            { key: "createdAt", label: "Created" },
            { key: "actions", label: "Actions", className: "text-right" },
          ]}
          data={paginatedTasks}
          renderCell={(task, column) => {
            switch (column.key) {
              case "title":
                return <span className="font-medium">{task.title}</span>
              case "user":
                return task.user
              case "status":
                return <StatusBadge status={task.status} />
              case "priority":
                return <StatusBadge status={task.priority} type="priority" />
              case "createdAt":
                return task.createdAt
              case "actions":
                return (
                  <Button variant="ghost" size="sm" onClick={() => handleViewTask(task)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )
              default:
                return null
            }
          }}
        />

        <Pagination
          currentPage={tasksCurrentPage}
          totalPages={totalTasksPages}
          onPageChange={setTasksCurrentPage}
          itemsPerPage={tasksPerPage}
          totalItems={filteredTasks.length}
        />

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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Assigned User</Label>
                    <p className="text-sm text-muted-foreground">{selectedTask.user}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedTask.status} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedTask.priority} type="priority" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">{selectedTask.createdAt}</p>
                  </div>
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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  )
}
