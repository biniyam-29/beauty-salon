import type { FC } from "react";

interface InfoPillProps {
  label: string;
  value?: string | number | null;
}

export const InfoPill: FC<InfoPillProps> = ({ label, value }) =>
  value || value === 0 ? (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-gray-700 font-semibold">{String(value)}</p>
    </div>
  ) : null;