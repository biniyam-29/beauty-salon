import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface BooleanDisplayProps {
  value?: number | null;
  trueText?: string;
  falseText?: string;
}

export const BooleanDisplay: React.FC<BooleanDisplayProps> = ({
  value,
  trueText = "Yes",
  falseText = "No",
}) => (
  <div className="flex items-center gap-2">
    {value ? (
      <CheckCircle2 size={16} className="text-green-600" />
    ) : (
      <XCircle size={16} className="text-red-500" />
    )}
    <span className="text-gray-700">{value ? trueText : falseText}</span>
  </div>
);