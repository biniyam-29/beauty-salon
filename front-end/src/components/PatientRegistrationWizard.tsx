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
} from "lucide-react";

// --- FIXED: Type definitions are now self-contained in this file ---
type PatientData = {
  name: string;
  address: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  heardFrom: string;
  skinType: string;
  skinFeel: string[];
  sunExposure: string;
  foundationType: string;
  skinHeal: string;
  bruiseEasily: boolean;
  usedProducts: string[];
  otherProducts: string;
  skinConcerns: string[];
  firstFacial: boolean;
  previousTreatmentLikes: string;
  treatmentGoal: string;
  usedRetinoids: boolean;
  hadFillers: boolean;
  acneMedication: boolean;
  acneMedicationDetails: string;
  healthConditions: string[];
  otherConditions: string;
  knownAllergies: boolean;
  supplements: boolean;
  alcoholOrSmoke: boolean;
  signature: string;
  signatureDate: string;
  prescriptionMeds: boolean;
  assignedProfessionalId?: string | null;
  conclusionNote?: string;
  id?: string;
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
    const errorBody = await response.json();
    throw new Error(errorBody.message || "An unknown error occurred.");
  }
  return response.json();
};

// --- Modern UI Components (Unchanged) ---
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
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => (
  <input
    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-3 bg-white/70"
    {...props}
  />
);
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (
  props
) => (
  <label className="block text-sm font-bold text-gray-700 mb-2" {...props} />
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (
  props
) => (
  <textarea
    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-3 bg-white/70"
    {...props}
  />
);
const Checkbox: React.FC<{
  children: React.ReactNode;
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ children, id, checked, onCheckedChange }) => (
  <label
    htmlFor={id}
    className={cn(
      "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
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
      className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
    />
    <span className="ml-3 block text-sm font-medium text-gray-800">
      {children}
    </span>
  </label>
);
const Switch: React.FC<{
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ checked, onCheckedChange }) => (
  <button
    type="button"
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

const PersonalInfoStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
    <div className="md:col-span-2">
      <Label htmlFor="name">Full Name *</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        required
      />
    </div>
    <div>
      <Label htmlFor="phone">Phone *</Label>
      <Input
        id="phone"
        value={formData.phone}
        onChange={(e) => updateFormData({ phone: e.target.value })}
        required
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
  </div>
);

const HealthHistoryStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  lookups,
  isLoading,
}) => {
  const handleMultiSelect = (
    field: "healthConditions" | "skinConcerns",
    value: string
  ) => {
    const currentArray = formData[field] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFormData({ [field]: updatedArray });
  };
  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">
          Do you have any of these health conditions?
        </Label>
        {isLoading ? (
          <p>Loading options...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {lookups.conditions.map((item) => (
              <Checkbox
                key={item.id}
                id={`health-${item.id}`}
                checked={formData.healthConditions.includes(item.name)}
                onCheckedChange={() =>
                  handleMultiSelect("healthConditions", item.name)
                }
              >
                {item.name}
              </Checkbox>
            ))}
          </div>
        )}
      </div>
      <div>
        <Label className="text-base">Please select your skin concerns.</Label>
        {isLoading ? (
          <p>Loading options...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {lookups.concerns.map((item) => (
              <Checkbox
                key={item.id}
                id={`concern-${item.id}`}
                checked={formData.skinConcerns.includes(item.name)}
                onCheckedChange={() =>
                  handleMultiSelect("skinConcerns", item.name)
                }
              >
                {item.name}
              </Checkbox>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <Label htmlFor="usedRetinoids" className="mb-0">
            Used Retin-A, Accutane, etc.?
          </Label>
          <Switch
            id="usedRetinoids"
            checked={formData.usedRetinoids}
            onCheckedChange={(c) => updateFormData({ usedRetinoids: c })}
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <Label htmlFor="acneMedication" className="mb-0">
            Taken acne medication before?
          </Label>
          <Switch
            id="acneMedication"
            checked={formData.acneMedication}
            onCheckedChange={(c) => updateFormData({ acneMedication: c })}
          />
        </div>
        {formData.acneMedication && (
          <Textarea
            value={formData.acneMedicationDetails}
            onChange={(e) =>
              updateFormData({ acneMedicationDetails: e.target.value })
            }
            placeholder="Please specify medication and dates..."
          />
        )}
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
  <div className="space-y-6">
    <div>
      <Label htmlFor="conclusionNote">Notes for the Professional</Label>
      <Textarea
        id="conclusionNote"
        value={formData.conclusionNote || ""}
        onChange={(e) => updateFormData({ conclusionNote: e.target.value })}
        placeholder="e.g., Client is particularly concerned about hyperpigmentation..."
        rows={4}
      />
    </div>
    <div>
      <Label>Assign a Professional</Label>
      {isLoading ? (
        <p>Loading professionals...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto p-2 bg-gray-50/50 rounded-lg">
          {professionals.map((prof) => (
            <label
              key={prof.id}
              htmlFor={`prof-${prof.id}`}
              className={cn(
                "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                formData.assignedProfessionalId === String(prof.id)
                  ? "bg-rose-50 border-rose-500"
                  : "bg-white border-gray-200 hover:border-rose-300"
              )}
            >
              <input
                type="radio"
                id={`prof-${prof.id}`}
                value={String(prof.id)}
                name="professional"
                checked={formData.assignedProfessionalId === String(prof.id)}
                onChange={() =>
                  updateFormData({ assignedProfessionalId: String(prof.id) })
                }
                className="h-4 w-4 text-rose-600 border-gray-300 focus:ring-rose-500"
              />
              <span className="ml-3 font-semibold text-gray-800">
                {prof.name}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  </div>
);

const ConsentStep: React.FC<StepProps> = ({ formData, updateFormData }) => (
  <div className="space-y-6 text-center flex flex-col items-center">
    <div className="bg-rose-50/50 rounded-lg p-6 w-full max-w-md">
      <h3 className="text-xl font-bold text-rose-800 mb-2">
        Consent & Signature
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Please confirm the details are correct and provide your signature.
      </p>
      <div className="text-sm text-gray-700 space-y-2 text-left bg-white p-4 rounded-md">
        <p>
          <strong>Patient:</strong> {formData.name || "..."}
        </p>
        <p>
          <strong>Primary Concerns:</strong>{" "}
          {formData.skinConcerns.join(", ") || "None"}
        </p>
        <p>
          <strong>Assigned To:</strong>{" "}
          {formData.assignedProfessionalId
            ? "Professional ID " + formData.assignedProfessionalId
            : "Not Assigned"}
        </p>
      </div>
    </div>
    <div>
      <Label htmlFor="signature">Client Signature *</Label>
      <Input
        id="signature"
        value={formData.signature}
        onChange={(e) => updateFormData({ signature: e.target.value })}
        placeholder="Type your full name"
        className="text-center font-serif text-xl"
        required
      />
    </div>
  </div>
);

// --- Main Wizard Component ---
const initialData: PatientData = {
  name: "",
  address: "",
  phone: "",
  city: "",
  dateOfBirth: "",
  email: "",
  emergencyContact: "",
  emergencyPhone: "",
  skinType: "",
  skinFeel: [],
  sunExposure: "",
  usedProducts: [],
  skinConcerns: [],
  usedRetinoids: false,
  acneMedication: false,
  acneMedicationDetails: "",
  healthConditions: [],
  alcoholOrSmoke: false,
  signature: "",
  assignedProfessionalId: null,
  conclusionNote: "",
  heardFrom: "",
  foundationType: "",
  skinHeal: "",
  bruiseEasily: false,
  otherProducts: "",
  firstFacial: true,
  previousTreatmentLikes: "",
  treatmentGoal: "",
  hadFillers: false,
  otherConditions: "",
  knownAllergies: false,
  supplements: false,
  signatureDate: "",
  prescriptionMeds: false,
};

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
    onError: (error) => {
      console.error(error);
    },
  });

  const updateFormData = (updates: Partial<PatientData>) => {
    // ** FIXED: Added explicit type for 'prev' parameter **
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
      birth_date: formData.dateOfBirth,
      assigned_doctor_id: formData.assignedProfessionalId
        ? parseInt(formData.assignedProfessionalId, 10)
        : null,
      profile: {
        skin_type: formData.skinType,
        skin_feel: JSON.stringify(formData.skinFeel),
        sun_exposure: formData.sunExposure,
        used_products: JSON.stringify(formData.usedProducts),
        uses_retinoids_acids: formData.usedRetinoids,
        previous_acne_medication: formData.acneMedicationDetails,
        drinks_smokes: formData.alcoholOrSmoke,
      },
      // ** FIXED: Added explicit type for 'name' parameter **
      skin_concerns: formData.skinConcerns
        .map((name: string) => skinConcernsMap[name])
        .filter(Boolean),
      // ** FIXED: Added explicit type for 'name' parameter **
      health_conditions: formData.healthConditions
        .map((name: string) => healthConditionsMap[name])
        .filter(Boolean),
    };
    registrationMutation.mutate(apiPayload);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="w-full bg-[#FDF8F5] p-4 sm:p-6 lg:p-8 min-h-screen">
      {registrationMutation.status !== "idle" && (
        <StatusModal
          status={registrationMutation.isSuccess ? "success" : "error"}
          message={
            registrationMutation.isSuccess
              ? "Client registered successfully!"
              : registrationMutation.error?.message || "An error occurred."
          }
          onClose={() => {
            const wasSuccess = registrationMutation.isSuccess;
            registrationMutation.reset();
            if (wasSuccess && newlyCreatedUser) {
              onRegistrationComplete(newlyCreatedUser);
            }
          }}
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
