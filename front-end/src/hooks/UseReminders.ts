import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

export interface ReminderCustomer {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  last_visit: string;
}

export const reminderKeys = {
  all: ['reminders'] as const,
  customersToRemind: () => [...reminderKeys.all, 'customers-to-remind'] as const,
};

export const reminderApi = {
  getCustomersToRemind: async (): Promise<ReminderCustomer[]> => {
    const response = await apiClient.get<{ customers: ReminderCustomer[] }>('/reminders');
    return response.customers ?? [];
  },

  logReminder: async (data: { customer_id: number; status: 'completed' | 'cancelled' }): Promise<{ message: string }> => {
    return apiClient.post('/reminders', data);
  },
};

export function useCustomersToRemind(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reminderKeys.customersToRemind(),
    queryFn: reminderApi.getCustomersToRemind,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useLogReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reminderApi.logReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.customersToRemind() });
    },
  });
}