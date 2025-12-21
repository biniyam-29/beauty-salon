// Types
export type PatientData = {
  // Personal Information
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  howHeard: string;
  initialNote: string;
  
  // Skin & Health Profile
  skinType: string;
  skinFeel: string;
  sunExposure: string;
  foundationType: string;
  healingProfile: string;
  bruisesEasily: boolean;
  usedProducts: string[];
  usedRetinoids: boolean;
  recentDermalFillers: boolean;
  acneMedicationDetails: string;
  allergies: string;
  supplements: string;
  otherMedication: string;
  alcoholOrSmoke: boolean;
  
  // New Questionnaire Fields (No Duplicates)
  firstFacialExperience: boolean;
  previousTreatmentLikes: string;
  treatmentGoals: string;
  vitaminADerivatives: string;
  recentBotoxFillers: boolean;
  takenAcneMedication: boolean;
  otherConditions: string;
  hasAllergies: boolean;
  allergiesDetails: string;
  takesSupplements: boolean;
  supplementsDetails: string;
  prescriptionMeds: string;
  drinksOrSmokes: boolean;
  
  // Lookups
  skinConcerns: string[];
  healthConditions: string[];
  skinCareHistory: string[];
  
  // Assignment
  assignedProfessionalId: string;
  
  // Optional fields
  id?: string;
  signature?: string;
  signatureDate?: string;
};

export type ProfessionalData = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  assigned_patients_count: number;
  untreated_assigned_patients_count: number;
  todays_followups_count: number;
  skills?: string[];
};

export type LookupItem = {
  id: number;
  name: string;
};

export type LookupsData = {
  concerns: LookupItem[];
  conditions: LookupItem[];
  skinCareHistory: LookupItem[];
};

// Component Props Types
export interface StepProps {
  formData: PatientData;
  updateFormData: (updates: Partial<PatientData>) => void;
  lookups: LookupsData;
  professionals: ProfessionalData[];
  isLoading: boolean;
}