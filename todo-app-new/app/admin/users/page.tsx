// admin/users/page.tsx
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
import { UserPlus, Mail, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { userAPI } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface User {
  id: number | string
  name?: string | null
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  tasks: number
  createdAt: string
}

interface UserManagementRef {
  triggerAddUser: () => void
}

const UserManagementPage = forwardRef<UserManagementRef>((props, ref) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("")

  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [editUserDialog, setEditUserDialog] = useState(false)
  const [viewUserDialog, setViewUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editUserName, setEditUserName] = useState("")
  const [editUserEmail, setEditUserEmail] = useState("")
  const [editUserRole, setEditUserRole] = useState("")
  const [editUserStatus, setEditUserStatus] = useState("")

  const [users, setUsers] = useState<User[]>([])
  const [totalUsersCount, setTotalUsersCount] = useState(0)
  const [usersCurrentPage, setUsersCurrentPage] = useState(1)
  const [usersPerPage] = useState(5)
  const [usersError, setUsersError] = useState<string | null>(null)

  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Expose the triggerAddUser method to parent components
  useImperativeHandle(ref, () => ({
    triggerAddUser: () => {
      console.log("triggerAddUser called in UserManagementPage") // Debug log
      setIsCreateUserDialogOpen(true)
    }
  }))

  const fetchUsers = async () => {
    setIsLoading(true)
    setUsersError(null)
    try {
      const response = await userAPI.getUsers(usersCurrentPage, usersPerPage, {
        email: searchTerm,
        status: filterStatus === "all" ? undefined : filterStatus,
      })
      
      if (!response) {
        throw new Error("No response from server")
      }
      
      setUsers((response?.data || []) as any[])
      setTotalUsersCount(response.total || 0)
      
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

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers()
    }
  }, [user, usersCurrentPage, searchTerm, filterStatus])

  useEffect(() => {
    setUsersCurrentPage(1)
  }, [searchTerm, filterStatus])

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
      setIsCreateUserDialogOpen(false)

      toast({
        title: "User Added",
        description: "OTP invitation sent successfully. User will receive login credentials via email.",
      })

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
            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
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
})

UserManagementPage.displayName = "UserManagementPage"

export default UserManagementPage