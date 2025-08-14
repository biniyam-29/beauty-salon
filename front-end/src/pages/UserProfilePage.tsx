import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { PatientData } from "../types";
import { dbUrl } from "../config";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
} from "../components/ui";
import { CustomerDetailView } from "../components/CustomerDetailView";

// =================================================================================
// FILE: src/pages/UserProfilePage.tsx
// =================================================================================

export const UserProfilePage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!customerId) {
        setError("No customer ID provided.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${dbUrl}/customers/${customerId}`);
        if (!response.ok) throw new Error("Customer not found");
        const data = await response.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [customerId]);

  if (isLoading)
    return (
      <div className="text-center text-pink-700 font-bold">
        Loading profile...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 font-bold">Error: {error}</div>
    );
  if (!user)
    return (
      <div className="text-center text-gray-500 font-bold">
        No user data found.
      </div>
    );

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-pink-800">Customer Profile</CardTitle>
      </CardHeader>
      <CardContent className="pt-8">
        <CustomerDetailView user={user} />
        <div className="text-center pt-8 mt-6 border-t border-pink-100">
          <Button
            onClick={() => navigate("/reception")}
            variant="outline"
            size="sm"
          >
            Back to Welcome
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
// =================================================================================
// END FILE: src/pages/UserProfilePage.tsx
// =================================================================================
