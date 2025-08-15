import React from "react";

// =================================================================================
// FILE: src/components/ui/index.tsx
// This file acts as a library for all the core, reusable UI components.
// =================================================================================

// --- Utility for combining class names ---
export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

// --- Icon Components ---
export const ChevronLeftIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5 8.25 12l7.5-7.5"
    />
  </svg>
);
export const ChevronRightIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m8.25 4.5 7.5 7.5-7.5 7.5"
    />
  </svg>
);
export const CheckIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);

// --- Card Components ---
type CardProps = React.PropsWithChildren<{
  className?: string;
  onClick?: () => void;
}>;
export const Card: React.FC<CardProps> = ({ children, className, onClick }) => (
  <div
    className={`bg-white/80 backdrop-blur-sm shadow-2xl shadow-pink-200/20 rounded-2xl border border-white/20 overflow-hidden ${
      onClick ? "cursor-pointer" : ""
    } ${className}`}
  >
    {children}
  </div>
);
export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div
    className={`p-6 bg-gradient-to-br from-pink-50 to-rose-100/50 border-b border-white/20 ${className}`}
  >
    {children}
  </div>
);
export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h2 className={`text-2xl font-bold text-pink-900 font-display ${className}`}>
    {children}
  </h2>
);
export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// --- Button Component ---
type ButtonProps = React.PropsWithChildren<{
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit" | "reset";
}>;
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  variant = "default",
  size = "md",
  className = "",
  type = "button",
}) => {
  const baseStyles =
    "font-bold rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4";
  const sizeStyles = size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3";
  const variantStyles =
    variant === "outline"
      ? "border-2 border-pink-300 bg-transparent text-pink-700 hover:bg-pink-100/50 hover:border-pink-400 focus:ring-pink-200"
      : "bg-gradient-to-br from-pink-600 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/50 focus:ring-pink-300";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
};

// --- Form Element Components ---
export const Input: React.FC<React.ComponentProps<"input">> = (props) => (
  <input
    {...props}
    className={`w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all ${props.className}`}
  />
);
export const Label: React.FC<React.ComponentProps<"label">> = (props) => (
  <label
    {...props}
    className={`block text-sm font-bold text-gray-600 mb-2 ${props.className}`}
  />
);
export const Textarea: React.FC<React.ComponentProps<"textarea">> = (props) => (
  <textarea
    {...props}
    className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
  />
);
export const RadioGroup: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => (
  <div className={`flex flex-wrap gap-4 ${className}`}>{children}</div>
);

type RadioGroupItemProps = React.PropsWithChildren<{
  value: string;
  id: string;
  name: string;
  checked: boolean;
  onChange: () => void;
}>;
export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  id,
  name,
  checked,
  onChange,
  children,
}) => (
  <div className="flex items-center">
    <input
      type="radio"
      value={value}
      id={id}
      name={name}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <label
      htmlFor={id}
      className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${
        checked
          ? "bg-pink-100 border-pink-500 shadow-inner"
          : "bg-gray-50 border-gray-200 hover:border-pink-300"
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          checked ? "border-pink-600 bg-pink-600" : "border-gray-400"
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-white"></span>}
      </span>
      <span
        className={`ml-3 font-semibold ${
          checked ? "text-pink-900" : "text-gray-700"
        }`}
      >
        {children}
      </span>
    </label>
  </div>
);

type CheckboxProps = React.PropsWithChildren<{
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}>;
export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onCheckedChange,
  children,
}) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="sr-only"
    />
    <label
      htmlFor={id}
      className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${
        checked
          ? "bg-pink-100 border-pink-500 shadow-inner"
          : "bg-gray-50 border-gray-200 hover:border-pink-300"
      }`}
    >
      <span
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
          checked ? "bg-pink-600 border-pink-600" : "border-gray-400"
        }`}
      >
        {checked && <CheckIcon className="w-4 h-4 text-white" />}
      </span>
      <span
        className={`ml-3 font-semibold ${
          checked ? "text-pink-900" : "text-gray-700"
        }`}
      >
        {children}
      </span>
    </label>
  </div>
);

type SwitchProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};
export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onCheckedChange,
}) => (
  <button
    type="button"
    id={id}
    onClick={() => onCheckedChange(!checked)}
    className={`${
      checked ? "bg-pink-600" : "bg-gray-300"
    } relative inline-flex h-7 w-14 items-center rounded-full transition-colors`}
  >
    <span
      className={`${
        checked ? "translate-x-8" : "translate-x-1"
      } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
    />
  </button>
);

export const Progress: React.FC<{ value: number; className?: string }> = ({
  value,
  className,
}) => (
  <div className={`w-full bg-pink-200/50 rounded-full h-3 ${className}`}>
    <div
      className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500 ease-out"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

export const CameraIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
    />
  </svg>
);

// =================================================================================
// END FILE: src/components/ui/index.tsx
// =================================================================================
