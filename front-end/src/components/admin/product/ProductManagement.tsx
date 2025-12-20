import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Package, DollarSign, BarChart3, 
  Search, ChevronLeft, ChevronRight, Filter 
} from 'lucide-react';
import { 
  useDeleteProduct, 
  useProducts, 
  useCreateProduct,
  useUpdateProduct,
  useUploadProductImage,
  type Product 
} from '../../../hooks/UseProduct';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { ProductModal } from './ProductModal';
import ConfirmationModal from '../ConfirmationModal';

const ProductManagementView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [, setImageFile] = useState<File | null>(null); // FIX: Only keep setImageFile
  
  // Filters and pagination
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products with pagination
  const { data: productsData, isLoading, isError, error, refetch } = useProducts(currentPage);
  const deleteMutation = useDeleteProduct();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const uploadImageMutation = useUploadProductImage();

  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;
  const currentPageNum = productsData?.currentPage || 1;

  // Calculate inventory statistics
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => {
    const cost = typeof product.cost === 'string' ? parseFloat(product.cost) : product.cost;
    return sum + (cost * product.stock_quantity);
  }, 0);
  
  const lowStockProducts = products.filter(p => p.stock_quantity < 10).length;

  // Filtered products based on search and stock filter
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Stock filter
        if (stockFilter === 'inStock') return product.stock_quantity > 0;
        if (stockFilter === 'outOfStock') return product.stock_quantity === 0;
        return true;
      })
      .filter(product => {
        // Search filter
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(term) ||
          (product.brand && product.brand.toLowerCase().includes(term)) ||
          (product.description && product.description.toLowerCase().includes(term))
        );
      });
  }, [products, stockFilter, searchTerm]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
  };

  const handleSaveProduct = async (productData: any, imageFile?: File | null) => {
    try {
      if (selectedProduct?.id) {
        // Update existing product
        await updateMutation.mutateAsync({
          id: selectedProduct.id,
          ...productData
        });
        
        // Upload image if provided
        if (imageFile) {
          await uploadImageMutation.mutateAsync({
            productId: selectedProduct.id,
            imageFile
          });
        }
      } else {
        // Create new product
        const result = await createMutation.mutateAsync(productData);
        
        // Upload image if provided
        if (imageFile && result.productId) {
          await uploadImageMutation.mutateAsync({
            productId: result.productId,
            imageFile
          });
        }
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
      setImageFile(null);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  // Pagination controls
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
        <p className="text-gray-600">
          Manage your inventory, track stock levels, and update product details.
        </p>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-lg border border-rose-100">
          <div className="flex items-center">
            <div className="p-3 bg-rose-100 rounded-lg mr-4">
              <Package className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {productsData ? totalProducts : '...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg border border-rose-100">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg border border-rose-100">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100/60 p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name, brand, description..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Stock:</span>
            {(['all', 'inStock', 'outOfStock'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStockFilter(filter)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  stockFilter === filter
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'inStock' ? 'In Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button onClick={handleAddProduct}>
              <Plus size={18} className="mr-2" />
              Add New Product
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">All Products</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredProducts.length} of {totalProducts} products
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-red-500 font-medium">
              Error loading products: {error?.message}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || stockFilter !== 'all' 
                ? 'No products match your search criteria. Try changing your filters.'
                : 'Get started by adding your first product to the inventory.'}
            </p>
            {searchTerm || stockFilter !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStockFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={handleAddProduct}>
                <Plus size={18} className="mr-2" />
                Add First Product
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Brand
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Cost
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Stock
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Value
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
                    const cost = typeof product.cost === 'string' ? parseFloat(product.cost) : product.cost;
                    const value = cost * product.stock_quantity;
                    
                    return (
                      <tr 
                        key={product.id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {product.description || 'No description'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-700">
                            {product.brand || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">
                            ${cost.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-green-600">
                            ${price.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <span className={`font-medium ${
                              product.stock_quantity < 10 
                                ? 'text-red-600' 
                                : 'text-gray-900'
                            }`}>
                              {product.stock_quantity}
                            </span>
                            {product.stock_quantity < 10 && (
                              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">
                            ${value.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stock_quantity > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditProduct(product)}
                              aria-label={`Edit ${product.name}`}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteClick(product)}
                              aria-label={`Delete ${product.name}`}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPageNum} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPageNum === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPageNum === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
          setImageFile(null);
        }}
        onSave={handleSaveProduct}
        onFileChange={handleFileChange}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
        isPending={createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This will permanently remove it from your inventory.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ProductManagementView;