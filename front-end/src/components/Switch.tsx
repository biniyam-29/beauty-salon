// FILE: src/components/Switch.tsx
import React from "react";

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  label,
}) => (
  <div className="flex items-center justify-between">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`${
        checked ? "bg-red-500" : "bg-gray-200"
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`${
          checked ? "translate-x-5" : "translate-x-0"
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);
