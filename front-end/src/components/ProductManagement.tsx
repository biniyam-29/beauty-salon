import React, { useState, useMemo, useEffect } from "react";
import type { Product } from "../types";
import { SearchIcon, EditIcon } from "./Icons";
import { ProductModal } from "./Modals";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// --- SVG Icon Components ---
// Defined locally to resolve import issue.
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

export const ProductManagementView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockFilter, setStockFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // API State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- Fetch Products from API ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://beauty-api.biniyammarkos.com/products?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

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
          p.brand.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        );
      });
  }, [products, stockFilter, searchTerm]);

  // --- API Handlers ---
  const handleAddProduct = async (
    newProductData: Omit<Product, "id" | "image">
  ) => {
    const token = localStorage.getItem("auth_token");
    try {
      const response = await fetch(
        "https://beauty-api.biniyammarkos.com/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newProductData),
        }
      );
      if (!response.ok) throw new Error("Failed to create product.");
      const savedProduct = await response.json();
      setProducts((prev) => [savedProduct, ...prev]);
      setIsAddModalOpen(false);
    } catch (err) {
      alert(
        `Error: ${
          err instanceof Error ? err.message : "An unknown error occurred."
        }`
      );
    }
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    const token = localStorage.getItem("auth_token");
    const payload = {
      name: updatedProduct.name,
      price: updatedProduct.price,
      stock_quantity: updatedProduct.stock_quantity,
      brand: updatedProduct.brand,
      description: updatedProduct.description,
    };
    try {
      const response = await fetch(
        `https://beauty-api.biniyammarkos.com/products/${updatedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to update product.");
      setProducts(
        products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setEditingProduct(null);
    } catch (err) {
      alert(
        `Error: ${
          err instanceof Error ? err.message : "An unknown error occurred."
        }`
      );
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    const token = localStorage.getItem("auth_token");
    try {
      const response = await fetch(
        `https://beauty-api.biniyammarkos.com/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete product.");
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      alert(
        `Error: ${
          err instanceof Error ? err.message : "An unknown error occurred."
        }`
      );
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
          <button
            onClick={() => setStockFilter("all")}
            className={`px-3 py-1 text-sm rounded-full ${
              stockFilter === "all"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStockFilter("inStock")}
            className={`px-3 py-1 text-sm rounded-full ${
              stockFilter === "inStock"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            In Stock
          </button>
          <button
            onClick={() => setStockFilter("outOfStock")}
            className={`px-3 py-1 text-sm rounded-full ${
              stockFilter === "outOfStock"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading products...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden group flex flex-col"
              >
                <img
                  src={
                    product.image ||
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
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <p className="text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-gray-400 hover:text-red-500"
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
          disabled={currentPage === 1 || loading}
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
          disabled={currentPage === totalPages || loading}
        >
          Next <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {editingProduct && (
        <ProductModal
          title="Edit Product"
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveProduct}
        />
      )}
      {isAddModalOpen && (
        <ProductModal
          title="Add New Product"
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddProduct}
        />
      )}
    </section>
  );
};
