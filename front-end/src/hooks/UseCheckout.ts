import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

// Types
export interface PrescriptionBase {
  id: number;
  name: string;
  quantity: number;
  instructions: string | null;
  status: string;
  created_at: string;
  unit_price: number;
  customer_name: string;
  customer_id: number;
  doctor_name: string;
  consultation_date: string;
}

export interface ProductPrescription extends PrescriptionBase {
  type: 'product';
  consultation_id: number;
  product_id: number | null;
  product_name: string | null;
  stock_quantity: number;
}

export interface ServicePrescription extends PrescriptionBase {
  type: 'service';
  consultation_id: null;
  product_id: null;
  product_name: null;
  stock_quantity: null;
}

export type Prescription = ProductPrescription | ServicePrescription;

export interface CheckoutInput {
  customer_id?: number;
  prescription_ids?: number[];
}

export interface CheckoutResponse {
  message: string;
  products_processed?: number;
  services_processed?: number;
}

export interface UpdateStatusInput {
  prescription_id?: number;
  customer_id?: number;
  type?: 'product' | 'service';
  status: 'sold' | 'completed' | 'cancelled' | 'pending';
}

export interface UpdateStatusResponse {
  message: string;
}

export interface PendingPrescriptionsResponse {
  success: boolean;
  data: Prescription[];
  error?: string;
}

// API methods
export const checkoutApi = {
  // Get all pending prescriptions
  getPendingPrescriptions: async (): Promise<PendingPrescriptionsResponse> => {
    return apiClient.get<PendingPrescriptionsResponse>('/checkout/pending');
  },

  // Get pending prescriptions by customer ID
  getPendingPrescriptionsByCustomer: async (customerId: number): Promise<PendingPrescriptionsResponse> => {
    return apiClient.get<PendingPrescriptionsResponse>(`/checkout/pending?customer_id=${customerId}`);
  },

  // Process checkout
  processCheckout: async (data: CheckoutInput): Promise<CheckoutResponse> => {
    return apiClient.post<CheckoutResponse>('/checkout', data);
  },

  // Update prescription status
  updateStatus: async (data: UpdateStatusInput): Promise<UpdateStatusResponse> => {
    return apiClient.post<UpdateStatusResponse>('/checkout/update-status', data);
  },
};

// Query keys
export const checkoutKeys = {
  all: ['checkout'] as const,
  lists: () => [...checkoutKeys.all, 'list'] as const,
  list: (filters?: { customerId?: number }) => [...checkoutKeys.lists(), filters] as const,
  details: () => [...checkoutKeys.all, 'detail'] as const,
  detail: (id: number) => [...checkoutKeys.details(), id] as const,
  pending: () => [...checkoutKeys.all, 'pending'] as const,
  customerPending: (customerId: number) => [...checkoutKeys.pending(), customerId] as const,
};

// React Query hooks
export function usePendingPrescriptions(
  options?: Omit<UseQueryOptions<PendingPrescriptionsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PendingPrescriptionsResponse, Error>({
    queryKey: checkoutKeys.pending(),
    queryFn: () => checkoutApi.getPendingPrescriptions(),
    staleTime: 0, // Always fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function usePendingPrescriptionsByCustomer(
  customerId: number,
  options?: Omit<UseQueryOptions<PendingPrescriptionsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PendingPrescriptionsResponse, Error>({
    queryKey: checkoutKeys.customerPending(customerId),
    queryFn: () => checkoutApi.getPendingPrescriptionsByCustomer(customerId),
    enabled: !!customerId,
    staleTime: 0, // Always fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useProcessCheckout(
  options?: UseMutationOptions<CheckoutResponse, Error, CheckoutInput>
) {
  const queryClient = useQueryClient();

  return useMutation<CheckoutResponse, Error, CheckoutInput>({
    mutationFn: checkoutApi.processCheckout,
    onSuccess: (data, variables) => {
      // Invalidate pending prescriptions queries
      queryClient.invalidateQueries({ queryKey: checkoutKeys.pending() });
      
      // If we processed by customer ID, invalidate that specific query too
      if (variables.customer_id) {
        queryClient.invalidateQueries({ queryKey: checkoutKeys.customerPending(variables.customer_id) });
      }
      
      // Invalidate products if stock was updated
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      console.log('Checkout successful:', data);
    },
    onError: (error) => {
      console.error('Checkout failed:', error);
    },
    ...options,
  });
}

export function useUpdatePrescriptionStatus(
  options?: UseMutationOptions<UpdateStatusResponse, Error, UpdateStatusInput>
) {
  const queryClient = useQueryClient();

  return useMutation<UpdateStatusResponse, Error, UpdateStatusInput>({
    mutationFn: checkoutApi.updateStatus,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: checkoutKeys.pending() });
      
      if (variables.customer_id) {
        queryClient.invalidateQueries({ queryKey: checkoutKeys.customerPending(variables.customer_id) });
      }
      
      // If product prescription was updated, invalidate products query
      if (variables.type === 'product' && variables.status === 'sold') {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
      
      console.log('Status updated:', data);
    },
    onError: (error) => {
      console.error('Status update failed:', error);
    },
    ...options,
  });
}

export function useCheckoutOperations() {
  const queryClient = useQueryClient();
  
  const checkoutMutation = useProcessCheckout();
  const updateStatusMutation = useUpdatePrescriptionStatus();
  
  const refreshPendingPrescriptions = () => {
    queryClient.invalidateQueries({ queryKey: checkoutKeys.pending() });
  };
  
  const refreshCustomerPrescriptions = (customerId: number) => {
    queryClient.invalidateQueries({ queryKey: checkoutKeys.customerPending(customerId) });
  };
  
  // Helper function to calculate totals
  const calculateTotals = (prescriptions: Prescription[]) => {
    const totalAmount = prescriptions.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
    
    const productCount = prescriptions.filter(p => p.type === 'product').length;
    const serviceCount = prescriptions.filter(p => p.type === 'service').length;
    
    return {
      totalAmount,
      productCount,
      serviceCount,
      totalItems: prescriptions.length,
    };
  };
  
  return {
    // Checkout operations
    processCheckout: checkoutMutation.mutate,
    processCheckoutAsync: checkoutMutation.mutateAsync,
    
    // Status update operations
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    
    // Refresh operations
    refreshPendingPrescriptions,
    refreshCustomerPrescriptions,
    
    // Helper functions
    calculateTotals,
    
    // Status
    isLoading: checkoutMutation.isPending || updateStatusMutation.isPending,
    isSuccess: checkoutMutation.isSuccess || updateStatusMutation.isSuccess,
    errors: {
      checkout: checkoutMutation.error,
      updateStatus: updateStatusMutation.error,
    },
    
    // Data access
    getPendingData: (customerId?: number) => {
      if (customerId) {
        return queryClient.getQueryData<PendingPrescriptionsResponse>(checkoutKeys.customerPending(customerId));
      }
      return queryClient.getQueryData<PendingPrescriptionsResponse>(checkoutKeys.pending());
    },
  };
}

// Helper functions for frontend components
export const checkoutUtils = {
  // Format price
  formatPrice: (price: number): string => {
    return `ETB ${price.toLocaleString()}`;
  },
  
  // Format total price
  formatTotalPrice: (prescriptions: Prescription[]): string => {
    const total = prescriptions.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
    return `ETB ${total.toLocaleString()}`;
  },
  
  // Get status badge properties
  getStatusBadgeProps: (status: string) => {
    const statusMap: Record<string, { color: string; bgColor: string; label: string }> = {
      prescribed: { color: 'text-blue-800', bgColor: 'bg-blue-100', label: 'Prescribed' },
      pending: { color: 'text-amber-800', bgColor: 'bg-amber-100', label: 'Pending' },
      sold: { color: 'text-green-800', bgColor: 'bg-green-100', label: 'Sold' },
      completed: { color: 'text-green-800', bgColor: 'bg-green-100', label: 'Completed' },
      cancelled: { color: 'text-red-800', bgColor: 'bg-red-100', label: 'Cancelled' },
    };
    
    return statusMap[status] || { color: 'text-gray-800', bgColor: 'bg-gray-100', label: status };
  },
  
  // Check if prescription can be processed
  canProcessPrescription: (prescription: Prescription): boolean => {
    if (prescription.type === 'product') {
      return prescription.status === 'prescribed' && 
             prescription.stock_quantity >= prescription.quantity;
    }
    return prescription.status === 'pending';
  },
  
  // Check if all prescriptions can be processed
  canProcessAll: (prescriptions: Prescription[]): { canProcess: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    
    prescriptions.forEach(p => {
      if (p.type === 'product') {
        if (p.status !== 'prescribed') {
          reasons.push(`${p.name}: Not in prescribed status`);
        } else if (p.stock_quantity < p.quantity) {
          reasons.push(`${p.name}: Insufficient stock (${p.stock_quantity} available, ${p.quantity} needed)`);
        }
      } else if (p.type === 'service') {
        if (p.status !== 'pending') {
          reasons.push(`${p.name}: Not in pending status`);
        }
      }
    });
    
    return {
      canProcess: reasons.length === 0,
      reasons,
    };
  },
};