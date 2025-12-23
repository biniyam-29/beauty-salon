import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

// Types
export interface ServicePrescription {
  id: number;
  name: string;
  prescription_notes?: string;
  price: number;
  customer_id: number;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  assigned_doctor_name?: string;
}

export interface ServicePrescriptionResponse {
  service_prescriptions: ServicePrescription[];
  totalPages: number;
  currentPage: number;
  totalServicePrescriptions: number;
  customer_id?: number; // Added for customer-specific responses
}

export interface CustomerServicePrescriptionResponse extends ServicePrescriptionResponse {
  customer_id: number;
}

export interface CreateServicePrescriptionInput {
  name: string;
  prescription_notes?: string;
  price: number;
  customer_id: number;
  status?: 'pending' | 'completed';
}

export interface UpdateServicePrescriptionInput {
  name?: string;
  prescription_notes?: string;
  price?: number;
  customer_id?: number;
  status?: 'pending' | 'completed';
}

export interface ServicePrescriptionFilters {
  customer_id?: number;
  status?: 'pending' | 'completed';
  page?: number;
  pageSize?: number;
}

// Query keys
export const servicePrescriptionKeys = {
  all: ['service-prescription'] as const,
  lists: () => [...servicePrescriptionKeys.all, 'list'] as const,
  list: (filters: ServicePrescriptionFilters) => 
    [...servicePrescriptionKeys.lists(), filters] as const,
  details: () => [...servicePrescriptionKeys.all, 'detail'] as const,
  detail: (id: number) => [...servicePrescriptionKeys.details(), id] as const,
  // Customer-specific query keys
  customerLists: (customerId: number) => 
    [...servicePrescriptionKeys.all, 'customer', customerId, 'list'] as const,
  customerList: (customerId: number, filters?: Omit<ServicePrescriptionFilters, 'customer_id'>) => 
    [...servicePrescriptionKeys.customerLists(customerId), filters || {}] as const,
};

// API functions
export const servicePrescriptionApi = {
  // Get all service prescriptions with filters
  getAll: async (filters: ServicePrescriptionFilters = {}): Promise<ServicePrescriptionResponse> => {
    const params = new URLSearchParams();
    
    if (filters.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const queryString = params.toString();
    const url = `/service-prescription${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<ServicePrescriptionResponse>(url);
  },

  // Get service prescriptions by customer ID (using query parameters)
  getByCustomerId: async (
    customerId: number, 
    filters?: Omit<ServicePrescriptionFilters, 'customer_id'>
  ): Promise<CustomerServicePrescriptionResponse> => {
    const params = new URLSearchParams();
    
    // Always include customer_id
    params.append('customer_id', customerId.toString());
    
    // Add optional filters
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const queryString = params.toString();
    const url = `/service-prescription${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ServicePrescriptionResponse>(url);
    
    // Add customer_id to response for type safety
    return {
      ...response,
      customer_id: customerId,
    };
  },

  // Alternative: Using dedicated endpoint (if you implemented the backend changes)
  getByCustomerIdDedicated: async (
    customerId: number,
    filters?: Omit<ServicePrescriptionFilters, 'customer_id'>
  ): Promise<CustomerServicePrescriptionResponse> => {
    const params = new URLSearchParams();
    
    // Add optional filters
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const queryString = params.toString();
    const url = `/service-prescription/customer/${customerId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ServicePrescriptionResponse>(url);
    
    // Add customer_id to response for type safety
    return {
      ...response,
      customer_id: customerId,
    };
  },

  // Get single service prescription by ID
  getById: async (id: number): Promise<ServicePrescription> => {
    return apiClient.get<ServicePrescription>(`/service-prescription/${id}`);
  },

  // Create new service prescription
  create: async (data: CreateServicePrescriptionInput): Promise<ServicePrescription> => {
    return apiClient.post<ServicePrescription>('/service-prescription', data);
  },

  // Update service prescription
  update: async (id: number, data: UpdateServicePrescriptionInput): Promise<ServicePrescription> => {
    return apiClient.put<ServicePrescription>(`/service-prescription/${id}`, data);
  },

  // Delete service prescription
  delete: async (id: number): Promise<{ message: string; deleted_service_prescription: ServicePrescription }> => {
    return apiClient.delete<{ message: string; deleted_service_prescription: ServicePrescription }>(
      `/service-prescription/${id}`
    );
  },

  // Update status only
  updateStatus: async (id: number, status: 'pending' | 'completed'): Promise<ServicePrescription> => {
    return apiClient.put<ServicePrescription>(`/service-prescription/${id}`, { status });
  },
};

// React Query Hooks

// Hook for all service prescriptions with filters
export function useServicePrescriptions(
  filters: ServicePrescriptionFilters = {},
  options?: Omit<UseQueryOptions<ServicePrescriptionResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ServicePrescriptionResponse, Error>({
    queryKey: servicePrescriptionKeys.list(filters),
    queryFn: () => servicePrescriptionApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (React Query v5)
    ...options,
  });
}

// Hook for customer-specific service prescriptions (using query parameters)
export function useCustomerServicePrescriptions(
  customerId: number | undefined,
  filters?: Omit<ServicePrescriptionFilters, 'customer_id'>,
  options?: Omit<UseQueryOptions<CustomerServicePrescriptionResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CustomerServicePrescriptionResponse, Error>({
    queryKey: servicePrescriptionKeys.customerList(customerId!, filters),
    queryFn: () => servicePrescriptionApi.getByCustomerId(customerId!, filters),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

// Alternative hook using dedicated endpoint
export function useCustomerServicePrescriptionsDedicated(
  customerId: number | undefined,
  filters?: Omit<ServicePrescriptionFilters, 'customer_id'>,
  options?: Omit<UseQueryOptions<CustomerServicePrescriptionResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CustomerServicePrescriptionResponse, Error>({
    queryKey: [...servicePrescriptionKeys.customerList(customerId!, filters), 'dedicated'],
    queryFn: () => servicePrescriptionApi.getByCustomerIdDedicated(customerId!, filters),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

// Hook for single service prescription
export function useServicePrescription(
  id: number | undefined,
  options?: Omit<UseQueryOptions<ServicePrescription, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ServicePrescription, Error>({
    queryKey: servicePrescriptionKeys.detail(id!),
    queryFn: () => servicePrescriptionApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

// Mutation hooks remain the same
export function useCreateServicePrescription(
  options?: UseMutationOptions<ServicePrescription, Error, CreateServicePrescriptionInput>
) {
  const queryClient = useQueryClient();
  
  return useMutation<ServicePrescription, Error, CreateServicePrescriptionInput>({
    mutationFn: servicePrescriptionApi.create,
    onSuccess: (data) => {
      // Invalidate all service prescription lists
      queryClient.invalidateQueries({ queryKey: servicePrescriptionKeys.lists() });
      
      // Invalidate customer-specific lists if this prescription has a customer_id
      if (data.customer_id) {
        queryClient.invalidateQueries({ 
          queryKey: servicePrescriptionKeys.customerLists(data.customer_id) 
        });
      }
      
      // Update individual cache
      queryClient.setQueryData(servicePrescriptionKeys.detail(data.id), data);
    },
    ...options,
  });
}

export function useUpdateServicePrescription(
  options?: UseMutationOptions<ServicePrescription, Error, { id: number; data: UpdateServicePrescriptionInput }>
) {
  const queryClient = useQueryClient();
  
  return useMutation<ServicePrescription, Error, { id: number; data: UpdateServicePrescriptionInput }>({
    mutationFn: ({ id, data }) => servicePrescriptionApi.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: servicePrescriptionKeys.lists() });
      
      // Invalidate customer-specific lists if customer_id changed or is present
      const oldData = queryClient.getQueryData<ServicePrescription>(
        servicePrescriptionKeys.detail(variables.id)
      );
      const newCustomerId = variables.data.customer_id || data.customer_id;
      
      if (oldData?.customer_id && oldData.customer_id !== newCustomerId) {
        // Customer changed, invalidate old customer's lists
        queryClient.invalidateQueries({ 
          queryKey: servicePrescriptionKeys.customerLists(oldData.customer_id) 
        });
      }
      
      if (newCustomerId) {
        // Invalidate new customer's lists
        queryClient.invalidateQueries({ 
          queryKey: servicePrescriptionKeys.customerLists(newCustomerId) 
        });
      }
      
      // Update specific item cache
      queryClient.setQueryData(servicePrescriptionKeys.detail(variables.id), data);
      
      // Also update in lists
      queryClient.setQueriesData<ServicePrescriptionResponse>(
        { queryKey: servicePrescriptionKeys.lists() },
        (oldListData) => {
          if (!oldListData) return oldListData;
          
          return {
            ...oldListData,
            service_prescriptions: oldListData.service_prescriptions.map(item =>
              item.id === variables.id ? { ...item, ...data } : item
            ),
          };
        }
      );
    },
    ...options,
  });
}

export function useDeleteServicePrescription(
  options?: UseMutationOptions<
    { message: string; deleted_service_prescription: ServicePrescription },
    Error,
    number
  >
) {
  const queryClient = useQueryClient();
  
  return useMutation<
    { message: string; deleted_service_prescription: ServicePrescription },
    Error,
    number
  >({
    mutationFn: servicePrescriptionApi.delete,
    onSuccess: (data, id) => {
      const deletedPrescription = data.deleted_service_prescription;
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: servicePrescriptionKeys.detail(id) });
      
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: servicePrescriptionKeys.lists() });
      
      // Invalidate customer-specific lists
      if (deletedPrescription.customer_id) {
        queryClient.invalidateQueries({ 
          queryKey: servicePrescriptionKeys.customerLists(deletedPrescription.customer_id) 
        });
      }
      
      // Optimistically remove from lists
      queryClient.setQueriesData<ServicePrescriptionResponse>(
        { queryKey: servicePrescriptionKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            service_prescriptions: oldData.service_prescriptions.filter(item => item.id !== id),
            totalServicePrescriptions: oldData.totalServicePrescriptions - 1,
          };
        }
      );
      
      // Optimistically remove from customer-specific lists
      if (deletedPrescription.customer_id) {
        queryClient.setQueriesData<CustomerServicePrescriptionResponse>(
          { queryKey: servicePrescriptionKeys.customerLists(deletedPrescription.customer_id) },
          (oldData) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              service_prescriptions: oldData.service_prescriptions.filter(item => item.id !== id),
              totalServicePrescriptions: oldData.totalServicePrescriptions - 1,
            };
          }
        );
      }
    },
    ...options,
  });
}

export function useUpdateServicePrescriptionStatus(
  options?: UseMutationOptions<ServicePrescription, Error, { id: number; status: 'pending' | 'completed' }>
) {
  const queryClient = useQueryClient();
  
  return useMutation<ServicePrescription, Error, { id: number; status: 'pending' | 'completed' }>({
    mutationFn: ({ id, status }) => servicePrescriptionApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      // Update specific item cache
      queryClient.setQueryData(servicePrescriptionKeys.detail(variables.id), data);
      
      // Update in all lists
      queryClient.setQueriesData<ServicePrescriptionResponse>(
        { queryKey: servicePrescriptionKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            service_prescriptions: oldData.service_prescriptions.map(item =>
              item.id === variables.id ? { ...item, status: variables.status } : item
            ),
          };
        }
      );
      
      // Update in customer-specific lists
      if (data.customer_id) {
        queryClient.setQueriesData<CustomerServicePrescriptionResponse>(
          { queryKey: servicePrescriptionKeys.customerLists(data.customer_id) },
          (oldData) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              service_prescriptions: oldData.service_prescriptions.map(item =>
                item.id === variables.id ? { ...item, status: variables.status } : item
              ),
            };
          }
        );
      }
    },
    ...options,
  });
}

// Custom hook with enhanced operations
export function useServicePrescriptionOperations() {
  const queryClient = useQueryClient();
  
  const createMutation = useCreateServicePrescription();
  const updateMutation = useUpdateServicePrescription();
  const deleteMutation = useDeleteServicePrescription();
  const updateStatusMutation = useUpdateServicePrescriptionStatus();
  
  const refreshLists = () => {
    queryClient.invalidateQueries({ queryKey: servicePrescriptionKeys.lists() });
  };
  
  const refreshCustomerLists = (customerId: number) => {
    queryClient.invalidateQueries({ 
      queryKey: servicePrescriptionKeys.customerLists(customerId) 
    });
  };
  
  const getCustomerServicePrescriptions = (customerId: number) => {
    return queryClient.getQueryData<CustomerServicePrescriptionResponse>(
      servicePrescriptionKeys.customerList(customerId)
    );
  };
  
  const prefetchServicePrescription = (id: number) => {
    return queryClient.prefetchQuery({
      queryKey: servicePrescriptionKeys.detail(id),
      queryFn: () => servicePrescriptionApi.getById(id),
    });
  };
  
  const prefetchCustomerServicePrescriptions = (
    customerId: number, 
    filters?: Omit<ServicePrescriptionFilters, 'customer_id'>
  ) => {
    return queryClient.prefetchQuery({
      queryKey: servicePrescriptionKeys.customerList(customerId, filters),
      queryFn: () => servicePrescriptionApi.getByCustomerId(customerId, filters),
    });
  };
  
  return {
    createServicePrescription: createMutation.mutate,
    createServicePrescriptionAsync: createMutation.mutateAsync,
    updateServicePrescription: updateMutation.mutate,
    updateServicePrescriptionAsync: updateMutation.mutateAsync,
    deleteServicePrescription: deleteMutation.mutate,
    deleteServicePrescriptionAsync: deleteMutation.mutateAsync,
    updateServicePrescriptionStatus: updateStatusMutation.mutate,
    updateServicePrescriptionStatusAsync: updateStatusMutation.mutateAsync,
    refreshLists,
    refreshCustomerLists,
    getCustomerServicePrescriptions,
    prefetchServicePrescription,
    prefetchCustomerServicePrescriptions,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess || deleteMutation.isSuccess,
    errors: {
      create: createMutation.error,
      update: updateMutation.error,
      delete: deleteMutation.error,
      updateStatus: updateStatusMutation.error,
    },
  };
}

// Helper functions (remain the same)
export function formatServicePrescriptionPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function getServicePrescriptionStatusColor(status: 'pending' | 'completed'): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getServicePrescriptionStatusText(status: 'pending' | 'completed'): string {
  const texts = {
    pending: 'Pending',
    completed: 'Completed',
  };
  return texts[status] || 'Unknown';
}

// Types for React components (remain the same)
export interface ServicePrescriptionTableData {
  id: number;
  name: string;
  customer: string;
  price: string;
  status: {
    text: string;
    color: string;
  };
  created_at: string;
  actions: {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUpdateStatus: (status: 'pending' | 'completed') => void;
  };
}

export function transformToTableData(
  prescriptions: ServicePrescription[],
  callbacks: {
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdateStatus: (id: number, status: 'pending' | 'completed') => void;
  }
): ServicePrescriptionTableData[] {
  return prescriptions.map(prescription => ({
    id: prescription.id,
    name: prescription.name,
    customer: prescription.customer_name || `Customer #${prescription.customer_id}`,
    price: formatServicePrescriptionPrice(prescription.price),
    status: {
      text: getServicePrescriptionStatusText(prescription.status),
      color: getServicePrescriptionStatusColor(prescription.status),
    },
    created_at: new Date(prescription.created_at).toLocaleDateString(),
    actions: {
      onView: () => callbacks.onView(prescription.id),
      onEdit: () => callbacks.onEdit(prescription.id),
      onDelete: () => callbacks.onDelete(prescription.id),
      onUpdateStatus: (status: 'pending' | 'completed') => callbacks.onUpdateStatus(prescription.id, status),
    },
  }));
}

// Customer service prescription summary interface
export interface CustomerServicePrescriptionSummary {
  totalPrescriptions: number;
  pendingPrescriptions: number;
  completedPrescriptions: number;
  totalValue: number;
  averagePrice: number;
}

// Helper to calculate customer prescription summary
export function calculateCustomerPrescriptionSummary(
  prescriptions: ServicePrescription[]
): CustomerServicePrescriptionSummary {
  const total = prescriptions.length;
  const pending = prescriptions.filter(p => p.status === 'pending').length;
  const completed = prescriptions.filter(p => p.status === 'completed').length;
  const totalValue = prescriptions.reduce((sum, p) => sum + p.price, 0);
  const averagePrice = total > 0 ? totalValue / total : 0;

  return {
    totalPrescriptions: total,
    pendingPrescriptions: pending,
    completedPrescriptions: completed,
    totalValue,
    averagePrice,
  };
}

