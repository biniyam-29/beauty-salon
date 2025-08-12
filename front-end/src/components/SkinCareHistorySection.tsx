import React from "react";
import type { FormData } from "../formData";

type Props = {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
};

const SkinCareHistorySection: React.FC<Props> = ({
  formData,
  onChange,
  onCheckbox,
  options,
}) => (
  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Skin Care History</h3>
    <div className="mb-2">Currently used products:</div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      {options.map((option) => (
        <label key={option} className="flex items-center">
          <input
            type="checkbox"
            name="skinCareProducts"
            value={option}
            checked={formData.skinCareProducts.includes(option)}
            onChange={onCheckbox}
            className="form-checkbox"
          />
          <span className="ml-2">{option}</span>
        </label>
      ))}
    </div>
    <input
      name="others"
      value={formData.others}
      onChange={onChange}
      placeholder="Other products"
      className="form-input"
    />
  </div>
);

export default SkinCareHistorySection;
