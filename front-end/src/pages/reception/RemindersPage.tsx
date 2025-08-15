import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { PatientData, SessionData } from "../../types";
import { dbUrl } from "../../config";
import { Card, CardContent, Button, CheckIcon } from "../../components/ui";

// =================================================================================
// FILE: src/pages/RemindersPage.tsx
// =================================================================================

export const RemindersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<PatientData[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [custResponse, sessResponse] = await Promise.all([
        fetch(`${dbUrl}/customers`),
        fetch(`${dbUrl}/sessions`),
      ]);

      if (!custResponse.ok) throw new Error("Failed to fetch customers.");
      if (!sessResponse.ok) throw new Error("Failed to fetch sessions.");

      const custData = await custResponse.json();
      const sessData = await sessResponse.json();

      setCustomers(custData);
      setSessions(sessData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const customersToRemind = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 0);

    const latestSessionMap = new Map<string, SessionData>();
    sessions.forEach((session) => {
      const existingSession = latestSessionMap.get(session.customerId);
      if (
        !existingSession ||
        new Date(session.date) > new Date(existingSession.date)
      ) {
        latestSessionMap.set(session.customerId, session);
      }
    });

    return customers
      .map((customer) => {
        const latestSession = latestSessionMap.get(customer.id!);
        if (!latestSession || latestSession.reminderDismissed) return null;

        const lastSessionDate = new Date(latestSession.date);
        if (lastSessionDate < thirtyDaysAgo) {
          const daysSince = Math.floor(
            (new Date().getTime() - lastSessionDate.getTime()) /
              (1000 * 3600 * 24)
          );
          return { ...customer, latestSession, daysSince };
        }
        return null;
      })
      .filter(
        (
          customer
        ): customer is PatientData & {
          latestSession: SessionData;
          daysSince: number;
        } => customer !== null
      );
  }, [customers, sessions]);

  const handleDismiss = async (sessionId: string) => {
    try {
      const response = await fetch(`${dbUrl}/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderDismissed: true }),
      });
      if (!response.ok) throw new Error("Failed to dismiss reminder.");
      // Refresh data from server to update the list
      fetchData();
    } catch (error) {
      console.error("Error dismissing reminder:", error);
    }
  };

  if (isLoading)
    return (
      <div className="text-center text-pink-700 font-bold">
        Loading Reminders...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 font-bold">Error: {error}</div>
    );

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-display text-pink-900">
          Follow-Up Reminders
        </h1>
        <Button onClick={() => navigate("/reception")} variant="outline">
          Back to Welcome
        </Button>
      </div>
      <p className="text-gray-600 mb-6">
        Showing patients whose last session was more than 30 days ago and have
        not been dismissed.
      </p>

      {customersToRemind.length === 0 ? (
        <Card className="text-center">
          <CardContent>
            <p className="py-12 text-gray-500 font-semibold">
              No follow-up reminders at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customersToRemind.map((customer) => (
            <Card
              key={customer.id}
              className="transition-transform duration-300 hover:scale-105 hover:shadow-pink-300/50 relative"
            >
              <Button
                variant="outline"
                size="sm"
                className="absolute top-3 right-3 !p-2 h-auto rounded-full z-10"
                onClick={() => handleDismiss(customer.latestSession.id)}
                title="Dismiss Reminder"
              >
                <CheckIcon className="w-4 h-4" />
              </Button>
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
                    <p className="text-sm text-gray-500 mt-2">
                      Last visit:{" "}
                      <span className="font-bold">
                        {new Date(
                          customer.latestSession.date
                        ).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-xs text-pink-700">
                      ({customer.daysSince} days ago)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
