import React from "react";

interface InfoPillProps {
  label: string;
  value?: string | number | null;
}

export const InfoPill: React.FC<InfoPillProps> = ({ label, value }) => {
  if (!value && value !== 0) return null;

  return (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-gray-700 font-semibold">{String(value)}</p>
    </div>
  );
};