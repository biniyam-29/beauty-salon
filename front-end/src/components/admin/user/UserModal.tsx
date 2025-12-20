import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import type { User, CreateUserDto, UpdateUserDto, UserRole } from '../../../hooks/UseUsers';

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSave: (user: CreateUserDto | UpdateUserDto) => Promise<void>;
  title: string;
  isPending?: boolean;
  isOpen: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  onClose,
  onSave,
  title,
  isPending = false,
  isOpen,
}) => {
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    phone: '',
    role: 'reception',
  });
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'reception',
      });
    }
  }, [user, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required');
      return;
    }

    setLocalLoading(true);
    try {
      const saveData = user?.id 
        ? { ...formData, id: user.id } as UpdateUserDto
        : formData;
      
      await onSave(saveData);
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
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                placeholder="Enter full name"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                placeholder="Enter email address"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                placeholder="Enter phone number"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all appearance-none bg-white"
                disabled={isSaving}
              >
                <option value="super-admin">Super Admin</option>
                <option value="doctor">Professional</option>
                <option value="reception">Reception</option>
                <option value="inventory-manager">Inventory Manager</option>
              </select>
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
                user?.id ? 'Update User' : 'Create User'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};