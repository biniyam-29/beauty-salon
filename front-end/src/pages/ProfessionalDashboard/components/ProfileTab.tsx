import { useMemo } from "react";
import type { FC } from "react";
import { User, Droplet, Heart, Pill, Settings } from "lucide-react";
import type { Patient } from "../types";
import { safeJsonParse, formatDateTime } from "../services/utils";
import { DetailSection } from "./ui/DetailSection";
import { InfoPill } from "./ui/InfoPill";
import { Tag } from "./ui/Tag";
import { FactItem } from "./ui/FactItem";

interface ProfileTabProps {
  patient: Patient;
}

export const ProfileTab: FC<ProfileTabProps> = ({ patient }) => {
  const usedProducts = safeJsonParse(patient.profile?.used_products);
  const skinFeel = safeJsonParse(patient.profile?.skin_feel);

  const lifestyleFactors = useMemo(() => {
    if (!patient?.profile) return [];
    return [
      { key: "smokes", label: "Smokes", value: patient.profile.smokes },
      { key: "drinks", label: "Drinks Alcohol", value: patient.profile.drinks },
      { key: "bruises_easily", label: "Bruises Easily", value: patient.profile.bruises_easily },
      { key: "uses_retinoids_acids", label: "Uses Retinoids/Acids", value: patient.profile.uses_retinoids_acids },
      { key: "recent_dermal_fillers", label: "Recent Dermal Fillers", value: patient.profile.recent_dermal_fillers },
    ].filter((factor) => factor.value === 1);
  }, [patient]);

  return (
    <>
      <DetailSection title="Personal Information" icon={<User size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <InfoPill label="Address" value={patient.address} />
          <InfoPill label="City" value={patient.city} />
          <InfoPill label="Date of Birth" value={patient.birth_date} />
          <InfoPill label="Age" value={patient.age} />
          <InfoPill
            label="Emergency Contact"
            value={
              patient.emergency_contact_name
                ? `${patient.emergency_contact_name} (${patient.emergency_contact_phone || "N/A"})`
                : null
            }
          />
          <InfoPill label="How They Heard" value={patient.how_heard} />
        </div>
      </DetailSection>

      <DetailSection title="Skin Profile" icon={<Droplet size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <InfoPill label="Skin Type" value={patient.profile?.skin_type} />
          <InfoPill label="Skin Feel" value={skinFeel.join(", ")} />
          <InfoPill label="Sun Exposure" value={patient.profile?.sun_exposure} />
          <InfoPill label="Foundation Type" value={patient.profile?.foundation_type} />
        </div>
        {usedProducts.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Used Products</p>
            <div className="flex flex-wrap gap-2">
              {usedProducts.map((p, i) => (<Tag key={i}>{p}</Tag>))}
            </div>
          </div>
        )}
      </DetailSection>

      <DetailSection title="Medications & Allergies" icon={<Pill size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoPill label="Known Allergies" value={patient.profile.known_allergies_details} />
          <InfoPill label="Current Prescriptions" value={patient.profile.current_prescription} />
          <InfoPill label="Dietary Supplements" value={patient.profile.dietary_supplements} />
          <InfoPill label="Previous Acne Medication" value={patient.profile.previous_acne_medication} />
          <InfoPill label="Other Medication" value={patient.profile.other_medication} />
        </div>
      </DetailSection>

      <DetailSection title="Health & Concerns" icon={<Heart size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Skin Concerns</h3>
            <div className="flex flex-wrap gap-2">
              {(patient.skin_concerns?.length ?? 0) > 0 ? (
                patient.skin_concerns?.map((c) => (<Tag key={c.id}>{c.name}</Tag>))
              ) : (<p className="text-sm text-gray-500">None listed.</p>)}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Health Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {(patient.health_conditions?.length ?? 0) > 0 ? (
                patient.health_conditions?.map((c) => (<Tag key={c.id}>{c.name}</Tag>))
              ) : (<p className="text-sm text-gray-500">None listed.</p>)}
            </div>
          </div>
          <div className="md:col-span-2">
            <InfoPill label="Other Conditions" value={patient.profile.other_conditions} />
          </div>
          <div className="md:col-span-2">
            <InfoPill label="Healing Profile" value={patient.profile.healing_profile} />
          </div>
        </div>
        {lifestyleFactors.length > 0 && (
          <div className="mt-8 pt-6 border-t border-rose-200/60">
            <h3 className="font-semibold text-gray-700 mb-4">Lifestyle & Health Factors</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {lifestyleFactors.map((factor) => (
                <FactItem key={factor.key} label={factor.label} value={true} />
              ))}
            </div>
          </div>
        )}
      </DetailSection>

      <DetailSection title="Administrative Details" icon={<Settings size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <InfoPill label="Patient ID" value={patient.id} />
          <InfoPill label="Assigned Doctor ID" value={patient.assigned_doctor_id} />
          <InfoPill label="Record Created" value={formatDateTime(patient.created_at)} />
          <InfoPill label="Record Last Updated" value={formatDateTime(patient.updated_at)} />
        </div>
      </DetailSection>
    </>
  );
};