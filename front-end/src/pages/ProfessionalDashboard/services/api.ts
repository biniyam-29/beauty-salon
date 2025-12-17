import type { Patient, Consultation, Prescription, Product, Image } from "../types";

const API_BASE_URL = "https://api.in2skincare.com";

const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

// --- Fetching Functions ---
export const fetchAssignedPatients = async (): Promise<Patient[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/customers/assigned`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch assigned patients.");
  const data = await response.json();
  return data.customers || [];
};

export const fetchPatientDetails = async (patientId: number): Promise<Patient> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/customers/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch patient details.");
  return response.json();
};

export const fetchPatientConsultations = async (patientId: number): Promise<Consultation[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/customers/${patientId}/consultations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch consultations.");
  return (await response.json()) || [];
};

export const fetchAllSoldPrescriptions = async (): Promise<Prescription[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/prescriptions?status=sold`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch prescriptions.");
  return response.json();
};

export const fetchProducts = async (page: number = 1): Promise<Product[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/products?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch products.");
  const data = await response.json();
  return data.products || [];
};

export const fetchConsultationImages = async (consultationId: number): Promise<Image[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/images`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error("Failed to fetch consultation images.");
  }
  const data = await response.json();
  return data.images || [];
};

// --- Mutation Functions ---
export const addConsultation = async (payload: {
  patientId: number;
  notes: string;
  feedback: string[];
  goals: string[];
  followUpDate?: string;
}): Promise<{ consultationId: number }> => {
  const token = getAuthToken();
  const userStr = localStorage.getItem("user");
  if (!userStr) throw new Error("Doctor ID not found in local storage.");
  const doctorId = JSON.parse(userStr).id;
  const body = {
    customer_id: payload.patientId,
    doctor_id: doctorId,
    previous_treatment_feedback: payload.feedback,
    treatment_goals_today: payload.goals,
    doctor_notes: payload.notes,
    follow_up_date: payload.followUpDate || null,
  };
  const response = await fetch(`${API_BASE_URL}/consultations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to save consultation.");
  }
  return response.json();
};

export const uploadConsultationImages = async (payload: {
  consultationId: number;
  imageFiles: File[];
  descriptions?: string[];
}): Promise<any> => {
  const { consultationId, imageFiles, descriptions } = payload;
  const token = getAuthToken();
  const formData = new FormData();
  
  // Append all files to FormData
  imageFiles.forEach((file, index) => {
    formData.append('file[]', file);
    
    // Add description if provided for this file
    if (descriptions && descriptions[index]) {
      formData.append(`descriptions[]`, descriptions[index]);
    }
  });

  const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to upload images.");
  }
  return response.json();
};

export const addPrescriptionToConsultation = async (payload: {
  consultationId: number;
  productId?: number;
  product_name_custom?: string;
  quantity: number;
  instructions: string;
}) => {
  const token = getAuthToken();
  const body = {
    quantity: payload.quantity,
    instructions: payload.instructions,
    ...(payload.productId && { product_id: payload.productId }),
    ...(payload.product_name_custom && { product_name_custom: payload.product_name_custom }),
  };
  const response = await fetch(`${API_BASE_URL}/consultations/${payload.consultationId}/prescriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add prescription.");
  }
  return response.json();
};