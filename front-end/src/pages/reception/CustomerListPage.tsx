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
  ClipboardCheck,
  Settings,
} from "lucide-react";

// --- Type Definitions (Unchanged) ---
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
}

interface Consent {
  id: number;
  name: string;
  status: "given" | "revoked" | string;
  date: string;
}

interface Note {
  id: number;
  content: string;
  author: string;
  created_at: string;
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
  profile?: CustomerProfile;
  skin_concerns?: SkinConcern[];
  health_conditions?: HealthCondition[];
  consents?: Consent[];
  notes?: Note[];
}

interface Consultation {
  id: number;
  consultation_date: string;
  notes: string;
  doctor_name: string;
}

// --- API Fetching Functions (Unchanged) ---
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

// --- Child Components (Unchanged) ---
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
    <img
      src={
        customer.profile_picture || `https://i.pravatar.cc/150?u=${customer.id}`
      }
      alt={customer.full_name}
      className="w-12 h-12 rounded-full object-cover bg-rose-200 flex-shrink-0"
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

  // --- FIX: Moved useMemo hook before any conditional returns ---
  const lifestyleFactors = useMemo(() => {
    // Guard against the customer object being undefined during the initial load
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
    ].filter((factor) => factor.value === 1);
  }, [customer]); // Depend on the customer object itself

  if (isCustomerLoading || areConsultationsLoading) return <DetailSkeleton />;
  if (isCustomerError || isConsultationsError)
    return (
      <div className="p-10 text-center text-red-500">
        Error loading profile.
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
          <img
            src={
              customer.profile_picture ||
              `https://i.pravatar.cc/150?u=${customer.id}`
            }
            alt={customer.full_name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {customer.full_name}
            </h1>
            <p className="text-gray-500 mt-1">
              {customer.email || "No email provided"}
            </p>
            <p className="text-gray-500">{customer.phone}</p>
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
        </div>
      </div>

      <div className="p-8">
        {activeTab === "profile" && (
          <>
            <DetailSection
              title="Personal Information"
              icon={<User size={20} />}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoPill label="Address" value={customer.address} />
                <InfoPill label="City" value={customer.city} />
                <InfoPill label="Date of Birth" value={customer.birth_date} />
                <InfoPill
                  label="Emergency Contact"
                  value={
                    customer.emergency_contact_name &&
                    customer.emergency_contact_phone
                      ? `${customer.emergency_contact_name} (${customer.emergency_contact_phone})`
                      : customer.emergency_contact_name
                  }
                />
                <InfoPill label="How they heard" value={customer.how_heard} />
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
                  value={skinFeel.length > 0 ? skinFeel.join(", ") : null}
                />
                <InfoPill
                  label="Sun Exposure"
                  value={customer.profile?.sun_exposure}
                />
                <InfoPill
                  label="Foundation Type"
                  value={customer.profile?.foundation_type}
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
                  label="Current Prescriptions"
                  value={customer.profile?.current_prescription}
                />
                <InfoPill
                  label="Dietary Supplements"
                  value={customer.profile?.dietary_supplements}
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
                <div className="md:col-span-2">
                  <InfoPill
                    label="Healing Profile"
                    value={customer.profile?.healing_profile}
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

            <DetailSection
              title="Client Notes"
              icon={<MessageSquare size={20} />}
            >
              <div className="space-y-4">
                {(customer.notes?.length ?? 0) > 0 ? (
                  customer.notes?.map((note) => (
                    <div key={note.id} className="p-3 bg-rose-50/70 rounded-lg">
                      <p className="text-gray-800">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        - {note.author} on {formatDateTime(note.created_at)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No notes found for this client.
                  </p>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Consents" icon={<ClipboardCheck size={20} />}>
              <div className="flex flex-wrap gap-3">
                {(customer.consents?.length ?? 0) > 0 ? (
                  customer.consents?.map((consent) => (
                    <div
                      key={consent.id}
                      className="flex items-center gap-2 bg-rose-100/60 text-rose-800 text-sm font-medium px-3 py-1.5 rounded-full"
                    >
                      <CheckCircle2
                        size={16}
                        className={
                          consent.status === "given"
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      />
                      <span>
                        {consent.name} ({consent.status} on{" "}
                        {new Date(consent.date).toLocaleDateString()})
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No consent forms found.</p>
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
        {activeTab === "consultations" && (
          <DetailSection
            title="Consultation History"
            icon={<FileText size={20} />}
          >
            <div className="space-y-6">
              {(consultations?.length ?? 0) > 0 ? (
                consultations?.map((c) => (
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
                    <p className="text-gray-700">{c.notes}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No consultation history found.</p>
              )}
            </div>
          </DetailSection>
        )}
      </div>
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
