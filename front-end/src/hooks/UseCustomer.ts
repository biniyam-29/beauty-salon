import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

export interface CustomerProfile {
  customer_id: number;
  skin_type: string;
  skin_feel: string;
  sun_exposure: string;
  foundation_type?: string | null;
  healing_profile?: string | null;
  bruises_easily?: number;
  used_products: string;
  uses_retinoids_acids?: number;
  recent_dermal_fillers?: number;
  previous_acne_medication?: string;
  known_allergies_details?: string | null;
  dietary_supplements?: string | null;
  current_prescription?: string | null;
  other_conditions?: string | null;
  other_medication?: string | null;
  smokes?: number;
  drinks?: number;
  updated_at: string;
  first_facial_experience?: number;
  previous_treatment_likes?: string;
  treatment_goals?: string;
  vitamin_a_derivatives?: string;
  recent_botox_fillers?: number;
  taken_acne_medication?: number;
  has_allergies?: number;
  allergies_details?: string;
  takes_supplements?: number;
  supplements_details?: string;
  prescription_meds?: string;
  drinks_or_smokes?: number;
}

export interface Note {
  id: number;
  note_text: string;
  author_name: string;
  created_at: string;
  status: string;
}

export interface SkinConcern {
  id: number;
  name: string;
}

export interface HealthCondition {
  id: number;
  name: string;
}

export interface CustomerConsent {
  id: number;
  signature_data: string;
  consent_date: string;
  created_at: string;
}

export interface Customer {
  id: number | string;
  full_name: string;
  phone: string;
  email: string | null;
  profile_picture?: string | null;
  address?: string | null;
  city?: string | null;
  birth_date?: string | null;
  assigned_doctor_id?: number | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  how_heard?: string | null;
  created_at: string;
  updated_at: string;
  age?: number;
  profile?: CustomerProfile;
  skin_concerns?: SkinConcern[];
  health_conditions?: HealthCondition[];
  notes?: Note[];
  consents?: CustomerConsent[];
}

export interface ConsultationImage {
  id: number;
  image_url: string;
  consultation_id: number;
  created_at: string;
}

export interface Consultation {
  id: number;
  consultation_date: string;
  notes: string;
  doctor_name: string;
  follow_up_date?: string | null;
  doctor_notes?: string;
  treatment_goals_today?: string[];
  previous_treatment_feedback?: string[];
  images?: ConsultationImage[];
  created_at: string;
}

export interface Prescription {
  prescription_id: number;
  quantity: number;
  instructions: string;
  product_id: number;
  product_name: string;
  product_image: string;
  customer_name: string;
  customer_phone: string;
}

export interface Professional {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  assigned_patients_count: number;
  untreated_assigned_patients_count: number;
  todays_followups_count: number;
}

export interface CustomerResponse {
  customers: Customer[];
  totalPages: number;
  currentPage: number;
  totalCustomers?: number;
}

export interface SearchCustomerParams {
  searchTerm: string;
  page?: number;
}

export interface CreateCustomerData {
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  birth_date?: string;
  assigned_doctor_id?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  how_heard?: string;
  profile?: Partial<CustomerProfile>;
  skin_concerns?: number[];
  health_conditions?: number[];
  initial_note?: string;
}

export interface UpdateCustomerData {
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  birth_date?: string;
  assigned_doctor_id?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  how_heard?: string;
  profile?: Partial<CustomerProfile>;
}

export interface AddConsentData {
  signature_data: string;
  consent_date: string;
}

export interface AddSkinConcernData {
  concern_id: number;
}

export interface AddHealthConditionData {
  condition_id: number;
}

// --- API Functions ---
const fetchCustomers = async (page: number = 1): Promise<CustomerResponse> => {
  const response = await apiClient.get<CustomerResponse>(`/customers?page=${page}`);
  return response;
};

const fetchAssignedCustomers = async (page: number = 1): Promise<CustomerResponse> => {
  const response = await apiClient.get<CustomerResponse>(`/customers/assigned?page=${page}`);
  return response;
};

const searchCustomers = async (params: SearchCustomerParams): Promise<CustomerResponse> => {
  const { searchTerm, page = 1 } = params;
  const response = await apiClient.get<CustomerResponse>(`/customers/search/${searchTerm}?page=${page}`);
  return response;
};

const fetchCustomerDetails = async (customerId: number | string): Promise<Customer> => {
  return await apiClient.get<Customer>(`/customers/${customerId}`);
};

const fetchCustomerConsultations = async (customerId: number | string): Promise<Consultation[]> => {
  const response = await apiClient.get<Consultation[]>(`/customers/${customerId}/consultations`);
  return response || [];
};

const fetchCustomerImages = async (customerId: number | string): Promise<ConsultationImage[]> => {
  const response = await apiClient.get<ConsultationImage[]>(`/customers/${customerId}/images`);
  return response || [];
};

const fetchConsultationDetail = async (id: number): Promise<Consultation> => {
  return await apiClient.get<Consultation>(`/consultations/${id}`);
};

const fetchConsultationImages = async (consultationId: number): Promise<ConsultationImage[]> => {
  return await apiClient.get<ConsultationImage[]>(`/consultations/${consultationId}/images`);
};

const fetchPrescriptions = async (): Promise<Prescription[]> => {
  return await apiClient.get<Prescription[]>('/prescriptions?status=sold');
};

const fetchProfessionals = async (): Promise<Professional[]> => {
  const response = await apiClient.get<{ users: Professional[] }>('/users/role/doctor');
  return response.users || [];
};

const createCustomer = async (data: CreateCustomerData): Promise<{ message: string; customerId: number }> => {
  return await apiClient.post<{ message: string; customerId: number }>('/customers', data);
};

const updateCustomer = async (customerId: number | string, data: UpdateCustomerData): Promise<{ message: string }> => {
  return await apiClient.put<{ message: string }>(`/customers/${customerId}`, data);
};

const deleteCustomer = async (customerId: number | string): Promise<{ message: string }> => {
  return await apiClient.delete<{ message: string }>(`/customers/${customerId}`);
};

const updateCustomerProfilePicture = async (customerId: number | string, file: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('profile_picture', file);
  
  return await apiClient.post<{ message: string }>(`/customers/${customerId}/picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const addCustomerConsent = async (customerId: number | string, data: AddConsentData): Promise<{ message: string }> => {
  return await apiClient.post<{ message: string }>(`/customers/${customerId}/consent`, data);
};

const deleteCustomerConsent = async (customerId: number | string, consentId: number): Promise<{ message: string }> => {
  return await apiClient.delete<{ message: string }>(`/customers/${customerId}/consent/${consentId}`);
};

const addSkinConcern = async (customerId: number | string, data: AddSkinConcernData): Promise<{ message: string }> => {
  return await apiClient.post<{ message: string }>(`/customers/${customerId}/skin-concerns`, data);
};

const endSkinConcern = async (customerId: number | string, concernId: number): Promise<{ message: string }> => {
  return await apiClient.put<{ message: string }>(`/customers/${customerId}/skin-concerns/${concernId}`);
};

const deleteSkinConcern = async (customerId: number | string, concernId: number): Promise<{ message: string }> => {
  return await apiClient.delete<{ message: string }>(`/customers/${customerId}/skin-concerns/${concernId}`);
};

const addHealthCondition = async (customerId: number | string, data: AddHealthConditionData): Promise<{ message: string }> => {
  return await apiClient.post<{ message: string }>(`/customers/${customerId}/health-conditions`, data);
};

const endHealthCondition = async (customerId: number | string, conditionId: number): Promise<{ message: string }> => {
  return await apiClient.put<{ message: string }>(`/customers/${customerId}/health-conditions/${conditionId}`);
};

const deleteHealthCondition = async (customerId: number | string, conditionId: number): Promise<{ message: string }> => {
  return await apiClient.delete<{ message: string }>(`/customers/${customerId}/health-conditions/${conditionId}`);
};

const assignProfessionalToConsultation = async (
  consultationId: number,
  doctorId: number
): Promise<void> => {
  await apiClient.put(`/consultations/${consultationId}/assign-professional`, {
    doctor_id: doctorId,
  });
};

// --- Query Hooks ---
export const useCustomers = (page: number = 1) => {
  return useQuery({
    queryKey: ['customers', page],
    queryFn: () => fetchCustomers(page),
  });
};

export const useAssignedCustomers = (page: number = 1) => {
  return useQuery({
    queryKey: ['assigned-customers', page],
    queryFn: () => fetchAssignedCustomers(page),
  });
};

export const useSearchCustomers = (params: SearchCustomerParams) => {
  return useQuery({
    queryKey: ['search-customers', params.searchTerm, params.page],
    queryFn: () => searchCustomers(params),
    enabled: !!params.searchTerm,
  });
};

export const useCustomerDetails = (customerId: number | string) => {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => fetchCustomerDetails(customerId),
    enabled: !!customerId,
  });
};

export const useCustomerConsultations = (customerId: number | string) => {
  return useQuery({
    queryKey: ['consultations', customerId],
    queryFn: () => fetchCustomerConsultations(customerId),
    enabled: !!customerId,
  });
};

export const useCustomerImages = (customerId: number | string) => {
  return useQuery({
    queryKey: ['customer-images', customerId],
    queryFn: () => fetchCustomerImages(customerId),
    enabled: !!customerId,
  });
};

export const useConsultationDetail = (consultationId: number) => {
  return useQuery({
    queryKey: ['consultationDetail', consultationId],
    queryFn: () => fetchConsultationDetail(consultationId),
    enabled: !!consultationId,
  });
};

export const useConsultationImages = (consultationId: number) => {
  return useQuery({
    queryKey: ['consultationImages', consultationId],
    queryFn: () => fetchConsultationImages(consultationId),
    enabled: !!consultationId,
  });
};

export const usePrescriptions = () => {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: fetchPrescriptions,
  });
};

export const useProfessionals = () => {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals,
  });
};

// --- Mutation Hooks ---
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: number | string; data: UpdateCustomerData }) =>
      updateCustomer(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customerId: number | string) => deleteCustomer(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomerProfilePicture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, file }: { customerId: number | string; file: File }) =>
      updateCustomerProfilePicture(customerId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useAddCustomerConsent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: number | string; data: AddConsentData }) =>
      addCustomerConsent(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useDeleteCustomerConsent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, consentId }: { customerId: number | string; consentId: number }) =>
      deleteCustomerConsent(customerId, consentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useAddSkinConcern = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: number | string; data: AddSkinConcernData }) =>
      addSkinConcern(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useEndSkinConcern = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, concernId }: { customerId: number | string; concernId: number }) =>
      endSkinConcern(customerId, concernId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useDeleteSkinConcern = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, concernId }: { customerId: number | string; concernId: number }) =>
      deleteSkinConcern(customerId, concernId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useAddHealthCondition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: number | string; data: AddHealthConditionData }) =>
      addHealthCondition(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useEndHealthCondition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, conditionId }: { customerId: number | string; conditionId: number }) =>
      endHealthCondition(customerId, conditionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useDeleteHealthCondition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, conditionId }: { customerId: number | string; conditionId: number }) =>
      deleteHealthCondition(customerId, conditionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useAssignProfessional = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ consultationId, doctorId }: { consultationId: number; doctorId: number }) =>
      assignProfessionalToConsultation(consultationId, doctorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultationDetail'] });
    },
  });
};