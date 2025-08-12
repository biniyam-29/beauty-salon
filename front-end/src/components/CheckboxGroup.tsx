import React from "react";

interface CheckboxGroupProps {
  label: string;
  name: string;
  options: string[];
  values: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  name,
  options,
  values,
  onChange,
}) => (
  <div className="mb-4">
    <h3 className="font-semibold text-lg text-gray-800 mb-2">{label}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((option) => (
        <label key={option} className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            name={name}
            value={option}
            checked={values.includes(option)}
            onChange={onChange}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
          <span className="ml-2">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

export default CheckboxGroup;
