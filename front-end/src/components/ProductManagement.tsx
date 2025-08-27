import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product } from "../types";
import { SearchIcon, EditIcon } from "./Icons";
import { ProductModal } from "./Modals";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
const BASE_URL = "https://beauty-api.biniyammarkos.com";

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
  return response.json();
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
    onError: (err) => alert(`Image upload failed: ${err.message}`),
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
    onError: (err) => alert(`Error creating product: ${err.message}`),
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    },
    onError: (err) => alert(`Error: ${err.message}`),
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => alert(`Error: ${err.message}`),
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
    <section className="p-6">
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
        <p className="text-center text-gray-500">Loading products...</p>
      )}
      {isError && <p className="text-center text-red-500">{error.message}</p>}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden group flex flex-col"
              >
                {/* MODIFIED: Use `product.image_data` for the image source */}
                <img
                  src={
                    product.image_data ||
                    "https://placehold.co/600x400/fecdd3/4c0519?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">
                        {product.brand}
                      </p>
                      <h3 className="font-bold text-gray-800 mt-1">
                        {product.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock_quantity > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 flex-grow">
                    {product.description || "No description provided."}
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <p className="text-lg font-bold text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={deleteProductMutation.isPending}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">
                No products match the current filters.
              </p>
            </div>
          )}
        </>
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
