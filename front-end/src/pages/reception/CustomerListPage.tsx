import React, { useState, useMemo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Heart,
  Droplet,
  FileText,
  Search,
  ChevronLeft,
  X,
  Pill,
  CheckCircle2,
  XCircle,
  MessageSquare,
  // ClipboardCheck,
  Settings,
  ClipboardList,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  PlusCircle,
  ZoomIn,
} from "lucide-react";

// --- Type Definitions ---
interface CustomerProfile {
  customer_id: number;
  skin_type: string;
  skin_feel: string;
  sun_exposure: string;
  foundation_type?: string | null;
  healing_profile?: string | null;
  bruises_easily?: number;
  used_products: string;
  uses_retinoids_acids?: number;
  recent_dermal_fillers?: number;
  previous_acne_medication?: string;
  known_allergies_details?: string | null;
  dietary_supplements?: string | null;
  current_prescription?: string | null;
  other_conditions?: string | null;
  other_medication?: string | null;
  smokes?: number;
  drinks?: number;
  updated_at: string;
  // New fields from questionnaire
  first_facial_experience?: number;
  previous_treatment_likes?: string;
  treatment_goals?: string;
  vitamin_a_derivatives?: string;
  recent_botox_fillers?: number;
  taken_acne_medication?: number;
  has_allergies?: number;
  allergies_details?: string;
  takes_supplements?: number;
  supplements_details?: string;
  prescription_meds?: string;
  drinks_or_smokes?: number;
}

interface Note {
  id: number;
  note_text: string; 
  author_name: string;
  created_at: string;
  status: string;
}

interface SkinConcern {
  id: number;
  name: string;
}

interface HealthCondition {
  id: number;
  name: string;
}

interface Customer {
  id: number | string;
  full_name: string;
  phone: string;
  email: string | null;
  profile_picture?: string | null;
  address?: string | null;
  city?: string | null;
  birth_date?: string | null;
  assigned_doctor_id?: number | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  how_heard?: string | null;
  created_at: string;
  updated_at: string;
  age?: number;
  profile?: CustomerProfile;
  skin_concerns?: SkinConcern[];
  health_conditions?: HealthCondition[];
  notes?: Note[];
}

interface ConsultationImage {
  id: number;
  image_url: string;
  consultation_id: number;
  created_at: string;
}

interface Consultation {
  id: number;
  consultation_date: string;
  notes: string;
  doctor_name: string;
  follow_up_date?: string | null;
  doctor_notes?: string;
  treatment_goals_today?: string[];
  previous_treatment_feedback?: string[];
  images?: ConsultationImage[];
  created_at: string;
}

interface Prescription {
  prescription_id: number;
  quantity: number;
  instructions: string;
  product_id: number;
  product_name: string;
  product_image: string;
  customer_name: string;
  customer_phone: string;
}

// --- API Fetching Functions ---
const BASE_URL = "https://beauty-api.biniyammarkos.com";
const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

const fetchCustomers = async (): Promise<Customer[]> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/customers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch customers.");
  const data = await response.json();
  return data.customers || [];
};

const fetchCustomerDetails = async (
  customerId: number | string
): Promise<Customer> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/customers/${customerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch customer details.");
  return response.json();
};

const fetchCustomerConsultations = async (
  customerId: number | string
): Promise<Consultation[]> => {
  const token = getAuthToken();
  const response = await fetch(
    `${BASE_URL}/customers/${customerId}/consultations`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch consultations.");
  const data = await response.json();
  return data || [];
};

const fetchConsultationDetail = async (id: number): Promise<Consultation> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/consultations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch consultation");
  return response.json();
};

const fetchConsultationImages = async (consultationId: number): Promise<ConsultationImage[]> => {
  const token = getAuthToken();
  const response = await fetch(
    `${BASE_URL}/consultations/${consultationId}/images`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch consultation images");
  return response.json();
};

const fetchPrescriptions = async (): Promise<Prescription[]> => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/prescriptions?status=sold`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch prescriptions.");
  return response.json();
};

// --- Consultation Detail Components ---
const ImageGallery: FC<{ images: ConsultationImage[] }> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
        <h3 className="text-rose-700 font-semibold mb-3">Patient Photos ({images.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-rose-300 transition-colors"
              onClick={() => setSelectedImage(`${BASE_URL}/${image.image_url}`)}
            >
              <img
                src={`${BASE_URL}/${image.image_url}`}
                alt={`Consultation photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-rose-200 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged consultation photo"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

const ConsultationDetailModal: FC<{ 
  consultation: Consultation; 
  onClose: () => void 
}> = ({ consultation, onClose }) => {
  const { data: fullConsultation, isLoading } = useQuery({
    queryKey: ["consultationDetail", consultation.id],
    queryFn: () => fetchConsultationDetail(consultation.id),
    enabled: !!consultation.id,
  });

  const consultationData = fullConsultation || consultation;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-rose-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-rose-200 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-rose-700">Consultation Detail</h2>
          <button
            onClick={onClose}
            className="text-rose-500 hover:text-rose-700 font-semibold text-lg p-1"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-6">Loading...</p>
        ) : (
          <div className="space-y-5">
            {/* Date & Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-600 uppercase font-semibold">Consultation Date</p>
                <p className="text-gray-800 font-medium">
                  {new Date(consultationData.consultation_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-600 uppercase font-semibold">Follow-up Date</p>
                <p className="text-gray-800 font-medium">
                  {consultationData.follow_up_date ? (
                    new Date(consultationData.follow_up_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    <span className="text-gray-500">Not scheduled</span>
                  )}
                </p>
              </div>
            </div>

            {/* Images Gallery */}
            {consultationData.images && consultationData.images.length > 0 && (
              <ImageGallery images={consultationData.images} />
            )}

            {/* Doctor Notes */}
            <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
              <h3 className="text-rose-700 font-semibold mb-2">Doctor Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{consultationData.doctor_notes || consultationData.notes}</p>
            </div>

            {/* Treatment Goals */}
            {consultationData.treatment_goals_today?.length > 0 && (
              <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
                <h3 className="text-rose-700 font-semibold mb-2">Treatment Goals</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {consultationData.treatment_goals_today.map((goal: string, idx: number) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Previous Feedback */}
            {consultationData.previous_treatment_feedback?.length > 0 && (
              <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
                <h3 className="text-rose-700 font-semibold mb-2">Previous Feedback</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {consultationData.previous_treatment_feedback.map((fb: string, idx: number) => (
                    <li key={idx}>{fb}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Created At */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">Record Created</p>
              <p className="text-gray-700 text-sm">
                {new Date(consultationData.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-rose-200 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ConsultationItem: FC<{ 
  consultation: Consultation; 
  onClick: () => void 
}> = ({ consultation, onClick }) => {
  const { data: images } = useQuery({
    queryKey: ["consultationImages", consultation.id],
    queryFn: () => fetchConsultationImages(consultation.id),
  });

  const firstImage = images?.[0];

  return (
    <div
      onClick={onClick}
      className="relative pl-8 cursor-pointer hover:bg-rose-50 p-4 rounded-lg transition group border border-transparent hover:border-rose-200"
    >
      <div className="absolute left-0 top-4 h-[calc(100%-2rem)] border-l-2 border-rose-200"></div>
      <div className="absolute left-[-6px] top-4 w-3 h-3 bg-rose-500 rounded-full border-2 border-white group-hover:bg-rose-600 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-2">
        <p className="font-bold text-rose-800">
          {new Date(consultation.consultation_date).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </p>
        {images && images.length > 0 && (
          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
            {images.length} photo{images.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mb-3">with {consultation.doctor_name}</p>

      {firstImage && (
        <div className="my-3 w-48 h-32 overflow-hidden rounded-lg border border-gray-200">
          <img
            src={`${BASE_URL}/${firstImage.image_url}`}
            alt="Consultation visual note"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <p className="text-gray-700 line-clamp-2">{consultation.doctor_notes || consultation.notes}</p>
    </div>
  );
};

// --- Child Components ---
const AvatarPlaceholder: FC<{ name: string; className?: string }> = ({
  name,
  className = "",
}) => {
  const initial = name?.charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`flex-shrink-0 flex items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};

const CustomerListItem: FC<{
  customer: Customer;
  isSelected: boolean;
  onClick: () => void;
}> = ({ customer, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors duration-200 ${
      isSelected ? "bg-rose-100/60" : "hover:bg-rose-100/40"
    }`}
  >
    <AvatarPlaceholder
      name={customer.full_name}
      className="w-12 h-12 text-xl"
    />
    <div className="overflow-hidden">
      <h3 className="font-bold text-gray-800 truncate">{customer.full_name}</h3>{" "}
      <p className="text-sm text-gray-500 truncate">{customer.phone}</p>
    </div>
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

const ContactInfo: FC<{ label: string; value?: string | number | null; icon: React.ReactElement }> = ({
  label,
  value,
  icon
}) =>
  value ? (
    <div className="flex items-center gap-3 p-3 bg-rose-50/70 rounded-lg">
      <div className="text-rose-500 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-gray-700 font-semibold">{String(value)}</p>
      </div>
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

const BooleanDisplay: FC<{ value?: number | null; trueText?: string; falseText?: string }> = ({
  value,
  trueText = "Yes",
  falseText = "No"
}) => (
  <div className="flex items-center gap-2">
    {value ? (
      <CheckCircle2 size={16} className="text-green-600" />
    ) : (
      <XCircle size={16} className="text-red-500" />
    )}
    <span className="text-gray-700">{value ? trueText : falseText}</span>
  </div>
);

const PrescriptionCard: FC<{ prescription: Prescription }> = ({
  prescription,
}) => (
  <div className="flex items-start gap-4 p-4 border-b border-rose-100/80 last:border-b-0">
    <img
      src={prescription.product_image || "https://via.placeholder.com/80"}
      alt={prescription.product_name}
      className="w-20 h-20 rounded-lg object-cover bg-rose-100"
    />
    <div className="flex-1">
      <h3 className="font-bold text-gray-800">{prescription.product_name}</h3>
      <p className="text-sm text-gray-500 mb-2">
        Quantity: {prescription.quantity}
      </p>
      <p className="text-gray-700 text-sm">
        <span className="font-semibold">Instructions:</span>{" "}
        {prescription.instructions}
      </p>
    </div>
  </div>
);

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

const CustomerDetailView: FC<{ customerId: number | string }> = ({
  customerId,
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const {
    data: customer,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
  } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => fetchCustomerDetails(customerId),
  });

  const {
    data: consultations,
    isLoading: areConsultationsLoading,
    isError: isConsultationsError,
  } = useQuery({
    queryKey: ["consultations", customerId],
    queryFn: () => fetchCustomerConsultations(customerId),
    enabled: !!customer,
  });

  const {
    data: allPrescriptions,
    isLoading: arePrescriptionsLoading,
    isError: isPrescriptionsError,
  } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: fetchPrescriptions,
  });

  const lifestyleFactors = useMemo(() => {
    if (!customer?.profile) return [];
    return [
      { key: "smokes", label: "Smokes", value: customer.profile.smokes },
      {
        key: "drinks",
        label: "Drinks Alcohol",
        value: customer.profile.drinks,
      },
      {
        key: "bruises_easily",
        label: "Bruises Easily",
        value: customer.profile.bruises_easily,
      },
      {
        key: "uses_retinoids_acids",
        label: "Uses Retinoids/Acids",
        value: customer.profile.uses_retinoids_acids,
      },
      {
        key: "recent_dermal_fillers",
        label: "Recent Dermal Fillers",
        value: customer.profile.recent_dermal_fillers,
      },
      {
        key: "first_facial_experience",
        label: "First Facial Experience",
        value: customer.profile.first_facial_experience,
      },
      {
        key: "recent_botox_fillers",
        label: "Recent Botox/Fillers",
        value: customer.profile.recent_botox_fillers,
      },
      {
        key: "taken_acne_medication",
        label: "Taken Acne Medication",
        value: customer.profile.taken_acne_medication,
      },
      {
        key: "has_allergies",
        label: "Has Allergies",
        value: customer.profile.has_allergies,
      },
      {
        key: "takes_supplements",
        label: "Takes Supplements",
        value: customer.profile.takes_supplements,
      },
      {
        key: "drinks_or_smokes",
        label: "Drinks or Smokes",
        value: customer.profile.drinks_or_smokes,
      },
    ].filter((factor) => factor.value === 1);
  }, [customer]);

  const customerPrescriptions = useMemo(() => {
    if (!customer || !allPrescriptions) return [];
    return allPrescriptions.filter(
      (p) =>
        p.customer_name === customer.full_name ||
        p.customer_phone === customer.phone
    );
  }, [customer, allPrescriptions]);

  if (isCustomerLoading || areConsultationsLoading || arePrescriptionsLoading)
    return <DetailSkeleton />;

  if (isCustomerError || isConsultationsError || isPrescriptionsError)
    return (
      <div className="p-10 text-center text-red-500">
        Error loading profile data.
      </div>
    );
  if (!customer) return null;

  const safeJsonParse = (jsonString: string | null | undefined): any[] => {
    if (!jsonString) return [];
    try {
      let parsed = JSON.parse(jsonString);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const usedProducts = safeJsonParse(customer.profile?.used_products);
  const skinFeel = safeJsonParse(customer.profile?.skin_feel);

  return (
    <div className="flex-1">
      <div className="p-8 sticky top-0 bg-[#FDF8F5]/80 backdrop-blur-sm z-10 border-b border-rose-100/80">
        <div className="flex items-center gap-6">
          <AvatarPlaceholder
            name={customer.full_name}
            className="w-24 h-24 text-4xl border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
              {customer.full_name}
            </h1>
            <div className="flex flex-wrap gap-4 mt-3">
              <ContactInfo 
                label="Phone" 
                value={customer.phone} 
                icon={<Phone size={16} />}
              />
              <ContactInfo 
                label="Email" 
                value={customer.email} 
                icon={<Mail size={16} />}
              />
              {customer.age !== undefined && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/70 rounded-lg">
                  <Calendar size={16} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      Age
                    </p>
                    <p className="text-gray-700 font-semibold">{customer.age}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex border-b border-rose-200/60">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-rose-500"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("consultations")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "consultations"
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-rose-500"
            }`}
          >
            Consultations
          </button>
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "prescriptions"
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-rose-500"
            }`}
          >
            Prescriptions
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* --- PROFILE TAB CONTENT (ENHANCED) --- */}
        {activeTab === "profile" && (
          <>
            <DetailSection
              title="Contact Information"
              icon={<User size={20} />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ContactInfo 
                  label="Primary Phone" 
                  value={customer.phone} 
                  icon={<Phone size={18} />}
                />
                <ContactInfo 
                  label="Email Address" 
                  value={customer.email} 
                  icon={<Mail size={18} />}
                />
                <ContactInfo 
                  label="Address" 
                  value={customer.address} 
                  icon={<MapPin size={18} />}
                />
                <ContactInfo 
                  label="City" 
                  value={customer.city} 
                  icon={<MapPin size={18} />}
                />
                <ContactInfo 
                  label="Date of Birth" 
                  value={customer.birth_date} 
                  icon={<Calendar size={18} />}
                />
                {customer.age !== undefined && (
                  <ContactInfo 
                    label="Age" 
                    value={customer.age} 
                    icon={<User size={18} />}
                  />
                )}
              </div>
            </DetailSection>

            <DetailSection
              title="Emergency Contact"
              icon={<AlertCircle size={20} />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ContactInfo 
                  label="Emergency Contact Name" 
                  value={customer.emergency_contact_name} 
                  icon={<User size={18} />}
                />
                <ContactInfo 
                  label="Emergency Contact Phone" 
                  value={customer.emergency_contact_phone} 
                  icon={<Phone size={18} />}
                />
                <div className="md:col-span-2">
                  <ContactInfo 
                    label="How They Heard About Us" 
                    value={customer.how_heard} 
                  />
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Skin Profile" icon={<Droplet size={20} />}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoPill
                  label="Skin Type"
                  value={customer.profile?.skin_type}
                />
                <InfoPill
                  label="Skin Feel"
                  value={skinFeel.length > 0 ? skinFeel.join(", ") : "Not specified"}
                />
                <InfoPill
                  label="Sun Exposure"
                  value={customer.profile?.sun_exposure}
                />
                <InfoPill
                  label="Foundation Type"
                  value={customer.profile?.foundation_type}
                />
                <InfoPill
                  label="Healing Profile"
                  value={customer.profile?.healing_profile}
                />
              </div>
              {usedProducts.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
                    Used Products
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {usedProducts.map((p: string, i: number) => (
                      <Tag key={i}>{p}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </DetailSection>

            {/* New Questionnaire Section */}
            <DetailSection
              title="Treatment Experience & Goals"
              icon={<Calendar size={20} />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
                    First Facial Experience
                  </p>
                  <BooleanDisplay 
                    value={customer.profile?.first_facial_experience}
                    trueText="Yes, first facial"
                    falseText="No, previous experience"
                  />
                </div>
                {customer.profile?.first_facial_experience === 0 && (
                  <InfoPill
                    label="Previous Treatment Likes"
                    value={customer.profile?.previous_treatment_likes}
                  />
                )}
                <div className="md:col-span-2">
                  <InfoPill
                    label="Treatment Goals"
                    value={customer.profile?.treatment_goals}
                  />
                </div>
                <div className="md:col-span-2">
                  <InfoPill
                    label="Vitamin A Derivatives Usage"
                    value={customer.profile?.vitamin_a_derivatives}
                  />
                </div>
              </div>
            </DetailSection>

            <DetailSection
              title="Medications & Allergies"
              icon={<Pill size={20} />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoPill
                  label="Known Allergies"
                  value={customer.profile?.known_allergies_details}
                />
                <InfoPill
                  label="Allergies Details"
                  value={customer.profile?.allergies_details}
                />
                <InfoPill
                  label="Current Prescriptions"
                  value={customer.profile?.current_prescription}
                />
                <InfoPill
                  label="Prescription Medications"
                  value={customer.profile?.prescription_meds}
                />
                <InfoPill
                  label="Dietary Supplements"
                  value={customer.profile?.dietary_supplements}
                />
                <InfoPill
                  label="Supplements Details"
                  value={customer.profile?.supplements_details}
                />
                <InfoPill
                  label="Previous Acne Medication"
                  value={customer.profile?.previous_acne_medication}
                />
                <InfoPill
                  label="Other Medication"
                  value={customer.profile?.other_medication}
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
                    {(customer.skin_concerns?.length ?? 0) > 0 ? (
                      customer.skin_concerns?.map((c) => (
                        <Tag key={c.id}>{c.name}</Tag>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No skin concerns listed.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Health Conditions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(customer.health_conditions?.length ?? 0) > 0 ? (
                      customer.health_conditions?.map((c) => (
                        <Tag key={c.id}>{c.name}</Tag>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No health conditions listed.
                      </p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <InfoPill
                    label="Other Conditions"
                    value={customer.profile?.other_conditions}
                  />
                </div>
              </div>

              {lifestyleFactors.length > 0 && (
                <div className="mt-8 pt-6 border-t border-rose-200/60">
                  <h3 className="font-semibold text-gray-700 mb-4">
                    Lifestyle & Health Factors
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

            <DetailSection title="Client Notes" icon={<MessageSquare size={20} />}>
              <div className="space-y-4">
                {(customer.notes?.length ?? 0) > 0 ? (
                  customer.notes?.map((note) => (
                    <div key={note.id} className="p-4 bg-rose-50/70 rounded-lg border border-rose-100/60">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-gray-800">{note.author_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(note.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{note.note_text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No notes found for this client.
                  </p>
                )}
              </div>
            </DetailSection>

            <DetailSection
              title="Administrative Details"
              icon={<Settings size={20} />}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoPill label="Client ID" value={customer.id} />
                <InfoPill
                  label="Profile ID"
                  value={customer.profile?.customer_id}
                />
                <InfoPill
                  label="Assigned Doctor ID"
                  value={customer.assigned_doctor_id}
                />
                <InfoPill
                  label="Record Created On"
                  value={formatDateTime(customer.created_at)}
                />
                <InfoPill
                  label="Record Last Updated"
                  value={formatDateTime(customer.updated_at)}
                />
                <InfoPill
                  label="Profile Last Updated"
                  value={formatDateTime(customer.profile?.updated_at)}
                />
              </div>
            </DetailSection>
          </>
        )}

        {/* --- CONSULTATIONS TAB CONTENT (ENHANCED) --- */}
        {activeTab === "consultations" && (
          <DetailSection
            title="Consultation History"
            icon={<FileText size={20} />}
          >
            <div className="space-y-6">
              {(consultations?.length ?? 0) > 0 ? (
                consultations?.map((consultation) => (
                  <ConsultationItem
                    key={consultation.id}
                    consultation={consultation}
                    onClick={() => setSelectedConsultation(consultation)}
                  />
                ))
              ) : (
                <p className="text-gray-500">No consultation history found.</p>
              )}
            </div>
          </DetailSection>
        )}

        {/* --- PRESCRIPTIONS TAB CONTENT --- */}
        {activeTab === "prescriptions" && (
          <DetailSection
            title="Prescription History"
            icon={<ClipboardList size={20} />}
          >
            <div className="divide-y divide-rose-100/60 -m-6">
              {customerPrescriptions.length > 0 ? (
                customerPrescriptions.map((p) => (
                  <PrescriptionCard key={p.prescription_id} prescription={p} />
                ))
              ) : (
                <p className="text-gray-500 p-6">
                  No prescriptions found for this client.
                </p>
              )}
            </div>
          </DetailSection>
        )}
      </div>

      {/* Consultation Detail Modal */}
      {selectedConsultation && (
        <ConsultationDetailModal
          consultation={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    </div>
  );
};

// --- Skeleton Loader Components (Unchanged) ---
const ListSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);
const DetailSkeleton = () => (
  <div className="p-8 animate-pulse">
    <div className="flex items-center gap-6 mb-10">
      <div className="w-24 h-24 rounded-full bg-gray-200"></div>
      <div className="space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-8">
      <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="bg-gray-100 h-32 rounded-xl"></div>
      <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="bg-gray-100 h-32 rounded-xl"></div>
    </div>
  </div>
);

// --- Main Page Component (Unchanged) ---
export const CustomerListPage: FC = () => {
  const navigate = useNavigate();
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    number | string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: customers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const filteredCustomers = useMemo(
    () =>
      customers?.filter(
        (c) =>
          c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ?? [],
    [customers, searchTerm]
  );

  React.useEffect(() => {
    if (
      selectedCustomerId &&
      customers &&
      !filteredCustomers.find((c) => c.id === selectedCustomerId)
    ) {
      setSelectedCustomerId(null);
    }
  }, [filteredCustomers, selectedCustomerId, customers]);

  return (
    <div className="h-screen w-full bg-[#FDF8F5] font-sans flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-rose-200/60 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-800">Client Profiles</h1>
        <button
          onClick={() => navigate("/reception")}
          className="flex items-center gap-2 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-rose-100/50 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-full md:w-1/3 lg:w-1/4 border-r border-rose-200/60 flex flex-col">
          <div className="p-4 border-b border-rose-200/60">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-rose-200/80 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-rose-300 focus:outline-none transition"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <p className="p-4 text-red-500">{(error as Error).message}</p>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <CustomerListItem
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedCustomerId === customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                />
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">No clients found.</p>
            )}
          </div>
        </aside>

        <main className="flex-1 bg-[#FDF8F5] hidden md:block overflow-y-auto">
          {selectedCustomerId ? (
            <CustomerDetailView customerId={selectedCustomerId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <User size={48} className="mb-4 text-rose-300" />
              <h2 className="text-xl font-semibold">Select a client</h2>
              <p>Choose a client from the list to view their full profile.</p>
            </div>
          )}
        </main>
      </div>

      {selectedCustomerId && (
        <div className="md:hidden fixed inset-0 bg-[#FDF8F5] z-50 overflow-y-auto">
          <button
            onClick={() => setSelectedCustomerId(null)}
            className="absolute top-4 right-4 z-20 p-2 bg-white/50 rounded-full"
          >
            <X size={24} />
          </button>
          <CustomerDetailView customerId={selectedCustomerId} />
        </div>
      )}
    </div>
  );
};

export default CustomerListPage;
