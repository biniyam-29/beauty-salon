import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceDto {
  name: string;
  description: string;
  price: number;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  id: number;
}

export interface ServiceResponse {
  services: Service[];
  totalPages: number;
  currentPage: number;
  totalServices: number;
}

// Fetch all services with pagination
export const useServices = (page: number = 1, pageSize: number = 10) => {
  return useQuery<ServiceResponse>({
    queryKey: ['services', page],
    queryFn: async () => {
      return await apiClient.get<ServiceResponse>(`/service?page=${page}&pageSize=${pageSize}`);
    },
  });
};

// Create a new service
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: CreateServiceDto) => {
      return await apiClient.post<{ service: Service }>('/service', serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

// Update an existing service
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: UpdateServiceDto) => {
      const { id, ...data } = serviceData;
      return await apiClient.put<{ service: Service }>(`/service/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

// Delete a service
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await apiClient.delete(`/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

// Fetch a single service by ID
export const useService = (id: number | undefined) => {
  return useQuery<Service>({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) throw new Error('Service ID is required');
      return await apiClient.get<Service>(`/service/${id}`);
    },
    enabled: !!id,
  });
};