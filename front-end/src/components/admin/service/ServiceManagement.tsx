import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, 
  Sparkles, Calendar, Clock, DollarSign
} from 'lucide-react';
import { 
  useDeleteService, 
  useServices, 
  useCreateService,
  useUpdateService,
  type Service 
} from '../../../hooks/UseService';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { ServiceModal } from './ServiceModal';
import ConfirmationModal from '../ConfirmationModal';

const ServiceManagementView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch services with pagination
  const { data: servicesData, isLoading, isError, error, refetch } = useServices(currentPage, pageSize);
  const deleteMutation = useDeleteService();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const services = servicesData?.services || [];
  const totalPages = servicesData?.totalPages || 1;
  const totalServices = servicesData?.totalServices || 0;

  // Calculate total value of all services
  const totalValue = services.reduce((sum, service) => sum + service.price, 0);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filtered services based on search
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;
    
    const term = searchTerm.toLowerCase();
    return services.filter(service => 
      service.name.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term)
    );
  }, [services, searchTerm]);

  const handleAddService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(serviceToDelete.id);
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSaveService = async (serviceData: any) => {
    try {
      if (selectedService?.id) {
        // Update existing service
        await updateMutation.mutateAsync({
          id: selectedService.id,
          ...serviceData
        });
      } else {
        // Create new service
        await createMutation.mutateAsync(serviceData);
      }
      setIsModalOpen(false);
      setSelectedService(null);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Management</h1>
        <p className="text-gray-600">
          Manage your salon services, add new services, and update existing ones.
        </p>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-lg border border-rose-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">
                {servicesData ? totalServices : '...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg border border-rose-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100/60 p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name or description..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button onClick={handleAddService}>
              <Plus size={18} className="mr-2" />
              Add New Service
            </Button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">All Services</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredServices.length} of {services.length} services
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-red-500 font-medium">
              Error loading services: {error?.message}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No services found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'No services match your search criteria. Try a different search term.'
                : 'Get started by adding your first service to the salon.'}
            </p>
            {searchTerm ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                }}
              >
                Clear Search
              </Button>
            ) : (
              <Button onClick={handleAddService}>
                <Plus size={18} className="mr-2" />
                Add First Service
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
                      Service Name
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Created
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Last Updated
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredServices.map((service) => (
                    <tr 
                      key={service.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500">ID: {service.id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-700 line-clamp-2 max-w-md">
                          {service.description || 'No description'}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-600">
                            ${service.price.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(service.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(service.updated_at)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditService(service)}
                            aria-label={`Edit ${service.name}`}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(service)}
                            aria-label={`Delete ${service.name}`}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • {totalServices} total services
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
          </>
        )}
      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        service={selectedService}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSaveService}
        title={selectedService ? 'Edit Service' : 'Add New Service'}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Service"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ServiceManagementView;