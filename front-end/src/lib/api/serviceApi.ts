import { apiClient } from './Api';
import type { Service, CreateServiceDto, UpdateServiceDto } from '../../hooks/UseService';

const API_ENDPOINT = '/services';

// Fetch all services (alternative to hook for direct API calls)
export const fetchServices = async (page: number = 1, pageSize: number = 10): Promise<{
  services: Service[];
  totalPages: number;
  currentPage: number;
  totalServices: number;
}> => {
  return await apiClient.get(`${API_ENDPOINT}?page=${page}&pageSize=${pageSize}`);
};

// Fetch a single service by ID
export const fetchServiceById = async (id: number): Promise<Service> => {
  return await apiClient.get(`${API_ENDPOINT}/${id}`);
};

// Create a new service
export const createService = async (serviceData: CreateServiceDto): Promise<{ service: Service }> => {
  return await apiClient.post(API_ENDPOINT, serviceData);
};

// Update a service
export const updateService = async (serviceData: UpdateServiceDto): Promise<{ service: Service }> => {
  const { id, ...data } = serviceData;
  return await apiClient.put(`${API_ENDPOINT}/${id}`, data);
};

// Delete a service
export const deleteService = async (id: number): Promise<void> => {
  return await apiClient.delete(`${API_ENDPOINT}/${id}`);
};