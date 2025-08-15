import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import type { PatientData, ProfessionalData } from "../../types";
import { dbUrl } from "../../config";
import { Card, CardContent, Button, Input } from "../../components/ui";

// =================================================================================
// FILE: src/pages/ProfessionalDashboardPage.tsx
// =================================================================================

export const ProfessionalDashboardPage: React.FC = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // FIX: Added useLocation hook to detect navigation changes.
  const [professional, setProfessional] = useState<ProfessionalData | null>(
    null
  );
  const [customers, setCustomers] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Ensure loading state is reset on re-fetch
      if (!professionalId) {
        setError("No professional ID provided.");
        setIsLoading(false);
        return;
      }
      try {
        // Fetch professional details
        const profResponse = await fetch(
          `${dbUrl}/professionals/${professionalId}`
        );
        if (!profResponse.ok)
          throw new Error("Could not find professional data.");
        const profData = await profResponse.json();
        setProfessional(profData);

        // Fetch customers assigned to this professional
        const custResponse = await fetch(
          `${dbUrl}/customers?assignedProfessionalId=${professionalId}`
        );
        if (!custResponse.ok)
          throw new Error("Failed to fetch assigned customers.");
        const custData = await custResponse.json();
        setCustomers(custData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [professionalId, location]); // FIX: Added 'location' to the dependency array to force a re-fetch on navigation.

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      ),
    [customers, searchTerm]
  );

  if (isLoading)
    return (
      <div className="text-center text-pink-700 font-bold">
        Loading Dashboard...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 font-bold">Error: {error}</div>
    );

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display text-pink-900">
            Professional Dashboard
          </h1>
          <p className="text-xl text-gray-600">Welcome, {professional?.name}</p>
        </div>
        <Button onClick={() => navigate("/")} variant="outline">
          Logout
        </Button>
      </div>
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search your patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <h2 className="text-2xl font-display text-pink-800 mb-4">
        Your Assigned Patients
      </h2>
      {filteredCustomers.length === 0 ? (
        <Card className="text-center">
          <CardContent>
            <p className="py-12 text-gray-500 font-semibold">
              You have no patients assigned.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Link
              to={`/professional/session/${customer.id}`}
              key={customer.id}
              className="no-underline"
            >
              <Card className="transition-transform duration-300 hover:scale-105 hover:shadow-pink-300/50 h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-200 rounded-full flex items-center justify-center text-pink-600 text-2xl font-bold font-display">
                      {customer.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-display text-gray-800">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// =================================================================================
// END FILE: src/pages/ProfessionalDashboardPage.tsx
// =================================================================================
