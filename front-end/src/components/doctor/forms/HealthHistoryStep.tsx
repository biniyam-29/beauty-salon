import React from "react";
import { Loader2 } from "lucide-react";
import type { StepProps } from "../../../lib/types/patientRegistrationTypes";
import { Label, Checkbox } from "./PatientUpdateComponents";

export const HealthHistoryStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  lookups,
  isLoading,
}) => {
  const toggleArrayItem = (field: keyof typeof formData, value: string) => {
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

        {/* New Skin Care History Lookup */}
        <div>
          <Label helperText="Select your skin care history and previous treatments">
            Skin Care History
          </Label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Loading skin care history...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lookups.skinCareHistory.map((c) => (
                <Checkbox
                  key={c.id}
                  id={`skin-care-history-${c.id}`}
                  checked={formData.skinCareHistory.includes(c.name)}
                  onCheckedChange={() => toggleArrayItem("skinCareHistory", c.name)}
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