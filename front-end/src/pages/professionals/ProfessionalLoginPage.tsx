import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ProfessionalData } from "../../types";
import { dbUrl } from "../../config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "../../components/ui";

// =================================================================================
// FILE: src/pages/ProfessionalLoginPage.tsx
// =================================================================================

export const ProfessionalLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await fetch(`${dbUrl}/professionals`);
        if (!response.ok) {
          console.log(response);
          throw new Error(
            "Could not fetch professionals. Is the server running?"
          );
        }
        const data: ProfessionalData[] = await response.json();
        setProfessionals(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  const handleLogin = (professionalId: string) => {
    navigate(`/professional/${professionalId}`);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold font-display text-pink-900">
          Professional Portal
        </h1>
        <p className="text-xl text-gray-600 mt-2">
          Please select your profile to log in.
        </p>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-pink-800">Select Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <p className="text-center text-gray-500">
              Loading professionals...
            </p>
          )}
          {error && <p className="text-center text-red-600">{error}</p>}
          {professionals.map((prof) => (
            <Button
              key={prof.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleLogin(prof.id)}
            >
              <div className="flex items-center justify-between w-full">
                <span>{prof.name}</span>
                <span className="text-pink-600 text-xs capitalize">
                  {prof.skills[0]} Specialist
                </span>
              </div>
            </Button>
          ))}
          <div className="mt-6 text-center pt-4 border-t border-pink-100">
            <Button onClick={() => navigate("/")} variant="outline" size="sm">
              Back to Receptionist Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// =================================================================================
// END FILE: src/pages/ProfessionalLoginPage.tsx
// =================================================================================
