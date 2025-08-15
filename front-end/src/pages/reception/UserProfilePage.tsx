import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { PatientData, ProfessionalData } from "../../types";
import { dbUrl } from "../../config";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Label,
  Textarea,
  Input,
  RadioGroup,
  RadioGroupItem,
} from "../../components/ui";
import { CustomerDetailView } from "../../components/CustomerDetailView";

// =================================================================================
// FILE: src/pages/UserProfilePage.tsx
// =================================================================================

// --- New Re-assignment Form Component ---
type ReassignmentFormProps = {
  customer: PatientData;
  onAssignmentComplete: () => void; // Callback to refresh the profile
};
const ReassignmentForm: React.FC<ReassignmentFormProps> = ({
  customer,
  onAssignmentComplete,
}) => {
  const [note, setNote] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | undefined
  >(undefined);
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await fetch(`${dbUrl}/professionals`);
        const data = await response.json();
        setProfessionals(data);
      } catch (error) {
        console.error("Could not fetch professionals", error);
      }
    };
    fetchProfessionals();
  }, []);

  const filteredProfessionals = useMemo(() => {
    if (!searchTerm) {
      return professionals;
    }
    return professionals.filter((prof) =>
      prof.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [professionals, searchTerm]);

  const handleSave = async () => {
    if (!selectedProfessionalId) {
      alert("Please select a professional to assign.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${dbUrl}/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedProfessionalId: selectedProfessionalId,
          conclusionNote: note,
        }),
      });
      if (!response.ok) throw new Error("Failed to re-assign professional.");
      onAssignmentComplete();
    } catch (error) {
      console.error("Error re-assigning professional:", error);
      alert(`An error occurred: ${error}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-pink-100 space-y-6">
      <h3 className="text-2xl font-display text-pink-800 text-center">
        Re-assign Professional
      </h3>
      <div className="space-y-2">
        <Label htmlFor="reassign-note">Reason for Visit / Note</Label>
        <Textarea
          id="reassign-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., Follow-up for acne treatment."
          rows={3}
        />
      </div>
      <div className="space-y-4">
        <Label htmlFor="professionalSearch">
          Search & Assign a Professional
        </Label>
        <Input
          id="professionalSearch"
          type="text"
          placeholder="Start typing a professional's name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {filteredProfessionals.length > 0 ? (
          <RadioGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-48 overflow-y-auto p-2 bg-gray-50/50 rounded-lg">
            {filteredProfessionals.map((prof) => (
              <RadioGroupItem
                key={prof.id}
                value={prof.id}
                name="professional"
                id={`reassign-prof-${prof.id}`}
                checked={selectedProfessionalId === prof.id}
                onChange={() => setSelectedProfessionalId(prof.id)}
              >
                <div>
                  <p className="font-bold">{prof.name}</p>
                  <p className="text-xs text-gray-500">
                    {prof.skills.join(", ")}
                  </p>
                </div>
              </RadioGroupItem>
            ))}
          </RadioGroup>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No professionals match your search.
          </p>
        )}
      </div>
      <Button
        onClick={handleSave}
        disabled={isSubmitting || !selectedProfessionalId}
        className="w-full"
      >
        {isSubmitting ? "Saving..." : "Save Assignment"}
      </Button>
    </div>
  );
};

// --- Main User Profile Page Component ---
export const UserProfilePage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReassignForm, setShowReassignForm] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!customerId) {
      setError("No customer ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
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
  }, [customerId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleAssignmentComplete = () => {
    setShowReassignForm(false);
    fetchUser(); // Re-fetch the user data to show the latest updates
  };

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

        {showReassignForm ? (
          <ReassignmentForm
            customer={user}
            onAssignmentComplete={handleAssignmentComplete}
          />
        ) : (
          <div className="text-center pt-8 mt-6 border-t border-pink-100">
            <Button onClick={() => setShowReassignForm(true)}>
              Re-assign Professional
            </Button>
          </div>
        )}

        <div className="text-center pt-4 mt-4">
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
