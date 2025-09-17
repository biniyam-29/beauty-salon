import { useState, useMemo } from "react";
import type { FC } from "react";

import { usePatientData } from "../hooks/usePatientData";
import { ProfileTab } from "./ProfileTab";
import { ConsultationsTab } from "./ConsultationsTab";
import { PrescriptionsTab } from "./PrescriptionsTab";
import { AvatarPlaceholder } from "./ui/Avatar";
import { cn } from "../services/utils";

interface PatientDetailViewProps {
  patientId: number;
  onAddConsultation: () => void;
}

export const PatientDetailView: FC<PatientDetailViewProps> = ({
  patientId,
  onAddConsultation,
}) => {
  // Set the default active tab to 'consultations' for immediate access to history
  const [activeTab, setActiveTab] = useState("consultations");
  const { patient, consultations, allPrescriptions, isLoading, isError } =
    usePatientData(patientId);

  const patientPrescriptions = useMemo(() => {
    if (!patient || !allPrescriptions) return [];
    return allPrescriptions.filter(
      (p) =>
        p.customer_phone === patient.phone ||
        p.customer_name === patient.full_name
    );
  }, [patient, allPrescriptions]);

  if (isLoading) {
    return <p className="p-8 text-center text-gray-500">Loading patient details...</p>;
  }

  if (isError || !patient) {
    return <p className="p-8 text-center text-red-500">Could not load patient details.</p>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-rose-100/80">
        <div className="flex items-center gap-4">
          <AvatarPlaceholder name={patient.full_name} className="w-16 h-16 text-2xl" />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{patient.full_name}</h2>
            <p className="text-gray-500">{patient.phone} • {patient.email}</p>
          </div>
        </div>
        
        {/* Tabs - Reordered for better workflow */}
        <div className="mt-6 flex border-b border-rose-200/60 -mb-px">
          <button
            onClick={() => setActiveTab("consultations")}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === "consultations"
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-rose-500 border-b-2 border-transparent"
            )}
          >
            Consultations
          </button>
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === "prescriptions"
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-rose-500 border-b-2 border-transparent"
            )}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === "profile"
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-gray-500 hover:text-rose-500 border-b-2 border-transparent"
            )}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "consultations" && (
          <ConsultationsTab
            consultations={consultations || []}
            onAddConsultation={onAddConsultation}
          />
        )}
        {activeTab === "prescriptions" && (
          <PrescriptionsTab prescriptions={patientPrescriptions} />
        )}
        {activeTab === "profile" && <ProfileTab patient={patient} />}
      </div>
    </div>
  );
};