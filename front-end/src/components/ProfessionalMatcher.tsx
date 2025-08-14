import React, { useState, useEffect, useMemo } from "react";
import type { PatientData, ProfessionalData } from "../types";
import { dbUrl } from "../config";

// =================================================================================
// FILE: src/components/ProfessionalMatcher.tsx
// =================================================================================

export const ProfessionalMatcher: React.FC<{ customer: PatientData }> = ({
  customer,
}) => {
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await fetch(`${dbUrl}/professionals`);
        if (!response.ok) {
          throw new Error("Could not fetch professionals data.");
        }
        const data: ProfessionalData[] = await response.json();
        setProfessionals(data);
      } catch (error) {
        console.error("Could not fetch professionals", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  const bestMatch = useMemo((): ProfessionalData | null => {
    if (
      !professionals.length ||
      !customer.skinConcerns ||
      customer.skinConcerns.length === 0
    ) {
      return null;
    }

    let bestMatch: ProfessionalData | null = null;
    let maxScore = -1;

    professionals.forEach((prof) => {
      const score = prof.skills.filter((skill) =>
        customer.skinConcerns.includes(skill)
      ).length;
      if (score > maxScore) {
        maxScore = score;
        bestMatch = prof;
      }
    });

    // Only return a match if there's at least one overlapping skill
    if (maxScore > 0) {
      return bestMatch;
    }
    return null;
  }, [professionals, customer.skinConcerns]);

  if (isLoading) {
    return (
      <div className="text-center text-sm text-gray-500 mt-8">
        Finding a professional...
      </div>
    );
  }

  if (!bestMatch) {
    return null; // Don't render anything if no suitable professional is found
  }

  return (
    <div className="mt-8 pt-6 border-t border-pink-100">
      <h3 className="text-xl font-bold font-display text-pink-800 text-center mb-4">
        Suggested Professional
      </h3>
      <div className="bg-pink-50/70 p-4 rounded-lg text-center">
        <p className="font-bold text-lg text-gray-800">{bestMatch.name}</p>
        <p className="text-sm text-gray-600">
          Specializes in: {bestMatch.skills.join(", ")}
        </p>
      </div>
    </div>
  );
};

// =================================================================================
// END FILE: src/components/ProfessionalMatcher.tsx
// =================================================================================
