//lib/types.ts
export type Department = "IT" | "HR" | "Finance" | "Marketing" | "Operations" | "Sales" | "Support"

export interface Task {
  id: number
  title: string
  description: string
  status: "pending" | "completed"
  priority?: "low" | "medium" | "high"
  dueDate?: string
  createdAt?: string
  userId?: number
  user?: User // NEW: Include user info in tasks
}

export interface User {
  id: string | number
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  department?: Department | null // NEW: Department field
  name?: string | null
  tasks?: number
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  total?: number
  page?: number
  limit?: number
}

// NEW: Filter interfaces
export interface UserFilters {
  email?: string
  role?: "admin" | "user"
  status?: "active" | "inactive"
  department?: Department
}

export interface TaskFilters {
  status?: "pending" | "completed"
  title?: string
  department?: Department
  userEmail?: string
}

// NEW: Department statistics interface
export interface DepartmentStats {
  department: Department
  userCount: number
  totalTasks: number
  pendingTasks: number
  completedTasks: number
}