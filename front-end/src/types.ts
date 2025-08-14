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
}

// Defines the possible views/pages in the application.
export type View = "welcome" | "phone_check" | "register" | "profile" | "list";

