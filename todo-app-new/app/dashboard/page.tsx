//dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { StatsGrid } from "@/components/stats-grid"
import { SearchFilters } from "@/components/search-filters"
import { StatusBadge } from "@/components/status-badge"
import { ActionButtons } from "@/components/action-buttons"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Edit, Trash2, CheckCircle2, Clock, AlertCircle, Calendar, Eye } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { taskAPI } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/types"

// ✅ define TaskResponse type once
interface TaskResponse {
  data: Task[]
  total?: number
  page?: number
  limit?: number
}

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState("tasks")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [tasksPerPage] = useState(5)
  
  const [totalTasks, setTotalTasks] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [isLoading, setIsLoading] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending" as "pending" | "completed",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  })

  const [editTask, setEditTask] = useState<Partial<Task>>({
    id: 0,
    title: "",
    description: "",
    status: "pending" as "pending" | "completed",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  })

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewTask, setViewTask] = useState<Task | null>(null)

  useEffect(() => {
    if (user?.role === "user") {
      fetchTasks()
    }
  }, [user])

  useEffect(() => {
    if (user?.role === "user") {
      fetchTasks()
    }
  }, [currentPage, searchTerm, filterStatus])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)

      const response = await taskAPI.getTasks(currentPage, tasksPerPage, {
        title: searchTerm,
        status: filterStatus === "all" ? undefined : filterStatus,
      })

      //  FIXED: Parse properly and type it
      if (response && typeof response === "object" && "data" in response) {
        const apiResponse: TaskResponse = response as TaskResponse
        setTasks(apiResponse.data || [])
        setTotalTasks(apiResponse.total || 0)
        setTotalPages(Math.ceil((apiResponse.total || 0) / tasksPerPage))
      } else if (response && Array.isArray(response)) {
        const tasksArray = response as Task[]
        setTasks(tasksArray)
        setTotalTasks(tasksArray.length)
        setTotalPages(1)
      } else {
        setTasks([])
        setTotalTasks(0)
        setTotalPages(1)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
      setTasks([])
      setTotalTasks(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return

    try {
      setIsLoading(true)
      await taskAPI.createTask(newTask.title, newTask.description)

      setNewTask({ title: "", description: "", priority: "medium", dueDate: "", status: "pending" })
      setIsCreateDialogOpen(false)

      toast({
        title: "Task Created",
        description: "Your task has been created successfully.",
      })

      fetchTasks()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditTask = async () => {
    if (!editTask.id) return

    try {
      setIsLoading(true)
      await taskAPI.updateTask(editTask.id.toString(), {
        title: editTask.title,
        description: editTask.description,
        status: editTask.status as "pending" | "completed",
      })

      setIsEditDialogOpen(false)

      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully.",
      })

      fetchTasks()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      setIsLoading(true)
      await taskAPI.deleteTask(taskId.toString())

      toast({
        title: "Task Deleted",
        description: "Your task has been deleted successfully.",
      })

      fetchTasks()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (task: Task) => {
    setEditTask(task)
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (task: Task) => {
    setViewTask(task)
    setIsViewDialogOpen(true)
  }

  // FIXED: Updated taskStats to use totalTasks from API
  const taskStats = {
    total: totalTasks, // Use totalTasks from API instead of tasks.length
    completed: tasks.filter((t: Task) => t.status === "completed").length,
    pending: tasks.filter((t: Task) => t.status === "pending").length,
    overdue: 1, // Mock overdue count
  }

  const taskStatsData = [
    {
      title: "Total Tasks",
      value: taskStats.total,
      icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Completed",
      value: taskStats.completed,
      icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
    },
    {
      title: "Pending",
      value: taskStats.pending,
      icon: <Clock className="h-4 w-4 text-secondary" />,
    },
    {
      title: "Overdue",
      value: taskStats.overdue,
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
    },
  ]

  // FIXED: Removed double pagination - API handles all filtering and pagination
  const renderTaskManagement = () => {
    // Use tasks directly from API - no client-side filtering/pagination needed
    const displayTasks = tasks

    return (
      <div className="space-y-6">
        <PageHeader
          title="My Tasks"
          description="Manage your personal tasks and track progress"
          actionButton={{
            label: "New Task",
            icon: <Plus className="h-4 w-4 mr-2" />,
            trigger: (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="font-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-serif">Create New Task</DialogTitle>
                    <DialogDescription>Add a new task to your personal task list</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input
                        id="task-title"
                        placeholder="Enter task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-description">Description</Label>
                      <Textarea
                        id="task-description"
                        placeholder="Enter task description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-status">Status</Label>
                        <Select
                          value={newTask.status}
                          onValueChange={(value: string) =>
                            setNewTask({ ...newTask, status: value as "pending" | "completed" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-priority">Priority</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value: string) =>
                            setNewTask({ ...newTask, priority: value as "low" | "medium" | "high" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-due">Due Date</Label>
                        <Input
                          id="task-due"
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateTask} className="w-full font-medium">
                      Create Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ),
          }}
        />

        <StatsGrid stats={taskStatsData} />

        {/* FIXED: Reset page when searching/filtering */}
        <SearchFilters
          searchValue={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value)
            setCurrentPage(1) // Reset to first page when searching
          }}
          searchPlaceholder="Search tasks..."
          filters={[
            {
              value: filterStatus,
              onValueChange: (value) => {
                setFilterStatus(value)
                setCurrentPage(1) // Reset to first page when filtering
              },
              placeholder: "Filter by status",
              options: [
                { value: "all", label: "All Tasks" },
                { value: "pending", label: "Pending" },
                { value: "completed", label: "Completed" },
              ],
            },
          ]}
        />

        <DataTable
          title="Task List"
          description="Your personal tasks and their current status"
          columns={[
            { key: "task", label: "Task" },
            { key: "status", label: "Status" },
            { key: "priority", label: "Priority" },
            { key: "dueDate", label: "Due Date" },
            { key: "actions", label: "Actions", className: "text-right" },
          ]}
          data={displayTasks}
          renderCell={(task, column) => {
            switch (column.key) {
              case "task":
                return (
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                )
              case "status":
                return <StatusBadge status={task.status as any} />
              case "priority":
                return task.priority ? <StatusBadge status={task.priority as any} type="priority" /> : <span>-</span>
              case "dueDate":
                return (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{task.dueDate || "-"}</span>
                  </div>
                )
              case "actions":
                return (
                  <ActionButtons
                    actions={[
                      {
                        icon: <Eye className="h-4 w-4" />,
                        trigger: (
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(task)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        ),
                      },
                      {
                        icon: <Edit className="h-4 w-4" />,
                        trigger: (
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(task)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        ),
                      },
                      {
                        icon: <Trash2 className="h-4 w-4" />,
                        className: "text-destructive hover:text-destructive",
                        trigger: (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ),
                      },
                    ]}
                  />
                )
              default:
                return null
            }
          }}
        />

        {/* FIXED: Use totalPages and totalTasks from API */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={tasksPerPage}
          totalItems={totalTasks}
        />

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Create New Task</DialogTitle>
              <DialogDescription>Add a new task to your personal task list</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value: string) =>
                      setNewTask({ ...newTask, status: value as "pending" | "completed" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: string) =>
                      setNewTask({ ...newTask, priority: value as "low" | "medium" | "high" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateTask} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Edit Task</DialogTitle>
              <DialogDescription>Update task details and status</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editTask.status}
                    onValueChange={(value: string) =>
                      setEditTask({ ...editTask, status: value as "pending" | "completed" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editTask.priority}
                    onValueChange={(value: string) =>
                      setEditTask({ ...editTask, priority: value as "low" | "medium" | "high" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                />
              </div>
              <Button onClick={handleEditTask} className="w-full">
                Update Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Task Details</DialogTitle>
              <DialogDescription>Complete information about this task</DialogDescription>
            </DialogHeader>
            {viewTask && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Task Title</Label>
                    <p className="text-lg font-medium">{viewTask.title}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <StatusBadge status={viewTask.status as any} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm leading-relaxed">{viewTask.description || "No description provided"}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    {viewTask.priority ? (
                      <StatusBadge status={viewTask.priority as any} type="priority" />
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{viewTask.createdAt || "-"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{viewTask.dueDate || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      openEditDialog(viewTask)
                    }}
                  >
                    Edit Task
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-foreground">My Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Profile Settings</CardTitle>
          <CardDescription>Manage your account information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="Enter new password" />
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-foreground">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Preferences</CardTitle>
          <CardDescription>Customize your TaskFlow experience</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User preferences panel coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "tasks":
        return renderTaskManagement()
      case "profile":
        return renderProfile()
      case "settings":
        return renderSettings()
      default:
        return renderTaskManagement()
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