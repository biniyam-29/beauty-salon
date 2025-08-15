import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PatientData, SessionData } from "../../types";
import { dbUrl } from "../../config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Textarea,
  CameraIcon,
} from "../../components/ui";
import { CustomerDetailView } from "../../components/CustomerDetailView";

// =================================================================================
// FILE: src/pages/ProfessionalSessionPage.tsx
// =================================================================================

// --- New Session Form Component ---
type NewSessionFormProps = {
  customerId: string;
  professionalId: string;
  onProcessComplete: () => void; // Callback to navigate after completion
};
const NewSessionForm: React.FC<NewSessionFormProps> = ({
  customerId,
  professionalId,
  onProcessComplete,
}) => {
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const imageUrls = images.map((file) => `images/${file.name}`);

    const newSession: Omit<SessionData, "id"> = {
      customerId,
      professionalId,
      date: new Date().toISOString().split("T")[0],
      notes,
      prescription,
      images: imageUrls,
    };

    try {
      // Step 1: Save the new session
      const sessionResponse = await fetch(`${dbUrl}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });
      if (!sessionResponse.ok) throw new Error("Failed to save session.");

      // Step 2: Un-assign the professional from the customer
      const customerUpdateResponse = await fetch(
        `${dbUrl}/customers/${customerId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignedProfessionalId: "null" }),
        }
      );
      if (!customerUpdateResponse.ok)
        throw new Error("Failed to update customer assignment.");

      // Step 3: Trigger the completion callback (which will navigate away)
      onProcessComplete();
    } catch (error) {
      console.error("Error completing session process:", error);
      alert(`An error occurred: ${error}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Session & Complete</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="session-notes">Conclusion Note</Label>
            <Textarea
              id="session-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your analysis and conclusion..."
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-prescription">Prescription</Label>
            <Textarea
              id="session-prescription"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Enter any prescribed products or treatments..."
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Attach Pictures</Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="session-images"
                className="font-bold rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 border-2 border-pink-300 bg-transparent text-pink-700 hover:bg-pink-100/50 hover:border-pink-400 focus:ring-pink-200 px-4 py-2 text-sm inline-flex items-center cursor-pointer"
              >
                <CameraIcon className="w-4 h-4 mr-2" />
                Choose Files
              </label>
              <input
                id="session-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="text-sm text-gray-500">
                {images.length > 0
                  ? `${images.length} file(s) selected`
                  : "No files chosen"}
              </span>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : "Save & Discharge Patient"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// --- Session History Component ---
const SessionHistory: React.FC<{ sessions: SessionData[] }> = ({
  sessions,
}) => {
  if (sessions.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        No previous sessions found for this patient.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {sessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Session on {new Date(session.date).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-700">Notes</h4>
                <p className="text-gray-600 p-3 bg-gray-50 rounded-md">
                  {session.notes}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-700">Prescription</h4>
                <p className="text-gray-600 p-3 bg-gray-50 rounded-md">
                  {session.prescription}
                </p>
              </div>
              {session.images.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-700">Attached Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {session.images.map((img, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <span className="text-xs text-gray-500 text-center p-1">
                          Placeholder for: {img.split("/").pop()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

// --- Main Session Page Component ---
export const ProfessionalSessionPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<PatientData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // FIX: Added state to store the professional's ID when the page loads.
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  const fetchSessionData = useCallback(async () => {
    if (!customerId) {
      setError("No customer ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [custResponse, sessResponse] = await Promise.all([
        fetch(`${dbUrl}/customers/${customerId}`),
        fetch(`${dbUrl}/sessions?customerId=${customerId}`),
      ]);

      if (!custResponse.ok) throw new Error("Could not find customer data.");
      if (!sessResponse.ok) throw new Error("Could not fetch session history.");

      const custData = await custResponse.json();
      const sessData = await sessResponse.json();

      setCustomer(custData);
      setSessions(sessData);
      // FIX: Store the professional's ID in state before it gets changed.
      if (custData.assignedProfessionalId) {
        setProfessionalId(custData.assignedProfessionalId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const handleProcessComplete = () => {
    // FIX: Use the stored, stable professional ID for navigation.
    if (professionalId) {
      navigate(`/professional/${professionalId}`);
    } else {
      // Fallback in case the ID was not set
      navigate("/professional-login");
    }
  };

  if (isLoading)
    return (
      <div className="text-center text-pink-700 font-bold">
        Loading Session...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 font-bold">Error: {error}</div>
    );
  if (!customer)
    return (
      <div className="text-center text-gray-500 font-bold">
        No customer data found.
      </div>
    );

  return (
    <div className="w-full animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display text-pink-900">
            Patient Session: {customer.name}
          </h1>
          <p className="text-xl text-gray-600">
            Manage session notes, prescriptions, and progress photos.
          </p>
        </div>
        <Button
          onClick={() => navigate(`/professional/${professionalId}`)}
          variant="outline"
        >
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerDetailView user={customer} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <h2 className="text-2xl font-display text-pink-800">New Entry</h2>
          <NewSessionForm
            customerId={customerId!}
            professionalId={professionalId!}
            onProcessComplete={handleProcessComplete}
          />
        </div>
        <div className="space-y-8">
          <h2 className="text-2xl font-display text-pink-800">
            Session History
          </h2>
          <SessionHistory sessions={sessions} />
        </div>
      </div>
    </div>
  );
};

// =================================================================================
// END FILE: src/pages/ProfessionalSessionPage.tsx
// =================================================================================
