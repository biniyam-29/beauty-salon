import type { FC } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface FactItemProps {
  label: string;
  value: boolean | number | undefined;
}

export const FactItem: FC<FactItemProps> = ({ label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-rose-50/70 rounded-lg">
    {value ? (
      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
    ) : (
      <XCircle size={20} className="text-red-500 flex-shrink-0" />
    )}
    <span className="text-gray-700">{label}</span>
  </div>
);