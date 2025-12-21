import React from "react";
import { HelpCircle } from "lucide-react";

export const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/60",
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 border-b border-rose-100">{children}</div>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("p-6", className)}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-bold text-rose-800 font-sans">{children}</h2>
);

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "ghost";
  }
> = ({ children, variant, className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-lg text-sm font-semibold px-5 py-2.5 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px",
      variant === "outline" &&
        "bg-transparent border border-rose-500 text-rose-600 hover:bg-rose-50",
      variant === "ghost" &&
        "bg-transparent shadow-none text-rose-600 hover:bg-rose-100/50",
      !variant && "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { helperText?: string }> = (
  { helperText, ...props }
) => (
  <div className="space-y-1">
    <input
      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-3 bg-white/70"
      {...props}
    />
    {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
  </div>
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & { helperText?: string }> = (
  { children, helperText, ...props }
) => (
  <div className="mb-2">
    <label className="block text-sm font-bold text-gray-700" {...props}>
      {children}
    </label>
    {helperText && (
      <div className="flex items-center gap-1 mt-1">
        <HelpCircle size={12} className="text-gray-400" />
        <p className="text-xs text-gray-500">{helperText}</p>
      </div>
    )}
  </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { helperText?: string }> = (
  { helperText, ...props }
) => (
  <div className="space-y-1">
    <textarea
      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-3 bg-white/70"
      {...props}
    />
    {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
  </div>
);

export const Checkbox: React.FC<{
  children: React.ReactNode;
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  helperText?: string;
}> = ({ children, id, checked, onCheckedChange, helperText }) => (
  <div className="space-y-1">
    <label
      htmlFor={id}
      className={cn(
        "flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
        checked
          ? "bg-rose-50 border-rose-500"
          : "bg-white border-gray-200 hover:border-rose-300"
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 mt-0.5"
      />
      <div className="ml-3 block text-sm">
        <div className="font-medium text-gray-800">{children}</div>
        {helperText && <p className="text-xs text-gray-600 mt-1">{helperText}</p>}
      </div>
    </label>
  </div>
);