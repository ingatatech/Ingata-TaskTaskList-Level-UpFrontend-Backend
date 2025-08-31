//lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// UPDATED: Types with department support
export interface User {
  id: string
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  department?: "IT" | "HR" | "Finance" | "Marketing" | "Operations" | "Sales" | "Support" | null
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "completed"
  user?: User
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  total?: number
  page?: number
  limit?: number
}

export type Department = "IT" | "HR" | "Finance" | "Marketing" | "Operations" | "Sales" | "Support"

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// AUTH API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    return response.json()
  },

  initiateFirstLoginReset: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/first-login-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to initiate password reset")
    }

    return response.json()
  },

  checkAdminExists: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/admin/exists`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to check admin existence")
    }

    return response.json() as Promise<{ adminExists: boolean; canAssignAdmin: boolean }>
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to initiate password reset")
    }

    return response.json()
  },

  verifyOtp: async (email: string, otp: string, type: "first-login" | "forgot-password" = "first-login") => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, type }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "OTP verification failed")
    }

    return response.json()
  },

  setNewPassword: async (email: string, otp: string, newPassword: string, type: "first-login" | "forgot-password" = "first-login") => {
    const response = await fetch(`${API_BASE_URL}/auth/set-new-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword, type }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to set new password")
    }

    return response.json()
  },
}

// UPDATED: User API with department support
export const userApi = {
  // NEW: Get available departments
  getDepartments: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/departments`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch departments")
    }

    return response.json() as Promise<{ departments: Department[] }>
  },

  // UPDATED: Create user with department
  createUser: async (email: string, role: "admin" | "user" = "user", department?: Department) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, department }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "User creation failed")
    }

    return response.json()
  },

  // UPDATED: Get users with department filtering
  getUsers: async (page = 1, limit = 5, filters: { 
    email?: string; 
    role?: string; 
    status?: string; 
    department?: Department 
  } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
    })

    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch users")
    }

    return response.json() as Promise<ApiResponse<User[]>>
  },

  getUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch user")
    }

    return response.json() as Promise<User>
  },

  // UPDATED: Update user with department
  updateUser: async (id: string, data: Partial<Pick<User, "email" | "role" | "status" | "department">>) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update user")
    }

    return response.json()
  },

  deleteUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete user")
    }

    return response.json()
  },
}

// Task API (User)
export const taskApi = {
  createTask: async (title: string, description: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create task")
    }

    return response.json() as Promise<Task>
  },

  getTasks: async (page = 1, limit = 5, filters: { status?: string; title?: string } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
    })

    const response = await fetch(`${API_BASE_URL}/tasks?${params}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch tasks")
    }

    return response.json() as Promise<ApiResponse<Task[]>>
  },

  getTask: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch task")
    }

    return response.json() as Promise<Task>
  },

  updateTask: async (id: string, data: Partial<Pick<Task, "title" | "description" | "status">>) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update task")
    }

    return response.json() as Promise<Task>
  },

  deleteTask: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete task")
    }

    return response.json()
  },
}

// UPDATED: Admin Task API with department filtering
export const adminTaskApi = {
  getAllTasks: async (page = 1, limit = 5, filters: { 
    status?: string; 
    title?: string; 
    department?: Department;
    userEmail?: string;
  } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
    })

    const response = await fetch(`${API_BASE_URL}/admin/tasks/all?${params}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch all tasks")
    }

    return response.json() as Promise<ApiResponse<Task[]>>
  },

  getUserTasks: async (userId: string, page = 1, limit = 5, filters: { status?: string; title?: string } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
    })

    const response = await fetch(`${API_BASE_URL}/admin/tasks/user/${userId}?${params}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch user tasks")
    }

    return response.json() as Promise<ApiResponse<Task[]>>
  },

  // NEW: Get department statistics
  getDepartmentStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/tasks/stats/department`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch department statistics")
    }

    return response.json()
  },
}

export const userAPI = userApi
export const taskAPI = taskApi
export const adminTaskAPI = adminTaskApi