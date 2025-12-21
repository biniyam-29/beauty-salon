export type UserRole =
  | "reception"
  | "professional"
  | "doctor"
  | "cashier"
  | "admin";

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

// Mock authentication - in production, this would connect to your auth provider
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "reception@clinic.com",
    role: "reception",
  },
//   {
//     id: "2",
//     name: "Dr. Michael Chen",
//     email: "doctor@clinic.com",
//     role: "professional",
//   },
//   {
//     id: "3",
//     name: "Lisa Rodriguez",
//     email: "inventory@clinic.com",
//     role: "inventory-manager",
//   },
//   {
//     id: "4",
//     name: "Admin User",
//     email: "admin@clinic.com",
//     role: "admin",
//   },
];

let currentUser: User | null = null

export const getCurrentUser = (): User | null => {
  return currentUser
}

export const login = async (email: string): Promise<User | null> => {
  // Mock login - in production, authenticate with your backend
  const user = mockUsers.find((u) => u.email === email)
  if (user) {
    currentUser = user
    return user
  }
  return null
}

export const logout = async (): Promise<void> => {
  currentUser = null
  console.log("User logged out")
}

export const isAuthenticated = (): boolean => {
  return currentUser !== null
}

export const getRoleDashboardRoute = (role: UserRole): string => {
  switch (role) {
    // case "admin":
    //   return "/users";
    // case "inventory-manager":
    //   return "/inventory";
    case "reception":
      return "/reception";
    // case "professional":
    //   return "/professionals";
    default:
      return "/";
  }
}
