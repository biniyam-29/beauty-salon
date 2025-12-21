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

import { PersonalInfoStep } from "./PersonalInfoStep";
import { HealthHistoryStep } from "./HealthHistoryStep";
import { QuestionnaireStep } from "./QuestionnaireStep";
// import { AssignProfessionalStep } from "./AssignProfessionalStep";
import { ConsentReviewStep } from "./ConsentReviewStep";
import { fetchLookups, fetchProfessionals, registerPatient } from "../../../lib/api/patientRegistrationApi";
import type { PatientData, LookupsData, ProfessionalData } from "../../../lib/types/patientRegistrationTypes";
import { Card, CardHeader, CardContent, CardTitle, Button, cn } from "./patientRegistrationComponents";

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

// Initial Data
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

  // Step 3 - Questionnaire (No Duplicates)
  firstFacialExperience: undefined as any,
  previousTreatmentLikes: "",
  treatmentGoals: "",
  vitaminADerivatives: "",
  recentBotoxFillers: false,
  takenAcneMedication: false,
  otherConditions: "",
  hasAllergies: undefined as any,
  allergiesDetails: "",
  takesSupplements: undefined as any,
  supplementsDetails: "",
  prescriptionMeds: "",
  drinksOrSmokes: false,

  // Lookups
  skinConcerns: [],
  healthConditions: [],
  skinCareHistory: [],

  // Step 4 - Assignment
  assignedProfessionalId: "",
};

// Main Component
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
  const [newlyCreatedUser, setNewlyCreatedUser] = useState<PatientData | null>(null);

  const steps = [
    { name: "Personal Info", component: PersonalInfoStep },
    { name: "Health History", component: HealthHistoryStep },
    { name: "Questionnaire", component: QuestionnaireStep },
    // { name: "Assign Professional", component: AssignProfessionalStep },
    { name: "Consent & Review", component: ConsentReviewStep },
  ];

  // Queries
  const lookupsQuery = useQuery<LookupsData, Error>({
    queryKey: ["lookups"],
    queryFn: fetchLookups,
  });

  const professionalsQuery = useQuery<ProfessionalData[], Error>({
    queryKey: ["professionals"],
    queryFn: fetchProfessionals,
  });

  // Mutation
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
    const skinCareHistoryMap =
      lookupsQuery.data?.skinCareHistory.reduce(
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
        // New questionnaire fields (no duplicates)
        first_facial_experience: formData.firstFacialExperience ? 1 : 0,
        previous_treatment_likes: formData.previousTreatmentLikes,
        treatment_goals: formData.treatmentGoals,
        vitamin_a_derivatives: formData.vitaminADerivatives,
        recent_botox_fillers: formData.recentBotoxFillers ? 1 : 0,
        taken_acne_medication: formData.takenAcneMedication ? 1 : 0,
        other_conditions: formData.otherConditions,
        has_allergies: formData.hasAllergies ? 1 : 0,
        allergies_details: formData.allergiesDetails,
        takes_supplements: formData.takesSupplements ? 1 : 0,
        supplements_details: formData.supplementsDetails,
        prescription_meds: formData.prescriptionMeds,
        drinks_or_smokes: formData.drinksOrSmokes ? 1 : 0,
      },
      skin_concerns: formData.skinConcerns
        .map((name: string) => skinConcernsMap[name])
        .filter(Boolean),
      health_conditions: formData.healthConditions
        .map((name: string) => healthConditionsMap[name])
        .filter(Boolean),
      skin_care_history: formData.skinCareHistory
        .map((name: string) => skinCareHistoryMap[name])
        .filter(Boolean),
    };

    registrationMutation.mutate(apiPayload);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

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
      {/* Modals */}
      {showSuccessModal && (
        <StatusModal
          status="success"
          message="Client registered successfully!"
          onClose={handleModalClose}
        />
      )}

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
                    lookupsQuery.data || { concerns: [], conditions: [], skinCareHistory: [] }
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