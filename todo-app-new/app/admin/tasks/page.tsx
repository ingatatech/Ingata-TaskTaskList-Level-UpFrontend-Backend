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
import { ClipboardList, Eye, AlertTriangle, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminTaskAPI } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

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

interface TaskManagementRef {
  triggerAddTask: () => void
}

const TaskManagementPage = forwardRef<TaskManagementRef>((props, ref) => {
  const [taskSearchTerm, setTaskSearchTerm] = useState("")
  const [taskStatusFilter, setTaskStatusFilter] = useState("all")
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all")

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

  const fetchAllTasks = async () => {
    setIsLoading(true)
    setTasksError(null)
    try {
      const filters = {
        title: taskSearchTerm || undefined,
        status: taskStatusFilter === "all" ? undefined : taskStatusFilter,
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

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAllTasks()
    }
  }, [user, tasksCurrentPage, taskSearchTerm, taskStatusFilter])

  useEffect(() => {
    setTasksCurrentPage(1)
  }, [taskSearchTerm, taskStatusFilter])

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
})

TaskManagementPage.displayName = "TaskManagementPage"

export default TaskManagementPage