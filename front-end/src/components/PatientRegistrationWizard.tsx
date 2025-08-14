import React, { useState, useEffect, useMemo } from "react";
import type { PatientData, ProfessionalData } from "../types";
// import { dbUrl } from '../config'; // Removed to define locally and ensure correctness
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Switch,
  Progress,
  cn,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from "./ui";

// =================================================================================
// FILE: src/components/PatientRegistrationWizard.tsx
// =================================================================================

// --- Local Configuration ---
// This ensures the correct base URL is used for all API calls within this component.
const dbUrl = "http://localhost:3001";

// --- Registration Step Components (Internal to the Wizard) ---
type StepProps = {
  formData: PatientData;
  updateFormData: (updates: Partial<PatientData>) => void;
};

const PersonalInfoStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Enter full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
          placeholder="Enter phone number"
          disabled
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => updateFormData({ address: e.target.value })}
          placeholder="Enter street address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => updateFormData({ city: e.target.value })}
          placeholder="Enter city"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          placeholder="Enter email address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact</Label>
        <Input
          id="emergencyContact"
          value={formData.emergencyContact}
          onChange={(e) => updateFormData({ emergencyContact: e.target.value })}
          placeholder="Emergency contact name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emergencyPhone">Emergency Phone</Label>
        <Input
          id="emergencyPhone"
          value={formData.emergencyPhone}
          onChange={(e) => updateFormData({ emergencyPhone: e.target.value })}
          placeholder="Emergency contact phone"
        />
      </div>
    </div>
  );
};

const SkinHealthStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const handleCheckboxChange = (value: string, checked: boolean) => {
    const currentArray = formData.skinFeel;
    const updatedArray = checked
      ? [...currentArray, value]
      : currentArray.filter((item) => item !== value);
    updateFormData({ skinFeel: updatedArray });
  };
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700">
          What is your skin type?
        </Label>
        <RadioGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Normal", "Dry", "Oily", "Combo"].map((type) => (
            <RadioGroupItem
              key={type}
              value={type}
              name="skinType"
              id={`type-${type}`}
              checked={formData.skinType === type}
              onChange={() => updateFormData({ skinType: type })}
            >
              {type}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </div>
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700">
          Does your skin feel?
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          {["Flaky", "Redish", "Tight", "Excessive oil"].map((feel) => (
            <Checkbox
              key={feel}
              id={`feel-${feel}`}
              checked={formData.skinFeel.includes(feel)}
              onCheckedChange={(checked) => handleCheckboxChange(feel, checked)}
            >
              {feel}
            </Checkbox>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700">
          Your exposure to the sun?
        </Label>
        <RadioGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Never", "Light", "Moderate", "Excessive"].map((exp) => (
            <RadioGroupItem
              key={exp}
              value={exp}
              name="sunExposure"
              id={`exp-${exp}`}
              checked={formData.sunExposure === exp}
              onChange={() => updateFormData({ sunExposure: exp })}
            >
              {exp}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

const SkinCareStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const productOptions = [
    "Facial cleanser",
    "Sunscreen",
    "Mask",
    "Make-up remover",
    "Bar soap",
    "Eye product",
    "Exfoliants",
    "Face scrub",
    "Toner",
    "Moisturizer",
    "Day cream",
    "Body scrub",
    "Serum",
    "Lip products",
    "Night cream",
    "Body lotion",
    "Face oil",
  ];
  const concernOptions = [
    "Wrinkles",
    "Dryness",
    "Rosacea",
    "Aging",
    "Hyperpigmentation",
    "Melasma",
    "Dark circle",
    "Sun damage",
    "Acne",
    "Flaky skin",
    "Milia",
    "Redness",
    "Acne scarring",
    "Psoriasis",
    "Oily skin",
    "Sensitivity",
  ];

  const handleProductChange = (value: string, checked: boolean) => {
    const currentArray = formData.usedProducts;
    const updatedArray = checked
      ? [...currentArray, value]
      : currentArray.filter((item) => item !== value);
    updateFormData({ usedProducts: updatedArray });
  };

  const handleConcernChange = (value: string, checked: boolean) => {
    const currentArray = formData.skinConcerns;
    const updatedArray = checked
      ? [...currentArray, value]
      : currentArray.filter((item) => item !== value);
    updateFormData({ skinConcerns: updatedArray });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700">
          Kindly tick your currently used products
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {productOptions.map((product) => (
            <Checkbox
              key={product}
              id={`prod-${product}`}
              checked={formData.usedProducts.includes(product)}
              onCheckedChange={(checked) =>
                handleProductChange(product, checked)
              }
            >
              {product}
            </Checkbox>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700">
          Tell us your skin concerns
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {concernOptions.map((concern) => (
            <Checkbox
              key={concern}
              id={`concern-${concern}`}
              checked={formData.skinConcerns.includes(concern)}
              onCheckedChange={(checked) =>
                handleConcernChange(concern, checked)
              }
            >
              {concern}
            </Checkbox>
          ))}
        </div>
      </div>
    </div>
  );
};

const HealthHistoryStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
}) => {
  const healthOptions = [
    "Cancer",
    "Arthritis",
    "Thyroid condition",
    "Epilepsy",
    "High Blood Pressure",
    "Asthma",
    "Auto-immune disorders",
    "Warts",
    "Diabetes",
    "Hepatitis",
    "Low blood pressure",
    "Insomnia",
    "Heart Problem",
    "Migraines",
    "Pregnant",
    "Eczema",
  ];

  const handleHealthChange = (value: string, checked: boolean) => {
    const currentArray = formData.healthConditions;
    const updatedArray = checked
      ? [...currentArray, value]
      : currentArray.filter((item) => item !== value);
    updateFormData({ healthConditions: updatedArray });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-700">
          Have you experienced any of these health conditions?
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {healthOptions.map((condition) => (
            <Checkbox
              key={condition}
              id={`health-${condition}`}
              checked={formData.healthConditions.includes(condition)}
              onCheckedChange={(checked) =>
                handleHealthChange(condition, checked)
              }
            >
              {condition}
            </Checkbox>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <Label className="text-base font-bold text-gray-700">
          Additional Health Information
        </Label>
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <Label htmlFor="usedRetinoids" className="mb-0">
              Used Retin-A, Accutane, etc.?
            </Label>
            <Switch
              id="usedRetinoids"
              checked={formData.usedRetinoids}
              onCheckedChange={(checked) =>
                updateFormData({ usedRetinoids: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <Label htmlFor="acneMedication" className="mb-0">
              Taken any acne medication before?
            </Label>
            <Switch
              id="acneMedication"
              checked={formData.acneMedication}
              onCheckedChange={(checked) =>
                updateFormData({ acneMedication: checked })
              }
            />
          </div>
          {formData.acneMedication && (
            <Textarea
              value={formData.acneMedicationDetails}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateFormData({ acneMedicationDetails: e.target.value })
              }
              placeholder="Please share when and which drugs were used"
            />
          )}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <Label htmlFor="alcoholOrSmoke" className="mb-0">
              Do you drink alcohol or smoke?
            </Label>
            <Switch
              id="alcoholOrSmoke"
              checked={formData.alcoholOrSmoke}
              onCheckedChange={(checked) =>
                updateFormData({ alcoholOrSmoke: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CompleteRegistrationStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="space-y-6 text-center">
      <div className="bg-pink-50/50 rounded-lg p-6">
        <h3 className="font-display text-xl font-bold text-pink-800 mb-2">
          Registration Summary
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Patient:</strong> {formData.name || "..."}
          </p>
          <p>
            <strong>Phone:</strong> {formData.phone || "..."}
          </p>
          <p>
            <strong>Skin Type:</strong> {formData.skinType || "..."}
          </p>
          <p>
            <strong>Primary Concerns:</strong>{" "}
            {formData.skinConcerns.join(", ") || "None specified"}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signature">Client Signature *</Label>
        <Input
          id="signature"
          value={formData.signature}
          onChange={(e) => updateFormData({ signature: e.target.value })}
          placeholder="Type your full name to sign"
          className="text-center font-display text-xl"
        />
      </div>
      <p className="text-xs text-gray-500 max-w-md mx-auto">
        By signing, you agree that you have completed this form to the best of
        your knowledge and waive all liabilities for any misrepresentation of
        your health history.
      </p>
    </div>
  );
};

const AssignmentStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${dbUrl}/professionals`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProfessionals(data);
      } catch (error) {
        console.error("Could not fetch professionals", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  const filteredProfessionals = useMemo(() => {
    if (!searchTerm) {
      return professionals;
    }
    return professionals.filter((prof) =>
      prof.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [professionals, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="conclusionNote">Conclusion Note</Label>
        <Textarea
          id="conclusionNote"
          value={formData.conclusionNote || ""}
          onChange={(e) => updateFormData({ conclusionNote: e.target.value })}
          placeholder="Add a short conclusion note for the professional..."
          rows={4}
        />
      </div>
      <div className="space-y-4">
        <Label htmlFor="professionalSearch">
          Search & Assign a Professional
        </Label>
        <Input
          id="professionalSearch"
          type="text"
          placeholder="Start typing a professional's name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Loading professionals...
          </p>
        ) : filteredProfessionals.length > 0 ? (
          <RadioGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2 bg-gray-50/50 rounded-lg">
            {filteredProfessionals.map((prof) => (
              <RadioGroupItem
                key={prof.id}
                value={prof.id}
                name="professional"
                id={`prof-${prof.id}`}
                checked={formData.assignedProfessionalId === prof.id}
                onChange={() =>
                  updateFormData({ assignedProfessionalId: prof.id })
                }
              >
                <div>
                  <p className="font-bold">{prof.name}</p>
                  <p className="text-xs text-gray-500">
                    {prof.skills.join(", ")}
                  </p>
                </div>
              </RadioGroupItem>
            ))}
          </RadioGroup>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No professionals match your search.
          </p>
        )}
      </div>
    </div>
  );
};

// --- Main Registration Wizard Component ---
const initialData: PatientData = {
  name: "",
  address: "",
  phone: "",
  city: "",
  dateOfBirth: "",
  email: "",
  emergencyContact: "",
  emergencyPhone: "",
  heardFrom: "",
  skinType: "",
  skinFeel: [],
  sunExposure: "",
  foundationType: "",
  skinHeal: "",
  bruiseEasily: false,
  usedProducts: [],
  otherProducts: "",
  skinConcerns: [],
  firstFacial: true,
  previousTreatmentLikes: "",
  treatmentGoal: "",
  usedRetinoids: false,
  hadFillers: false,
  acneMedication: false,
  acneMedicationDetails: "",
  healthConditions: [],
  otherConditions: "",
  knownAllergies: false,
  supplements: false,
  alcoholOrSmoke: false,
  signature: "",
  signatureDate: "",
  prescriptionMeds: false,
};

type PatientRegistrationWizardProps = {
  phone: string;
  onRegistrationComplete: (newUser: PatientData) => void;
};
export const PatientRegistrationWizard: React.FC<
  PatientRegistrationWizardProps
> = ({ phone, onRegistrationComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PatientData>({
    ...initialData,
    phone,
  });

  const steps = [
    {
      id: 1,
      name: "Personal Info",
      title: "Personal Information",
      component: PersonalInfoStep,
    },
    {
      id: 2,
      name: "Skin Health",
      title: "Skin Health Check",
      component: SkinHealthStep,
    },
    {
      id: 3,
      name: "Skin Care",
      title: "Skin Care & Concerns",
      component: SkinCareStep,
    },
    {
      id: 4,
      name: "Health History",
      title: "Health History",
      component: HealthHistoryStep,
    },
    {
      id: 5,
      name: "Consent",
      title: "Consent & Completion",
      component: CompleteRegistrationStep,
    },
    {
      id: 6,
      name: "Assignment",
      title: "Assign Professional",
      component: AssignmentStep,
    },
  ];

  const updateFormData = (updates: Partial<PatientData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () =>
    currentStep < steps.length && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    const newUser = {
      ...formData,
      signatureDate: new Date().toISOString().split("T")[0],
    };
    try {
      const response = await fetch(`${dbUrl}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const savedUser = await response.json();
      onRegistrationComplete(savedUser);
    } catch (error) {
      console.error("Failed to save user:", error);
      alert(
        `Failed to save user: ${error}. Please ensure the server is running.`
      );
    }
  };

  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-12">
      <aside className="lg:w-72 lg:flex-shrink-0">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl shadow-pink-200/20 p-6 border border-white/20 sticky top-8">
          <div className="mb-8 text-2xl font-bold text-pink-700 text-center font-display">
            Registration
          </div>
          <ol className="space-y-5">
            {steps.map((step) => (
              <li key={step.id} className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold border-2 transition-all duration-300",
                    currentStep > step.id
                      ? "bg-pink-600 text-white border-pink-600"
                      : currentStep === step.id
                      ? "bg-white text-pink-700 border-pink-600 ring-4 ring-pink-200"
                      : "bg-gray-100 text-gray-400 border-gray-200"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckIcon className="w-6 h-6" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "text-base font-bold transition-colors",
                    currentStep === step.id ? "text-pink-800" : "text-gray-500"
                  )}
                >
                  {step.name}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-8 pt-8 border-t border-pink-100">
            <Progress value={progress} />
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
            />
          </CardContent>
        </Card>
        <div className="flex justify-between gap-4 mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeftIcon /> Previous
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={nextStep}>
              Next <ChevronRightIcon />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Complete Registration</Button>
          )}
        </div>
      </main>
    </div>
  );
};
// =================================================================================
// END FILE: src/components/PatientRegistrationWizard.tsx
// =================================================================================
