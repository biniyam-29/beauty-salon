import React, { useState, useEffect } from "react";
import type { PatientData, ProfessionalData, SessionData } from "../types";
import { dbUrl } from "../config";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui";

// =================================================================================
// FILE: src/components/CustomerDetailView.tsx
// =================================================================================

export const CustomerDetailView: React.FC<{ user: PatientData }> = ({
  user,
}) => {
  const [professional, setProfessional] = useState<ProfessionalData | null>(
    null
  );
  const [sessions, setSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    const fetchProfessionalAndSessions = async () => {
      // Fetch assigned professional if there is one
      if (user.assignedProfessionalId) {
        try {
          const profResponse = await fetch(
            `${dbUrl}/professionals/${user.assignedProfessionalId}`
          );
          if (profResponse.ok) {
            const profData = await profResponse.json();
            setProfessional(profData);
          }
        } catch (error) {
          console.error("Could not fetch professional", error);
        }
      }

      // Fetch sessions for the customer
      if (user.id) {
        try {
          const sessResponse = await fetch(
            `${dbUrl}/sessions?customerId=${user.id}`
          );
          if (sessResponse.ok) {
            const sessData = await sessResponse.json();
            setSessions(sessData);
          }
        } catch (error) {
          console.error("Could not fetch sessions", error);
        }
      }
    };

    fetchProfessionalAndSessions();
  }, [user.id, user.assignedProfessionalId]);

  return (
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
      {user.conclusionNote && (
        <div className="border-t border-pink-100 pt-6">
          <h4 className="text-lg font-bold font-display text-pink-800 mb-2">
            Receptionist Note
          </h4>
          <p className="text-gray-700 p-3 bg-pink-50/70 rounded-lg">
            {user.conclusionNote}
          </p>
        </div>
      )}
      {professional && (
        <div className="border-t border-pink-100 pt-6">
          <h4 className="text-lg font-bold font-display text-pink-800 mb-2">
            Assigned Professional
          </h4>
          <div className="bg-pink-50/70 p-3 rounded-lg">
            <p className="font-bold text-gray-800">{professional.name}</p>
            <p className="text-xs text-gray-600">
              {professional.skills.join(", ")}
            </p>
          </div>
        </div>
      )}
      {sessions.length > 0 && (
        <div className="border-t border-pink-100 pt-6">
          <h4 className="text-lg font-bold font-display text-pink-800 mb-4">
            Session History
          </h4>
          <div className="space-y-4">
            {sessions
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((session) => (
                <Card key={session.id} className="bg-white/90">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Session on {new Date(session.date).toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <h5 className="font-bold text-gray-700">Notes</h5>
                      <p className="text-gray-600">{session.notes}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-700">Prescription</h5>
                      <p className="text-gray-600">{session.prescription}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =================================================================================
// END FILE: src/components/CustomerDetailView.tsx
// =================================================================================
