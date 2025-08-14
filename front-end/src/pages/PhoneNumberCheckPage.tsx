import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PatientData } from "../types";
import { dbUrl } from "../config";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Input,
  Label,
} from "../components/ui";

// =================================================================================
// FILE: src/pages/PhoneNumberCheckPage.tsx
// =================================================================================

export const PhoneNumberCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${dbUrl}?phone=${phone}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data: PatientData[] = await response.json();

      if (data.length > 0) {
        navigate(`/reception/profile/${data[0].id}`);
      } else {
        navigate("/reception/register", { state: { phone } });
      }
    } catch (error: any) {
      setError(
        "Failed to connect to the server. Please make sure it's running."
      );
      console.error("Failed to fetch customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phone.trim()) handleCheck();
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-pink-800">Customer Lookup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone-check">Enter Customer's Phone Number</Label>
              <Input
                id="phone-check"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 555-123-4567"
                required
                className="text-center text-lg"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Checking..." : "Check Phone Number"}
            </Button>
          </form>
          <div className="mt-6 text-center">
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
    </div>
  );
};
// =================================================================================
// END FILE: src/pages/PhoneNumberCheckPage.tsx
// =================================================================================
