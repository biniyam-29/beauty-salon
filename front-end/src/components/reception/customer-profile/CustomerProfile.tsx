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

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customerId,
}) => {
  const {
    data: customer,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
  } = useCustomerDetails(customerId);

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

  const usedProducts = safeJsonParse(customer?.profile?.used_products);
  const skinFeel = safeJsonParse(customer?.profile?.skin_feel);

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

  if (isCustomerLoading) return <DetailSkeleton />;

  if (isCustomerError) {
    return (
      <div className="p-10 text-center text-red-500">
        Error loading profile data.
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="p-8">
      {/* Contact Information */}
      <DetailSection title="Contact Information" icon={<User size={20} />}>
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

      {/* Emergency Contact */}
      <DetailSection title="Emergency Contact" icon={<AlertCircle size={20} />}>
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

      {/* Skin Profile */}
      <DetailSection title="Skin Profile" icon={<Droplet size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <InfoPill label="Skin Type" value={customer.profile?.skin_type} />
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

      {/* Treatment Experience & Goals */}
      <DetailSection title="Treatment Experience & Goals" icon={<Calendar size={20} />}>
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

      {/* Medications & Allergies */}
      <DetailSection title="Medications & Allergies" icon={<FileText size={20} />}>
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

      {/* Health & Concerns */}
      <DetailSection title="Health & Concerns" icon={<Heart size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Skin Concerns</h3>
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
                <FactItem key={factor.key} label={factor.label} value={true} />
              ))}
            </div>
          </div>
        )}
      </DetailSection>

      {/* Client Notes */}
      <DetailSection title="Client Notes" icon={<MessageSquare size={20} />}>
        <div className="space-y-4">
          {(customer.notes?.length ?? 0) > 0 ? (
            customer.notes?.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-rose-50/70 rounded-lg border border-rose-100/60"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-gray-800">
                    {note.author_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDateTime(note.created_at)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {note.note_text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No notes found for this client.</p>
          )}
        </div>
      </DetailSection>

      {/* Administrative Details */}
      <DetailSection title="Administrative Details" icon={<Settings size={20} />}>
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
    </div>
  );
};