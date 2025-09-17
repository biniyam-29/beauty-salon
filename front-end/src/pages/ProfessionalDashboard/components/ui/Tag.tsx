import React from "react";
import type { FC } from "react";

export const Tag: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-rose-100/60 text-rose-800 text-sm font-medium px-3 py-1.5 rounded-full">
    {children}
  </span>
);