import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import type { CreateProductDto, Product, UpdateProductDto } from '../../../hooks/UseProduct';
import { Button } from '../../ui/button';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: CreateProductDto | UpdateProductDto, imageFile?: File | null) => Promise<void>;
  title: string;
  isPending?: boolean;
  isOpen: boolean;
  onFileChange?: (file: File | null) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onSave,
  title,
  isPending = false,
  isOpen,
  onFileChange,
}) => {
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    brand: '',
    description: '',
    price: 0,
    cost: 0,
    stock_quantity: 0,
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand || '',
        description: product.description || '',
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        cost: typeof product.cost === 'string' ? parseFloat(product.cost) : product.cost,
        stock_quantity: product.stock_quantity,
      });
      
      // Set image preview if product has image data
      if (product.image_data) {
        setImagePreview(product.image_data);
      }
    } else {
      setFormData({
        name: '',
        brand: '',
        description: '',
        price: 0,
        cost: 0,
        stock_quantity: 0,
      });
    }
    setImageFile(null);
    setImagePreview(null);
  }, [product, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newValue =
      e.target.type === 'number' ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (onFileChange) {
      onFileChange(file);
    }
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileChange) {
      onFileChange(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    setLocalLoading(true);
    try {
      const saveData = product?.id 
        ? { ...formData, id: product.id } as UpdateProductDto
        : formData;
      
      await onSave(saveData, imageFile);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const isSaving = isPending || localLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      alt="Product preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="product-image"
                  disabled={isSaving}
                />
                <label
                  htmlFor="product-image"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer transition-all ${
                    isSaving 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <Upload size={18} />
                  {imageFile ? 'Change Image' : 'Upload Image'}
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                placeholder="Enter product name"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                placeholder="Enter brand name"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all resize-none"
                placeholder="Enter product description"
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cost *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                    min="0"
                    step="0.01"
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                    min="0"
                    step="0.01"
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                  min="0"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};