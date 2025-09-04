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
import { Building2, Plus, Edit, Trash2, Eye, AlertTriangle, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { departmentApi, Department } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

// Define the ref interface
export interface DepartmentManagementRef {
  triggerAddDepartment: () => void
}

interface DepartmentManagementPageProps {
  // These props will be controlled by the parent layout
  isCreateDialogOpen: boolean
  onCreateDialogStateChange: (isOpen: boolean) => void
}

const DepartmentManagementPage = ({
  isCreateDialogOpen,
  onCreateDialogStateChange,
}: DepartmentManagementPageProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  
  const [departments, setDepartments] = useState<Department[]>([])
  const [totalDepartmentsCount, setTotalDepartmentsCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [error, setError] = useState<string | null>(null)

  // Dialog states for Edit and View
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

  // Form states
  const [newDeptName, setNewDeptName] = useState("")
  const [newDeptDescription, setNewDeptDescription] = useState("")
  const [newDeptStatus, setNewDeptStatus] = useState("active")

  const [editDeptName, setEditDeptName] = useState("")
  const [editDeptDescription, setEditDeptDescription] = useState("")
  const [editDeptStatus, setEditDeptStatus] = useState("active")

  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const fetchDepartments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await departmentApi.getDepartmentsPaginated(currentPage, itemsPerPage, {
        name: searchTerm || undefined,
        status: filterStatus === "all" ? undefined : filterStatus,
      })
      
      setDepartments(response.data || [])
      setTotalDepartmentsCount(response.total || 0)
      
    } catch (error) {
      console.error("Failed to fetch departments:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch departments")
      setDepartments([])
      setTotalDepartmentsCount(0)
      toast({
        title: "Error",
        description: "Failed to fetch departments. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDepartments()
    }
  }, [user, currentPage, searchTerm, filterStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus])

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) {
      toast({
        title: "Error",
        description: "Department name is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await departmentApi.createDepartment(
        newDeptName.trim(),
        newDeptDescription.trim() || undefined,
        newDeptStatus as "active" | "inactive"
      )

      setNewDeptName("")
      setNewDeptDescription("")
      setNewDeptStatus("active")
      onCreateDialogStateChange(false); // Close dialog via parent state

      toast({
        title: "Department Created",
        description: "Department has been successfully created.",
      })

      fetchDepartments()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create department",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment || !editDeptName.trim()) {
      toast({
        title: "Error",
        description: "Department name is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await departmentApi.updateDepartment(selectedDepartment.id, {
        name: editDeptName.trim(),
        description: editDeptDescription.trim() || undefined,
        status: editDeptStatus as "active" | "inactive",
      })

      setIsEditDialogOpen(false)
      toast({
        title: "Department Updated",
        description: "Department has been successfully updated.",
      })

      fetchDepartments()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update department",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    try {
      setIsLoading(true)
      await departmentApi.deleteDepartment(departmentId)

      toast({
        title: "Department Deleted",
        description: "Department has been successfully removed.",
        variant: "destructive",
      })

      fetchDepartments()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete department",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department)
    setIsViewDialogOpen(true)
  }

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department)
    setEditDeptName(department.name)
    setEditDeptDescription(department.description || "")
    setEditDeptStatus(department.status)
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalPages = Math.ceil(totalDepartmentsCount / itemsPerPage)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        description="Manage organizational departments and assignments"
        actionButton={{
          label: "Add Department",
          icon: <Plus className="h-4 w-4 mr-2" />,
          trigger: (
            <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogStateChange}>
              <DialogTrigger asChild>
                <Button className="font-medium">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">Create New Department</DialogTitle>
                  <DialogDescription>Add a new department to organize your users</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dept-name">Department Name *</Label>
                    <Input
                      id="dept-name"
                      placeholder="Enter department name"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept-description">Description</Label>
                    <Textarea
                      id="dept-description"
                      placeholder="Enter department description (optional)"
                      value={newDeptDescription}
                      onChange={(e) => setNewDeptDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept-status">Status</Label>
                    <Select value={newDeptStatus} onValueChange={setNewDeptStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateDepartment} className="w-full font-medium" disabled={isLoading}>
                    <Building2 className="h-4 w-4 mr-2" />
                    {isLoading ? "Creating..." : "Create Department"}
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
        searchPlaceholder="Search departments..."
        filters={[
          {
            value: filterStatus,
            onValueChange: setFilterStatus,
            placeholder: "Filter by status",
            options: [
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
      />

      {error ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-destructive mb-2">Failed to load departments</p>
              <Button onClick={fetchDepartments} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : isLoading && departments.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading departments...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <DataTable
            title="Departments"
            description="Manage organizational departments"
            columns={[
              { key: "name", label: "Name" },
              { key: "description", label: "Description" },
              { key: "status", label: "Status" },
              { key: "userCount", label: "Users" },
              { key: "createdAt", label: "Created" },
              { key: "actions", label: "Actions", className: "text-right" },
            ]}
            data={departments}
            renderCell={(dept, column) => {
              switch (column.key) {
                case "name":
                  return (
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                  )
                case "description":
                  return (
                    <span className="text-sm text-muted-foreground">
                      {dept.description || <em>No description</em>}
                    </span>
                  )
                case "status":
                  return <StatusBadge status={dept.status} />
                case "userCount":
                  return (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{dept.userCount || 0}</span>
                    </div>
                  )
                case "createdAt":
                  return <span className="text-sm">{formatDate(dept.createdAt)}</span>
                case "actions":
                  return (
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDepartment(dept)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditDepartment(dept)}>
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
                            <AlertDialogTitle>Delete Department</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{dept.name}"? This action cannot be undone.
                              {(dept.userCount && dept.userCount > 0) && (
                                <span className="block mt-2 text-amber-600 font-medium">
                                  Warning: This department has {dept.userCount} user(s) assigned to it.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDepartment(dept.id)}
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

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalDepartmentsCount}
              />
            </div>
          )}
        </>
      )}

      {/* View Department Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Department Details</DialogTitle>
            <DialogDescription>View department information</DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{selectedDepartment.name}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDepartment.description || "No description provided"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedDepartment.status} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Users</Label>
                    <div className="flex items-center space-x-1 mt-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{selectedDepartment.userCount || 0} user(s)</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground mt-1">{formatDate(selectedDepartment.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Updated</Label>
                    <p className="text-sm text-muted-foreground mt-1">{formatDate(selectedDepartment.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Department</DialogTitle>
            <DialogDescription>Update department information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dept-name">Department Name *</Label>
              <Input
                id="edit-dept-name"
                value={editDeptName}
                onChange={(e) => setEditDeptName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-description">Description</Label>
              <Textarea
                id="edit-dept-description"
                value={editDeptDescription}
                onChange={(e) => setEditDeptDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-status">Status</Label>
              <Select value={editDeptStatus} onValueChange={setEditDeptStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateDepartment} className="w-full font-medium" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Department"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// NOTE: We no longer need the forwardRef or the useImperativeHandle
// as the state is now managed by the parent component.
// A page component should ideally not expose a ref to a parent.
export default DepartmentManagementPage
