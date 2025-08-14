import React from "react";
import type { PatientData } from "../types";

// =================================================================================
// FILE: src/components/CustomerDetailView.tsx
// =================================================================================

export const CustomerDetailView: React.FC<{ user: PatientData }> = ({
  user,
}) => (
  <div className="space-y-6">
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-200 rounded-full flex items-center justify-center text-pink-600 text-5xl font-bold font-display ring-8 ring-white/50">
        {user.name?.charAt(0)}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-800 font-display">
          {user.name}
        </h3>
        <p className="text-gray-500">{user.email}</p>
        <p className="text-gray-500">{user.phone}</p>
      </div>
    </div>
    <div className="border-t border-pink-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="bg-pink-50/70 p-3 rounded-lg">
        <strong className="text-gray-600 block">Date of Birth:</strong>{" "}
        {user.dateOfBirth}
      </div>
      <div className="bg-pink-50/70 p-3 rounded-lg">
        <strong className="text-gray-600 block">Skin Type:</strong>{" "}
        {user.skinType}
      </div>
      <div className="bg-pink-50/70 p-3 rounded-lg md:col-span-2">
        <strong className="text-gray-600 block">Primary Concerns:</strong>{" "}
        {user.skinConcerns?.join(", ")}
      </div>
      <div className="bg-pink-50/70 p-3 rounded-lg">
        <strong className="text-gray-600 block">Used Products:</strong>{" "}
        {user.usedProducts?.join(", ")}
      </div>
      <div className="bg-pink-50/70 p-3 rounded-lg">
        <strong className="text-gray-600 block">Health Conditions:</strong>{" "}
        {user.healthConditions?.join(", ")}
      </div>
      <div className="bg-pink-50/70 p-3 rounded-lg">
        <strong className="text-gray-600 block">Smokes/Drinks:</strong>{" "}
        {user.alcoholOrSmoke ? "Yes" : "No"}
      </div>
      <div className="bg-pink-50/70 p-3 rounded-lg">
        <strong className="text-gray-600 block">Signed On:</strong>{" "}
        {user.signatureDate}
      </div>
    </div>
  </div>
);

// =================================================================================
// END FILE: src/components/CustomerDetailView.tsx
// =================================================================================
