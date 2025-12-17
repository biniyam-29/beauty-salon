import { useMemo } from "react";
import type { FC } from "react";
import { 
  User, Droplet, Heart, Pill, Settings, 
  Phone, Mail, Calendar, MapPin, AlertCircle,
  Sun, Thermometer, Shield, FileText, Star,
  Activity, Clock, ShieldCheck, ClipboardCheck,
  Stethoscope, BriefcaseMedical, Syringe, Eye
} from "lucide-react";
import type { Note, Patient } from "../types";
import { safeJsonParse, formatDateTime } from "../services/utils";
import { DetailSection } from "./ui/DetailSection";
import { InfoPill } from "./ui/InfoPill";
import { Tag } from "./ui/Tag";

// Color utilities for consistent theming
const sectionColors = {
  personal: { bg: "from-blue-50 to-indigo-50", border: "border-blue-200", icon: "text-blue-600" },
  contact: { bg: "from-emerald-50 to-teal-50", border: "border-emerald-200", icon: "text-emerald-600" },
  emergency: { bg: "from-rose-50 to-pink-50", border: "border-rose-200", icon: "text-rose-600" },
  skin: { bg: "from-purple-50 to-violet-50", border: "border-purple-200", icon: "text-purple-600" },
  health: { bg: "from-pink-50 to-rose-50", border: "border-pink-200", icon: "text-pink-600" },
  medical: { bg: "from-amber-50 to-orange-50", border: "border-amber-200", icon: "text-amber-600" },
  treatment: { bg: "from-cyan-50 to-sky-50", border: "border-cyan-200", icon: "text-cyan-600" },
  allergies: { bg: "from-red-50 to-orange-50", border: "border-red-200", icon: "text-red-600" },
  admin: { bg: "from-slate-50 to-gray-50", border: "border-gray-200", icon: "text-gray-600" },
  notes: { bg: "from-lime-50 to-green-50", border: "border-lime-200", icon: "text-lime-600" }
};

interface ProfileTabProps {
  patient: Patient;
}

export const ProfileTab: FC<ProfileTabProps> = ({ patient }) => {
  const usedProducts = safeJsonParse(patient.profile?.used_products || "[]");
  const skinFeel = safeJsonParse(patient.profile?.skin_feel || "[]");

  const lifestyleFactors = useMemo(() => {
    if (!patient?.profile) return [];
    return [
      { 
        key: "smokes", 
        label: "Smokes", 
        value: patient.profile.drinks_or_smokes === 1,
        icon: Activity,
        color: "text-red-500"
      },
      { 
        key: "bruises_easily", 
        label: "Bruises Easily", 
        value: patient.profile.bruises_easily === 1,
        icon: AlertCircle,
        color: "text-amber-500"
      },
      { 
        key: "uses_retinoids_acids", 
        label: "Uses Retinoids/Acids", 
        value: patient.profile.uses_retinoids_acids === 1,
        icon: Thermometer,
        color: "text-purple-500"
      },
      { 
        key: "recent_dermal_fillers", 
        label: "Recent Dermal Fillers", 
        value: patient.profile.recent_dermal_fillers === 1,
        icon: Shield,
        color: "text-cyan-500"
      },
      { 
        key: "recent_botox_fillers", 
        label: "Recent Botox", 
        value: patient.profile.recent_botox_fillers === 1,
        icon: Syringe,
        color: "text-indigo-500"
      },
    ].filter((factor) => factor.value);
  }, [patient]);

  const treatmentHistoryItems = useMemo(() => {
    const items = [];
    if (patient.profile?.skin_care_history) items.push({
      title: "Skin Care History",
      content: patient.profile.skin_care_history,
      icon: <Stethoscope size={14} className="text-cyan-500" />
    });
    if (patient.profile?.previous_treatment_likes) items.push({
      title: "Previous Treatment Likes",
      content: patient.profile.previous_treatment_likes,
      icon: <ClipboardCheck size={14} className="text-cyan-500" />
    });
    if (patient.profile?.vitamin_a_derivatives) items.push({
      title: "Vitamin A Derivatives",
      content: patient.profile.vitamin_a_derivatives,
      icon: <BriefcaseMedical size={14} className="text-cyan-500" />
    });
    if (patient.profile?.previous_acne_medication) items.push({
      title: "Previous Acne Medication",
      content: patient.profile.previous_acne_medication,
      icon: <Pill size={14} className="text-cyan-500" />
    });
    return items;
  }, [patient.profile]);

  const medicalInfoItems = useMemo(() => {
    const items = [];
    if (patient.profile?.supplements_details) items.push({ 
      label: "Supplements", 
      value: patient.profile.supplements_details,
      icon: <Pill size={14} className="text-amber-500" />
    });
    if (patient.profile?.prescription_meds) items.push({ 
      label: "Prescription Meds", 
      value: patient.profile.prescription_meds,
      icon: <BriefcaseMedical size={14} className="text-amber-500" />
    });
    if (patient.profile?.other_conditions) items.push({ 
      label: "Other Conditions", 
      value: patient.profile.other_conditions,
      icon: <AlertCircle size={14} className="text-amber-500" />
    });
    if (patient.profile?.other_medication) items.push({ 
      label: "Other Medication", 
      value: patient.profile.other_medication,
      icon: <Syringe size={14} className="text-amber-500" />
    });
    return items;
  }, [patient.profile]);

  return (
    <div className="space-y-6">
      {/* Personal Information - Enhanced */}
      <DetailSection title="Personal Information" icon={<User className={sectionColors.personal.icon} size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`bg-gradient-to-br ${sectionColors.personal.bg} p-4 rounded-xl border ${sectionColors.personal.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-blue-500" />
              <h3 className="font-semibold text-gray-700">Basic Info</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-blue-400" />
                <span className="text-sm text-gray-600">Born: {patient.birth_date} ({patient.age} years)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-blue-400" />
                <span className="text-sm text-gray-600">{patient.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={14} className="text-blue-400" />
                <span className="text-sm text-gray-600">Heard via: {patient.how_heard || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${sectionColors.contact.bg} p-4 rounded-xl border ${sectionColors.contact.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-700">Contact Details</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400" />
                <a href={`tel:${patient.phone}`} className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  {patient.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-400" />
                <a href={`mailto:${patient.email}`} className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  {patient.email}
                </a>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${sectionColors.emergency.bg} p-4 rounded-xl border ${sectionColors.emergency.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-rose-500" />
              <h3 className="font-semibold text-gray-700">Emergency Contact</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">{patient.emergency_contact_name}</p>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-rose-400" />
                <a href={`tel:${patient.emergency_contact_phone}`} className="text-sm text-gray-600 hover:text-rose-600 transition-colors">
                  {patient.emergency_contact_phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <InfoPill 
            label="Full Address" 
            value={patient.address} 
            // className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
          />
        </div>
      </DetailSection>

      {/* Skin Profile - Enhanced */}
      <DetailSection title="Skin Profile & Analysis" icon={<Droplet className={sectionColors.skin.icon} size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className={`bg-gradient-to-br ${sectionColors.skin.bg} p-4 rounded-xl border ${sectionColors.skin.border}`}>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Thermometer size={16} className="text-purple-500" />
                Skin Characteristics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Skin Type</p>
                  <Badge skinType={patient.profile?.skin_type?.toLowerCase()}>
                    {patient.profile?.skin_type || "Not specified"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Skin Feel</p>
                  <div className="flex flex-wrap gap-1">
                    {skinFeel.map((feel, i) => (
                      <Badge key={i} variant="outline">{feel}</Badge>
                    ))}
                    {skinFeel.length === 0 && <span className="text-sm text-gray-500">Not specified</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sun Exposure</p>
                  <Badge variant="sun">{patient.profile?.sun_exposure || "Not specified"}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Foundation</p>
                  <Badge variant="product">{patient.profile?.foundation_type || "Not specified"}</Badge>
                </div>
              </div>
            </div>

            {patient.profile?.healing_profile && (
              <div className={`bg-gradient-to-br ${sectionColors.health.bg} p-4 rounded-xl border ${sectionColors.health.border}`}>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-pink-500" />
                  Healing Profile
                </h3>
                <p className="text-sm text-gray-600">{patient.profile.healing_profile}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className={`bg-gradient-to-br ${sectionColors.treatment.bg} p-4 rounded-xl border ${sectionColors.treatment.border}`}>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Sun size={16} className="text-cyan-500" />
                Sun Exposure & Products
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Used Products</p>
                  <div className="flex flex-wrap gap-2">
                    {usedProducts.length > 0 ? (
                      usedProducts.map((product, i) => (
                        <Tag key={i} 
                        // variant="product"
                        >
                          {product}
                        </Tag>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No products listed</p>
                    )}
                  </div>
                </div>
                {patient.profile?.skin_care_history && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Skin Care History</p>
                    <p className="text-sm text-gray-700">{patient.profile.skin_care_history}</p>
                  </div>
                )}
              </div>
            </div>

            {lifestyleFactors.length > 0 && (
              <div className={`bg-gradient-to-br ${sectionColors.allergies.bg} p-4 rounded-xl border ${sectionColors.allergies.border}`}>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  Important Health Factors
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {lifestyleFactors.map((factor) => (
                    <div key={factor.key} className="flex items-center gap-2">
                      <factor.icon size={14} className={factor.color} />
                      <span className="text-sm text-gray-700">{factor.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DetailSection>

      {/* Medical History & Allergies */}
      <DetailSection title="Medical History & Allergies" icon={<Pill className={sectionColors.medical.icon} size={20} />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allergies & Medications */}
          <div className="space-y-4">
            <div className={`bg-gradient-to-br ${sectionColors.allergies.bg} p-4 rounded-xl border ${sectionColors.allergies.border}`}>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                Allergies & Reactions
              </h3>
              <div className="space-y-3">
                <InfoPill 
                  label="Known Allergies" 
                  value={patient.profile?.known_allergies_details || "None reported"} 
                  // variant={patient.profile?.known_allergies_details ? "warning" : "default"}
                  // icon={<AlertCircle size={14} />}
                />
                <InfoPill 
                  label="Current Prescriptions" 
                  value={patient.profile?.current_prescription || "None"} 
                  // icon={<BriefcaseMedical size={14} />}
                />
                <InfoPill 
                  label="Dietary Supplements" 
                  value={patient.profile?.dietary_supplements || "None"} 
                  // icon={<Pill size={14} />}
                />
              </div>
            </div>

            {/* Additional Medical Info */}
            {medicalInfoItems.length > 0 && (
              <div className={`bg-gradient-to-br ${sectionColors.medical.bg} p-4 rounded-xl border ${sectionColors.medical.border}`}>
                <h3 className="font-semibold text-gray-700 mb-3">Additional Medical Information</h3>
                <div className="space-y-3">
                  {medicalInfoItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">{item.icon}</div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className="text-sm text-gray-700">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Treatment History */}
          <div className="space-y-4">
            <div className={`bg-gradient-to-br ${sectionColors.treatment.bg} p-4 rounded-xl border ${sectionColors.treatment.border}`}>
              <h3 className="font-semibold text-gray-700 mb-3">Treatment History</h3>
              <div className="space-y-3">
                {treatmentHistoryItems.length > 0 ? (
                  treatmentHistoryItems.map((item, index) => (
                    <div key={index} className="bg-white/70 p-3 rounded-lg border border-cyan-100">
                      <div className="flex items-center gap-2 mb-1">
                        {item.icon}
                        <h4 className="text-sm font-medium text-gray-700">{item.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{item.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No treatment history available</p>
                )}
              </div>
            </div>

            {/* Vitamin A Derivatives */}
            {patient.profile?.vitamin_a_derivatives && (
              <div className={`bg-gradient-to-br ${sectionColors.health.bg} p-4 rounded-xl border ${sectionColors.health.border}`}>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Eye size={16} className="text-pink-500" />
                  Vitamin A Derivatives History
                </h3>
                <p className="text-sm text-gray-600">{patient.profile.vitamin_a_derivatives}</p>
              </div>
            )}
          </div>
        </div>
      </DetailSection>

      {/* Health Conditions & Concerns */}
      <DetailSection title="Health Conditions & Concerns" icon={<Heart className={sectionColors.health.icon} size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`bg-gradient-to-br ${sectionColors.health.bg} p-5 rounded-xl border ${sectionColors.health.border}`}>
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Droplet size={16} className="text-pink-500" />
              Skin Concerns
            </h3>
            <div className="flex flex-wrap gap-2">
              {(patient.skin_concerns?.length ?? 0) > 0 ? (
                patient.skin_concerns?.map((c) => (
                  <Badge key={c.id} variant="concern">
                    {c.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No skin concerns listed</p>
              )}
            </div>
          </div>

          <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-200`}>
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Heart size={16} className="text-indigo-500" />
              Health Conditions
            </h3>
            <div className="flex flex-wrap gap-2">
              {(patient.health_conditions?.length ?? 0) > 0 ? (
                patient.health_conditions?.map((c) => (
                  <Badge key={c.id} variant="condition">
                    {c.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No health conditions listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Other Conditions */}
        {patient.profile?.other_conditions && (
          <div className={`bg-gradient-to-br ${sectionColors.medical.bg} p-4 rounded-xl border ${sectionColors.medical.border}`}>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              Other Medical Conditions
            </h3>
            <p className="text-sm text-gray-600">{patient.profile.other_conditions}</p>
          </div>
        )}

        {/* Consents */}
        {/* <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-3">Consents & Agreements</h3>
          <div className={`bg-gradient-to-br ${sectionColors.admin.bg} p-4 rounded-xl border ${sectionColors.admin.border}`}>
            {(patient.consents?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {patient.consents?.map((consent, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-green-500" />
                    <span className="text-sm text-gray-700">{consent.name || `Consent ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No consents recorded</p>
            )}
          </div>
        </div> */}
      </DetailSection>

      {/* Notes Section */}
      {(patient.notes?.length ?? 0) > 0 && (
        <DetailSection title="Clinical Notes" icon={<FileText className={sectionColors.notes.icon} size={20} />}>
          <div className="space-y-4">
            {patient.notes?.map((note: Note) => (
              <div 
                key={note.id} 
                className={`bg-gradient-to-br p-4 rounded-xl border ${
                  note.status === 'pending' 
                    ? 'from-amber-50 to-orange-50 border-amber-200' 
                    : 'from-emerald-50 to-green-50 border-emerald-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className={note.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'} />
                    <div>
                      <span className="font-medium text-gray-700">{note.author_name}</span>
                      <span className="text-xs text-gray-500 ml-2">{formatDateTime(note.created_at)}</span>
                    </div>
                  </div>
                  <Badge variant={note.status === 'pending' ? 'warning' : 'success'}>
                    {note.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">{note.note_text}</p>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {/* Administrative Details */}
      <DetailSection title="Administrative Details" icon={<Settings className={sectionColors.admin.icon} size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <User size={12} />
              Patient ID
            </p>
            <p className="font-mono text-sm text-gray-700">{patient.id}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Stethoscope size={12} />
              Doctor ID
            </p>
            <p className="font-mono text-sm text-gray-700">{patient.assigned_doctor_id || "Not assigned"}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Clock size={12} />
              Created
            </p>
            <span className="text-sm text-gray-700">{formatDateTime(patient.created_at)}</span>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Clock size={12} />
              Updated
            </p>
            <span className="text-sm text-gray-700">{formatDateTime(patient.updated_at)}</span>
          </div>
        </div>
      </DetailSection>
    </div>
  );
};

// Enhanced Badge Component with more colors
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "concern" | "condition" | "product" | "warning" | "success" | "sun";
  skinType?: string;
  className?: string;
}

const Badge: FC<BadgeProps> = ({ children, variant = "default", skinType, className }) => {
  // Determine variant based on skin type if provided
  let actualVariant = variant;
  if (skinType) {
    if (skinType.includes('oily')) actualVariant = "warning";
    else if (skinType.includes('dry')) actualVariant = "default";
    else if (skinType.includes('normal')) actualVariant = "success";
    else if (skinType.includes('combination')) actualVariant = "product";
  }

  const variantClasses = {
    default: "bg-gray-100 text-gray-800 border border-gray-200",
    outline: "bg-white text-gray-700 border border-gray-300",
    concern: "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border border-pink-200",
    condition: "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200",
    product: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200",
    warning: "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200",
    success: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200",
    sun: "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border border-amber-200",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[actualVariant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};