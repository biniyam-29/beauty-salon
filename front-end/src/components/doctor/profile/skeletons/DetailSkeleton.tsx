import React from "react";

export const DetailSkeleton: React.FC = () => (
  <div className="p-8 animate-pulse">
    <div className="flex items-center gap-6 mb-10">
      <div className="w-24 h-24 rounded-full bg-gray-200"></div>
      <div className="space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-8">
      <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="bg-gray-100 h-32 rounded-xl"></div>
      <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="bg-gray-100 h-32 rounded-xl"></div>
    </div>
  </div>
);