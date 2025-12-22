import React, { useMemo } from "react";
import {
  User,
  Heart,
  Droplet,
  FileText,
  MessageSquare,
  Settings,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  useCustomerDetails,
} from "../../../hooks/UseCustomer";
import { DetailSection } from "./shared/DetailSection";
import { ContactInfo } from "./shared/ContactInfo";
import { InfoPill } from "./shared/InfoPill";
import { Tag } from "./shared/Tag";
import { FactItem } from "./shared/FactItem";
import { DetailSkeleton } from "./skeletons/DetailSkeleton";
import { BooleanDisplay } from "./shared/BooleanDisplay";

interface CustomerProfileProps {
  customerId: number | string;
}

const safeJsonParse = (jsonString: string | null | undefined, fallback: any = []): any[] => {
  if (!jsonString) return fallback;
  try {
    let parsed = JSON.parse(jsonString);
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const isTruthy = (value: number | boolean | undefined | null): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  return false;
};

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customerId }) => {
  const { data: customer, isLoading, isError } = useCustomerDetails(customerId);

  const lifestyleFactors = useMemo(() => {
    if (!customer?.profile) return [];
    const p = customer.profile;
    return [
      { key: "smokes", label: "Smokes", value: isTruthy(p.smokes) },
      { key: "drinks", label: "Drinks Alcohol", value: isTruthy(p.drinks) },
      { key: "bruises_easily", label: "Bruises Easily", value: isTruthy(p.bruises_easily) },
      { key: "uses_retinoids_acids", label: "Uses Retinoids/Acids", value: isTruthy(p.uses_retinoids_acids) },
      { key: "recent_dermal_fillers", label: "Recent Dermal Fillers", value: isTruthy(p.recent_dermal_fillers) },
      { key: "first_facial_experience", label: "First Facial Experience", value: isTruthy(p.first_facial_experience) },
      { key: "recent_botox_fillers", label: "Recent Botox/Fillers", value: isTruthy(p.recent_botox_fillers) },
      { key: "taken_acne_medication", label: "Taken Acne Medication", value: isTruthy(p.taken_acne_medication) },
      { key: "has_allergies", label: "Has Allergies", value: isTruthy(p.has_allergies) },
      { key: "takes_supplements", label: "Takes Supplements", value: isTruthy(p.takes_supplements) },
      { key: "drinks_or_smokes", label: "Drinks or Smokes", value: isTruthy(p.drinks_or_smokes) },
    ].filter(f => f.value);
  }, [customer]);

  const usedProducts = useMemo(() => safeJsonParse(customer?.profile?.used_products), [customer]);

  const skinFeel = useMemo(() => {
    const value = customer?.profile?.skin_feel;
    const parsed = safeJsonParse(value, []);
    return parsed.length > 0 ? parsed : value ? [value] : [];
  }, [customer]);

  const formatDateTime = (date?: string) =>
    date ? new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) : "-";

  if (isLoading) return <DetailSkeleton />;
  if (isError) return <div className="p-10 text-center text-red-500">Error loading profile data</div>;
  if (!customer) return null;

  const p: any = customer.profile || {};

  return (
    <div className="p-8 space-y-10">
      {/* Contact Information */}
      <DetailSection title="Contact Information" icon={<User size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ContactInfo label="Full Name" value={customer.full_name || "-"} icon={<User size={18} />} />
          <ContactInfo label="Primary Phone" value={customer.phone || "-"} icon={<Phone size={18} />} />
          <ContactInfo label="Email Address" value={customer.email || "-"} icon={<Mail size={18} />} />
          <ContactInfo label="Address" value={customer.address || "-"} icon={<MapPin size={18} />} />
          <ContactInfo label="City" value={customer.city || "-"} icon={<MapPin size={18} />} />
          <ContactInfo label="Date of Birth" value={customer.birth_date || "-"} icon={<Calendar size={18} />} />
          <ContactInfo label="Age" value={customer.age?.toString() ?? "-"} icon={<User size={18} />} />
        </div>
      </DetailSection>

      {/* Emergency Contact & Source */}
      <DetailSection title="Emergency Contact & Source" icon={<AlertCircle size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContactInfo label="Emergency Contact Name" value={customer.emergency_contact_name || "-"} />
          <ContactInfo label="Emergency Contact Phone" value={customer.emergency_contact_phone || "-"} />
          <ContactInfo label="How They Heard About Us" value={customer.how_heard || "-"} />
        </div>
      </DetailSection>

      {/* Skin Profile */}
      <DetailSection title="Skin Profile" icon={<Droplet size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <InfoPill label="Skin Type" value={p.skin_type || "-"} />
          <InfoPill label="Skin Feel" value={skinFeel.length > 0 ? skinFeel.join(", ") : "-"} />
          <InfoPill label="Sun Exposure" value={p.sun_exposure || "-"} />
          <InfoPill label="Foundation Type" value={p.foundation_type || "-"} />
          <InfoPill label="Healing Profile" value={p.healing_profile || "-"} />
        </div>

        <div className="mt-6">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Used Products</p>
          <div className="flex flex-wrap gap-2">
            {usedProducts.length > 0 ? (
              usedProducts.map((prod: string, i: number) => <Tag key={i}>{prod}</Tag>)
            ) : (
              <span className="text-sm text-gray-500">-</span>
            )}
          </div>
        </div>
      </DetailSection>

      {/* Treatment Experience */}
      <DetailSection title="Treatment Experience" icon={<Calendar size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
              First Facial Experience
            </p>
            <BooleanDisplay
              value={isTruthy(p.first_facial_experience) ? 1 : 0}
              trueText="Yes (first time)"
              falseText="No (has previous experience)"
            />
          </div>

          <InfoPill
            label="Previous Treatment Likes"
            value={p.previous_treatment_likes || "-"}
          />

          <InfoPill
            label="Vitamin A Derivatives Usage"
            value={p.vitamin_a_derivatives || "-"}
          />
        </div>
      </DetailSection>

      {/* Medications & Allergies */}
      <DetailSection title="Medications & Allergies" icon={<FileText size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoPill label="Known Allergies" value={p.known_allergies_details || "-"} />
          <InfoPill label="Allergies Details" value={p.allergies_details || "-"} />
          <InfoPill label="Current Prescriptions" value={p.current_prescription || "-"} />
          <InfoPill label="Prescription Medications" value={p.prescription_meds || "-"} />
          <InfoPill label="Dietary Supplements" value={p.dietary_supplements || "-"} />
          <InfoPill label="Supplements Details" value={p.supplements_details || "-"} />
          <InfoPill label="Previous Acne Medication" value={p.previous_acne_medication || "-"} />
          <InfoPill label="Other Medication" value={p.other_medication || "-"} />
        </div>
      </DetailSection>

      {/* Health & Concerns */}
      <DetailSection title="Health & Concerns" icon={<Heart size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Skin Concerns</h3>
            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              {customer.skin_concerns?.length ? (
                customer.skin_concerns.map(c => <Tag key={c.id}>{c.name}</Tag>)
              ) : (
                <span className="text-sm text-gray-500">-</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Health Conditions</h3>
            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              {customer.health_conditions?.length ? (
                customer.health_conditions.map(c => <Tag key={c.id}>{c.name}</Tag>)
              ) : (
                <span className="text-sm text-gray-500">-</span>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <InfoPill label="Other Conditions" value={p.other_conditions || "-"} />
          </div>
        </div>

        {lifestyleFactors.length > 0 && (
          <div className="mt-8 pt-6 border-t border-rose-200/60">
            <h3 className="font-semibold text-gray-700 mb-4">Lifestyle Factors (Yes)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {lifestyleFactors.map(f => (
                <FactItem key={f.key} label={f.label} value={true} />
              ))}
            </div>
          </div>
        )}
      </DetailSection>


      {/* Notes */}
      <DetailSection title="Client Notes" icon={<MessageSquare size={20} />}>
        {customer.notes?.length ? (
          <div className="space-y-4">
            {customer.notes.map(note => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border ${
                  note.status === "pending"
                    ? "bg-yellow-50/70 border-yellow-100/60"
                    : "bg-rose-50/70 border-rose-100/60"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-gray-800">{note.author_name || "Unknown"}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDateTime(note.created_at)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{note.note_text || "-"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No notes found</p>
        )}
      </DetailSection>

      {/* Administrative Details */}
      <DetailSection title="Administrative Details" icon={<Settings size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <InfoPill label="Client ID" value={customer.id} />
          <InfoPill label="Profile ID" value={p.customer_id ?? "-"} />
          <InfoPill label="Record Created" value={formatDateTime(customer.created_at)} />
          <InfoPill label="Record Last Updated" value={formatDateTime(customer.updated_at)} />
        </div>
      </DetailSection>
    </div>
  );
};