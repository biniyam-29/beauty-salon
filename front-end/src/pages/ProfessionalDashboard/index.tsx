import { useState, useEffect } from "react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { User, Menu } from "lucide-react";

import type { Professional } from "./types";
import { fetchAssignedPatients } from "./services/api";

import { Sidebar } from "./components/Sidebar";
import { PatientList } from "./components/PatientList";
import { PatientDetailView } from "./components/PatientDetailView";
import { AddConsultationModal,  } from "./components/modals/AddConsultationModal";
import { ConfirmationModal } from "./components/modals/ConfirmationModal";
import { PrescriptionModal } from "./components/modals/PrescriptionModal";

const ProfessionalDashboard: FC = () => {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isAddingConsultation, setIsAddingConsultation] = useState(false);
  const [pendingPrescription, setPendingPrescription] = useState<{
    consultationId: number;
    patientName: string;
  } | null>(null);
  const [_sidebarOpen, setSidebarOpen] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<Professional | null>(null);
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setDoctorInfo(JSON.parse(userStr));
  }, []);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["assignedPatients"],
    queryFn: fetchAssignedPatients,
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleConsultationSaveSuccess = (consultationId: number) => {
    toast.success("Consultation has been saved.");
    const patient = patients?.find((p) => p.id === selectedPatientId);
    if (patient) {
      setConfirmation({
        isOpen: true,
        title: "Proceed to Prescription?",
        message: "Would you like to add a prescription for this patient now?",
        onConfirm: () => {
          setPendingPrescription({
            consultationId,
            patientName: patient.full_name,
          });
          setConfirmation(null);
        },
      });
    }
  };

  const selectedPatient = patients?.find((p) => p.id === selectedPatientId);

  return (
    <div className="flex h-screen w-full bg-[#FDF8F5] font-sans">
      <Toaster position="top-right" richColors />
      
      {/* Modals */}
      {confirmation && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          title={confirmation.title}
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}
      {isAddingConsultation && selectedPatient && (
        <AddConsultationModal
          patient={selectedPatient}
          onClose={() => setIsAddingConsultation(false)}
          onSaveSuccess={handleConsultationSaveSuccess}
        />
      )}
      {pendingPrescription && (
        <PrescriptionModal
          consultationId={pendingPrescription.consultationId}
          patientName={pendingPrescription.patientName}
          onClose={() => setPendingPrescription(null)}
        />
      )}

      {/* Layout */}
      <Sidebar doctorInfo={doctorInfo} onLogout={handleLogout} />
      
      {/* Mobile Sidebar can be its own component too */}
      {/* ... */}
      
      <main className="flex flex-1 overflow-hidden flex-col">
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <PatientList
            patients={patients}
            isLoading={isLoading}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
          <div className="flex-1 hidden md:flex flex-col">
            {selectedPatientId ? (
              <PatientDetailView
                patientId={selectedPatientId}
                onAddConsultation={() => setIsAddingConsultation(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <User size={48} className="mb-4 text-rose-300" />
                <h2 className="text-xl font-semibold">Select a Patient</h2>
                <p>Choose a patient from the list to view their details.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;