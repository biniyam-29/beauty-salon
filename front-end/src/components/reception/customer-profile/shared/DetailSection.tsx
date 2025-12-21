import React from "react";

interface DetailSectionProps {
  title: string;
  icon: React.ReactElement;
  children: React.ReactNode;
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  icon,
  children,
}) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-rose-500">{icon}</div>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
    <div className="bg-white p-6 rounded-xl border border-rose-100/60">
      {children}
    </div>
  </div>
);