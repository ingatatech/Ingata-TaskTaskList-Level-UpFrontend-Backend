export interface Task {
  id: number
  title: string
  description: string
  status: "pending" | "completed"
  priority?: "low" | "medium" | "high"
  dueDate?: string
  createdAt?: string
  userId?: number
}

export interface User {
  id: string | number
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
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
