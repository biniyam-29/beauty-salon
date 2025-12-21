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
      // Ensure price is integer
      const dataToSend = {
        ...serviceData,
        price: Math.round(Number(serviceData.price)) || 0
      };
      
      console.log('Creating service with data:', dataToSend);
      
      const response = await apiClient.post<{ 
        message: string; 
        service: Service 
      }>('/service', dataToSend);
      
      return response.service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      console.error('Create service error:', error);
    }
  });
};

// Update an existing service
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: UpdateServiceDto) => {
      const { id, ...data } = serviceData;
      
      // Ensure price is integer if provided
      const dataToSend = { ...data };
      if (dataToSend.price !== undefined) {
        dataToSend.price = Math.round(Number(dataToSend.price)) || 0;
      }
      
      console.log('Updating service with data:', { id, data: dataToSend });
      
      const response = await apiClient.put<{ 
        message: string; 
        service: Service 
      }>(`/service/${id}`, dataToSend);
      
      return response.service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      console.error('Update service error:', error);
    }
  });
};

// Delete a service
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete<{ message: string }>(`/service/${id}`);
      return id;
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