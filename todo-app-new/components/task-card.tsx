"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, CheckCircle2 } from "lucide-react"

interface TaskCardProps {
  task: {
    id: number
    title: string
    description: string
    status: string
    priority: string
    assignedTo?: string
    dueDate: string
    createdAt: string
  }
  onEdit?: (task: any) => void
  onDelete?: (id: number) => void
  showAssignee?: boolean
}

export function TaskCard({ task, onEdit, onDelete, showAssignee = false }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-serif line-clamp-1">{task.title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(task.priority)} variant="outline">
              {task.priority}
            </Badge>
            <Badge className={getStatusColor(task.status)} variant="outline">
              {task.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {task.status}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{task.dueDate}</span>
            </div>
            {showAssignee && task.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{task.assignedTo}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(task.id)}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
