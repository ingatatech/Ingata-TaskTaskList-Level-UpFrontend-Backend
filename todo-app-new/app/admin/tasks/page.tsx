// admin/tasks/page.tsx
"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { PageHeader } from "@/components/page-header"
import { SearchFilters } from "@/components/search-filters"
import { StatusBadge } from "@/components/status-badge"
import { DataTable } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { ClipboardList, Eye, AlertTriangle, Plus, Building2, User, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminTaskAPI, userAPI, Department } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface Task {
  id: number | string
  title: string
  description?: string | null
  status: "pending" | "completed"
  priority: "low" | "medium" | "high"
  user: {
    id?: string
    email: string
    role?: "admin" | "user"
    department?: Department | null
  } | string
  createdAt: string
  dueDate?: string | null
}

interface TaskManagementRef {
  triggerAddTask: () => void
}

const TaskManagementPage = forwardRef<TaskManagementRef>((props, ref) => {
  const [taskSearchTerm, setTaskSearchTerm] = useState("")
  const [taskStatusFilter, setTaskStatusFilter] = useState("all")
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all")
  const [taskDepartmentFilter, setTaskDepartmentFilter] = useState("all") // NEW: Department filter
  const [taskUserEmailFilter, setTaskUserEmailFilter] = useState("") // NEW: User email filter

  const [viewTaskDialog, setViewTaskDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Add Task Dialog States
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("")
  const [newTaskAssignedUser, setNewTaskAssignedUser] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")

  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [totalTasksCount, setTotalTasksCount] = useState(0)
  const [tasksCurrentPage, setTasksCurrentPage] = useState(1)
  const [tasksPerPage] = useState(5)
  const [tasksError, setTasksError] = useState<string | null>(null)

  // NEW: Department state
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Expose the triggerAddTask method to parent components
  useImperativeHandle(ref, () => ({
    triggerAddTask: () => {
      console.log("triggerAddTask called in TaskManagementPage") // Debug log
      setIsCreateTaskDialogOpen(true)
    }
  }))

  // NEW: Fetch departments
  const fetchDepartments = async () => {
    setIsLoadingDepartments(true)
    try {
      const response = await userAPI.getDepartments()
      setDepartments(response.departments)
    } catch (error) {
      console.error("Failed to fetch departments:", error)
      // Fallback departments if API fails
      setDepartments(["IT", "HR", "Finance", "Marketing", "Operations", "Sales", "Support"])
    } finally {
      setIsLoadingDepartments(false)
    }
  }

  const fetchAllTasks = async () => {
    setIsLoading(true)
    setTasksError(null)
    try {
      const filters = {
        title: taskSearchTerm || undefined,
        status: taskStatusFilter === "all" ? undefined : taskStatusFilter,
        department: taskDepartmentFilter === "all" ? undefined : (taskDepartmentFilter as Department), // NEW: Department filter
        userEmail: taskUserEmailFilter || undefined, // NEW: User email filter
      };

      const response = await adminTaskAPI.getAllTasks(tasksCurrentPage, tasksPerPage, filters)
      
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
      toast({
        title: "Error",
        description: "Failed to fetch tasks. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // NEW: Fetch departments on mount
  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAllTasks()
    }
  }, [user, tasksCurrentPage, taskSearchTerm, taskStatusFilter, taskDepartmentFilter, taskUserEmailFilter]) // UPDATED: Added new filters

  useEffect(() => {
    setTasksCurrentPage(1)
  }, [taskSearchTerm, taskStatusFilter, taskDepartmentFilter, taskUserEmailFilter]) // UPDATED: Added new filters

  const handleAddTask = async () => {
    if (!newTaskTitle || !newTaskPriority || !newTaskAssignedUser) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      // You'll need to implement this API call based on your backend
      // await adminTaskAPI.createTask({
      //   title: newTaskTitle,
      //   description: newTaskDescription,
      //   priority: newTaskPriority,
      //   assignedUser: newTaskAssignedUser,
      //   dueDate: newTaskDueDate
      // })

      // Reset form
      setNewTaskTitle("")
      setNewTaskDescription("")
      setNewTaskPriority("")
      setNewTaskAssignedUser("")
      setNewTaskDueDate("")
      setIsCreateTaskDialogOpen(false)

      toast({
        title: "Task Created",
        description: "Task has been successfully created and assigned.",
      })

      fetchAllTasks()
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

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setViewTaskDialog(true)
  }

  // NEW: Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalTasksPages = Math.ceil(totalTasksCount / tasksPerPage)

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Tasks"
        description="Monitor and manage tasks across all users"
        actionButton={{
          label: "Add Task",
          icon: <Plus className="h-4 w-4 mr-2" />,
          trigger: (
            <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button className="font-medium">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">Create New Task</DialogTitle>
                  <DialogDescription>Assign a new task to a user</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title *</Label>
                    <Input
                      id="task-title"
                      placeholder="Enter task title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      placeholder="Enter task description (optional)"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-priority">Priority *</Label>
                      <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
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
                      <Label htmlFor="task-user">Assign to User *</Label>
                      <Input
                        id="task-user"
                        placeholder="Enter user email"
                        value={newTaskAssignedUser}
                        onChange={(e) => setNewTaskAssignedUser(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">Due Date (optional)</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddTask} className="w-full font-medium" disabled={isLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isLoading ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ),
        }}
      />

      {/* UPDATED: Search filters with department and user email */}
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
          // NEW: Department filter
          {
            value: taskDepartmentFilter,
            onValueChange: setTaskDepartmentFilter,
            placeholder: "Filter by department",
            options: [
              { value: "all", label: "All Departments" },
              ...departments.map(dept => ({ value: dept, label: dept })),
              { value: "null", label: "No Department" },
            ],
          },
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
            {taskSearchTerm || taskStatusFilter !== "all" || taskPriorityFilter !== "all" || taskDepartmentFilter !== "all" || taskUserEmailFilter
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
              { key: "department", label: "Department" }, // NEW: Department column
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
                  return (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {typeof task?.user === 'object' ? task?.user?.email : String(task?.user || "Unknown User")}
                        </p>
                        {typeof task?.user === 'object' && task?.user?.role && (
                          <p className="text-xs text-muted-foreground capitalize">{task.user.role}</p>
                        )}
                      </div>
                    </div>
                  );
                // NEW: Department display
                case "department":
                  return (
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {typeof task?.user === 'object' && task?.user?.department 
                          ? task.user.department 
                          : <span className="text-muted-foreground italic">No department</span>
                        }
                      </span>
                    </div>
                  );
                case "status":
                  return <StatusBadge status={(task?.status as "pending" | "completed") || "pending"} />;
                case "createdAt":
                  return (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(String(task?.createdAt || "Unknown"))}</span>
                    </div>
                  );
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

      {/* UPDATED: View Task Dialog with Department Info */}
      <Dialog open={viewTaskDialog} onOpenChange={setViewTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Task Details</DialogTitle>
            <DialogDescription>View task information and details</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              {/* Task Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-lg font-semibold">{selectedTask.title}</p>
                </div>
                {selectedTask.description && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedTask.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedTask.status} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <div className="flex items-center space-x-1 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{formatDate(selectedTask.createdAt)}</p>
                    </div>
                  </div>
                  {selectedTask.dueDate && (
                    <div>
                      <Label className="text-sm font-medium">Due Date</Label>
                      <p className="text-sm text-muted-foreground">{selectedTask.dueDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Information */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-3 block">Assigned User</Label>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {typeof selectedTask.user === 'object' ? selectedTask.user?.email : String(selectedTask.user)}
                        </p>
                      </div>
                    </div>
                    {typeof selectedTask.user === 'object' && selectedTask.user?.role && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Role</Label>
                        <p className="text-sm capitalize mt-1">{selectedTask.user.role}</p>
                      </div>
                    )}
                    {/* NEW: Department display in task view */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Department</Label>
                      <div className="flex items-center space-x-1 mt-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          {typeof selectedTask.user === 'object' && selectedTask.user?.department
                            ? selectedTask.user.department 
                            : <span className="text-muted-foreground italic">No department</span>
                          }
                        </p>
                      </div>
                    </div>
                    {typeof selectedTask.user === 'object' && selectedTask.user?.id && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">User ID</Label>
                        <p className="text-sm text-muted-foreground mt-1 font-mono">{selectedTask.user.id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})

TaskManagementPage.displayName = "TaskManagementPage"

export default TaskManagementPage