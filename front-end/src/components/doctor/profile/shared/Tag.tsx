import React from "react";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, className = "" }) => (
  <span
    className={`bg-rose-100/60 text-rose-800 text-sm font-medium px-3 py-1.5 rounded-full ${className}`}
  >
    {children}
  </span>
);