import React, { useState, type ReactNode } from "react";
// Assuming ProductData is defined in this path.
// import type { ProductData } from "../../types";

// --- MOCK TYPES & COMPONENTS FOR STANDALONE DEMO ---
// This makes the component runnable for demonstration purposes.
type ProductData = {
  id?: number | string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  price: number;
};

// Mock UI components
const Card: React.FC<{ className?: string; children: ReactNode }> = ({
  className,
  children,
}) => (
  <div className={`bg-white rounded-lg shadow-lg ${className}`}>{children}</div>
);
const CardHeader: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="p-6 border-b">{children}</div>
);
const CardTitle: React.FC<{ children: ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-bold text-gray-800">{children}</h2>
);
const CardContent: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="p-6">{children}</div>
);
const Button: React.FC<{
  children: ReactNode;
  type: "button" | "submit";
  variant?: string;
  onClick?: () => void;
}> = ({ children, ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md font-semibold ${
      props.variant === "outline"
        ? "text-gray-700 border border-gray-300 hover:bg-gray-100"
        : "text-white bg-pink-600 hover:bg-pink-700"
    }`}
  >
    {children}
  </button>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => (
  <input
    {...props}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
  />
);
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (
  props
) => <label {...props} className="block text-sm font-medium text-gray-700" />;
// --- END MOCK ---

// =================================================================================
// FILE: src/components/ProductFormModal.tsx
// =================================================================================

type ProductFormModalProps = {
  product: ProductData | null;
  onSave: (product: ProductData) => void;
  onClose: () => void;
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<ProductData>(
    product || { name: "", brand: "", category: "", stock: 0, price: 0 }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    // This outer div acts as the modal backdrop. Clicking it calls onClose.
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast p-4"
    >
      {/* FIX: This wrapper div now handles the click event to stop propagation,
          preventing the modal from closing when you click inside the card. */}
      <div
        className="w-full max-w-lg"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>
              {product ? "Edit Product" : "Add New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Save Product</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// =================================================================================
// END FILE: src/components/ProductFormModal.tsx
// =================================================================================
