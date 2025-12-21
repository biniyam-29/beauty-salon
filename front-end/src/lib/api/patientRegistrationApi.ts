import { apiClient } from '../../lib/api/Api';
import type { LookupsData, ProfessionalData, LookupItem } from '../types/patientRegistrationTypes';

export const fetchLookups = async (): Promise<LookupsData> => {
  const [concernsRes, conditionsRes, skinCareHistoryRes] = await Promise.all([
    apiClient.get<LookupItem[]>('/lookups/skin-concerns'),
    apiClient.get<LookupItem[]>('/lookups/health-conditions'),
    apiClient.get<LookupItem[]>('/lookups/skin-care-history'),
  ]);

  return {
    concerns: concernsRes || [],
    conditions: conditionsRes || [],
    skinCareHistory: skinCareHistoryRes || [],
  };
};

export const fetchProfessionals = async (): Promise<ProfessionalData[]> => {
  const response = await apiClient.get<{ users: ProfessionalData[] }>('/users/role/doctor');
  return response.users || [];
};

export const registerPatient = async (payload: any): Promise<any> => {
  return await apiClient.post('/customers', payload);
};