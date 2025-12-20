import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

// --- Type Definitions ---
export interface LookupItem {
  id: number;
  name: string;
}

export type LookupType = 'skin-concerns' | 'health-conditions' | 'skin-care-history';

// --- API Functions ---
export class LookupsService {
  async fetchLookups(type: LookupType): Promise<LookupItem[]> {
    const response = await apiClient.get<LookupItem[]>(`/lookups/${type}`);
    return Array.isArray(response) ? response : [];
  }

  async addLookupItem(type: LookupType, name: string): Promise<LookupItem> {
    return apiClient.post<LookupItem>(`/lookups/${type}`, { name });
  }

  async updateLookupItem(type: LookupType, id: number, name: string): Promise<LookupItem> {
    return apiClient.put<LookupItem>(`/lookups/${type}/${id}`, { name });
  }

  async deleteLookupItem(type: LookupType, id: number): Promise<void> {
    return apiClient.delete(`/lookups/${type}/${id}`);
  }

  getItemTypeName(type: LookupType): string {
    switch (type) {
      case 'skin-concerns':
        return 'Skin Concern';
      case 'health-conditions':
        return 'Health Condition';
      case 'skin-care-history':
        return 'Skin Care History';
      default:
        return 'Item';
    }
  }
}

export const lookupsService = new LookupsService();

// --- React Query Hooks ---
export const useLookups = (type: LookupType) => {
  return useQuery({
    queryKey: ['lookups', type],
    queryFn: () => lookupsService.fetchLookups(type),
  });
};

export const useAddLookup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ type, name }: { type: LookupType; name: string }) =>
      lookupsService.addLookupItem(type, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lookups', variables.type] });
    },
    onError: (error: Error) => {
      console.error('Error adding lookup item:', error);
      throw error;
    },
  });
};

export const useUpdateLookup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ type, id, name }: { type: LookupType; id: number; name: string }) =>
      lookupsService.updateLookupItem(type, id, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lookups', variables.type] });
    },
    onError: (error: Error) => {
      console.error('Error updating lookup item:', error);
      throw error;
    },
  });
};

export const useDeleteLookup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ type, id }: { type: LookupType; id: number }) =>
      lookupsService.deleteLookupItem(type, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lookups', variables.type] });
    },
    onError: (error: Error) => {
      console.error('Error deleting lookup item:', error);
      throw error;
    },
  });
};