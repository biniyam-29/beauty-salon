import React from "react";
import { AlertTriangle } from "lucide-react";
import type { StepProps } from "../../../lib/types/patientRegistrationTypes";
import { Label, Textarea } from "./PatientUpdateComponents";

export const ConsentReviewStep: React.FC<StepProps> = ({ formData, updateFormData }) => (
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
            <p><span className="font-medium">Skin Care History:</span> {formData.skinCareHistory.length > 0 ? formData.skinCareHistory.join(", ") : "None selected"}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-700 mb-3">Questionnaire Responses</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><span className="font-medium">First Facial:</span> {formData.firstFacialExperience === true ? "Yes" : formData.firstFacialExperience === false ? "No" : "Not specified"}</p>
            <p><span className="font-medium">Recent Botox/Fillers:</span> {formData.recentBotoxFillers ? "Yes" : "No"}</p>
            <p><span className="font-medium">Taken Acne Meds:</span> {formData.takenAcneMedication ? "Yes" : "No"}</p>
            <p><span className="font-medium">Has Allergies:</span> {formData.hasAllergies ? "Yes" : "No"}</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-medium">Takes Supplements:</span> {formData.takesSupplements ? "Yes" : "No"}</p>
            <p><span className="font-medium">Drinks/Smokes:</span> {formData.drinksOrSmokes ? "Yes" : "No"}</p>
            <p><span className="font-medium">Treatment Goals:</span> {formData.treatmentGoals || "Not specified"}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-700 mb-3">Final Notes</h4>
        <Label htmlFor="initialNote" helperText="Any final thoughts, concerns, or additional information you'd like to share after completing all steps">
          Initial Note
        </Label>
        <Textarea
          id="initialNote"
          placeholder="Any special notes about the patient, how they're feeling after discussing their health history, or additional concerns..."
          value={formData.initialNote}
          onChange={(e) => updateFormData({ initialNote: e.target.value })}
          rows={4}
        />
      </div>
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