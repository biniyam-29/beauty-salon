import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PartyPopper,
  AlertTriangle,
} from "lucide-react";

import { PersonalInfoStep } from "./PersonalInfoStep";
import { HealthHistoryStep } from "./HealthHistoryStep";
import { QuestionnaireStep } from "./QuestionnaireStep";
import { ConsentReviewStep } from "./ConsentReviewStep";
import type { PatientData } from "../../../lib/types/patientRegistrationTypes";
import { Card, CardHeader, CardContent, CardTitle, Button, cn } from "./PatientUpdateComponents";
import { useCustomerDetails, useUpdateCustomer } from "../../../hooks/UseCustomer";

const StatusModal: React.FC<{
  status: "success" | "error";
  message: string;
  onClose: () => void;
}> = ({ status, message, onClose }) => (
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

// Progress Component
const Progress: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full bg-rose-100 rounded-full h-1.5">
    <div
      className="bg-gradient-to-r from-rose-400 to-rose-600 h-1.5 rounded-full"
      style={{ width: `${value}%`, transition: "width 0.5s ease-in-out" }}
    ></div>
  </div>
);

// Transform API customer data to form data
const transformCustomerToFormData = (customer: any): PatientData => {
  const profile = customer.profile || {};
  
  // Parse skin feel and used products safely
  let skinFeel = "";
  try {
    skinFeel = typeof profile.skin_feel === 'string' ? profile.skin_feel : JSON.stringify(profile.skin_feel || "");
  } catch {
    skinFeel = profile.skin_feel || "";
  }

  let usedProducts: string[] = [];
  try {
    if (typeof profile.used_products === 'string') {
      usedProducts = JSON.parse(profile.used_products || '[]');
    } else if (Array.isArray(profile.used_products)) {
      usedProducts = profile.used_products;
    }
  } catch {
    usedProducts = [];
  }

  return {
    // Personal Info
    name: customer.full_name || "",
    phone: customer.phone || "",
    email: customer.email || "",
    address: customer.address || "",
    city: customer.city || "",
    dateOfBirth: customer.birth_date || "",
    emergencyContactName: customer.emergency_contact_name || "",
    emergencyContactPhone: customer.emergency_contact_phone || "",
    howHeard: customer.how_heard || "",
    initialNote: "",
    assigned_doctor_id: customer.assigned_doctor_id,

    // Health History
    skinType: profile.skin_type || "",
    skinFeel: skinFeel,
    sunExposure: profile.sun_exposure || "",
    foundationType: profile.foundation_type || "",
    healingProfile: profile.healing_profile || "",
    bruisesEasily: profile.bruises_easily === 1,
    usedProducts: usedProducts,
    usedRetinoids: profile.uses_retinoids_acids === 1,
    recentDermalFillers: profile.recent_dermal_fillers === 1,
    acneMedicationDetails: profile.previous_acne_medication || "",
    allergies: profile.known_allergies_details || "",
    supplements: profile.dietary_supplements || "",
    otherMedication: profile.other_medication || "",
    alcoholOrSmoke: profile.drinks === 1 || profile.smokes === 1,

    // Questionnaire
    firstFacialExperience: profile.first_facial_experience === 1 ? true : 
                          profile.first_facial_experience === 0 ? false : undefined,
    previousTreatmentLikes: profile.previous_treatment_likes || "",
    treatmentGoals: profile.treatment_goals || "",
    vitaminADerivatives: profile.vitamin_a_derivatives || "",
    recentBotoxFillers: profile.recent_botox_fillers === 1,
    takenAcneMedication: profile.taken_acne_medication === 1,
    otherConditions: profile.other_conditions || "",
    hasAllergies: profile.has_allergies === 1 ? true : 
                 profile.has_allergies === 0 ? false : undefined,
    allergiesDetails: profile.allergies_details || "",
    takesSupplements: profile.takes_supplements === 1 ? true : 
                     profile.takes_supplements === 0 ? false : undefined,
    supplementsDetails: profile.supplements_details || "",
    prescriptionMeds: profile.prescription_meds || "",
    drinksOrSmokes: profile.drinks_or_smokes === 1,

    // Lookups (will be populated from separate API calls)
    skinConcerns: customer.skin_concerns?.map((c: any) => c.name) || [],
    healthConditions: customer.health_conditions?.map((c: any) => c.name) || [],
    skinCareHistory: [],
  };
};

// Steps
const steps = [
  { name: "Personal Info", component: PersonalInfoStep },
  { name: "Health History", component: HealthHistoryStep },
  { name: "Questionnaire", component: QuestionnaireStep },
  { name: "Review & Save", component: ConsentReviewStep },
];

export const DoctorPatientWizard: React.FC<{
  mode?: 'create' | 'edit';
  onComplete?: () => void;
  initialCustomerId?: string | number;
}> = ({ mode = 'edit', onComplete, initialCustomerId }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PatientData | null>(null);
  const [statusModal, setStatusModal] = useState<{status: 'success' | 'error', message: string} | null>(null);

  // Get customer ID from params or props
  const { customerId: paramCustomerId } = useParams();
  const customerId = initialCustomerId || paramCustomerId || '';

  // Queries
  const { data: customerData, isLoading: isLoadingCustomer } = useCustomerDetails( customerId as string );

  // Mutations
  const updateCustomerMutation = useUpdateCustomer();

  const updateFormData = (updates: Partial<PatientData>) => {
    setFormData(prev => prev ? { ...prev, ...updates } : null);
  };

  const nextStep = () =>
    currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && customerData) {
      const transformed = transformCustomerToFormData(customerData);
      setFormData(transformed);
    }
  }, [mode, customerData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (currentStep < steps.length - 1) {
      nextStep();
      return;
    }

    if (!formData || !customerId) return;

    try {
      // Prepare customer update data
      const updateData = {
        full_name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        birth_date: formData.dateOfBirth || undefined,
        emergency_contact_name: formData.emergencyContactName || undefined,
        emergency_contact_phone: formData.emergencyContactPhone || undefined,
        how_heard: formData.howHeard || undefined,
        assigned_doctor_id: formData.assigned_doctor_id || undefined,
        profile: {
          skin_type: formData.skinType || undefined,
          skin_feel: formData.skinFeel || undefined,
          sun_exposure: formData.sunExposure || undefined,
          foundation_type: formData.foundationType || undefined,
          healing_profile: formData.healingProfile || undefined,
          bruises_easily: formData.bruisesEasily ? 1 : 0,
          used_products: formData.usedProducts.length > 0 ? JSON.stringify(formData.usedProducts) : undefined,
          uses_retinoids_acids: formData.usedRetinoids ? 1 : 0,
          recent_dermal_fillers: formData.recentDermalFillers ? 1 : 0,
          previous_acne_medication: formData.acneMedicationDetails || undefined,
          known_allergies_details: formData.allergies || undefined,
          dietary_supplements: formData.supplements || undefined,
          other_medication: formData.otherMedication || undefined,
          first_facial_experience: formData.firstFacialExperience === true ? 1 : formData.firstFacialExperience === false ? 0 : undefined,
          previous_treatment_likes: formData.previousTreatmentLikes || undefined,
          treatment_goals: formData.treatmentGoals || undefined,
          vitamin_a_derivatives: formData.vitaminADerivatives || undefined,
          recent_botox_fillers: formData.recentBotoxFillers ? 1 : 0,
          taken_acne_medication: formData.takenAcneMedication ? 1 : 0,
          other_conditions: formData.otherConditions || undefined,
          has_allergies: formData.hasAllergies === true ? 1 : formData.hasAllergies === false ? 0 : undefined,
          allergies_details: formData.allergiesDetails || undefined,
          takes_supplements: formData.takesSupplements === true ? 1 : formData.takesSupplements === false ? 0 : undefined,
          supplements_details: formData.supplementsDetails || undefined,
          prescription_meds: formData.prescriptionMeds || undefined,
          drinks_or_smokes: formData.drinksOrSmokes ? 1 : 0,
        }
      };

      await updateCustomerMutation.mutateAsync({
        customerId: customerId,
        data: updateData
      });

      setStatusModal({
        status: 'success',
        message: 'Customer updated successfully!'
      });
    } catch (error: any) {
      setStatusModal({
        status: 'error',
        message: error.message || 'Failed to update customer'
      });
    }
  };

  if (!formData || (mode === 'edit' && isLoadingCustomer)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="w-full bg-[#FDF8F5] p-4 sm:p-6 lg:p-8 min-h-screen">
      {statusModal && (
        <StatusModal
          status={statusModal.status}
          message={statusModal.message}
          onClose={() => {
            setStatusModal(null);
            if (statusModal.status === 'success' && onComplete) {
              onComplete();
            }
          }}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Edit Client Profile
        </h1>
        <Button variant="ghost" onClick={() => navigate("/doctor")}>
          <ChevronLeft size={16} className="mr-2" />
          Back to Profiles
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
                  lookups={{
                    concerns: [],
                    conditions: [],
                    skinCareHistory: []
                  }}
                  isLoading={false}
                  isEditing={mode === 'edit'}
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
                <Button type="submit" disabled={updateCustomerMutation.isPending}>
                  {updateCustomerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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

export default DoctorPatientWizard;