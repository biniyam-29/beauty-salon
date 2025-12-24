import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

export interface TreatmentFeedback {
  strengths?: string[];
  weaknesses?: string[];
  next_steps?: string[];
}

export interface TreatmentGoals {
  primary?: string;
  secondary?: string[];
  expectations?: string;
}

export interface ConsultationImage {
  id: number;
  image_url: string;
  description: string | null;
  created_at: string;
}

export interface Consultation {
  id: number;
  customer_id: number;
  doctor_id: number;
  consultation_date: string;
  treatment_goals_today: TreatmentGoals | null;
  previous_treatment_feedback: TreatmentFeedback | null;
  doctor_notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  images?: ConsultationImage[];
  professional_name?: string;
  status: string;
  professional_id?: number;
}

export interface FollowUpCustomer {
  consultation_id: number;
  follow_up_date: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  doctor_name: string;
  skin_concerns: string;
  health_conditions: string;
}

export interface PendingProfessionalCustomer {
  customer_id: number;
  full_name: string;
  phone: string;
  email: string | null;
  consultation_count: number;
  first_consultation: string;
  last_consultation: string;
}

export interface pendingProfessionalResponse{
  sucess: boolean;
  data: PendingProfessionalCustomer[]
}

export interface CreateConsultationInput {
  customer_id: number;
  doctor_id: number;
  previous_treatment_feedback?: TreatmentFeedback;
  treatment_goals_today?: TreatmentGoals;
  doctor_notes?: string;
  follow_up_date?: string;
}

export interface UpdateConsultationInput {
  previous_treatment_feedback?: TreatmentFeedback;
  treatment_goals_today?: TreatmentGoals;
  doctor_notes?: string;
  follow_up_date?: string;
  doctor_id?: number;
}

export interface AssignProfessionalInput {
  doctor_id: number;
}

export interface ProfessionalSignatureInput {
  professional_id: number;
  professional_name?: string;
}

export interface UploadImageResponse {
  message: string;
  image_url: string;
}

export interface BatchUploadImageResponse {
  message: string;
  results: Array<{
    fileName: string;
    success: boolean;
    error?: string;
  }>;
}

export interface ProfessionalSignatureResponse {
  message: string;
  consultation_id: number;
  professional_id: number;
  professional_name: string;
  data?: PendingProfessionalCustomer[];
}

export const consultationKeys = {
  all: ['consultations'] as const,
  lists: () => [...consultationKeys.all, 'list'] as const,
  list: (customerId?: number) => [...consultationKeys.lists(), customerId] as const,
  details: () => [...consultationKeys.all, 'detail'] as const,
  detail: (id: number) => [...consultationKeys.details(), id] as const,
  followUps: () => [...consultationKeys.all, 'follow-ups'] as const,
  todaysFollowUps: () => [...consultationKeys.followUps(), 'today'] as const,
  pendingProfessional: () => [...consultationKeys.all, 'pending-professional'] as const,
  prescriptions: (consultationId: number) => [...consultationKeys.detail(consultationId), 'prescriptions'] as const,
  images: (consultationId: number) => [...consultationKeys.detail(consultationId), 'images'] as const,
};

export const consultationApi = {
  create: async (data: CreateConsultationInput): Promise<{ message: string; consultationId: number }> => {
    return apiClient.post<{ message: string; consultationId: number }>('/consultations', data);
  },

  getById: async (id: number): Promise<Consultation> => {
    return apiClient.get<Consultation>(`/consultations/${id}`);
  },

  update: async (id: number, data: UpdateConsultationInput): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(`/consultations/${id}`, data);
  },

  assignProfessional: async (
    consultationId: number,
    data: AssignProfessionalInput,
  ): Promise<{ message: string; consultation_id: number; doctor_id: number }> => {
    return apiClient.put(`/consultations/${consultationId}/assign-professional`, data);
  },

  professionalSignature: async (
    consultationId: number,
    data: ProfessionalSignatureInput,
  ): Promise<ProfessionalSignatureResponse> => {
    return apiClient.put(`/consultations/${consultationId}/professional-sign`, data);
  },

  getTodaysFollowUps: async (): Promise<FollowUpCustomer[]> => {
    return apiClient.get<FollowUpCustomer[]>('/consultations/follow-ups/today');
  },

  getCustomersWithPendingProfessional: async (): Promise<ProfessionalSignatureResponse> => {
    return apiClient.get<ProfessionalSignatureResponse>('/consultations/pending-professional');
  },

  uploadImage: async (
    consultationId: number,
    file: File,
    description?: string,
  ): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    return apiClient.post<UploadImageResponse>(`/consultations/${consultationId}/images`, formData, {
      headers: {},
    });
  },

  uploadImagesBatch: async (
    consultationId: number,
    files: File[],
    description?: string,
  ): Promise<BatchUploadImageResponse> => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('file[]', file);
    });

    if (description) {
      formData.append('description', description);
    }

    return apiClient.post<BatchUploadImageResponse>(`/consultations/${consultationId}/images`, formData);
  },

  getImages: async (consultationId: number): Promise<ConsultationImage[]> => {
    return apiClient.get<ConsultationImage[]>(`/consultations/${consultationId}/images`);
  },
};

// hooks
export function useConsultation(
  id: number | undefined,
  options?: Omit<UseQueryOptions<Consultation, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: consultationKeys.detail(id!),
    queryFn: () => consultationApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useTodaysFollowUps(
  options?: Omit<UseQueryOptions<FollowUpCustomer[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: consultationKeys.todaysFollowUps(),
    queryFn: consultationApi.getTodaysFollowUps,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useCustomersWithPendingProfessional(
  options?: Omit<UseQueryOptions<ProfessionalSignatureResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: consultationKeys.pendingProfessional(),
    queryFn: () => consultationApi.getCustomersWithPendingProfessional(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useCreateConsultation(
  options?: UseMutationOptions<{ message: string; consultationId: number }, Error, CreateConsultationInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: consultationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
    },
    ...options,
  });
}

export function useUpdateConsultation(
  options?: UseMutationOptions<
    { message: string },
    Error,
    { id: number; data: UpdateConsultationInput }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => consultationApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() });
    },
    ...options,
  });
}

export function useAssignProfessional(
  options?: UseMutationOptions<
    { message: string; consultation_id: number; doctor_id: number },
    Error,
    { consultationId: number; data: AssignProfessionalInput }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ consultationId, data }) => consultationApi.assignProfessional(consultationId, data),
    onSuccess: (_, { consultationId }) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(consultationId) });
    },
    ...options,
  });
}

export function useProfessionalSignature(
  options?: UseMutationOptions<
    ProfessionalSignatureResponse,
    Error,
    { consultationId: number; data: ProfessionalSignatureInput }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ consultationId, data }) => consultationApi.professionalSignature(consultationId, data),
    onSuccess: (_, { consultationId }) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(consultationId) });
    },
    ...options,
  });
}

export function useUploadImage(
  options?: UseMutationOptions<
    UploadImageResponse,
    Error,
    { consultationId: number; file: File; description?: string }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ consultationId, file, description }) =>
      consultationApi.uploadImage(consultationId, file, description),
    onSuccess: (_, { consultationId }) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.images(consultationId) });
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(consultationId) });
    },
    ...options,
  });
}

export function useUploadImagesBatch(
  options?: UseMutationOptions<
    BatchUploadImageResponse,
    Error,
    { consultationId: number; files: File[]; description?: string }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ consultationId, files, description }) =>
      consultationApi.uploadImagesBatch(consultationId, files, description),
    onSuccess: (_, { consultationId }) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.images(consultationId) });
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(consultationId) });
    },
    ...options,
  });
}

export function useConsultationImages(
  consultationId: number | undefined,
  options?: Omit<UseQueryOptions<ConsultationImage[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: consultationKeys.images(consultationId!),
    queryFn: () => consultationApi.getImages(consultationId!),
    enabled: !!consultationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useConsultationOperations() {
  const queryClient = useQueryClient();

  const createMutation = useCreateConsultation();
  const updateMutation = useUpdateConsultation();
  const assignProfessionalMutation = useAssignProfessional();
  const professionalSignatureMutation = useProfessionalSignature();
  const uploadImageMutation = useUploadImage();
  const uploadImagesBatchMutation = useUploadImagesBatch();

  const refreshConsultation = (id: number) => {
    queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
  };

  const refreshImages = (consultationId: number) => {
    queryClient.invalidateQueries({ queryKey: consultationKeys.images(consultationId) });
  };

  const refreshFollowUps = () => {
    queryClient.invalidateQueries({ queryKey: consultationKeys.todaysFollowUps() });
  };

  const refreshPendingProfessional = () => {
    queryClient.invalidateQueries({ queryKey: consultationKeys.pendingProfessional() });
  };

  return {
    createConsultation: createMutation.mutate,
    createConsultationAsync: createMutation.mutateAsync,
    updateConsultation: updateMutation.mutate,
    updateConsultationAsync: updateMutation.mutateAsync,
    assignProfessional: assignProfessionalMutation.mutate,
    assignProfessionalAsync: assignProfessionalMutation.mutateAsync,
    professionalSignature: professionalSignatureMutation.mutate,
    professionalSignatureAsync: professionalSignatureMutation.mutateAsync,
    uploadImage: uploadImageMutation.mutate,
    uploadImageAsync: uploadImageMutation.mutateAsync,
    uploadImagesBatch: uploadImagesBatchMutation.mutate,
    uploadImagesBatchAsync: uploadImagesBatchMutation.mutateAsync,
    refreshConsultation,
    refreshImages,
    refreshFollowUps,
    refreshPendingProfessional,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      assignProfessionalMutation.isPending ||
      professionalSignatureMutation.isPending ||
      uploadImageMutation.isPending ||
      uploadImagesBatchMutation.isPending,
    isSuccess:
      createMutation.isSuccess ||
      updateMutation.isSuccess ||
      assignProfessionalMutation.isSuccess ||
      professionalSignatureMutation.isSuccess ||
      uploadImageMutation.isSuccess ||
      uploadImagesBatchMutation.isSuccess,
    errors: {
      create: createMutation.error,
      update: updateMutation.error,
      assignProfessional: assignProfessionalMutation.error,
      professionalSignature: professionalSignatureMutation.error,
      uploadImage: uploadImageMutation.error,
      uploadImagesBatch: uploadImagesBatchMutation.error,
    },
  };
}