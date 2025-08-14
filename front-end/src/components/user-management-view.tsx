import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  ShieldCheckIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"
import { UserForm } from "./user-form"
import type { UserRole } from "../lib/auth"

interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  status: "active" | "inactive" | "pending"
  lastLogin?: string
  createdAt: string
  department?: string
  phone?: string
}

// Mock user data (expanded from auth.ts)
const mockUsers: SystemUser[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "reception@clinic.com",
    role: "reception",
    status: "active",
    lastLogin: "2024-01-15",
    createdAt: "2024-01-01",
    department: "Front Desk",
    phone: "(555) 123-4567",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    email: "doctor@clinic.com",
    role: "doctor",
    status: "active",
    lastLogin: "2024-01-15",
    createdAt: "2024-01-01",
    department: "Dermatology",
    phone: "(555) 234-5678",
  },
  {
    id: "3",
    name: "Lisa Rodriguez",
    email: "inventory@clinic.com",
    role: "inventory-manager",
    status: "active",
    lastLogin: "2024-01-14",
    createdAt: "2024-01-01",
    department: "Operations",
    phone: "(555) 345-6789",
  },
  {
    id: "4",
    name: "Admin User",
    email: "admin@clinic.com",
    role: "super-admin",
    status: "active",
    lastLogin: "2024-01-15",
    createdAt: "2024-01-01",
    department: "Administration",
    phone: "(555) 456-7890",
  },
  {
    id: "5",
    name: "Dr. Emily Watson",
    email: "emily.watson@clinic.com",
    role: "doctor",
    status: "inactive",
    lastLogin: "2024-01-10",
    createdAt: "2024-01-05",
    department: "Dermatology",
    phone: "(555) 567-8901",
  },
  {
    id: "6",
    name: "John Smith",
    email: "john.smith@clinic.com",
    role: "reception",
    status: "pending",
    createdAt: "2024-01-14",
    department: "Front Desk",
    phone: "(555) 678-9012",
  },
]

export function UserManagementView() {
  const [users, setUsers] = useState<SystemUser[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all")
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const roles: (UserRole | "all")[] = ["all", "reception", "doctor", "inventory-manager", "super-admin"]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = selectedRole === "all" || user.role === selectedRole

    return matchesSearch && matchesRole
  })

  const activeUsers = users.filter((u) => u.status === "active")
  const inactiveUsers = users.filter((u) => u.status === "inactive")
  const pendingUsers = users.filter((u) => u.status === "pending")

  const handleAddUser = (userData: Omit<SystemUser, "id" | "createdAt" | "lastLogin">) => {
    const newUser: SystemUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setUsers([...users, newUser])
    setIsAddDialogOpen(false)
  }

  const handleEditUser = (userData: Omit<SystemUser, "id" | "createdAt" | "lastLogin">) => {
    if (!editingUser) return

    const updatedUser: SystemUser = {
      ...userData,
      id: editingUser.id,
      createdAt: editingUser.createdAt,
      lastLogin: editingUser.lastLogin,
    }

    setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)))
    setEditingUser(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  const handleToggleUserStatus = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: u.status === "active" ? "inactive" : "active",
            }
          : u,
      ),
    )
  }

  const handleActivatePendingUser = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "active" as const } : u)))
  }

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      reception: "bg-blue-100 text-blue-800",
      doctor: "bg-green-100 text-green-800",
      "inventory-manager": "bg-purple-100 text-purple-800",
      "super-admin": "bg-red-100 text-red-800",
    }

    const roleLabels = {
      reception: "Reception",
      doctor: "Doctor",
      "inventory-manager": "Inventory Manager",
      "super-admin": "Super Admin",
    }

    return (
      <Badge className={roleColors[role]} variant="secondary">
        {roleLabels[role]}
      </Badge>
    )
  }

  const getStatusBadge = (status: SystemUser["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "pending":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Pending
          </Badge>
        )
    }
  }

  const UserCard = ({ user }: { user: SystemUser }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={user.avatar || `/abstract-geometric-shapes.png?height=48&width=48&query=${user.name}`}
              />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.department && <p className="text-sm text-gray-500">{user.department}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Role</p>
              {getRoleBadge(user.role)}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Status</p>
              {getStatusBadge(user.status)}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Last Login</p>
              <p className="text-sm text-gray-500">{user.lastLogin || "Never"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-sm text-gray-500">{user.phone || "N/A"}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingUser(user)
                    setIsEditDialogOpen(true)
                  }}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit User
                </DropdownMenuItem>
                {user.status === "pending" && (
                  <DropdownMenuItem onClick={() => handleActivatePendingUser(user.id)}>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Activate User
                  </DropdownMenuItem>
                )}
                {user.status !== "pending" && (
                  <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                    {user.status === "active" ? (
                      <>
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600 focus:text-red-600">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account for the clinic management system.</DialogDescription>
            </DialogHeader>
            <UserForm onSubmit={handleAddUser} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">System users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting activation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <XCircleIcon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveUsers.length}</div>
            <p className="text-xs text-muted-foreground">Deactivated accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                  className={selectedRole === role ? "bg-teal-600 hover:bg-teal-700" : ""}
                >
                  {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1).replace("-", " ")}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeUsers.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingUsers.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </TabsContent>
      </Tabs>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserForm
              initialData={editingUser}
              onSubmit={handleEditUser}
              onCancel={() => {
                setEditingUser(null)
                setIsEditDialogOpen(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
