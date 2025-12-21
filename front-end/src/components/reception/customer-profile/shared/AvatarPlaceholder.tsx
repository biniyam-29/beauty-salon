import React from "react";

interface AvatarPlaceholderProps {
  name: string;
  className?: string;
}

export const AvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({
  name,
  className = "",
}) => {
  const initial = name?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`flex-shrink-0 flex items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};