import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useUpdateCustomer, type Customer } from "../../hooks/UseCustomer";
import { PersonalInfoStep } from "./forms/PersonalInfoStep";
import { HealthHistoryStep } from "./forms/HealthHistoryStep";
import { QuestionnaireStep } from "./forms/QuestionnaireStep";
import { ConsentReviewStep } from "./forms/ConsentReviewStep";
import { Button, cn, Card, CardHeader, CardContent, CardTitle } from "./forms/PatientUpdateComponents";
import { useLookups } from "../../hooks/UseLookups";

interface DoctorCustomerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSuccess?: () => void;
}

// Helper function to safely parse JSON arrays
const safeParseArray = (jsonString: string | undefined | null): string[] => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Helper to convert Customer data to form data
const customerToFormData = (customer: Customer | null) => {
  if (!customer) return null;

  console.log("this is the customer data: ", customer);
  
  return {
    // Personal Info
    name: customer.full_name,
    phone: customer.phone,
    email: customer.email || "",
    address: customer.address || "",
    city: customer.city || "",
    dateOfBirth: customer.birth_date || "",
    emergencyContactName: customer.emergency_contact_name || "",
    emergencyContactPhone: customer.emergency_contact_phone || "",
    howHeard: customer.how_heard || "",
    initialNote: "",
    
    // Health History
    skinType: customer.profile?.skin_type || "",
    skinFeel: customer.profile?.skin_feel || "",
    sunExposure: customer.profile?.sun_exposure || "",
    foundationType: customer.profile?.foundation_type || "",
    healingProfile: customer.profile?.healing_profile || "",
    bruisesEasily: customer.profile?.bruises_easily === 1,
    usedProducts: safeParseArray(customer.profile?.used_products),
    usedRetinoids: customer.profile?.uses_retinoids_acids === 1,
    recentDermalFillers: customer.profile?.recent_dermal_fillers === 1,
    acneMedicationDetails: customer.profile?.previous_acne_medication || "",
    allergies: customer.profile?.known_allergies_details || "",
    supplements: customer.profile?.dietary_supplements || "",
    otherMedication: customer.profile?.other_medication || "",
    alcoholOrSmoke: customer.profile?.drinks === 1 || customer.profile?.smokes === 1,
    
    // Questionnaire
    firstFacialExperience: customer.profile?.first_facial_experience === 1 ? true : 
                          customer.profile?.first_facial_experience === 0 ? false : undefined,
    previousTreatmentLikes: customer.profile?.previous_treatment_likes || "",
    treatmentGoals: customer.profile?.treatment_goals || "",
    vitaminADerivatives: customer.profile?.vitamin_a_derivatives || "",
    recentBotoxFillers: customer.profile?.recent_botox_fillers === 1,
    takenAcneMedication: customer.profile?.taken_acne_medication === 1,
    otherConditions: customer.profile?.other_conditions || "",
    hasAllergies: customer.profile?.has_allergies === 1 ? true : 
                 customer.profile?.has_allergies === 0 ? false : undefined,
    allergiesDetails: customer.profile?.allergies_details || "",
    takesSupplements: customer.profile?.takes_supplements === 1 ? true : 
                     customer.profile?.takes_supplements === 0 ? false : undefined,
    supplementsDetails: customer.profile?.supplements_details || "",
    prescriptionMeds: customer.profile?.prescription_meds || "",
    drinksOrSmokes: customer.profile?.drinks_or_smokes === 1,
    
    // Arrays - These should match the form field names exactly
    skinConcerns: customer.skin_concerns?.map(sc => sc.name) || [],
    healthConditions: customer.health_conditions?.map(hc => hc.name) || [],
    skinCareHistory: customer.skin_concerns?.map(sc => sc.name) || [], // Fallback if skin care history not available
  };
};

// Steps for editing
const steps = [
  { name: "Personal Info", component: PersonalInfoStep },
  { name: "Health History", component: HealthHistoryStep },
  { name: "Questionnaire", component: QuestionnaireStep },
  { name: "Review", component: ConsentReviewStep },
];

export const DoctorCustomerEditModal: React.FC<DoctorCustomerEditModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const updateCustomerMutation = useUpdateCustomer();
  const { data: conditionsData, isLoading: loadingConditions } = useLookups("health-conditions");
  const { data: concernsData, isLoading: loadingConcerns } = useLookups("skin-concerns");
  const { data: skinCareHistoryData, isLoading: loadingSkinCare } = useLookups("skin-care-history");

  const isLookupsLoading = loadingConditions || loadingConcerns || loadingSkinCare;
  const lookups = {
    conditions: conditionsData || [],
    concerns: concernsData || [],
    skinCareHistory: skinCareHistoryData || [],
  };

  // Reset form when modal opens/closes or customer changes
  useEffect(() => {
    if (isOpen && customer) {
      const newFormData = customerToFormData(customer);
      setFormData(newFormData);
      setCurrentStep(0);
      setIsInitialized(true);
    } else {
      setFormData(null);
      setIsInitialized(false);
    }
  }, [isOpen, customer]);

  const updateFormData = (updates: Partial<any>) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const nextStep = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < steps.length - 1) {
      nextStep();
      return;
    }

    if (!formData || !customer) return;

    // Prepare update payload
    const updatePayload = {
      full_name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      birth_date: formData.dateOfBirth || undefined,
      emergency_contact_name: formData.emergencyContactName || undefined,
      emergency_contact_phone: formData.emergencyContactPhone || undefined,
      how_heard: formData.howHeard || undefined,
      profile: {
        skin_type: formData.skinType || undefined,
        skin_feel: formData.skinFeel || undefined,
        sun_exposure: formData.sunExposure || undefined,
        foundation_type: formData.foundationType || undefined,
        healing_profile: formData.healingProfile || undefined,
        bruises_easily: formData.bruisesEasily ? 1 : 0,
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
      },
    };

    updateCustomerMutation.mutate(
      { customerId: customer.id, data: updatePayload },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          console.error('Update failed:', error);
          alert('Failed to update customer. Please try again.');
        }
      }
    );
  };

  const handleClose = () => {
    setFormData(null);
    setCurrentStep(0);
    setIsInitialized(false);
    onClose();
  };

  if (!isOpen) return null;

  // Show loading while initializing
  if (!isInitialized || !formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Client: {customer?.full_name}</h2>
            <p className="text-sm text-gray-500">Update client information</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-100px)]">
          {/* Sidebar with steps */}
          <div className="lg:w-64 border-r border-gray-200 p-6">
            <div className="space-y-6">
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li key={step.name} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2",
                        currentStep > index
                          ? "bg-rose-600 text-white border-rose-600"
                          : currentStep === index
                          ? "bg-white text-rose-700 border-rose-600 ring-2 ring-rose-200"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      )}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={cn(
                        "font-medium",
                        currentStep === index ? "text-rose-800" : "text-gray-500"
                      )}
                    >
                      {step.name}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="pt-4 border-t border-gray-200">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-rose-400 to-rose-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>{steps[currentStep].name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CurrentStepComponent
                    formData={formData}
                    updateFormData={updateFormData}
                    lookups={lookups ?? { concerns: [], conditions: [], skinCareHistory: [] }}
                    isLoading={isLookupsLoading}
                    isEditing={true}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button type="submit">
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={updateCustomerMutation.isPending}
                  >
                    {updateCustomerMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};