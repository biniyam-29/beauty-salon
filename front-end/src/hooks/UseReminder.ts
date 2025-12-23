import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

export interface ReminderCustomer {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  last_visit: string;
}

export interface LogReminderInput {
  customer_id: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface LogReminderResponse {
  message: string;
}

export const reminderKeys = {
  all: ['reminders'] as const,
  customers: () => [...reminderKeys.all, 'customers'] as const,
};

export const reminderApi = {
  getCustomersToRemind: async (): Promise<ReminderCustomer[]> => {
    return apiClient.get<ReminderCustomer[]>('/reminders');
  },

  logReminder: async (data: LogReminderInput): Promise<LogReminderResponse> => {
    return apiClient.post<LogReminderResponse>('/reminders', data);
  },
};

export function useCustomersToRemind(
  options?: Omit<UseQueryOptions<ReminderCustomer[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ReminderCustomer[], Error>({
    queryKey: reminderKeys.customers(),
    queryFn: reminderApi.getCustomersToRemind,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useLogReminder(
  options?: UseMutationOptions<LogReminderResponse, Error, LogReminderInput>
) {
  const queryClient = useQueryClient();
  
  return useMutation<LogReminderResponse, Error, LogReminderInput>({
    mutationFn: reminderApi.logReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.customers() });
    },
    ...options,
  });
}

export function useReminderOperations() {
  const queryClient = useQueryClient();
  
  const logReminderMutation = useLogReminder();
  
  const refreshCustomers = () => {
    queryClient.invalidateQueries({ queryKey: reminderKeys.customers() });
  };
  
  return {
    logReminder: logReminderMutation.mutate,
    logReminderAsync: logReminderMutation.mutateAsync,
    refreshCustomers,
    isLoading: logReminderMutation.isPending,
    isSuccess: logReminderMutation.isSuccess,
    error: logReminderMutation.error,
  };
}