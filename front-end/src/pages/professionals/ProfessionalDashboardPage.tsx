import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { LogOut, User, Users, ClipboardPlus, Loader2, X } from "lucide-react";

// --- Type Definitions ---
interface Professional {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}
interface Patient {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  profile_picture: string | null;
  skin_concerns: { name: string }[];
}
interface Consultation {
  id: number;
  consultation_date: string;
  doctor_notes: string;
  doctor_name: string;
}

// --- API Functions ---
const API_BASE_URL = "https://beauty-api.biniyammarkos.com";
const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

const fetchAssignedPatients = async (): Promise<Patient[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/customers/assigned`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch assigned patients.");
  const data = await response.json();
  return data.customers || [];
};

const fetchPatientDetails = async (patientId: number): Promise<Patient> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/customers/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch patient details.");
  return response.json();
};

const fetchPatientConsultations = async (
  patientId: number
): Promise<Consultation[]> => {
  const token = getAuthToken();
  const response = await fetch(
    `${API_BASE_URL}/customers/${patientId}/consultations`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new Error("Failed to fetch consultations.");
  const data = await response.json();
  return data.consultations || [];
};

const addConsultation = async (payload: {
  patientId: number;
  notes: string;
  followUpDate?: string;
}): Promise<void> => {
  const token = getAuthToken();
  const userStr = localStorage.getItem("user");
  if (!userStr) throw new Error("Doctor ID not found in local storage.");
  const doctorId = JSON.parse(userStr).id;

  const body = {
    customer_id: payload.patientId,
    doctor_id: doctorId,
    doctor_notes: payload.notes,
    follow_up_date: payload.followUpDate || null,
  };
  const response = await fetch(`${API_BASE_URL}/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to save consultation.");
  }
};

// --- UI Components ---
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "ghost" }
> = ({ children, variant, className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-lg text-sm font-semibold px-5 py-2.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px",
      variant === "ghost"
        ? "bg-transparent shadow-none text-rose-600 hover:bg-rose-100/50"
        : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const AddConsultationModal: React.FC<{
  patient: Patient;
  onClose: () => void;
}> = ({ patient, onClose }) => {
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["consultations", patient.id],
      });
      onClose();
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ patientId: patient.id, notes, followUpDate });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            New Consultation for {patient.full_name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Doctor's Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              rows={6}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Next Follow-up Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Consultation"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PatientDetailView: React.FC<{
  patientId: number;
  onAddConsultation: () => void;
}> = ({ patientId, onAddConsultation }) => {
  const results = useQueries({
    queries: [
      {
        queryKey: ["patientDetails", patientId],
        queryFn: () => fetchPatientDetails(patientId),
      },
      {
        queryKey: ["consultations", patientId],
        queryFn: () => fetchPatientConsultations(patientId),
      },
    ],
  });
  const { data: patient, isLoading: isPatientLoading } = results[0];
  const { data: consultations, isLoading: isConsultationsLoading } = results[1];

  if (isPatientLoading || isConsultationsLoading)
    return (
      <p className="p-8 text-center text-gray-500">
        Loading patient details...
      </p>
    );
  if (!patient)
    return (
      <p className="p-8 text-center text-red-500">
        Could not load patient details.
      </p>
    );

  return (
    <div className="p-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {patient.full_name}
          </h2>
          <p className="text-gray-500">
            {patient.phone} • {patient.email}
          </p>
        </div>
        <Button onClick={onAddConsultation}>
          <ClipboardPlus size={16} className="mr-2" /> Add Consultation
        </Button>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Consultation History
        </h3>
        <div className="space-y-6">
          {consultations && consultations.length > 0 ? (
            consultations.map((c) => (
              <div key={c.id} className="relative pl-8">
                <div className="absolute left-0 top-1 h-full border-l-2 border-rose-200"></div>
                <div className="absolute left-[-6px] top-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
                <p className="font-bold text-rose-800">
                  {new Date(c.consultation_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  with {c.doctor_name}
                </p>
                <p className="text-gray-700">{c.doctor_notes}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No consultation history for this patient.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const PatientListSkeleton: React.FC = () => (
  <div className="p-2 space-y-1 animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page ---
const ProfessionalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [isAddingConsultation, setIsAddingConsultation] = useState(false);

  const [doctorInfo, setDoctorInfo] = useState<Professional | null>(null);
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

  const selectedPatient = patients?.find((p) => p.id === selectedPatientId);

  return (
    <div className="flex h-screen w-full bg-[#FDF8F5] font-sans">
      {isAddingConsultation && selectedPatient && (
        <AddConsultationModal
          patient={selectedPatient}
          onClose={() => setIsAddingConsultation(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-white/90 p-6 hidden lg:flex flex-col justify-between border-r border-rose-100/60 flex-shrink-0 h-screen sticky top-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <h1 className="text-2xl font-bold text-gray-800">
              Professional View
            </h1>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold bg-rose-100/60 text-rose-700">
              <Users size={20} /> Assigned Patients
            </button>
          </div>
        </div>
        {doctorInfo && (
          <div>
            <div className="border-t border-rose-100/60 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    doctorInfo.avatar ||
                    `https://i.pravatar.cc/150?u=${doctorInfo.id}`
                  }
                  alt={doctorInfo.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {doctorInfo.name}
                  </p>
                  <p className="text-xs text-gray-500">{doctorInfo.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-gray-500 rounded-md hover:bg-rose-100/50 hover:text-rose-600 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Patient List */}
        <div className="w-full md:w-2/5 lg:w-1/3 border-r border-rose-100/60 flex flex-col">
          <div className="p-4 border-b border-rose-100/60">
            <h2 className="font-bold text-gray-800">
              Your Patients ({patients?.length || 0})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <PatientListSkeleton />
            ) : (
              patients?.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors",
                    selectedPatientId === patient.id
                      ? "bg-rose-100/60"
                      : "hover:bg-rose-100/40"
                  )}
                >
                  <img
                    src={
                      patient.profile_picture ||
                      `https://i.pravatar.cc/150?u=${patient.id}`
                    }
                    alt={patient.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {patient.full_name}
                    </h3>
                    {/* ** FIXED: Safely access the skin_concerns array ** */}
                    <p className="text-sm text-gray-500">
                      {patient.skin_concerns?.[0]?.name || "No concerns listed"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patient Detail View */}
        <div className="flex-1 overflow-y-auto hidden md:block">
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
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
