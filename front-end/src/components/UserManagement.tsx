import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
// import { UserForm } from "./user-form"; // UserForm is now defined locally
import type { UserRole } from "../lib/auth"; // Assuming you have this type

// --- Type Definition ---
interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: "active" | "inactive" | "pending";
  lastLogin?: string;
  createdAt: string;
  department?: string;
  phone?: string;
}

// --- Local UserForm Component ---
const UserForm = ({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: SystemUser | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      email: "",
      phone: "",
      role: "reception",
    }
  );

  const roleDescriptions: Record<UserRole, string> = {
    reception:
      "Manages appointments, patient check-ins, and basic client communication.",
    doctor:
      "Access to patient records and treatment history for assigned patients.",
    professional:
      "Access to patient records and treatment history for assigned patients.", // Kept for compatibility if type is not updated
    "inventory-manager":
      "Manages product stock, orders, and supplier information.",
    "super-admin":
      "Full access to all system settings, user management, and financial data.",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <Input
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
        >
          <option value="reception">Reception</option>
          <option value="doctor">Professional</option>
          <option value="inventory-manager">Inventory Manager</option>
          <option value="super-admin">Super Admin</option>
        </select>
        <p className="mt-2 text-xs text-gray-500">
          {roleDescriptions[formData.role as UserRole]}
        </p>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
          Save
        </Button>
      </div>
    </form>
  );
};

// --- Main Component ---
export function UserManagementView() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // --- API State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const roles: (UserRole | "all")[] = [
    "all",
    "reception",
    "doctor",
    "inventory-manager",
    "super-admin",
  ];

  // --- Fetch Users from API ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      let url = "https://beauty-api.biniyammarkos.com/users";
      if (selectedRole !== "all") {
        // Use 'doctor' for the API call when 'professional' is selected in UI logic if needed,
        // but here we align the state with the API directly.
        url = `https://beauty-api.biniyammarkos.com/users/role/${selectedRole}?page=${currentPage}`;
      } else {
        url = `https://beauty-api.biniyammarkos.com/users?page=${currentPage}`;
      }

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data = await response.json();

        const formattedUsers = data.users.map(
          (user: any, index: number): SystemUser => ({
            ...user,
            id: String(user.id),
            status:
              index % 3 === 0
                ? "pending"
                : index % 2 === 0
                ? "inactive"
                : "active",
            createdAt: new Date().toISOString().split("T")[0],
            avatar: `https://i.pravatar.cc/48?u=${user.id}`,
          })
        );

        setUsers(formattedUsers);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, selectedRole]);

  const handleRoleChange = (role: UserRole | "all") => {
    setSelectedRole(role);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  // --- Filtering and Derived State ---
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.department && user.department.toLowerCase().includes(term));

    const matchesRole =
      selectedRole === "all" || (user.role && user.role === selectedRole);

    return matchesSearch && matchesRole;
  });

  const activeUsers = filteredUsers.filter((u) => u.status === "active");
  const inactiveUsers = filteredUsers.filter((u) => u.status === "inactive");
  const pendingUsers = filteredUsers.filter((u) => u.status === "pending");

  // --- API Handlers ---
  const handleEditUser = async (
    userData: Omit<SystemUser, "id" | "createdAt" | "lastLogin">
  ) => {
    if (!editingUser) return;
    const token = localStorage.getItem("auth_token");

    const payload = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
    };

    try {
      const response = await fetch(
        `https://beauty-api.biniyammarkos.com/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user.");
      }

      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? { ...editingUser, ...payload } : u
        )
      );
      setEditingUser(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      alert(
        `Error: ${
          err instanceof Error ? err.message : "An unknown error occurred."
        }`
      );
    }
  };

  const handleAddUser = async (
    userData: Omit<
      SystemUser,
      "id" | "createdAt" | "lastLogin" | "status" | "avatar"
    >
  ) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Authentication Error: You must be logged in.");
      return;
    }

    const payload = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
    };

    try {
      const response = await fetch(
        "https://beauty-api.biniyammarkos.com/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user.");
      }

      const newUserFromApi = await response.json();

      const newUser: SystemUser = {
        ...newUserFromApi,
        id: String(newUserFromApi.id),
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0],
        avatar: `https://i.pravatar.cc/48?u=${newUserFromApi.id}`,
      };

      setUsers([newUser, ...users]);
      setIsAddDialogOpen(false);
    } catch (err) {
      alert(
        `Error: ${
          err instanceof Error ? err.message : "An unknown error occurred."
        }`
      );
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: u.status === "active" ? "inactive" : "active",
            }
          : u
      )
    );
  };

  const handleActivatePendingUser = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: "active" as const } : u
      )
    );
  };

  // --- UI Helper Functions ---
  const getRoleBadge = (role: UserRole) => {
    const roleColors: Record<UserRole, string> = {
      reception: "bg-blue-100 text-blue-800",
      doctor: "bg-green-100 text-green-800",
      professional: "bg-green-100 text-green-800",
      "inventory-manager": "bg-purple-100 text-purple-800",
      "super-admin": "bg-red-100 text-red-800",
    };
    const roleLabels: Record<UserRole, string> = {
      reception: "Reception",
      doctor: "Professional",
      professional: "Professional",
      "inventory-manager": "Inventory Manager",
      "super-admin": "Super Admin",
    };
    return (
      <Badge className={roleColors[role]} variant="secondary">
        {roleLabels[role]}
      </Badge>
    );
  };

  const getStatusBadge = (status: SystemUser["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "pending":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Pending
          </Badge>
        );
    }
  };

  const UserCard = ({ user }: { user: SystemUser }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="flex-shrink-0 w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center sm:space-x-6 gap-y-2">
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium text-gray-500">Role</p>
            {getRoleBadge(user.role)}
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium text-gray-500">Status</p>
            {getStatusBadge(user.status)}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingUser(user);
              setIsEditDialogOpen(true);
            }}
          >
            <PencilIcon className="h-4 w-4 mr-2" /> Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-9 p-0">
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user.status === "pending" && (
                <DropdownMenuItem
                  onClick={() => handleActivatePendingUser(user.id)}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" /> Activate User
                </DropdownMenuItem>
              )}
              {user.status !== "pending" && (
                <DropdownMenuItem
                  onClick={() => handleToggleUserStatus(user.id)}
                >
                  {user.status === "active" ? (
                    <>
                      <XCircleIcon className="h-4 w-4 mr-2" /> Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" /> Activate
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteUser(user.id)}
                className="text-red-600 focus:text-red-600"
              >
                <TrashIcon className="h-4 w-4 mr-2" /> Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          User Management
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <PlusIcon className="h-4 w-4 mr-2" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account.</DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={handleAddUser}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

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
            <div className="text-2xl font-bold">
              {users.filter((u) => u.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting activation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Users
            </CardTitle>
            <XCircleIcon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.status === "inactive").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Deactivated accounts
            </p>
          </CardContent>
        </Card>
      </div>

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
                  onClick={() => handleRoleChange(role)}
                  className={
                    selectedRole === role ? "bg-teal-600 hover:bg-teal-700" : ""
                  }
                >
                  {role === "all"
                    ? "All Roles"
                    : role === "doctor"
                    ? "Professional"
                    : role.charAt(0).toUpperCase() +
                      role.slice(1).replace("-", " ")}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Users ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeUsers.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({inactiveUsers.length})
          </TabsTrigger>
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

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {filteredUsers.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-center space-x-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" /> Previous
        </Button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserForm
              initialData={editingUser}
              onSubmit={handleEditUser}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
