// src/pages/ProfessionalDashboard/types.ts

export interface Professional {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

export interface PatientProfile {
  customer_id: number;
  skin_type: string;
  skin_feel: string;
  sun_exposure: string;
  foundation_type?: string | null;
  healing_profile?: string | null;
  bruises_easily: 0 | 1;
  used_products: string;
  uses_retinoids_acids: 0 | 1;
  recent_dermal_fillers?: 0 | 1;
  previous_acne_medication?: string;
  known_allergies_details?: string | null;
  dietary_supplements?: string | null;
  current_prescription?: string | null;
  other_conditions?: string | null;
  other_medication?: string | null;
  smokes: 0 | 1;
  drinks: 0 | 1;
  updated_at: string;
}

export interface Patient {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  birth_date?: string;
  age?: number;
  assigned_doctor_id?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  how_heard?: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
  profile: PatientProfile;
  skin_concerns: { id: number; name: string }[];
  health_conditions: { id: number; name: string }[];
}

export interface Consultation {
  id: number;
  consultation_date: string;
  doctor_notes: string;
  doctor_name: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  stock_quantity: number;
  image_data: string | null;
}

export interface Prescription {
  prescription_id: number;
  quantity: number;
  instructions: string;
  product_id: number;
  product_name: string;
  product_image: string | null;
  customer_name: string;
  customer_phone: string;
}

export interface SelectedPrescriptionItem {
  tempId: number | string;
  productId?: number;
  name: string;
  brand?: string;
  quantity: number;
  instructions: string;
  isCustom: boolean;
}

// src/pages/ProfessionalDashboard/types.ts
// ... (keep all existing interfaces)

export interface Image {
  id: number;
  image_url: string;
  description: string | null;
  created_at: string;
}

export interface Consultation {
  id: number;
  consultation_date: string;
  doctor_notes: string;
  doctor_name: string;
  images?: Image[]; // Add this optional property
}