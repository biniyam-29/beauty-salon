import React, { useState, useEffect } from 'react';
import { X, Loader2, DollarSign } from 'lucide-react';
import type { CreateServiceDto, Service, UpdateServiceDto } from '../../../hooks/UseService';
import { Button } from '../../ui/button';

interface ServiceModalProps {
  service?: Service | null;
  onClose: () => void;
  onSave: (service: CreateServiceDto | UpdateServiceDto) => Promise<void>;
  title: string;
  isPending?: boolean;
  isOpen: boolean;
  error?: string | null; // Add error prop
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  onClose,
  onSave,
  title,
  isPending = false,
  isOpen,
  error,
}) => {
  const [formData, setFormData] = useState<CreateServiceDto>({
    name: '',
    description: '',
    price: 0,
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
      });
    }
    setValidationError(null);
  }, [service, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newValue =
      e.target.type === 'number' ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    // Clear validation error when user types
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationError(null);
    
    // Validate required fields
    if (!formData.name.trim()) {
      setValidationError('Service name is required');
      return;
    }

    if (formData.price < 0) {
      setValidationError('Price cannot be negative');
      return;
    }

    if (formData.price === 0) {
      setValidationError('Price must be greater than 0');
      return;
    }

    setLocalLoading(true);
    try {
      const saveData = service?.id 
        ? { ...formData, id: service.id } as UpdateServiceDto
        : formData;
      
      console.log('Saving service data:', saveData);
      await onSave(saveData);
    } catch (error: any) {
      console.error('Save failed with error:', error);
      setValidationError(error.message || 'Failed to save service');
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
          <div className="space-y-4">
            {/* Show error messages */}
            {(validationError || error) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  {validationError || error}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                placeholder="Enter service name"
                required
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
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all resize-none"
                placeholder="Describe the service in detail..."
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <DollarSign size={18} />
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                  disabled={isSaving}
                  onKeyDown={(e) => {
                    // Prevent decimal input
                    if (e.key === '.' || e.key === ',') {
                      e.preventDefault();
                    }
                  }}
/>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Price must be a whole number (no decimals)
              </p>
            </div>

            {/* Show read-only fields when editing */}
            {service && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ID:</span> {service.id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span> {new Date(service.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Last Updated:</span> {new Date(service.updated_at).toLocaleString()}
                </p>
              </div>
            )}
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
                service ? 'Update Service' : 'Create Service'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};