import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline"
import { ProductForm } from "./product-form"

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

// Mock product data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Tretinoin Cream 0.025%",
    category: "Prescription",
    brand: "Generic",
    description: "Topical retinoid for acne treatment and anti-aging",
    price: 45.0,
    cost: 25.0,
    stockQuantity: 24,
    minStockLevel: 10,
    unit: "tube",
    sku: "TRT-025-30G",
    expiryDate: "2025-06-15",
    supplier: "MedSupply Co.",
    status: "active",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "Vitamin C Serum 20%",
    category: "Skincare",
    brand: "SkinMedica",
    description: "High-potency vitamin C serum for brightening and antioxidant protection",
    price: 89.0,
    cost: 45.0,
    stockQuantity: 8,
    minStockLevel: 15,
    unit: "bottle",
    sku: "VCS-20-30ML",
    expiryDate: "2024-12-30",
    supplier: "Beauty Distributors",
    status: "active",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: "Hyaluronic Acid Moisturizer",
    category: "Skincare",
    brand: "CeraVe",
    description: "Hydrating moisturizer with hyaluronic acid for all skin types",
    price: 32.0,
    cost: 18.0,
    stockQuantity: 0,
    minStockLevel: 20,
    unit: "jar",
    sku: "HAM-50ML",
    supplier: "Pharmacy Plus",
    status: "out-of-stock",
    lastUpdated: "2024-01-10",
  },
  {
    id: "4",
    name: "Chemical Peel Solution",
    category: "Treatment",
    brand: "PCA Skin",
    description: "Professional-grade chemical peel for in-office treatments",
    price: 125.0,
    cost: 75.0,
    stockQuantity: 12,
    minStockLevel: 5,
    unit: "bottle",
    sku: "CPS-100ML",
    expiryDate: "2025-03-20",
    supplier: "Professional Beauty Supply",
    status: "active",
    lastUpdated: "2024-01-12",
  },
  {
    id: "5",
    name: "Sunscreen SPF 50",
    category: "Skincare",
    brand: "EltaMD",
    description: "Broad-spectrum mineral sunscreen for daily protection",
    price: 38.0,
    cost: 22.0,
    stockQuantity: 35,
    minStockLevel: 25,
    unit: "tube",
    sku: "SS-SPF50-85G",
    supplier: "Medical Supplies Inc.",
    status: "active",
    lastUpdated: "2024-01-13",
  },
]

export function InventoryManagementView() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockLevel && p.status !== "out-of-stock")
  const outOfStockProducts = products.filter((p) => p.status === "out-of-stock")
  const activeProducts = products.filter((p) => p.status === "active")

  const handleAddProduct = (productData: Omit<Product, "id" | "lastUpdated">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split("T")[0],
    }
    setProducts([...products, newProduct])
    setIsAddDialogOpen(false)
  }

  const handleEditProduct = (productData: Omit<Product, "id" | "lastUpdated">) => {
    if (!editingProduct) return

    const updatedProduct: Product = {
      ...productData,
      id: editingProduct.id,
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)))
    setEditingProduct(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId))
  }

  const getStatusBadge = (product: Product) => {
    if (product.status === "out-of-stock") {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (product.stockQuantity <= product.minStockLevel) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          Low Stock
        </Badge>
      )
    }
    return <Badge variant="default">In Stock</Badge>
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              {getStatusBadge(product)}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {product.brand} • {product.category}
            </p>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">SKU</p>
                <p className="text-gray-600">{product.sku}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Stock</p>
                <p className="text-gray-600">
                  {product.stockQuantity} {product.unit}s
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Price</p>
                <p className="text-gray-600">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Supplier</p>
                <p className="text-gray-600">{product.supplier}</p>
              </div>
            </div>

            {product.expiryDate && (
              <div className="mt-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Expires:</span>
                  <span className="text-gray-600 ml-1">{product.expiryDate}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingProduct(product)
                setIsEditDialogOpen(true)
              }}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Add a new product to your inventory.</DialogDescription>
            </DialogHeader>
            <ProductForm onSubmit={handleAddProduct} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <CubeIcon className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">{activeProducts.length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <ArchiveBoxIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Unavailable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CubeIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${products.reduce((sum, p) => sum + p.stockQuantity * p.cost, 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Inventory cost</p>
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
                placeholder="Search products by name, brand, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-teal-600 hover:bg-teal-700" : ""}
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Products ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock ({lowStockProducts.length})</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock ({outOfStockProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          {lowStockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </TabsContent>

        <TabsContent value="out-of-stock" className="space-y-4">
          {outOfStockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </TabsContent>
      </Tabs>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleEditProduct}
              onCancel={() => {
                setEditingProduct(null)
                setIsEditDialogOpen(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
