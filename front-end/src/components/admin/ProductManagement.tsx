import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product } from "../../lib/types/types";
import { SearchIcon, EditIcon } from "../Icons";
import { ProductModal } from "./Modals";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// --- Helper Components ---
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
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

// --- API Functions ---
const BASE_URL = "https://api.in2skincare.com";

const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found. Please log in.");
  return token;
};

const fetchProducts = async (
  page: number
): Promise<{ products: Product[]; totalPages: number }> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/products?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  const data = await response.json();
  // Ensure image_data is included for the modal, even if not shown in the table
  const productsWithImageData = data.products.map((p: Product) => ({
    ...p,
    image_data: p.image_data
      ? `data:image/jpeg;base64,${p.image_data.split(",").pop()}`
      : null,
  }));
  return { ...data, products: productsWithImageData };
};

const addProduct = async (
  productData: Omit<Product, "id" | "image_data">
): Promise<{ productId: number }> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error("Failed to create product.");
  return response.json();
};

const updateProduct = async (
  productData: Product
): Promise<{ message: string }> => {
  const token = getAuthToken();
  const { id, ...payload } = productData;
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update product.");
  return response.json();
};

const deleteProduct = async (
  productId: number
): Promise<{ message: string }> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete product.");
  return response.json();
};

const uploadProductImage = async ({
  productId,
  imageFile,
}: {
  productId: number;
  imageFile: File;
}) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("product_picture", imageFile);

  const response = await fetch(`${BASE_URL}/products/${productId}/picture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to upload product image.");
  return response.json();
};

// --- Main Component ---
export const ProductManagementView: React.FC = () => {
  const queryClient = useQueryClient();

  const [stockFilter, setStockFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    data: queryData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", currentPage],
    queryFn: () => fetchProducts(currentPage),
    placeholderData: (previousData) => previousData,
  });

  const products = queryData?.products ?? [];
  const totalPages = queryData?.totalPages ?? 1;

  const uploadImageMutation = useMutation({
    mutationFn: uploadProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      console.log("Image uploaded and product list updated.");
    },
    onError: (err) => alert(`Image upload failed: ${(err as Error).message}`),
  });

  const addProductMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: (data) => {
      console.log("Product created with ID:", data.productId);
      if (imageFile) {
        uploadImageMutation.mutate({ productId: data.productId, imageFile });
      } else {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
      setIsAddModalOpen(false);
      setImageFile(null);
    },
    onError: (err) =>
      alert(`Error creating product: ${(err as Error).message}`),
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    },
    onError: (err) => alert(`Error: ${(err as Error).message}`),
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => alert(`Error: ${(err as Error).message}`),
  });

  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (p) =>
          stockFilter === "all" ||
          (stockFilter === "inStock" && p.stock_quantity > 0) ||
          (stockFilter === "outOfStock" && p.stock_quantity === 0)
      )
      .filter((p) => {
        const term = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          (p.brand && p.brand.toLowerCase().includes(term)) ||
          (p.description && p.description.toLowerCase().includes(term))
        );
      });
  }, [products, stockFilter, searchTerm]);

  const handleDelete = (productId: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  return (
    <section className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
        >
          + Add New Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-grow w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <Input
            type="text"
            placeholder="Search by name, brand, description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-600">Stock:</span>
          {["all", "inStock", "outOfStock"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStockFilter(filter)}
              className={`px-3 py-1 text-sm rounded-full ${
                stockFilter === filter
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {filter === "all"
                ? "All"
                : filter === "inStock"
                ? "In Stock"
                : "Out of Stock"}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <p className="text-center text-gray-500 py-10">Loading products...</p>
      )}
      {isError && (
        <p className="text-center text-red-500 py-10">
          {(error as Error).message}
        </p>
      )}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Brand
                </th>
                <th scope="col" className="px-6 py-3">
                  Description
                </th>
                <th scope="col" className="px-6 py-3">
                  Cost
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {product.name}
                    </td>
                    <td className="px-6 py-4">{product.brand || "N/A"}</td>
                    <td
                      className="px-6 py-4 max-w-sm truncate"
                      title={product.description || ""}
                    >
                      {product.description || "No description provided."}
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600">
                      ${Number(product.cost).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{product.stock_quantity}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.stock_quantity > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock_quantity > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end items-center space-x-3">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-gray-400 hover:text-red-500"
                        title="Edit Product"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={deleteProductMutation.isPending}
                        title="Delete Product"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500">
                    No products match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-center space-x-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" /> Previous
        </Button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || isLoading}
        >
          Next <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {editingProduct && (
        <ProductModal
          title="Edit Product"
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(product) => updateProductMutation.mutate(product as Product)}
          isPending={updateProductMutation.isPending}
        />
      )}
      {isAddModalOpen && (
        <ProductModal
          title="Add New Product"
          onClose={() => {
            setIsAddModalOpen(false);
            setImageFile(null);
          }}
          onSave={(product) =>
            addProductMutation.mutate(
              product as Omit<Product, "id" | "image_data">
            )
          }
          isPending={
            addProductMutation.isPending || uploadImageMutation.isPending
          }
          onFileChange={(file: File | null) => setImageFile(file)}
        />
      )}
    </section>
  );
};
