import React, { useState, useEffect, useMemo } from "react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  LogOut,
  User,
  Users,
  Loader2,
  X,
  Droplet,
  Heart,
  PlusCircle,
  Search,
  Menu,
  AlertTriangle,
  Pill,
  Settings,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Toaster, toast } from "sonner";

// --- Type Definitions ---
interface Professional {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}
interface PatientProfile {
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
interface Patient {
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
  consents?: any[];
  notes?: any[];
}
interface Consultation {
  id: number;
  consultation_date: string;
  doctor_notes: string;
  doctor_name: string;
}
interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  stock_quantity: number;
  image_data: string | null;
}
interface Prescription {
  prescription_id: number;
  quantity: number;
  instructions: string;
  product_id: number;
  product_name: string;
  product_image: string | null;
  customer_name: string;
  customer_phone: string;
}

// --- API Functions ---
const API_BASE_URL = "https://api.in2skincare.com";
const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

const fetchAssignedPatients = async (): Promise<Patient[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/customers/assigned`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch assigned patients.");
  const data = await response.json();
  return data.customers || [];
};

const fetchPatientDetails = async (patientId: number): Promise<Patient> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/customers/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch patient details.");
  return response.json();
};

const fetchPatientConsultations = async (
  patientId: number
): Promise<Consultation[]> => {
  const token = getAuthToken();
  const response = await fetch(
    `${API_BASE_URL}/customers/${patientId}/consultations`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new Error("Failed to fetch consultations.");
  const data = await response.json();
  return data || [];
};

const fetchAllSoldPrescriptions = async (): Promise<Prescription[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/prescriptions?status=sold`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch prescriptions.");
  return response.json();
};

const addConsultation = async (payload: {
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to save consultation.");
  }
  return response.json();
};

const fetchProducts = async (page: number = 1): Promise<Product[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/products?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch products.");
  const data = await response.json();
  return data.products || [];
};

const addPrescriptionToConsultation = async (payload: {
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
    ...(payload.product_name_custom && {
      product_name_custom: payload.product_name_custom,
    }),
  };

  if (body.product_id && body.product_name_custom) {
    throw new Error("Cannot provide both product_id and product_name_custom.");
  }

  const response = await fetch(
    `${API_BASE_URL}/consultations/${payload.consultationId}/prescriptions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add prescription.");
  }
  return response.json();
};

// --- Helper & UI Components ---
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");
const safeJsonParse = (jsonString: string | null | undefined): any[] => {
  if (!jsonString) return [];
  try {
    let parsed = JSON.parse(jsonString);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse JSON string:", jsonString, e);
    return [];
  }
};
const formatDateTime = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Button: FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "ghost" }
> = ({ children, variant, className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-lg text-sm font-semibold px-5 py-2.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px",
      variant === "ghost"
        ? "bg-transparent shadow-none text-rose-600 hover:bg-rose-100/50"
        : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200",
      className
    )}
    {...props}
  >
    {children}
  </button>
);
const AvatarPlaceholder: FC<{ name: string; className?: string }> = ({
  name,
  className,
}) => (
  <div
    className={cn(
      "flex-shrink-0 flex items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold",
      className
    )}
  >
    <span>{name?.charAt(0).toUpperCase() || "?"}</span>
  </div>
);
const PatientListSkeleton: FC = () => (
  <div className="p-2 space-y-1 animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);
const DetailSection: FC<{
  title: string;
  icon: React.ReactElement;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-rose-500">{icon}</div>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
    <div className="bg-white p-6 rounded-xl border border-rose-100/60">
      {children}
    </div>
  </div>
);
const InfoPill: FC<{ label: string; value?: string | number | null }> = ({
  label,
  value,
}) =>
  value || value === 0 ? (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-gray-700 font-semibold">{String(value)}</p>
    </div>
  ) : null;
const Tag: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-rose-100/60 text-rose-800 text-sm font-medium px-3 py-1.5 rounded-full">
    {children}
  </span>
);
const FactItem: FC<{ label: string; value: boolean | number | undefined }> = ({
  label,
  value,
}) => (
  <div className="flex items-center gap-3 p-3 bg-rose-50/70 rounded-lg">
    {value ? (
      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
    ) : (
      <XCircle size={20} className="text-red-500 flex-shrink-0" />
    )}
    <span className="text-gray-700">{label}</span>
  </div>
);
const ConfirmationModal: FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-fade-in-fast">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center transform animate-slide-up">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100">
          <AlertTriangle className="h-6 w-6 text-rose-600" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            Yes, Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};

const AddConsultationModal: FC<{
  patient: Patient;
  onClose: () => void;
  onSaveSuccess: (consultationId: number) => void;
}> = ({ patient, onClose, onSaveSuccess }) => {
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [goals, setGoals] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: addConsultation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["consultations", patient.id],
      });
      onClose();
      onSaveSuccess(data.consultationId);
    },
    onError: (error: Error) =>
      toast.error(error.message || "An unknown error occurred."),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedbackArray = feedback
      .split("\n")
      .filter((line) => line.trim() !== "");
    const goalsArray = goals.split("\n").filter((line) => line.trim() !== "");
    mutation.mutate({
      patientId: patient.id,
      notes,
      feedback: feedbackArray,
      goals: goalsArray,
      followUpDate,
    });
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            New Consultation for {patient.full_name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Previous Treatment Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              placeholder="One feedback item per line..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Treatment Goals Today
            </label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              placeholder="One goal per line..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Doctor's Notes *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              rows={5}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Next Follow-up Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> Saving...
                </>
              ) : (
                "Save Consultation"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SelectedPrescriptionItem {
  tempId: number | string;
  productId?: number;
  name: string;
  brand?: string;
  quantity: number;
  instructions: string;
  isCustom: boolean;
}
const PrescriptionModal: FC<{
  consultationId: number;
  patientName: string;
  onClose: () => void;
}> = ({ consultationId, patientName, onClose }) => {
  const [selectedProducts, setSelectedProducts] = useState<
    SelectedPrescriptionItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customProductName, setCustomProductName] = useState("");
  const queryClient = useQueryClient();

  const { data: allProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  const addPrescriptionMutation = useMutation({
    mutationFn: addPrescriptionToConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSoldPrescriptions"] });
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to add prescription item."),
  });

  const handleSelectProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.productId === product.id)) {
      const newItem: SelectedPrescriptionItem = {
        tempId: product.id,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        quantity: 1,
        instructions: "",
        isCustom: false,
      };
      setSelectedProducts([...selectedProducts, newItem]);
    } else {
      toast.info("Product already selected.");
    }
  };

  const handleAddCustomProduct = () => {
    if (!customProductName.trim()) return;
    if (
      selectedProducts.find(
        (p) => p.name.toLowerCase() === customProductName.trim().toLowerCase()
      )
    ) {
      toast.warning("This product is already in the list.");
      return;
    }
    const newCustomProduct: SelectedPrescriptionItem = {
      tempId: `custom-${Date.now()}`,
      name: customProductName.trim(),
      quantity: 1,
      instructions: "",
      isCustom: true,
    };
    setSelectedProducts([...selectedProducts, newCustomProduct]);
    setCustomProductName("");
  };

  const handleUpdatePrescriptionItem = (
    tempId: number | string,
    field: "quantity" | "instructions",
    value: string | number
  ) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.tempId === tempId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleRemoveProduct = (tempId: number | string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.tempId !== tempId));
  };

  const handleSavePrescription = () => {
    const prescriptionPromises = selectedProducts.map((p) => {
      const payload = {
        consultationId,
        quantity: p.quantity,
        instructions: p.instructions,
        ...(p.isCustom
          ? { product_name_custom: p.name }
          : { productId: p.productId }),
      };
      return addPrescriptionMutation.mutateAsync(payload);
    });

    toast.promise(Promise.all(prescriptionPromises), {
      loading: "Saving prescription...",
      success: () => {
        onClose();
        return "Prescription saved successfully!";
      },
      error: "Could not save the full prescription.",
    });
  };

  const filteredProducts = allProducts?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            Add Prescription for {patientName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
          <div className="flex flex-col overflow-hidden">
            <div className="relative mb-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Or add a custom product name..."
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleAddCustomProduct}
                disabled={!customProductName.trim()}
                className="px-4"
              >
                Add
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {isLoadingProducts && <p>Loading products...</p>}
              {filteredProducts?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center">
                    <div>
                      <p className="font-semibold text-gray-700">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.brand}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectProduct(p)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col overflow-hidden bg-gray-50/50 p-4 rounded-lg">
            <h3 className="font-bold mb-4 text-gray-700 flex-shrink-0">
              Selected for Prescription
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {selectedProducts.length === 0 ? (
                <p className="text-center text-sm text-gray-500 pt-10">
                  No products selected.
                </p>
              ) : (
                selectedProducts.map((p) => (
                  <div
                    key={p.tempId}
                    className="bg-white p-3 rounded-lg border"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-700">{p.name}</p>
                        {p.brand && (
                          <p className="text-xs text-gray-500">{p.brand}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(p.tempId)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-2 items-center">
                      <label className="text-sm col-span-1">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={p.quantity}
                        onChange={(e) =>
                          handleUpdatePrescriptionItem(
                            p.tempId,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full border rounded-md p-1 col-span-4"
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-5 gap-2 items-start">
                      <label className="text-sm col-span-1 pt-1">Notes:</label>
                      <textarea
                        placeholder="Instructions..."
                        rows={2}
                        value={p.instructions}
                        onChange={(e) =>
                          handleUpdatePrescriptionItem(
                            p.tempId,
                            "instructions",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-md p-1 col-span-4 text-sm"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 flex-shrink-0">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePrescription}
            disabled={
              addPrescriptionMutation.isPending || selectedProducts.length === 0
            }
          >
            {addPrescriptionMutation.isPending
              ? "Saving..."
              : "Save Prescription"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PrescriptionCard: FC<{ prescription: Prescription }> = ({
  prescription,
}) => (
  <div className="py-4 flex items-center gap-4">
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-rose-100/60 rounded-lg">
      <Pill className="w-6 h-6 text-rose-600" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">
        {prescription.product_name} (Qty: {prescription.quantity})
      </h4>
      <p className="text-sm text-gray-600">{prescription.instructions}</p>
    </div>
  </div>
);

// --- Component: PatientDetailView ---
const PatientDetailView: FC<{
  patientId: number;
  onAddConsultation: () => void;
}> = ({ patientId, onAddConsultation }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const results = useQueries({
    queries: [
      {
        queryKey: ["patientDetails", patientId],
        queryFn: () => fetchPatientDetails(patientId),
      },
      {
        queryKey: ["consultations", patientId],
        queryFn: () => fetchPatientConsultations(patientId),
      },
      {
        queryKey: ["allSoldPrescriptions"],
        queryFn: fetchAllSoldPrescriptions,
      },
    ],
  });

  const {
    data: patient,
    isLoading: isPatientLoading,
    isError: isPatientError,
  } = results[0];
  const { data: consultations, isLoading: isConsultationsLoading } = results[1];
  const { data: allPrescriptions, isLoading: isPrescriptionsLoading } =
    results[2];

  const patientPrescriptions = useMemo(() => {
    if (!patient || !allPrescriptions) return [];
    return allPrescriptions.filter(
      (p) =>
        p.customer_phone === patient.phone ||
        p.customer_name === patient.full_name
    );
  }, [patient, allPrescriptions]);

  const lifestyleFactors = useMemo(() => {
    if (!patient?.profile) return [];
    return [
      { key: "smokes", label: "Smokes", value: patient.profile.smokes },
      { key: "drinks", label: "Drinks Alcohol", value: patient.profile.drinks },
      {
        key: "bruises_easily",
        label: "Bruises Easily",
        value: patient.profile.bruises_easily,
      },
      {
        key: "uses_retinoids_acids",
        label: "Uses Retinoids/Acids",
        value: patient.profile.uses_retinoids_acids,
      },
      {
        key: "recent_dermal_fillers",
        label: "Recent Dermal Fillers",
        value: patient.profile.recent_dermal_fillers,
      },
    ].filter((factor) => factor.value === 1);
  }, [patient]);

  if (isPatientLoading || isConsultationsLoading || isPrescriptionsLoading)
    return (
      <p className="p-8 text-center text-gray-500">
        Loading patient details...
      </p>
    );
  if (isPatientError || !patient)
    return (
      <p className="p-8 text-center text-red-500">
        Could not load patient details.
      </p>
    );

  const usedProducts = safeJsonParse(patient.profile?.used_products);
  const skinFeel = safeJsonParse(patient.profile?.skin_feel);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-rose-100/80">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <AvatarPlaceholder
              name={patient.full_name}
              className="w-16 h-16 text-2xl"
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {patient.full_name}
              </h2>
              <p className="text-gray-500">
                {patient.phone} • {patient.email}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex border-b border-rose-200/60 -mb-px">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === "profile"
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-rose-500 border-b-2 border-transparent"
            )}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("consultations")}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === "consultations"
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-rose-500 border-b-2 border-transparent"
            )}
          >
            Consultations
          </button>
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === "prescriptions"
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-rose-500 border-b-2 border-transparent"
            )}
          >
            Prescriptions
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "profile" && (
          <>
            <DetailSection
              title="Personal Information"
              icon={<User size={20} />}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoPill label="Address" value={patient.address} />
                <InfoPill label="City" value={patient.city} />
                <InfoPill label="Date of Birth" value={patient.birth_date} />
                <InfoPill label="Age" value={patient.age} />
                <InfoPill
                  label="Emergency Contact"
                  value={
                    patient.emergency_contact_name
                      ? `${patient.emergency_contact_name} (${
                          patient.emergency_contact_phone || "N/A"
                        })`
                      : null
                  }
                />
                <InfoPill label="How They Heard" value={patient.how_heard} />
              </div>
            </DetailSection>
            <DetailSection title="Skin Profile" icon={<Droplet size={20} />}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoPill
                  label="Skin Type"
                  value={patient.profile?.skin_type}
                />
                <InfoPill label="Skin Feel" value={skinFeel.join(", ")} />
                <InfoPill
                  label="Sun Exposure"
                  value={patient.profile?.sun_exposure}
                />
                <InfoPill
                  label="Foundation Type"
                  value={patient.profile?.foundation_type}
                />
              </div>
              {usedProducts.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
                    Used Products
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {usedProducts.map((p, i) => (
                      <Tag key={i}>{p}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </DetailSection>
            <DetailSection
              title="Medications & Allergies"
              icon={<Pill size={20} />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoPill
                  label="Known Allergies"
                  value={patient.profile.known_allergies_details}
                />
                <InfoPill
                  label="Current Prescriptions"
                  value={patient.profile.current_prescription}
                />
                <InfoPill
                  label="Dietary Supplements"
                  value={patient.profile.dietary_supplements}
                />
                <InfoPill
                  label="Previous Acne Medication"
                  value={patient.profile.previous_acne_medication}
                />
                <InfoPill
                  label="Other Medication"
                  value={patient.profile.other_medication}
                />
              </div>
            </DetailSection>
            <DetailSection title="Health & Concerns" icon={<Heart size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Skin Concerns
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(patient.skin_concerns?.length ?? 0) > 0 ? (
                      patient.skin_concerns?.map((c) => (
                        <Tag key={c.id}>{c.name}</Tag>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">None listed.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Health Conditions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(patient.health_conditions?.length ?? 0) > 0 ? (
                      patient.health_conditions?.map((c) => (
                        <Tag key={c.id}>{c.name}</Tag>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">None listed.</p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <InfoPill
                    label="Other Conditions"
                    value={patient.profile.other_conditions}
                  />
                </div>
                <div className="md:col-span-2">
                  <InfoPill
                    label="Healing Profile"
                    value={patient.profile.healing_profile}
                  />
                </div>
              </div>
              {lifestyleFactors.length > 0 && (
                <div className="mt-8 pt-6 border-t border-rose-200/60">
                  <h3 className="font-semibold text-gray-700 mb-4">
                    Lifestyle & Health Factors
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {lifestyleFactors.map((factor) => (
                      <FactItem
                        key={factor.key}
                        label={factor.label}
                        value={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </DetailSection>
            <DetailSection
              title="Administrative Details"
              icon={<Settings size={20} />}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoPill label="Patient ID" value={patient.id} />
                <InfoPill
                  label="Assigned Doctor ID"
                  value={patient.assigned_doctor_id}
                />
                <InfoPill
                  label="Record Created"
                  value={formatDateTime(patient.created_at)}
                />
                <InfoPill
                  label="Record Last Updated"
                  value={formatDateTime(patient.updated_at)}
                />
              </div>
            </DetailSection>
          </>
        )}
        {activeTab === "consultations" && (
          <>
            <div className="text-right mb-4">
              <Button onClick={onAddConsultation}>
                <PlusCircle size={16} className="mr-2" />
                Add New Consultation
              </Button>
            </div>
            <div className="space-y-6">
              {consultations && consultations.length > 0 ? (
                consultations.map((c) => (
                  <div key={c.id} className="relative pl-8">
                    <div className="absolute left-0 top-1 h-full border-l-2 border-rose-200"></div>
                    <div className="absolute left-[-6px] top-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
                    <p className="font-bold text-rose-800">
                      {new Date(c.consultation_date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      with {c.doctor_name}
                    </p>
                    <p className="text-gray-700">{c.doctor_notes}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No consultation history.
                </p>
              )}
            </div>
          </>
        )}
        {activeTab === "prescriptions" && (
          <div className="divide-y divide-rose-100/60">
            {patientPrescriptions.length > 0 ? (
              patientPrescriptions.map((p) => (
                <PrescriptionCard key={p.prescription_id} prescription={p} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No prescription history.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const ProfessionalDashboard: FC = () => {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [isAddingConsultation, setIsAddingConsultation] = useState(false);
  const [pendingPrescription, setPendingPrescription] = useState<{
    consultationId: number;
    patientName: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<Professional | null>(null);
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setDoctorInfo(JSON.parse(userStr));
  }, []);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["assignedPatients"],
    queryFn: fetchAssignedPatients,
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleConsultationSaveSuccess = (consultationId: number) => {
    toast.success("Consultation has been saved.");
    const patient = patients?.find((p) => p.id === selectedPatientId);
    if (patient) {
      setConfirmation({
        isOpen: true,
        title: "Proceed to Prescription?",
        message: "Would you like to add a prescription for this patient now?",
        onConfirm: () => {
          setPendingPrescription({
            consultationId,
            patientName: patient.full_name,
          });
          setConfirmation(null);
        },
      });
    }
  };

  const selectedPatient = patients?.find((p) => p.id === selectedPatientId);

  return (
    <div className="flex h-screen w-full bg-[#FDF8F5] font-sans">
      <Toaster position="top-right" richColors />
      {confirmation && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          title={confirmation.title}
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}
      {isAddingConsultation && selectedPatient && (
        <AddConsultationModal
          patient={selectedPatient}
          onClose={() => setIsAddingConsultation(false)}
          onSaveSuccess={handleConsultationSaveSuccess}
        />
      )}
      {pendingPrescription && (
        <PrescriptionModal
          consultationId={pendingPrescription.consultationId}
          patientName={pendingPrescription.patientName}
          onClose={() => setPendingPrescription(null)}
        />
      )}

      <aside className="w-72 bg-white/90 p-6 hidden lg:flex flex-col justify-between border-r border-rose-100/60 h-screen sticky top-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <h1 className="text-2xl font-bold text-gray-800">
              Professional View
            </h1>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold bg-rose-100/60 text-rose-700">
              <Users size={20} /> Assigned Patients
            </button>
          </div>
        </div>
        {doctorInfo && (
          <div>
            <div className="border-t border-rose-100/60 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AvatarPlaceholder
                  name={doctorInfo.name}
                  className="w-10 h-10"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {doctorInfo.name}
                  </p>
                  <p className="text-xs text-gray-500">{doctorInfo.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-gray-500 rounded-md hover:bg-rose-100/50 hover:text-rose-600 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 bg-white shadow-xl">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-10">Menu</h1>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold bg-rose-100/60 text-rose-700">
                <Users size={20} /> Assigned Patients
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-1 overflow-hidden flex-col">
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-full md:w-2/5 lg:w-1/3 border-r border-rose-100/60 flex flex-col">
            <div className="p-4 border-b border-rose-100/60">
              <h2 className="font-bold text-gray-800">
                Your Patients ({patients?.length || 0})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <PatientListSkeleton />
              ) : (
                patients?.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors",
                      selectedPatientId === patient.id
                        ? "bg-rose-100/60"
                        : "hover:bg-rose-100/40"
                    )}
                  >
                    <AvatarPlaceholder
                      name={patient.full_name}
                      className="w-12 h-12 text-xl"
                    />
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {patient.full_name}
                      </h3>
                      <p className="text-sm text-gray-500">{patient.phone}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex-1 hidden md:flex flex-col">
            {selectedPatientId ? (
              <PatientDetailView
                patientId={selectedPatientId}
                onAddConsultation={() => setIsAddingConsultation(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <User size={48} className="mb-4 text-rose-300" />
                <h2 className="text-xl font-semibold">Select a Patient</h2>
                <p>Choose a patient from the list to view their details.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
