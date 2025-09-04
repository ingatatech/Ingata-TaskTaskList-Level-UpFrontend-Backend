// lib/types.ts (FIXED)

// UPDATED: Department interface to match backend entity
export interface Department {
  id: string
  name: string
  description?: string | null
  status: "active" | "inactive"
  userCount?: number
  users?: User[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: number | string
  title: string
  description: string
  status: "pending" | "completed"
  priority?: "low" | "medium" | "high"
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  userId?: number | string
  user?: User
}

// UPDATED: User interface with proper department relationship
export interface User {
  id: string | number
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  department?: Department | null // Now references Department object
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

// UPDATED: Filter interfaces
export interface UserFilters {
  email?: string
  role?: "admin" | "user"
  status?: "active" | "inactive"
  departmentId?: string // Changed from department to departmentId
}

export interface TaskFilters {
  status?: "pending" | "completed"
  title?: string
  departmentId?: string // Changed from department to departmentId
  userEmail?: string
}

// UPDATED: Department statistics interface
export interface DepartmentStats {
  id: string
  name: string
  status: "active" | "inactive"
  userCount: number
  activeUsers: number
  totalTasks?: number
  pendingTasks?: number
  completedTasks?: number
}

// NEW: Department management interfaces
export interface DepartmentFilters {
  name?: string
  status?: "active" | "inactive"
}

export interface CreateDepartmentData {
  name: string
  description?: string
  status?: "active" | "inactive"
}

export interface UpdateDepartmentData {
  name?: string
  description?: string
  status?: "active" | "inactive"
}