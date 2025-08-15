// =================================================================================
// FILE: src/types.ts
// =================================================================================

// Defines the main data structure for a patient/customer.
export interface PatientData {
  id?: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  heardFrom: string;
  skinType: string;
  skinFeel: string[];
  sunExposure: string;
  foundationType: string;
  skinHeal: string;
  bruiseEasily: boolean;
  usedProducts: string[];
  otherProducts: string;
  skinConcerns: string[];
  firstFacial: boolean;
  previousTreatmentLikes: string;
  treatmentGoal: string;
  usedRetinoids: boolean;
  hadFillers: boolean;
  acneMedication: boolean;
  acneMedicationDetails: string;
  healthConditions: string[];
  otherConditions: string;
  knownAllergies: boolean;
  allergiesDetails?: string;
  supplements: boolean;
  supplementsDetails?: string;
  prescriptionMeds: boolean;
  prescriptionMedsDetails?: string;
  alcoholOrSmoke: boolean;
  signature: string;
  signatureDate: string;
  conclusionNote?: string;
  assignedProfessionalId?: string;
  sessions?: SessionData[];
}

// Defines the data structure for a professional.
export interface ProfessionalData {
  id: string;
  name: string;
  skills: string[];
}

// Defines the data structure for a single session with a professional.
export interface SessionData {
  id: string;
  customerId: string;
  date: string;
  professionalId: string;
  notes: string;
  prescription: string;
  images: string[]; // URLs to images
}

// =================================================================================
// END FILE: src/types.ts
// =================================================================================
