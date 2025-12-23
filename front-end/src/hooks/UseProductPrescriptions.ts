import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

export interface ProductPrescription {
  prescription_id: number;
  quantity: number;
  instructions: string | null;
  status: 'prescribed' | 'sold' | 'cancelled';
  product_id: number | null;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  product_image?: string;
}

export interface CreatePrescriptionInput {
  consultation_id: number;
  product_id?: number;
  product_name_custom?: string;
  quantity: number;
  instructions?: string;
}

export interface UpdatePrescriptionInput {
  quantity?: number;
  instructions?: string;
}

export interface PrescriptionFilters {
  customer_id?: number;
  status?: 'prescribed' | 'sold' | 'cancelled';
}

export const prescriptionKeys = {
  all: ['prescriptions'] as const,
  lists: () => [...prescriptionKeys.all, 'list'] as const,
  list: (filters?: PrescriptionFilters) => [...prescriptionKeys.lists(), filters || {}] as const,
  details: () => [...prescriptionKeys.all, 'detail'] as const,
  detail: (id: number) => [...prescriptionKeys.details(), id] as const,
  consultation: (consultationId: number) => [...prescriptionKeys.all, 'consultation', consultationId] as const,
};

export const prescriptionApi = {
  getPrescriptions: async (filters?: PrescriptionFilters): Promise<ProductPrescription[]> => {
    const params = new URLSearchParams();
    
    if (filters?.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const url = `/prescriptions${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<ProductPrescription[]>(url);
  },

  getConsultationPrescriptions: async (consultationId: number): Promise<ProductPrescription[]> => {
    return apiClient.get<ProductPrescription[]>(`/consultations/${consultationId}/prescriptions`);
  },

  createPrescription: async (consultationId: number, data: Omit<CreatePrescriptionInput, 'consultation_id'>): Promise<{ message: string; prescriptionId: number }> => {
    return apiClient.post<{ message: string; prescriptionId: number }>(
      `/consultations/${consultationId}/prescriptions`,
      data
    );
  },

  updatePrescription: async (id: number, data: UpdatePrescriptionInput): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(`/prescriptions/${id}`, data);
  },

  deletePrescription: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/prescriptions/${id}`);
  },
};

export function usePrescriptions(
  filters?: PrescriptionFilters,
  options?: Omit<UseQueryOptions<ProductPrescription[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProductPrescription[], Error>({
    queryKey: prescriptionKeys.list(filters),
    queryFn: () => prescriptionApi.getPrescriptions(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useConsultationPrescriptions(
  consultationId: number | undefined,
  options?: Omit<UseQueryOptions<ProductPrescription[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProductPrescription[], Error>({
    queryKey: prescriptionKeys.consultation(consultationId!),
    queryFn: () => prescriptionApi.getConsultationPrescriptions(consultationId!),
    enabled: !!consultationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useCreatePrescription(
  options?: UseMutationOptions<{ message: string; prescriptionId: number }, Error, CreatePrescriptionInput>
) {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: string; prescriptionId: number }, Error, CreatePrescriptionInput>({
    mutationFn: (data) => prescriptionApi.createPrescription(data.consultation_id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.consultation(variables.consultation_id) });
      console.log(data);
    },
    ...options,
  });
}

export function useUpdatePrescription(
  options?: UseMutationOptions<{ message: string }, Error, { id: number; data: UpdatePrescriptionInput }>
) {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: string }, Error, { id: number; data: UpdatePrescriptionInput }>({
    mutationFn: ({ id, data }) => prescriptionApi.updatePrescription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      console.log(variables);
    },
    ...options,
  });
}

export function useDeletePrescription(
  options?: UseMutationOptions<{ message: string }, Error, number>
) {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: string }, Error, number>({
    mutationFn: prescriptionApi.deletePrescription,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      queryClient.removeQueries({ queryKey: prescriptionKeys.detail(id) });
    },
    ...options,
  });
}

export function usePrescriptionOperations() {
  const queryClient = useQueryClient();
  
  const createMutation = useCreatePrescription();
  const updateMutation = useUpdatePrescription();
  const deleteMutation = useDeletePrescription();
  
  const refreshPrescriptions = (filters?: PrescriptionFilters) => {
    queryClient.invalidateQueries({ queryKey: prescriptionKeys.list(filters) });
  };
  
  const refreshConsultationPrescriptions = (consultationId: number) => {
    queryClient.invalidateQueries({ queryKey: prescriptionKeys.consultation(consultationId) });
  };
  
  return {
    createPrescription: createMutation.mutate,
    createPrescriptionAsync: createMutation.mutateAsync,
    updatePrescription: updateMutation.mutate,
    updatePrescriptionAsync: updateMutation.mutateAsync,
    deletePrescription: deleteMutation.mutate,
    deletePrescriptionAsync: deleteMutation.mutateAsync,
    refreshPrescriptions,
    refreshConsultationPrescriptions,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess || deleteMutation.isSuccess,
    errors: {
      create: createMutation.error,
      update: updateMutation.error,
      delete: deleteMutation.error,
    },
  };
}