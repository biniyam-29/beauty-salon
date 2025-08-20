import React, { useState, useMemo } from "react";
import { initialProducts } from "../data";
import type { Product } from "../types";
import { SearchIcon, EditIcon } from "./Icons";
import { ProductModal } from "./Modals";

export const ProductManagementView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stockFilter, setStockFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts(
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prevProducts) => [
      { ...newProduct, id: Date.now() },
      ...prevProducts,
    ]);
    setIsAddModalOpen(false);
  };

  return (
    <section>
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
          <input
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden group flex flex-col"
          >
            <img
              src={product.image}
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
                <button
                  onClick={() => setEditingProduct(product)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <EditIcon />
                </button>
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
