import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';
import type { PatientData, LookupsData, ProfessionalData } from '../lib/types/patientRegistrationTypes';

export interface DoctorPatientData extends PatientData {
  id: number | string;
  created_at: string;
  updated_at: string;
  profile_picture?: string | null;
  age?: number;
}

export const usePatientData = (patientId?: number | string) => {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => fetchPatientData(patientId!),
    enabled: !!patientId,
  });
};

export const useUpdatePatient = (patientId: number | string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<PatientData>) => updatePatientData(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const usePatientLookups = () => {
  return useQuery({
    queryKey: ['patientLookups'],
    queryFn: fetchPatientLookups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePatientProfessionals = () => {
  return useQuery({
    queryKey: ['patientProfessionals'],
    queryFn: fetchPatientProfessionals,
  });
};

// API Functions
const fetchPatientData = async (patientId: number | string): Promise<DoctorPatientData> => {
  const response = await apiClient.get<DoctorPatientData>(`/customers/${patientId}`);
  return response;
};

const updatePatientData = async (patientId: number | string, data: Partial<PatientData>) => {
  return await apiClient.put(`/customers/${patientId}`, {
    ...data,
    profile: data, // Adapt to your backend structure if needed
  });
};

const fetchPatientLookups = async (): Promise<LookupsData> => {
  const [concernsRes, conditionsRes, skinCareHistoryRes] = await Promise.all([
    apiClient.get('/lookups/skin-concerns'),
    apiClient.get('/lookups/health-conditions'),
    apiClient.get('/lookups/skin-care-history'),
  ]);

  return {
    concerns: concernsRes || [],
    conditions: conditionsRes || [],
    skinCareHistory: skinCareHistoryRes || [],
  };
};

const fetchPatientProfessionals = async (): Promise<ProfessionalData[]> => {
  const response = await apiClient.get<{ users: ProfessionalData[] }>('/users/role/doctor');
  return response.users || [];
};