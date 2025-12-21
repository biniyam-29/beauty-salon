import React from "react";
import type { StepProps } from "../../../lib/types/patientRegistrationTypes";
import { Label, Checkbox, Textarea } from "./patientRegistrationComponents";

export const QuestionnaireStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800">Treatment Experience & Goals</h3>
        
        <div className="space-y-4">
          <Label helperText="Is this your first time receiving a facial treatment?">
            Is this your first facial experience?
          </Label>
          <div className="flex gap-4">
            <Checkbox
              id="firstFacial-yes"
              checked={formData.firstFacialExperience === true}
              onCheckedChange={(checked) => updateFormData({ firstFacialExperience: checked })}
            >
              Yes
            </Checkbox>
            <Checkbox
              id="firstFacial-no"
              checked={formData.firstFacialExperience === false}
              onCheckedChange={(checked) => updateFormData({ firstFacialExperience: !checked })}
            >
              No
            </Checkbox>
          </div>
        </div>

        {formData.firstFacialExperience === false && (
          <div>
            <Label htmlFor="previousTreatmentLikes" helperText="What did you enjoy about previous treatments?">
              If no, tell us what you liked about previous treatment
            </Label>
            <Textarea
              id="previousTreatmentLikes"
              placeholder="e.g., I enjoyed the relaxing atmosphere, the deep cleansing felt great, the results lasted for weeks..."
              value={formData.previousTreatmentLikes}
              onChange={(e) => updateFormData({ previousTreatmentLikes: e.target.value })}
              rows={3}
            />
          </div>
        )}

        <div>
          <Label htmlFor="treatmentGoals" helperText="What are your main objectives for today's treatment?">
            What do you want to achieve from your facial treatment today?
          </Label>
          <Textarea
            id="treatmentGoals"
            placeholder="e.g., Deep cleansing, hydration, anti-aging, acne treatment, relaxation..."
            value={formData.treatmentGoals}
            onChange={(e) => updateFormData({ treatmentGoals: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800">Current Products & Treatments</h3>
        
        <div>
          <Label htmlFor="vitaminADerivatives" helperText="Please list all vitamin A derivatives and acids you currently use or have used recently">
            Do you / have you used retine-a, renova, adapalene, accutane, differen, glycolic acid, lactic acid, mandelic acid, retinol, or other vitamin A derivatives?
          </Label>
          <Textarea
            id="vitaminADerivatives"
            placeholder="e.g., I currently use retinol serum nightly, used Accutane 2 years ago for 6 months, occasionally use glycolic acid toner..."
            value={formData.vitaminADerivatives}
            onChange={(e) => updateFormData({ vitaminADerivatives: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <Label helperText="Have you received any injectable treatments in the last two weeks?">
            Have you received any botox, juvederm, or other dermal fillers in the last two weeks?
          </Label>
          <div className="flex gap-4">
            <Checkbox
              id="recentBotoxFillers-yes"
              checked={formData.recentBotoxFillers === true}
              onCheckedChange={(checked) => updateFormData({ recentBotoxFillers: checked })}
            >
              Yes
            </Checkbox>
            <Checkbox
              id="recentBotoxFillers-no"
              checked={formData.recentBotoxFillers === false}
              onCheckedChange={(checked) => updateFormData({ recentBotoxFillers: !checked })}
            >
              No
            </Checkbox>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800">Medical History Details</h3>
        
        <div className="space-y-4">
          <Label helperText="Have you ever taken prescription acne medication?">
            Have you taken any acne medication before?
          </Label>
          <div className="flex gap-4">
            <Checkbox
              id="takenAcneMedication-yes"
              checked={formData.takenAcneMedication === true}
              onCheckedChange={(checked) => updateFormData({ takenAcneMedication: checked })}
            >
              Yes
            </Checkbox>
            <Checkbox
              id="takenAcneMedication-no"
              checked={formData.takenAcneMedication === false}
              onCheckedChange={(checked) => updateFormData({ takenAcneMedication: !checked })}
            >
              No
            </Checkbox>
          </div>
        </div>

        {formData.takenAcneMedication && (
          <div>
            <Label htmlFor="acneMedicationDetails" helperText="Please specify when and which drugs were used">
              If yes, please share when and which drugs were used
            </Label>
            <Textarea
              id="acneMedicationDetails"
              placeholder="e.g., Accutane from Jan-June 2022, topical clindamycin in 2023, currently using spironolactone..."
              value={formData.acneMedicationDetails}
              onChange={(e) => updateFormData({ acneMedicationDetails: e.target.value })}
              rows={3}
            />
          </div>
        )}

        <div>
          <Label htmlFor="otherConditions" helperText="Any other medical conditions we should know about?">
            Any other conditions?
          </Label>
          <Textarea
            id="otherConditions"
            placeholder="e.g., PCOS, thyroid issues, autoimmune conditions, recent surgeries..."
            value={formData.otherConditions}
            onChange={(e) => updateFormData({ otherConditions: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800">Allergies & Supplements</h3>
        
        <div className="space-y-4">
          <Label helperText="Do you have any known allergies?">
            Any known allergies?
          </Label>
          <div className="flex gap-4 mb-4">
            <Checkbox
              id="hasAllergies-yes"
              checked={formData.hasAllergies === true}
              onCheckedChange={(checked) => updateFormData({ hasAllergies: checked })}
            >
              Yes
            </Checkbox>
            <Checkbox
              id="hasAllergies-no"
              checked={formData.hasAllergies === false}
              onCheckedChange={(checked) => updateFormData({ hasAllergies: !checked })}
            >
              No
            </Checkbox>
          </div>
          {formData.hasAllergies && (
            <Textarea
              id="allergiesDetails"
              placeholder="e.g., allergic to nuts, penicillin, shellfish, specific skincare ingredients like fragrance or preservatives..."
              value={formData.allergiesDetails}
              onChange={(e) => updateFormData({ allergiesDetails: e.target.value })}
              rows={3}
            />
          )}
        </div>

        <div className="space-y-4">
          <Label helperText="Do you take any dietary or health supplements?">
            Do you take any dietary/health supplements?
          </Label>
          <div className="flex gap-4 mb-4">
            <Checkbox
              id="takesSupplements-yes"
              checked={formData.takesSupplements === true}
              onCheckedChange={(checked) => updateFormData({ takesSupplements: checked })}
            >
              Yes
            </Checkbox>
            <Checkbox
              id="takesSupplements-no"
              checked={formData.takesSupplements === false}
              onCheckedChange={(checked) => updateFormData({ takesSupplements: !checked })}
            >
              No
            </Checkbox>
          </div>
          {formData.takesSupplements && (
            <Textarea
              id="supplementsDetails"
              placeholder="e.g., Vitamin D 2000IU daily, Omega-3, Probiotics, Iron supplement, Collagen peptides..."
              value={formData.supplementsDetails}
              onChange={(e) => updateFormData({ supplementsDetails: e.target.value })}
              rows={3}
            />
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800">Medications & Lifestyle</h3>
        
        <div>
          <Label htmlFor="prescriptionMeds" helperText="List all current prescription and over-the-counter medications">
            Are you currently on any prescription/over-the-counter medication?
          </Label>
          <Textarea
            id="prescriptionMeds"
            placeholder="e.g., Birth control pills, blood pressure medication, antidepressants, occasional ibuprofen..."
            value={formData.prescriptionMeds}
            onChange={(e) => updateFormData({ prescriptionMeds: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <Label helperText="Do you regularly consume alcohol or use tobacco products?">
            Do you drink alcohol or smoke?
          </Label>
          <div className="flex gap-4">
            <Checkbox
              id="drinksOrSmokes-yes"
              checked={formData.drinksOrSmokes === true}
              onCheckedChange={(checked) => updateFormData({ drinksOrSmokes: checked })}
            >
              Yes
            </Checkbox>
            <Checkbox
              id="drinksOrSmokes-no"
              checked={formData.drinksOrSmokes === false}
              onCheckedChange={(checked) => updateFormData({ drinksOrSmokes: !checked })}
            >
              No
            </Checkbox>
          </div>
        </div>
      </div>
    </div>
  );
};