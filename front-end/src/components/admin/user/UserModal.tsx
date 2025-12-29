import React, { useState, useEffect } from 'react';
import { X, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import type { User, CreateUserDto, UpdateUserDto } from '../../../hooks/UseUsers';

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSave: (user: CreateUserDto | UpdateUserDto) => Promise<void>;
  title: string;
  isPending?: boolean;
  isOpen: boolean;
  onResetPassword?: (data: { password: string; email: string }) => Promise<void>;
  isResettingPassword?: boolean;
  onResetPasswordSuccess?: () => void; 
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  onClose,
  onSave,
  title,
  isPending = false,
  isOpen,
  onResetPassword,
  isResettingPassword = false,
  onResetPasswordSuccess, // New prop
}) => {
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    phone: '',
    role: 'reception',
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false); 

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
    // Reset password section when modal closes or user changes
    setShowResetPassword(false);
    setResetPasswordData({ password: '', confirmPassword: '' });
    setResetError('');
    setResetSuccess(false);
  }, [user, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetPasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (resetError) setResetError('');
    // Clear success message when user starts typing
    if (resetSuccess) setResetSuccess(false);
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!resetPasswordData.password.trim()) {
      setResetError('Password is required');
      return;
    }
    
    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    
    if (resetPasswordData.password.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }
    
    if (!user?.email) {
      setResetError('User email not found');
      return;
    }
    
    try {
      await onResetPassword?.({
        password: resetPasswordData.password,
        email: user.email,
      });
      
      // Show success message
      setResetSuccess(true);
      
      // Reset form and close reset section after 2 seconds
      setTimeout(() => {
        setResetPasswordData({ password: '', confirmPassword: '' });
        setShowResetPassword(false);
        setResetSuccess(false);
        
        // Notify parent component about success
        onResetPasswordSuccess?.();
      }, 2000);
      
    } catch (error: any) {
      setResetError(error.message || 'Failed to reset password');
    }
  };

  const isSaving = isPending || localLoading;
  const canShowResetPassword = user?.id && onResetPassword;
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            disabled={isSaving || isResettingPassword}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Reset Password Toggle for Edit Mode */}
        {canShowResetPassword && !showResetPassword && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              disabled={isSaving || isResettingPassword}
              className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium text-sm"
            >
              <RefreshCw size={16} />
              Reset Password
            </button>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Set a new password for this user
            </p>
          </div>
        )}

        {/* Reset Password Form */}
        {showResetPassword && (
          <div className="mb-6 p-4 bg-rose-50 rounded-lg border border-rose-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Reset Password</h3>
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(false);
                  setResetPasswordData({ password: '', confirmPassword: '' });
                  setResetError('');
                  setResetSuccess(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
                disabled={isResettingPassword}
              >
                Cancel
              </button>
            </div>
            
            {resetSuccess ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Password Reset Successfully!</h4>
                <p className="text-sm text-gray-600">
                  The password has been updated for {user?.name}
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={resetPasswordData.password}
                    onChange={handleResetPasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-300 focus:border-transparent"
                    placeholder="Enter new password"
                    disabled={isResettingPassword}
                    minLength={6}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={resetPasswordData.confirmPassword}
                    onChange={handleResetPasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-300 focus:border-transparent"
                    placeholder="Confirm new password"
                    disabled={isResettingPassword}
                    minLength={6}
                    required
                  />
                </div>
                
                {resetError && (
                  <p className="text-sm text-red-600">{resetError}</p>
                )}
                
                <Button
                  type="submit"
                  disabled={isResettingPassword}
                  className="w-full bg-rose-600 hover:bg-rose-700"
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Main User Form */}
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
                disabled={isSaving || isResettingPassword}
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
                disabled={isSaving || isResettingPassword}
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
                disabled={isSaving || isResettingPassword}
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
                disabled={isSaving || isResettingPassword}
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="reception">Reception</option>
                <option value="cashier">Cashier</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving || isResettingPassword}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isResettingPassword || showResetPassword}
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