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
  assignedProfessionalId?: string | null;
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
  reminderDismissed?: boolean;
}

// Defines the data structure for a product.
export interface ProductData {
  id?: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  price: number;
}

// Defines the data structure for a super admin.
export interface SuperAdminData {
  id: string;
  name: string;
  email: string;
}

// FILE: src/types.ts
// This file defines the shared data structures for the application.

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'super-admin' | 'doctor' | 'reception' | 'inventory-manager';
  is_active: boolean;
  avatar: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string | null;
  cost: number;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_data: string | null; // Base64 data string from the API
  image_data_mimetype?: string;
}

