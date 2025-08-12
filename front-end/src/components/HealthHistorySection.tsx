import React from "react";
import type { FormData } from "../formData";

type Props = {
  formData: FormData;
  onCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
};

const HealthHistorySection: React.FC<Props> = ({ formData, onCheckbox, onChange, options }) => (
  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Health History</h3>
    <div className="grid grid-cols-2 gap-2 mb-4">
      {options.map(option => (
        <label key={option} className="flex items-center">
          <input
            type="checkbox"
            name="healthHistory"
            value={option}
            checked={formData.healthHistory.includes(option)}
            onChange={onCheckbox}
            className="form-checkbox"
          />
          <span className="ml-2">{option}</span>
        </label>
      ))}
    </div>
    <input name="anyOtherConditions" value={formData.anyOtherConditions} onChange={onChange} placeholder="Other conditions" className="form-input mb-2" />
    <input name="knownAllergies" value={formData.knownAllergies} onChange={onChange} placeholder="Known allergies" className="form-input mb-2" />
    <input name="allergiesDetails" value={formData.allergiesDetails} onChange={onChange} placeholder="Allergy details" className="form-input mb-2" />
    <input name="supplements" value={formData.supplements} onChange={onChange} placeholder="Supplements" className="form-input mb-2" />
    <input name="medication" value={formData.medication} onChange={onChange} placeholder="Medication" className="form-input mb-2" />
    <input name="alcoholSmoke" value={formData.alcoholSmoke} onChange={onChange} placeholder="Alcohol/Smoke" className="form-input mb-2" />
  </div>
);

export default HealthHistorySection;