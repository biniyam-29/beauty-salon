import { apiClient } from '../../lib/api/Api';
import type { LookupsData, ProfessionalData, LookupItem, PatientData } from '../types/patientRegistrationTypes';

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

export const formatPatientUpdateData = (data: PatientData) => {
  return {
    full_name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    birth_date: data.dateOfBirth,
    emergency_contact_name: data.emergencyContactName,
    emergency_contact_phone: data.emergencyContactPhone,
    how_heard: data.howHeard,
    profile: {
      skin_type: data.skinType,
      skin_feel: data.skinFeel,
      sun_exposure: data.sunExposure,
      foundation_type: data.foundationType,
      healing_profile: data.healingProfile,
      bruises_easily: data.bruisesEasily ? 1 : 0,
      used_products: data.usedProducts,
      uses_retinoids_acids: data.usedRetinoids ? 1 : 0,
      recent_dermal_fillers: data.recentDermalFillers ? 1 : 0,
      previous_acne_medication: data.acneMedicationDetails,
      known_allergies_details: data.allergies,
      dietary_supplements: data.supplements,
      other_medication: data.otherMedication,
      drinks_or_smokes: data.alcoholOrSmoke ? 1 : 0,
      first_facial_experience: data.firstFacialExperience ? 1 : 0,
      previous_treatment_likes: data.previousTreatmentLikes,
      treatment_goals: data.treatmentGoals,
      vitamin_a_derivatives: data.vitaminADerivatives,
      recent_botox_fillers: data.recentBotoxFillers ? 1 : 0,
      taken_acne_medication: data.takenAcneMedication ? 1 : 0,
      other_conditions: data.otherConditions,
      has_allergies: data.hasAllergies ? 1 : 0,
      allergies_details: data.allergiesDetails,
      takes_supplements: data.takesSupplements ? 1 : 0,
      supplements_details: data.supplementsDetails,
      prescription_meds: data.prescriptionMeds,
    },
  };
};