import React from "react";

export const ListSkeleton: React.FC = () => (
  <div className="space-y-2">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);