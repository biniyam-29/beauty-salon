import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Users, UserCircle, Search, 
  ChevronLeft, ChevronRight, MoreVertical,
  Filter, Phone
} from 'lucide-react';
import { 
  useUsers,
  useUsersSearch,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type User,
  type UserRole,
  type UserRoleFilter
} from '../../../hooks/UseUsers';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { UserModal } from './UserModal';
import ConfirmationModal from '../ConfirmationModal';
import { TemporaryPasswordModal } from './TemporaryPasswordModal';

// Custom hook for debouncing
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const UserManagementView: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRoleFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newlyCreatedUser, setNewlyCreatedUser] = useState<(User & { temporary_password: string }) | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<number | null>(null);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isPhoneSearch = /^\d{3,}/.test(debouncedSearchTerm);

  // Roles
  const roles: UserRoleFilter[] = ['all', 'reception', 'doctor', 'admin', 'professional', 'cashier'];
  const roleLabels: Record<UserRoleFilter, string> = {
    'all': 'All Users',
    'reception': 'Reception',
    'doctor': 'Doctor',
    'admin': 'Admin',
    'professional': 'Professional',
    'cashier': 'Cashier',
  };

  // Queries
  const { 
    data: usersData, 
    isLoading: isUsersLoading, 
    isError: isUsersError, 
    error: usersError,
    refetch: refetchUsers 
  } = useUsers(currentPage, selectedRole);

  const { 
    data: searchResults, 
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError 
  } = useUsersSearch(isPhoneSearch ? debouncedSearchTerm : '');

  // Mutations
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  // Data
  const users = isPhoneSearch ? (searchResults || []) : (usersData?.users || []);
  const totalPages = usersData?.totalPages || 1;
  const isLoading = isUsersLoading || (isPhoneSearch && isSearchLoading);
  const isError = isUsersError || isSearchError;
  const error = usersError || searchError;

  // Statistics
  const totalUsers = users.length;

  // Filter users by role for statistics (excluding 'all' filter)
  const usersByRole = useMemo(() => {
    const counts: Record<UserRole, number> = {
      'reception': 0,
      'doctor': 0,
      'admin': 0,
      'cashier': 0,
      'professional': 0,
    };
    
    users.forEach(user => {
      if (user.role in counts) {
        counts[user.role]++;
      }
    });
    
    return counts;
  }, [users]);

  // Role badge colors
  const getRoleBadgeColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      'reception': 'bg-blue-100 text-blue-800',
      'doctor': 'bg-green-100 text-green-800',
      'admin': 'bg-red-100 text-red-800',
      'cashier': 'bg-gray-100 text-gray-800',
      'professional': 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Role descriptions
  const getRoleDescription = (role: UserRole): string => {
    const descriptions: Record<UserRole, string> = {
      'reception': 'Manages appointments and client communication',
      'doctor': 'Access to patient records and treatment history',
      'admin': 'Full system access and user management',
      'cashier': 'Customer payment checkout',
      'professional':'Provide the service for the customer',
    };
    return descriptions[role] || '';
  };

  // Handlers
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setIsMenuOpen(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (selectedUser?.id) {
        // Update existing user
        await updateMutation.mutateAsync({
          id: selectedUser.id,
          ...userData
        });
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        // Create new user
        const result = await createMutation.mutateAsync(userData);
        setIsAddModalOpen(false);
        setNewlyCreatedUser(result.user);
        setIsPasswordModalOpen(true);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleRoleChange = (role: UserRoleFilter) => {
    setSelectedRole(role);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setSelectedRole('all');
      setCurrentPage(1);
    }
  };

  // Render user card
  const UserCard = ({ user }: { user: User }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-rose-600" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-gray-500 truncate">
                <Phone className="inline h-3 w-3 mr-1" />
                {user.phone}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2 ml-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
            {roleLabels[user.role]}
          </span>
          
          <div className="flex items-center space-x-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleEditUser(user)}
              aria-label={`Edit ${user.name}`}
              className="h-8 w-8"
            >
              <Edit size={14} />
            </Button>
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMenuOpen(isMenuOpen === user.id ? null : user.id)}
                aria-label="More options"
                className="h-8 w-8"
              >
                <MoreVertical size={14} />
              </Button>
              
              {isMenuOpen === user.id && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      handleDeleteClick(user);
                      setIsMenuOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete User
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">
          Manage user accounts, roles, and permissions across the system.
        </p>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-lg border border-rose-100">
          <div className="flex items-center">
            <div className="p-3 bg-rose-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>

        {Object.entries(usersByRole).map(([role, count]) => (
          <div key={role} className="bg-white rounded-xl p-5 shadow-lg border border-rose-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <UserCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{roleLabels[role as UserRole]}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {getRoleDescription(role as UserRole)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100/60 p-4">
        {/* Main Container: Stacked on mobile, row on medium screens+ */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
          
          {/* Search Input: Takes full width on mobile/tablet */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by phone..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isLoading}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Controls Wrapper: Holds Role filters and Add Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            
            {/* Role Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-gray-400 shrink-0" />
              <span className="text-sm font-medium text-gray-600 hidden sm:inline">Role:</span>
              <div className="flex gap-1">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${
                      selectedRole === role
                        ? 'bg-rose-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={isPhoneSearch}
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button: Full width on tiny screens, auto on larger ones */}
            <Button 
              onClick={handleAddUser} 
              className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto shrink-0"
            >
              <Plus size={18} className="mr-2" />
              <span className="whitespace-nowrap">Add New User</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {users.length} users
              {searchTerm && ` (searching by phone)`}
              {selectedRole !== 'all' && !searchTerm && ` (${roleLabels[selectedRole]})`}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetchUsers()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-red-500 font-medium">
              Error loading users: {error?.message}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetchUsers()}
            >
              Try Again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No users found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'No users match your search. Try a different phone number.'
                : selectedRole !== 'all'
                ? `No users found with ${roleLabels[selectedRole]} role.`
                : 'Get started by adding your first user.'}
            </p>
            <Button onClick={handleAddUser}>
              <Plus size={18} className="mr-2" />
              Add First User
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 md:p-6 space-y-4">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>

            {/* Pagination (only show for non-search results) */}
            {!isPhoneSearch && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isAddModalOpen}
        user={null}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        title="Add New User"
        isPending={createMutation.isPending}
      />

      <UserModal
        isOpen={isEditModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        title="Edit User"
        isPending={updateMutation.isPending}
      />

      <TemporaryPasswordModal
        isOpen={isPasswordModalOpen}
        user={newlyCreatedUser!}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setNewlyCreatedUser(null);
        }}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
          setIsMenuOpen(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default UserManagementView;