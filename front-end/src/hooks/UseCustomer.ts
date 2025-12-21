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

// --- API Functions ---
const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get<{ customers: Customer[] }>('/customers');
  return response.customers || [];
};

const fetchCustomerDetails = async (customerId: number | string): Promise<Customer> => {
  return await apiClient.get<Customer>(`/customers/${customerId}`);
};

const fetchCustomerConsultations = async (customerId: number | string): Promise<Consultation[]> => {
  const response = await apiClient.get<Consultation[]>(`/customers/${customerId}/consultations`);
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

const assignProfessionalToConsultation = async (
  consultationId: number,
  doctorId: number
): Promise<void> => {
  await apiClient.put(`/consultations/${consultationId}/assign-professional`, {
    doctor_id: doctorId,
  });
};

// --- Query Hooks ---
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
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

export const useAssignProfessional = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ consultationId, doctorId }: { consultationId: number; doctorId: number }) =>
      assignProfessionalToConsultation(consultationId, doctorId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultationDetail'] });
    },
  });
};