import type React from "react"

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.tsx"
import { type UserRole, getCurrentUser, logout } from "../lib/auth"

const HomeIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>🏠</div>
)
const UserPlusIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>👤+</div>
)
const UsersIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>👥</div>
)
const CalendarIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>📅</div>
)
const DocumentTextIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>📄</div>
)
const CubeIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>📦</div>
)
const CogIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>⚙️</div>
)
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>‹</div>
)
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>›</div>
)

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: HomeIcon,
    roles: ["reception", "professional", "inventory-manager", "super-admin"],
  },
  {
    name: "Register Patient",
    href: "/patients/register",
    icon: UserPlusIcon,
    roles: ["reception", "super-admin"],
  },
  {
    name: "Patients",
    href: "/patients",
    icon: UsersIcon,
    roles: ["reception", "professional", "super-admin"],
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: CalendarIcon,
    roles: ["reception", "professional", "super-admin"],
  },
  {
    name: "Consultations",
    href: "/consultations",
    icon: DocumentTextIcon,
    roles: ["professional", "super-admin"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: CubeIcon,
    roles: ["inventory-manager", "super-admin"],
  },
  {
    name: "User Management",
    href: "/users",
    icon: CogIcon,
    roles: ["super-admin"],
  },
];

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const user = getCurrentUser()
  const [collapsed, setCollapsed] = useState(() => {
    // Load initial value from localStorage (default false)
    const stored = localStorage.getItem("sidebarCollapsed");
    return stored === "true";
  });
  useEffect(() => {
    // Save whenever collapsed changes
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  if (!user) return null

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user.role))

  const handleLogout = async () => {
    await logout()
    navigate("/login");
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && <h1 className="text-lg font-semibold text-gray-900">Skin Clinic</h1>}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="p-2">
          {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn("w-full justify-start p-2", collapsed ? "justify-center" : "")}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role.replace("-", " ")}</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
