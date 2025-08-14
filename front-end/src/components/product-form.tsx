import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface Product {
  id: string
  name: string
  category: string
  brand: string
  description: string
  price: number
  cost: number
  stockQuantity: number
  minStockLevel: number
  unit: string
  sku: string
  expiryDate?: string
  supplier: string
  status: "active" | "discontinued" | "out-of-stock"
  lastUpdated: string
}

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: Omit<Product, "id" | "lastUpdated">) => void
  onCancel: () => void
}

const categories = ["Prescription", "Skincare", "Treatment", "Supplement", "Equipment", "Other"]
const units = ["tube", "bottle", "jar", "box", "vial", "pack", "piece"]
const statuses = ["active", "discontinued", "out-of-stock"] as const

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    brand: initialData?.brand || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    cost: initialData?.cost || 0,
    stockQuantity: initialData?.stockQuantity || 0,
    minStockLevel: initialData?.minStockLevel || 0,
    unit: initialData?.unit || "",
    sku: initialData?.sku || "",
    expiryDate: initialData?.expiryDate || "",
    supplier: initialData?.supplier || "",
    status: initialData?.status || ("active" as const),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.brand.trim()) newErrors.brand = "Brand is required"
    if (!formData.sku.trim()) newErrors.sku = "SKU is required"
    if (!formData.unit) newErrors.unit = "Unit is required"
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier is required"
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0"
    if (formData.cost <= 0) newErrors.cost = "Cost must be greater than 0"
    if (formData.stockQuantity < 0) newErrors.stockQuantity = "Stock quantity cannot be negative"
    if (formData.minStockLevel < 0) newErrors.minStockLevel = "Minimum stock level cannot be negative"

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="Enter product name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => updateFormData("brand", e.target.value)}
              placeholder="Enter brand name"
              className={errors.brand ? "border-red-500" : ""}
            />
            {errors.brand && <p className="text-sm text-red-600">{errors.brand}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => updateFormData("sku", e.target.value)}
              placeholder="Enter SKU"
              className={errors.sku ? "border-red-500" : ""}
            />
            {errors.sku && <p className="text-sm text-red-600">{errors.sku}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            placeholder="Enter product description"
            rows={3}
          />
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Pricing & Stock</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Selling Price ($) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => updateFormData("price", Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost Price ($) *</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => updateFormData("cost", Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.cost ? "border-red-500" : ""}
            />
            {errors.cost && <p className="text-sm text-red-600">{errors.cost}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Current Stock *</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => updateFormData("stockQuantity", Number.parseInt(e.target.value) || 0)}
              placeholder="0"
              className={errors.stockQuantity ? "border-red-500" : ""}
            />
            {errors.stockQuantity && <p className="text-sm text-red-600">{errors.stockQuantity}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStockLevel">Minimum Stock Level *</Label>
            <Input
              id="minStockLevel"
              type="number"
              min="0"
              value={formData.minStockLevel}
              onChange={(e) => updateFormData("minStockLevel", Number.parseInt(e.target.value) || 0)}
              placeholder="0"
              className={errors.minStockLevel ? "border-red-500" : ""}
            />
            {errors.minStockLevel && <p className="text-sm text-red-600">{errors.minStockLevel}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select value={formData.unit} onValueChange={(value) => updateFormData("unit", value)}>
              <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit && <p className="text-sm text-red-600">{errors.unit}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier *</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => updateFormData("supplier", e.target.value)}
              placeholder="Enter supplier name"
              className={errors.supplier ? "border-red-500" : ""}
            />
            {errors.supplier && <p className="text-sm text-red-600">{errors.supplier}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => updateFormData("expiryDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
          {initialData ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  )
}
