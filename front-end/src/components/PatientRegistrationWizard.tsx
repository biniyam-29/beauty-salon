import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PartyPopper,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

// --- Consolidated Type Definitions ---
type PatientData = {
  // Personal Information
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  howHeard: string;
  initialNote: string;
  
  // Skin & Health Profile
  skinType: string;
  skinFeel: string;
  sunExposure: string;
  foundationType: string;
  healingProfile: string;
  bruisesEasily: boolean;
  usedProducts: string[];
  usedRetinoids: boolean;
  recentDermalFillers: boolean;
  acneMedicationDetails: string;
  allergies: string;
  supplements: string;
  otherMedication: string;
  alcoholOrSmoke: boolean;
  
  // Lookups
  skinConcerns: string[];
  healthConditions: string[];
  
  // Assignment
  assignedProfessionalId: string;
  
  // Optional fields
  id?: string;
  signature?: string;
  signatureDate?: string;
};

type ProfessionalData = {
  id: number;
  name: string;
  skills: string[];
};

type LookupItem = {
  id: number;
  name: string;
};

// --- API Functions ---
const API_BASE_URL = "https://beauty-api.biniyammarkos.com";

const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

const fetchLookups = async (): Promise<{
  concerns: LookupItem[];
  conditions: LookupItem[];
}> => {
  const token = getAuthToken();
  const headers = { Authorization: `Bearer ${token}` };
  const [concernsRes, conditionsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/lookups/skin-concerns`, { headers }),
    fetch(`${API_BASE_URL}/lookups/health-conditions`, { headers }),
  ]);
  if (!concernsRes.ok || !conditionsRes.ok) {
    throw new Error("Failed to fetch lookup data");
  }
  const concerns = await concernsRes.json();
  const conditions = await conditionsRes.json();
  return { concerns, conditions };
};

const fetchProfessionals = async (): Promise<ProfessionalData[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/users/role/doctor`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch professionals.");
  const data = await response.json();
  return data.users || [];
};

const registerPatient = async (payload: any): Promise<PatientData> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error(
        "A client with this phone number or email already exists."
      );
    }
    const errorBody = await response.json();
    throw new Error(
      errorBody.message || `An API error occurred: ${response.statusText}`
    );
  }
  return response.json();
};

// --- Modern UI Components ---
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/60",
      className
    )}
  >
    {children}
  </div>
);
const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 border-b border-rose-100">{children}</div>
);
const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("p-6", className)}>{children}</div>
);
const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-bold text-rose-800 font-sans">{children}</h2>
);
const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "ghost";
  }
> = ({ children, variant, className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-lg text-sm font-semibold px-5 py-2.5 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px",
      variant === "outline" &&
        "bg-transparent border border-rose-500 text-rose-600 hover:bg-rose-50",
      variant === "ghost" &&
        "bg-transparent shadow-none text-rose-600 hover:bg-rose-100/50",
      !variant && "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200",
      className
    )}
    {...props}
  >
    {children}
  </button>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { helperText?: string }> = (
  { helperText, ...props }
) => (
  <div className="space-y-1">
    <input
      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-3 bg-white/70"
      {...props}
    />
    {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
  </div>
);
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & { helperText?: string }> = (
  { children, helperText, ...props }
) => (
  <div className="mb-2">
    <label className="block text-sm font-bold text-gray-700" {...props}>
      {children}
    </label>
    {helperText && (
      <div className="flex items-center gap-1 mt-1">
        <HelpCircle size={12} className="text-gray-400" />
        <p className="text-xs text-gray-500">{helperText}</p>
      </div>
    )}
  </div>
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { helperText?: string }> = (
  { helperText, ...props }
) => (
  <div className="space-y-1">
    <textarea
      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-3 bg-white/70"
      {...props}
    />
    {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
  </div>
);
const Checkbox: React.FC<{
  children: React.ReactNode;
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  helperText?: string;
}> = ({ children, id, checked, onCheckedChange, helperText }) => (
  <div className="space-y-1">
    <label
      htmlFor={id}
      className={cn(
        "flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
        checked
          ? "bg-rose-50 border-rose-500"
          : "bg-white border-gray-200 hover:border-rose-300"
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 mt-0.5"
      />
      <div className="ml-3 block text-sm">
        <div className="font-medium text-gray-800">{children}</div>
        {helperText && <p className="text-xs text-gray-600 mt-1">{helperText}</p>}
      </div>
    </label>
  </div>
);
const Switch: React.FC<{
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  helperText?: string;
}> = ({ id, checked, onCheckedChange, label, helperText }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
    <div className="flex-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-800 cursor-pointer">
        {label}
      </label>
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
    <button
      type="button"
      id={id}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
        checked ? "bg-rose-600" : "bg-gray-200"
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  </div>
);
const Progress: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full bg-rose-100 rounded-full h-1.5">
    <div
      className="bg-gradient-to-r from-rose-400 to-rose-600 h-1.5 rounded-full"
      style={{ width: `${value}%`, transition: "width 0.5s ease-in-out" }}
    ></div>
  </div>
);

type StatusModalProps = {
  status: "success" | "error";
  message: string;
  onClose: () => void;
};
const StatusModal: React.FC<StatusModalProps> = ({
  status,
  message,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
    <div
      className={cn(
        "bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center border-t-4",
        status === "success" ? "border-green-500" : "border-red-500"
      )}
    >
      <div
        className={cn(
          "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full",
          status === "success" ? "bg-green-100" : "bg-red-100"
        )}
      >
        {status === "success" ? (
          <PartyPopper className="h-6 w-6 text-green-600" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-red-600" />
        )}
      </div>
      <h3
        className={cn(
          "text-lg leading-6 font-medium mt-4",
          status === "success" ? "text-green-900" : "text-red-900"
        )}
      >
        {status === "success" ? "Success!" : "Oops!"}
      </h3>
      <p className="text-sm text-gray-500 mt-2">{message}</p>
      <Button onClick={onClose} className="mt-6">
        Close
      </Button>
    </div>
  </div>
);

// --- Step Components ---
type StepProps = {
  formData: PatientData;
  updateFormData: (updates: Partial<PatientData>) => void;
  lookups: { concerns: LookupItem[]; conditions: LookupItem[] };
  professionals: ProfessionalData[];
  isLoading: boolean;
};

const PersonalInfoStep: React.FC<StepProps> = ({ formData, updateFormData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="md:col-span-2">
      <Label htmlFor="name" helperText="Full legal name as it appears on official documents">
        Full Name *
      </Label>
      <Input
        id="name"
        placeholder="e.g., Jane Doe"
        value={formData.name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        required
      />
    </div>

    <div>
      <Label htmlFor="phone" helperText="Primary contact number for appointments and reminders">
        Phone Number *
      </Label>
      <Input
        id="phone"
        placeholder="e.g., 0912345678"
        value={formData.phone}
        onChange={(e) => updateFormData({ phone: e.target.value })}
        required
      />
    </div>

    <div>
      <Label htmlFor="email" helperText="We'll send appointment confirmations and updates here">
        Email Address *
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="e.g., janedoe@example.com"
        value={formData.email}
        onChange={(e) => updateFormData({ email: e.target.value })}
        required
      />
    </div>

    <div>
      <Label htmlFor="address" helperText="Street address for billing and correspondence">
        Street Address
      </Label>
      <Input
        id="address"
        placeholder="e.g., 123 Main St"
        value={formData.address}
        onChange={(e) => updateFormData({ address: e.target.value })}
      />
    </div>

    <div>
      <Label htmlFor="city">City</Label>
      <Input
        id="city"
        placeholder="e.g., Addis Ababa"
        value={formData.city}
        onChange={(e) => updateFormData({ city: e.target.value })}
      />
    </div>

    <div>
      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
      <Input
        id="dateOfBirth"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
        required
      />
    </div>

    <div>
      <Label htmlFor="emergencyContactName" helperText="Person to contact in case of emergency">
        Emergency Contact Name
      </Label>
      <Input
        id="emergencyContactName"
        placeholder="e.g., John Doe"
        value={formData.emergencyContactName}
        onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
      />
    </div>

    <div>
      <Label htmlFor="emergencyContactPhone" helperText="Emergency contact's phone number">
        Emergency Contact Phone
      </Label>
      <Input
        id="emergencyContactPhone"
        placeholder="e.g., 09556671111"
        value={formData.emergencyContactPhone}
        onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
      />
    </div>

    <div className="md:col-span-2">
      <Label htmlFor="howHeard" helperText="Help us understand how clients find us">
        How did you hear about us?
      </Label>
      <select
        id="howHeard"
        className="w-full border rounded p-3 bg-white/70 border-gray-300 focus:border-rose-500 focus:ring-rose-500"
        value={formData.howHeard}
        onChange={(e) => updateFormData({ howHeard: e.target.value })}
      >
        <option value="">Select an option</option>
        <option value="Friend Referral">Friend Referral</option>
        <option value="Social Media">Social Media</option>
        <option value="Advertisement">Advertisement</option>
        <option value="Doctor Referral">Doctor Referral</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <div className="md:col-span-2">
      <Label htmlFor="initialNote" helperText="Any special considerations or notes for our team">
        Initial Note
      </Label>
      <Textarea
        id="initialNote"
        placeholder="Any special notes about the patient..."
        value={formData.initialNote}
        onChange={(e) => updateFormData({ initialNote: e.target.value })}
      />
    </div>
  </div>
);

const HealthHistoryStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  lookups,
  isLoading,
}) => {
  const toggleArrayItem = (field: keyof PatientData, value: string) => {
    const current = formData[field] as string[];
    updateFormData({
      [field]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  return (
    <div className="space-y-8">
      {/* Skin Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Skin Information</h3>
        
        <div>
          <Label helperText="Select your primary skin type">Skin Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Oily", "Dry", "Combination", "Normal"].map((type) => (
              <Checkbox
                key={type}
                id={`skin-type-${type}`}
                checked={formData.skinType === type}
                onCheckedChange={(checked) =>
                  updateFormData({ skinType: checked ? type : "" })
                }
              >
                {type}
              </Checkbox>
            ))}
          </div>
        </div>

        <div>
          <Label helperText="How does your skin typically feel? Select all that apply">
            How does your skin usually feel?
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Tight", "Itchy", "Rough", "Sensitive"].map((feel) => (
              <Checkbox
                key={feel}
                id={`skin-feel-${feel}`}
                checked={formData.skinFeel === feel}
                onCheckedChange={(checked) =>
                  updateFormData({ skinFeel: checked ? feel : "" })
                }
              >
                {feel}
              </Checkbox>
            ))}
          </div>
        </div>

        <div>
          <Label helperText="How often are you exposed to direct sunlight?">
            Sun Exposure
          </Label>
          <div className="flex flex-wrap gap-3">
            {["Rare", "Moderate", "Daily"].map((exp) => (
              <Checkbox
                key={exp}
                id={`sun-exposure-${exp}`}
                checked={formData.sunExposure === exp}
                onCheckedChange={(checked) =>
                  updateFormData({ sunExposure: checked ? exp : "" })
                }
              >
                {exp}
              </Checkbox>
            ))}
          </div>
        </div>

        <div>
          <Label helperText="What type of foundation do you prefer?">
            Preferred Foundation Type
          </Label>
          <div className="flex flex-wrap gap-3">
            {["Liquid", "Powder", "None"].map((ft) => (
              <Checkbox
                key={ft}
                id={`foundation-${ft}`}
                checked={formData.foundationType === ft}
                onCheckedChange={(checked) =>
                  updateFormData({ foundationType: checked ? ft : "" })
                }
              >
                {ft}
              </Checkbox>
            ))}
          </div>
        </div>
      </div>

      {/* Habits & Medical Conditions */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Habits & Medical Information</h3>
        
        <div className="space-y-3">
          <Switch
            id="bruisesEasily"
            label="I bruise easily"
            checked={formData.bruisesEasily}
            onCheckedChange={(checked) => updateFormData({ bruisesEasily: checked })}
            helperText="Important for treatment planning and safety"
          />
          
          <Switch
            id="usedRetinoids"
            label="I use retinoids or acids"
            checked={formData.usedRetinoids}
            onCheckedChange={(checked) => updateFormData({ usedRetinoids: checked })}
            helperText="e.g., Retin-A, Accutane, glycolic acid"
          />
          
          <Switch
            id="recentDermalFillers"
            label="I had dermal fillers recently"
            checked={formData.recentDermalFillers}
            onCheckedChange={(checked) => updateFormData({ recentDermalFillers: checked })}
            helperText="Within the last 6 months"
          />
          
          <Switch
            id="alcoholOrSmoke"
            label="I drink alcohol or smoke"
            checked={formData.alcoholOrSmoke}
            onCheckedChange={(checked) => updateFormData({ alcoholOrSmoke: checked })}
            helperText="Affects skin healing and treatment outcomes"
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="acneMedicationDetails" helperText="List any previous acne medications and when you used them">
            Previous Acne Medication History
          </Label>
          <Textarea
            id="acneMedicationDetails"
            placeholder="e.g., Accutane for 6 months in 2022, topical retinoids currently"
            value={formData.acneMedicationDetails}
            onChange={(e) => updateFormData({ acneMedicationDetails: e.target.value })}
          />

          <Label htmlFor="allergies" helperText="Any known allergies to medications, foods, or products">
            Known Allergies
          </Label>
          <Textarea
            id="allergies"
            placeholder="e.g., allergic to penicillin, shellfish, or specific skincare ingredients"
            value={formData.allergies}
            onChange={(e) => updateFormData({ allergies: e.target.value })}
          />

          <Label htmlFor="supplements" helperText="List any dietary supplements you're currently taking">
            Dietary Supplements
          </Label>
          <Textarea
            id="supplements"
            placeholder="e.g., Vitamin C, Iron, Omega-3, Probiotics"
            value={formData.supplements}
            onChange={(e) => updateFormData({ supplements: e.target.value })}
          />

          <Label htmlFor="otherMedication" helperText="Any other prescription or over-the-counter medications">
            Other Medications
          </Label>
          <Textarea
            id="otherMedication"
            placeholder="e.g., blood pressure medication, birth control, antidepressants"
            value={formData.otherMedication}
            onChange={(e) => updateFormData({ otherMedication: e.target.value })}
          />
        </div>
      </div>

      {/* Lookups */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Conditions & Concerns</h3>
        
        <div>
          <Label helperText="Select any health conditions that apply to you">
            Health Conditions
          </Label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Loading conditions...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lookups.conditions.map((c) => (
                <Checkbox
                  key={c.id}
                  id={`condition-${c.id}`}
                  checked={formData.healthConditions.includes(c.name)}
                  onCheckedChange={() => toggleArrayItem("healthConditions", c.name)}
                >
                  {c.name}
                </Checkbox>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label helperText="Select your primary skin concerns">
            Skin Concerns
          </Label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Loading concerns...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lookups.concerns.map((c) => (
                <Checkbox
                  key={c.id}
                  id={`concern-${c.id}`}
                  checked={formData.skinConcerns.includes(c.name)}
                  onCheckedChange={() => toggleArrayItem("skinConcerns", c.name)}
                >
                  {c.name}
                </Checkbox>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AssignmentStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  professionals,
  isLoading,
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold text-gray-800">Assign a Doctor / Professional</h3>
    <p className="text-gray-600 text-sm">
      Select a professional who will be primarily responsible for this client's care.
    </p>
    
    {isLoading ? (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          Loading professionals...
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professionals.map((prof) => (
          <label
            key={prof.id}
            className={cn(
              "flex items-start gap-3 border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-rose-300",
              formData.assignedProfessionalId === String(prof.id)
                ? "border-rose-500 bg-rose-50"
                : "border-gray-200 bg-white"
            )}
          >
            <input
              type="radio"
              name="professional"
              value={String(prof.id)}
              checked={formData.assignedProfessionalId === String(prof.id)}
              onChange={() =>
                updateFormData({ assignedProfessionalId: String(prof.id) })
              }
              className="mt-1 text-rose-600 focus:ring-rose-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800">{prof.name}</div>
              {prof.skills && prof.skills.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  Specialties: {prof.skills.join(", ")}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    )}
  </div>
);

const ConsentStep: React.FC<StepProps> = ({ formData }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Review Your Information</h3>
      <p className="text-gray-600">
        Please review all the information below carefully. Make sure everything is accurate before submitting your registration.
      </p>
    </div>

    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Personal Information</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Name:</span> {formData.name || "Not provided"}</p>
            <p><span className="font-medium">Phone:</span> {formData.phone}</p>
            <p><span className="font-medium">Email:</span> {formData.email || "Not provided"}</p>
            <p><span className="font-medium">Address:</span> {formData.address ? `${formData.address}, ${formData.city}` : "Not provided"}</p>
            <p><span className="font-medium">Date of Birth:</span> {formData.dateOfBirth || "Not provided"}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Emergency Contact</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Contact:</span> {formData.emergencyContactName || "Not provided"}</p>
            <p><span className="font-medium">Phone:</span> {formData.emergencyContactPhone || "Not provided"}</p>
            <p><span className="font-medium">How heard:</span> {formData.howHeard || "Not provided"}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-700 mb-3">Skin & Health Profile</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><span className="font-medium">Skin Type:</span> {formData.skinType || "Not specified"}</p>
            <p><span className="font-medium">Sun Exposure:</span> {formData.sunExposure || "Not specified"}</p>
            <p><span className="font-medium">Foundation Type:</span> {formData.foundationType || "Not specified"}</p>
            <p><span className="font-medium">Bruises Easily:</span> {formData.bruisesEasily ? "Yes" : "No"}</p>
            <p><span className="font-medium">Uses Retinoids:</span> {formData.usedRetinoids ? "Yes" : "No"}</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-medium">Recent Fillers:</span> {formData.recentDermalFillers ? "Yes" : "No"}</p>
            <p><span className="font-medium">Alcohol/Smoke:</span> {formData.alcoholOrSmoke ? "Yes" : "No"}</p>
            <p><span className="font-medium">Skin Concerns:</span> {formData.skinConcerns.length > 0 ? formData.skinConcerns.join(", ") : "None selected"}</p>
            <p><span className="font-medium">Health Conditions:</span> {formData.healthConditions.length > 0 ? formData.healthConditions.join(", ") : "None selected"}</p>
          </div>
        </div>
      </div>

      {formData.initialNote && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Additional Notes</h4>
          <p className="text-sm text-gray-600">{formData.initialNote}</p>
        </div>
      )}
    </div>

    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-rose-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-rose-800">Important Notice</h4>
          <p className="text-sm text-rose-700 mt-1">
            By submitting this form, you confirm that all information provided is accurate to the best of your knowledge. 
            This information will be used for treatment planning and medical safety purposes.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Wizard Component ---
const initialData: PatientData = {
  // Step 1 - Personal Info
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  dateOfBirth: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  howHeard: "",
  initialNote: "",

  // Step 2 - Health History (Profile)
  skinType: "",
  skinFeel: "",
  sunExposure: "",
  foundationType: "",
  healingProfile: "",
  bruisesEasily: false,
  usedProducts: [],
  usedRetinoids: false,
  recentDermalFillers: false,
  acneMedicationDetails: "",
  allergies: "",
  supplements: "",
  otherMedication: "",
  alcoholOrSmoke: false,

  // Step 2 - Lookups
  skinConcerns: [],
  healthConditions: [],

  // Step 3 - Assignment
  assignedProfessionalId: "",
};

// FIXED: Export the PatientData type for external use
export type { PatientData };

export const PatientRegistrationWizard: React.FC<{
  phone: string;
  onRegistrationComplete: (newUser: PatientData) => void;
}> = ({ phone, onRegistrationComplete }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PatientData>({
    ...initialData,
    phone,
  });
  const [newlyCreatedUser, setNewlyCreatedUser] = useState<PatientData | null>(
    null
  );

  const steps = [
    { name: "Personal Info", component: PersonalInfoStep },
    { name: "Health History", component: HealthHistoryStep },
    { name: "Assign Professional", component: AssignmentStep },
    { name: "Consent", component: ConsentStep },
  ];

  const lookupsQuery = useQuery({
    queryKey: ["lookups"],
    queryFn: fetchLookups,
  });
  const professionalsQuery = useQuery({
    queryKey: ["professionals"],
    queryFn: fetchProfessionals,
  });

  const registrationMutation = useMutation({
    mutationFn: registerPatient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setNewlyCreatedUser(data);
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
    },
  });

  const updateFormData = (updates: Partial<PatientData>) => {
    setFormData((prev: PatientData) => ({ ...prev, ...updates }));
  };

  const nextStep = () =>
    currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (currentStep < steps.length - 1) {
      nextStep();
      return;
    }

    const skinConcernsMap =
      lookupsQuery.data?.concerns.reduce(
        (acc, c) => ({ ...acc, [c.name]: c.id }),
        {} as Record<string, number>
      ) || {};
    const healthConditionsMap =
      lookupsQuery.data?.conditions.reduce(
        (acc, c) => ({ ...acc, [c.name]: c.id }),
        {} as Record<string, number>
      ) || {};

  const apiPayload = {
    full_name: formData.name,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
    city: formData.city,
    birth_date: formData.dateOfBirth,
    assigned_doctor_id: formData.assignedProfessionalId
      ? parseInt(formData.assignedProfessionalId, 10)
      : null,
    emergency_contact_name: formData.emergencyContactName,
    emergency_contact_phone: formData.emergencyContactPhone,
    how_heard: formData.howHeard,
    initial_note: formData.initialNote,
    profile: {
      skin_type: formData.skinType,
      skin_feel: formData.skinFeel,
      sun_exposure: formData.sunExposure,
      foundation_type: formData.foundationType,
      healing_profile: formData.healingProfile,
      bruises_easily: formData.bruisesEasily ? 1 : 0,
      used_products: formData.usedProducts,
      uses_retinoids_acids: formData.usedRetinoids ? 1 : 0,
      recent_dermal_fillers: formData.recentDermalFillers ? 1 : 0,
      previous_acne_medication: formData.acneMedicationDetails,
      known_allergies_details: formData.allergies,
      dietary_supplements: formData.supplements,
      other_medication: formData.otherMedication,
      drinks_smokes: formData.alcoholOrSmoke ? 1 : 0,
    },
    skin_concerns: formData.skinConcerns
      .map((name: string) => skinConcernsMap[name])
      .filter(Boolean),
    health_conditions: formData.healthConditions
      .map((name: string) => healthConditionsMap[name])
      .filter(Boolean),
  };

    registrationMutation.mutate(apiPayload);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  // FIXED: Proper modal state management
  const showSuccessModal = registrationMutation.isSuccess && newlyCreatedUser;
  const showErrorModal = registrationMutation.isError;

  const handleModalClose = () => {
    if (registrationMutation.isSuccess && newlyCreatedUser) {
      onRegistrationComplete(newlyCreatedUser);
    }
    registrationMutation.reset();
    navigate("/reception");
  };

  return (
    <div className="w-full bg-[#FDF8F5] p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* FIXED: Show success modal only on success */}
      {showSuccessModal && (
        <StatusModal
          status="success"
          message="Client registered successfully!"
          onClose={handleModalClose}
        />
      )}

      {/* FIXED: Show error modal only on error */}
      {showErrorModal && (
        <StatusModal
          status="error"
          message={registrationMutation.error?.message || "An error occurred during registration."}
          onClose={handleModalClose}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          New Client Registration
        </h1>
        <Button variant="ghost" onClick={() => navigate("/reception")}>
          <ChevronLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-72 lg:flex-shrink-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-rose-100/60 sticky top-8">
            <ol className="space-y-5">
              {steps.map((step, index) => (
                <li key={step.name} className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-all duration-300",
                      currentStep > index
                        ? "bg-rose-600 text-white border-rose-600"
                        : currentStep === index
                        ? "bg-white text-rose-700 border-rose-600 ring-2 ring-rose-200"
                        : "bg-gray-100 text-gray-400 border-gray-200"
                    )}
                  >
                    {currentStep > index ? <Check size={16} /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      "font-semibold transition-colors",
                      currentStep === index ? "text-rose-800" : "text-gray-500"
                    )}
                  >
                    {step.name}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-8 pt-6 border-t border-rose-100">
              <Progress value={progress} />
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>{steps[currentStep].name}</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[400px]">
                <CurrentStepComponent
                  formData={formData}
                  updateFormData={updateFormData}
                  lookups={
                    lookupsQuery.data || { concerns: [], conditions: [] }
                  }
                  professionals={professionalsQuery.data || []}
                  isLoading={
                    lookupsQuery.isLoading || professionalsQuery.isLoading
                  }
                />
              </CardContent>
            </Card>
            <div className="flex justify-between gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft /> Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button type="submit">
                  Next <ChevronRight />
                </Button>
              ) : (
                <Button type="submit" disabled={registrationMutation.isPending}>
                  {registrationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default PatientRegistrationWizard;
