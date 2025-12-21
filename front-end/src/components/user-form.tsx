import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
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

interface UserFormProps {
  initialData?: SystemUser
  onSubmit: (data: Omit<SystemUser, "id" | "createdAt" | "lastLogin">) => void
  onCancel: () => void
}

const roles: UserRole[] = [
  "reception",
  "professional",
  "doctor",
  "admin",
  "cashier",
];
const statuses = ["active", "inactive", "pending"] as const
const departments = [
  "Front Desk",
  "Dermatology",
  "Operations",
  "Administration",
  "Nursing",
  "Laboratory",
  "Pharmacy",
  "Other",
]

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: initialData?.role || ("reception" as UserRole),
    status: initialData?.status || ("active" as const),
    department: initialData?.department || "",
    phone: initialData?.phone || "",
    avatar: initialData?.avatar || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.role) newErrors.role = "Role is required"
    if (formData.phone && !/^$$\d{3}$$ \d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Phone format should be (555) 123-4567"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    updateFormData("phone", formatted)
  }

  const getRoleDescription = (role: UserRole) => {
    const descriptions: Record<UserRole, string> = {
      reception: "Manage patient registration, appointments, and front desk operations",
      doctor: "Full patient records access, consultations, and treatment planning",
      cashier: "Responsible for customer checkout related to payments",
      admin: "Full system access including user management and system settings",
      professional: "this is the professional responsible to make treatment on the patient"
    }
    return descriptions[role]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="Enter full name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value: string) =>
                updateFormData("department", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept: string) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Role & Permissions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Role & Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">User Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: string) =>
                updateFormData("role", value as UserRole)
              }
            >
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() +
                      role.slice(1).replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role}</p>
            )}
            {formData.role && (
              <p className="text-sm text-gray-600 mt-1">
                {getRoleDescription(formData.role)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Account Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: string) => updateFormData("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Role Permissions Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Permissions Overview
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Access Permissions:
              </h4>
              <ul className="space-y-1 text-gray-600">
                {formData.role === "reception" && (
                  <>
                    <li>• Patient registration and management</li>
                    <li>• Appointment scheduling</li>
                    <li>• Basic patient information access</li>
                  </>
                )}
                {formData.role === "professional" && (
                  <>
                    <li>• Responsible for delivering the service</li>
                  </>
                )}
                {formData.role === "doctor" && (
                  <>
                    <li>• Full patient records access</li>
                    <li>• Consultation management</li>
                    <li>• Prescription and treatment planning</li>
                  </>
                )}
                {formData.role === "cashier" && (
                  <>
                    <li>• customer check out payments</li>
                  </>
                )}
                {formData.role === "admin" && (
                  <>
                    <li>• Full system access</li>
                    <li>• User management</li>
                    <li>• System configuration</li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Navigation Access:
              </h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Dashboard</li>
                {(formData.role === "reception" ||
                  formData.role === "admin") && (
                  <li>• Patient Registration</li>
                )}
                {(formData.role === "professional" ||
                  formData.role === "reception" ||
                  formData.role === "admin") && (
                  <>
                    <li>• Patients List</li>
                    <li>• Appointments</li>
                  </>
                )}
                {(formData.role === "professional" ||
                  formData.role === "admin") && <li>• Consultations</li>}
                {(formData.role === "admin") && <li>• Inventory</li>}
                {formData.role === "admin" && <li>• User Management</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
          {initialData ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
