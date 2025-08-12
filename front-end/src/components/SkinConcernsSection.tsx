import React from "react";
import type { FormData } from "../formData";

type Props = {
  formData: FormData;
  onCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
};

const SkinConcernsSection: React.FC<Props> = ({
  formData,
  onCheckbox,
  options,
}) => (
  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Skin Concerns</h3>
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <label key={option} className="flex items-center">
          <input
            type="checkbox"
            name="skinConcerns"
            value={option}
            checked={formData.skinConcerns.includes(option)}
            onChange={onCheckbox}
            className="form-checkbox"
          />
          <span className="ml-2">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

export default SkinConcernsSection;
