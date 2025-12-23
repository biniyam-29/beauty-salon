import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

export interface CheckoutInput {
  prescription_ids: number[];
}

export interface CheckoutResponse {
  message: string;
}

export interface CheckoutError {
  error: string;
}

export const checkoutKeys = {
  all: ['checkout'] as const,
};

export const checkoutApi = {
  processCheckout: async (data: CheckoutInput): Promise<CheckoutResponse> => {
    return apiClient.post<CheckoutResponse>('/checkout', data);
  },
};

export function useProcessCheckout(
  options?: UseMutationOptions<CheckoutResponse, CheckoutError, CheckoutInput>
) {
  return useMutation<CheckoutResponse, CheckoutError, CheckoutInput>({
    mutationFn: checkoutApi.processCheckout,
    ...options,
  });
}