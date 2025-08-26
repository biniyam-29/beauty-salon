import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";

// --- A simple debounce hook to prevent API calls on every keystroke ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Prop Type Definitions (Unchanged) ---
interface BaseProps {
  children: React.ReactNode;
  className?: string;
}
type ButtonVariant = "default" | "outline" | "secondary";
type ButtonSize = "sm" | "md";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}
interface BadgeProps extends BaseProps {
  variant?: "default" | "secondary";
}
interface AvatarImageProps {
  src?: string;
  alt?: string;
}
interface DialogProps extends BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
interface DropdownMenuContentProps extends BaseProps {
  align: "start" | "end";
}

// --- UI Components (Unchanged) ---
const Card = ({ children, className = "" }: BaseProps) => (
  <div className={`border rounded-lg shadow-sm bg-white ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children, className = "" }: BaseProps) => (
  <div className={`p-4 border-b ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }: BaseProps) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }: BaseProps) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const Button = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses: Record<ButtonVariant, string> = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  };
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-9 px-3",
    md: "h-10 px-4 py-2",
  };
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
const Input = ({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${className}`}
    {...props}
  />
);
const Badge = ({
  children,
  variant = "default",
  className = "",
}: BadgeProps) => {
  const variantClasses: Record<"default" | "secondary", string> = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-900",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
const Avatar = ({ children, className = "" }: BaseProps) => (
  <div
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
  >
    {children}
  </div>
);
const AvatarImage = ({ src, alt = "" }: AvatarImageProps) => (
  <img
    src={src}
    alt={alt}
    className="aspect-square h-full w-full object-cover"
  />
);
const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
  <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-100">
    {children}
  </span>
);
const Dialog = ({
  children,
  open,
  onOpenChange,
  className = "",
}: DialogProps & { className?: string }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={`relative z-50 bg-white rounded-lg shadow-xl w-full max-w-lg ${className}`}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
const DialogContent = ({ children, className = "" }: BaseProps) => (
  <div className={`bg-white rounded-lg shadow-xl w-full ${className}`}>
    {children}
  </div>
);
const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-b">{children}</div>
);
const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold">{children}</h2>
);
const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-slate-500 mt-1">{children}</p>
);
const DropdownMenuContent = ({ children, align }: DropdownMenuContentProps) => (
  <div
    className={`origin-top-right absolute ${
      align === "end" ? "right-0" : "left-0"
    } mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10`}
  >
    {children}
  </div>
);
const DropdownMenuItem = ({
  children,
  className,
  ...props
}: BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    href="#"
    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
    {...props}
  >
    {children}
  </a>
);
const Tabs = ({ children, className = "" }: BaseProps) => (
  <div className={className}>{children}</div>
);
const TabsList = ({ children, className = "" }: BaseProps) => (
  <div className={`flex border-b ${className}`}>{children}</div>
);
const TabsTrigger = ({ children }: { children: React.ReactNode }) => (
  <button className="px-4 py-2 -mb-px border-b-2 border-transparent hover:border-slate-400 focus:outline-none">
    {children}
  </button>
);
const TabsContent = ({
  children,
  className = "",
}: BaseProps & { value: string }) => (
  <div className={className}>{children}</div>
);

// --- Icon Placeholders (Unchanged) ---
const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const PencilIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
    />
  </svg>
);
const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const UserIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);
const EllipsisVerticalIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

// --- Type Definitions ---
type UserRole =
  | "reception"
  | "doctor"
  | "professional"
  | "inventory-manager"
  | "super-admin";
interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null; // Can be a string (Data URL) or null
  lastLogin?: string;
  createdAt: string;
  department?: string;
  phone?: string;
}
type UserPayload = Omit<
  SystemUser,
  "id" | "createdAt" | "lastLogin" | "avatar"
>;

// --- API Functions ---
const BASE_URL = "https://beauty-api.biniyammarkos.com";

const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

// ** UPDATED ** Helper to format user data, now handling profile_picture
const formatUser = (user: any): SystemUser => ({
  ...user,
  id: String(user.id),
  createdAt: new Date().toISOString().split("T")[0],
  // If profile_picture exists, create a Data URL. Otherwise, it's null.
  avatar: user.profile_picture
    ? `data:image/jpeg;base64,${user.profile_picture}`
    : null,
});

const fetchUsers = async (
  page: number,
  role: UserRole | "all"
): Promise<{ users: SystemUser[]; totalPages: number }> => {
  const token = getAuthToken();
  let url = `${BASE_URL}/users?page=${page}`;
  if (role !== "all") {
    url = `${BASE_URL}/users/role/${role}?page=${page}`;
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  const data = await response.json();
  const formattedUsers = data.users.map(formatUser);
  return { users: formattedUsers, totalPages: data.totalPages };
};

const searchUserByPhone = async (phone: string): Promise<SystemUser[]> => {
  if (!phone.trim()) return [];
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/users/search/${phone}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to search user: ${response.statusText}`);
  }
  const data = await response.json();
  const usersArray = Array.isArray(data) ? data : [data];
  return usersArray.map(formatUser);
};

const addUser = async (userData: UserPayload): Promise<SystemUser> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create user.");
  }
  return response.json();
};

const updateUser = async ({
  id,
  ...userData
}: Partial<UserPayload> & { id: string }): Promise<SystemUser> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update user.");
  }
  return response.json();
};

const deleteUser = async (userId: string): Promise<void> => {
  console.log("Simulating API call to delete user:", userId);
  return new Promise((resolve) => setTimeout(resolve, 500));
};

// --- Local UserForm Component (Unchanged) ---
const UserForm = ({
  initialData,
  onSubmit,
  onCancel,
  isPending,
}: {
  initialData?: SystemUser | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isPending?: boolean;
}) => {
  const [formData, setFormData] = useState(
    initialData || { name: "", email: "", phone: "", role: "reception" }
  );
  const roleDescriptions: Record<UserRole, string> = {
    reception:
      "Manages appointments, patient check-ins, and basic client communication.",
    doctor:
      "Access to patient records and treatment history for assigned patients.",
    professional:
      "Access to patient records and treatment history for assigned patients.",
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
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isPending}
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
          disabled={isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <Input
          name="phone"
          type="text"
          value={formData.phone || ""}
          onChange={handleChange}
          disabled={isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          disabled={isPending}
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
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-rose-600 hover:bg-rose-700"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

// --- Main Component ---
export function UserManagementView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isPhoneSearch = /^\d{3,}/.test(debouncedSearchTerm);

  const roles: (UserRole | "all")[] = [
    "all",
    "reception",
    "doctor",
    "inventory-manager",
    "super-admin",
  ];

  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
  } = useQuery({
    queryKey: ["users", currentPage, selectedRole],
    queryFn: () => fetchUsers(currentPage, selectedRole),
    enabled: !isPhoneSearch,
  });

  const {
    data: searchData,
    isLoading: isSearching,
    isError: isSearchError,
    error: searchError,
  } = useQuery({
    queryKey: ["userSearch", debouncedSearchTerm],
    queryFn: () => searchUserByPhone(debouncedSearchTerm),
    enabled: isPhoneSearch,
  });

  const users = isPhoneSearch ? searchData ?? [] : listData?.users ?? [];
  const totalPages = isPhoneSearch ? 1 : listData?.totalPages ?? 1;
  const isLoading = isListLoading || isSearching;
  const isError = isListError || isSearchError;
  const error = listError || searchError;

  const addUserMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsAddDialogOpen(false);
    },
    onError: (err) => alert(`Error: ${err.message}`),
  });

  const editUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
    },
    onError: (err) => alert(`Error: ${err.message}`),
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => alert(`Error deleting user: ${err.message}`),
  });

  const handleRoleChange = (role: UserRole | "all") => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

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

  const UserCard = ({ user }: { user: SystemUser }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <Avatar className="h-12 w-12">
            {/* ** UPDATED ** Conditionally render image or fallback */}
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="w-full sm:w-auto flex flex-row sm:flex-col md:flex-row items-center justify-between sm:justify-start md:items-center gap-x-4 gap-y-2 mt-2 sm:mt-0">
          <div className="text-left">
            <p className="text-xs font-medium text-gray-500 hidden sm:block">
              Role
            </p>
            {getRoleBadge(user.role)}
          </div>
        </div>
        <div className="w-full sm:w-auto flex items-center justify-start sm:justify-end space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingUser(user)}
            className="flex-grow sm:flex-grow-0"
          >
            <PencilIcon className="h-4 w-4 mr-2" /> Edit
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="w-9 p-0"
              onClick={() =>
                setIsMenuOpen(isMenuOpen === user.id ? null : user.id)
              }
            >
              <span className="sr-only">Open menu</span>
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
            {isMenuOpen === user.id && (
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    if (window.confirm("Are you sure?")) {
                      deleteUserMutation.mutate(user.id);
                    }
                    setIsMenuOpen(null);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <TrashIcon className="h-4 w-4 mr-2" /> Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {roles.map((role) => (
                  <Button
                    key={role}
                    variant={selectedRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRoleChange(role)}
                    disabled={isPhoneSearch}
                    className={
                      selectedRole === role
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : ""
                    }
                  >
                    {role.charAt(0).toUpperCase() +
                      role.slice(1).replace("-", " ")}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Tabs className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger>All Users ({users.length})</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="space-y-4">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </TabsContent>
        </Tabs>
        {isLoading && (
          <p className="text-center text-gray-500 py-8">Loading users...</p>
        )}
        {isError && (
          <p className="text-center text-red-500 py-8">{error?.message}</p>
        )}
        {!isLoading && users.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold">No Users Found</h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
        {!isPhoneSearch && (
          <div className="flex items-center justify-center space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account.</DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={(data) => addUserMutation.mutate(data)}
              onCancel={() => setIsAddDialogOpen(false)}
              isPending={addUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information.</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <UserForm
                initialData={editingUser}
                onSubmit={(data) =>
                  editUserMutation.mutate({ ...data, id: editingUser.id })
                }
                onCancel={() => setEditingUser(null)}
                isPending={editUserMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
