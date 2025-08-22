import React, { useState } from "react";

// --- Type Definitions ---
interface Doctor {
  name: string;
  specialty: string;
  avatar: string;
}

interface PatientHistory {
  date: string;
  treatment: string;
  notes: string;
  doctorAnalysis?: string;
  images?: string[];
}

interface Patient {
  id: number;
  name: string;
  details: string;
  appointmentType: string;
  appointmentDetails: string;
  time1: string;
  time2: string;
  avatar: string;
  buttonType: "primary" | "secondary";
  history: PatientHistory[];
}

// --- Mock Data ---
const doctorInfo: Doctor = {
  name: "Dr. Evelyn Reed",
  specialty: "Cardiologist",
  avatar: "https://placehold.co/100x100/FFFFFF/E91E63?text=Dr",
};

const initialPatients: Patient[] = [
  {
    id: 1,
    name: "Same",
    details: "Zotre 20m",
    appointmentType: "Appointment",
    appointmentDetails: "Uptay 2220m",
    time1: "1:00 Pm",
    time2: "18:00 Pm",
    avatar: "https://placehold.co/100x100/E91E63/FFFFFF?text=S",
    buttonType: "secondary",
    history: [
      {
        date: "2023-07-15",
        treatment: "Chemical Peel",
        notes: "Patient reported mild redness.",
        doctorAnalysis: "Standard reaction. Advised patient to moisturize.",
        images: ["https://placehold.co/300x200/ccc/fff?text=Post-Peel+1"],
      },
    ],
  },
  {
    id: 2,
    name: "Mane Name",
    details: "Daire 20m",
    appointmentType: "Appointment",
    appointmentDetails: "Uptay 2220m",
    time1: "1:00 Pm",
    time2: "17:30 Pm",
    avatar: "https://placehold.co/100x100/4CAF50/FFFFFF?text=M",
    buttonType: "primary",
    history: [
      {
        date: "2023-08-01",
        treatment: "Microdermabrasion",
        notes: "Positive results, skin appears smoother.",
      },
    ],
  },
  {
    id: 3,
    name: "Sume",
    details: "Zotre 20m",
    appointmentType: "Appointment",
    appointmentDetails: "Uptay 3220m",
    time1: "1:00 Pm",
    time2: "14:00 Pm",
    avatar: "https://placehold.co/100x100/FFC107/FFFFFF?text=S",
    buttonType: "primary",
    history: [],
  },
  {
    id: 4,
    name: "Nam",
    details: "Dotre 20m",
    appointmentType: "Appointment",
    appointmentDetails: "Uptay 2220m",
    time1: "1:00 Pm",
    time2: "17:30 Pm",
    avatar: "https://placehold.co/100x100/2196F3/FFFFFF?text=N",
    buttonType: "primary",
    history: [
      {
        date: "2023-06-20",
        treatment: "Laser Resurfacing",
        notes: "Follow-up required in 2 weeks.",
      },
    ],
  },
];

// --- Sub-Components ---

interface SidebarProps {
  doctor: Doctor;
  onEditProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ doctor, onEditProfile }) => (
  <div className="w-1/5 bg-rose-800 p-6 flex flex-col text-white">
    <div className="text-center mb-10">
      <img
        className="w-24 h-24 rounded-full mx-auto border-4 border-rose-700"
        src={doctor.avatar}
        alt="Doctor Avatar"
      />
      <h2 className="font-bold text-xl mt-4">{doctor.name}</h2>
      <p className="text-sm text-rose-200">{doctor.specialty}</p>
    </div>
    <button
      onClick={onEditProfile}
      className="w-full bg-rose-700 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
    >
      Edit Profile
    </button>
  </div>
);

interface PatientCardProps {
  patient: Patient;
  onSelect: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onSelect }) => (
  <div className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <img
        className="w-12 h-12 rounded-full"
        src={patient.avatar}
        alt={`Patient ${patient.name}`}
      />
      <div>
        <p className="font-bold text-gray-900">{patient.name}</p>
        <p className="text-sm text-gray-500">{patient.details}</p>
      </div>
    </div>
    <div>
      <p className="font-semibold text-gray-800">{patient.appointmentType}</p>
      <p className="text-sm text-gray-500">{patient.appointmentDetails}</p>
    </div>
    <div>
      <p className="font-bold text-lg text-gray-900">{patient.time1}</p>
      <p className="text-sm text-gray-500 text-right">{patient.time2}</p>
    </div>
    <button
      onClick={() => onSelect(patient)}
      className={`font-semibold py-2 px-8 rounded-lg transition-colors ${
        patient.buttonType === "primary"
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "bg-rose-100 text-rose-700 hover:bg-rose-200"
      }`}
    >
      Select
    </button>
  </div>
);

interface EditProfileModalProps {
  doctor: Doctor;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  doctor,
  onClose,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
        <form>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                defaultValue={doctor.name}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                defaultValue="e.reed@example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {showPassword && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label
                    htmlFor="old_password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Old Password
                  </label>
                  <input
                    type="password"
                    id="old_password"
                    placeholder="Enter your current password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new_password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    placeholder="Enter new password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-rose-600 hover:underline"
            >
              {showPassword ? "Cancel Password Change" : "Change Password"}
            </button>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PatientDetailViewProps {
  patient: Patient;
  onBack: () => void;
  onSaveHistory: (patientId: number, newHistory: PatientHistory) => void;
}

const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  onBack,
  onSaveHistory,
}) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = () => {
    const newImage = `https://placehold.co/300x200/d1d5db/4b5563?text=New+Image+${
      images.length + 1
    }`;
    setImages([...images, newImage]);
  };

  const handleSave = () => {
    if (!analysis.trim()) {
      alert("Please enter an analysis.");
      return;
    }
    const newHistoryEntry: PatientHistory = {
      date: new Date().toISOString().split("T")[0],
      treatment: "Doctor's Analysis",
      notes: analysis,
      images: images,
    };
    onSaveHistory(patient.id, newHistoryEntry);
    setAnalysis("");
    setImages([]);
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 text-rose-600 hover:underline font-semibold"
      >
        &larr; Back to Patient List
      </button>
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center space-x-6 mb-6">
          <img
            className="w-24 h-24 rounded-full"
            src={patient.avatar}
            alt={`Patient ${patient.name}`}
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{patient.name}</h2>
            <p className="text-md text-gray-500">{patient.details}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 border-t pt-6 mt-6">
          Previous History
        </h3>
        <div className="mt-4 space-y-4">
          {patient.history.length > 0 ? (
            patient.history.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700">
                  {item.date} - {item.treatment}
                </p>
                <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                {item.doctorAnalysis && (
                  <p className="text-sm text-rose-800 mt-2 font-semibold">
                    Dr. Analysis:{" "}
                    <span className="font-normal">{item.doctorAnalysis}</span>
                  </p>
                )}
                {item.images && item.images.length > 0 && (
                  <div className="mt-2 flex space-x-2">
                    {item.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="w-24 h-16 rounded object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No previous history found for this patient.
            </p>
          )}
        </div>

        <div className="border-t pt-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800">
            Add Doctor's Analysis
          </h3>
          <div className="mt-4 space-y-4">
            <textarea
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              placeholder="Enter your analysis and notes here..."
              rows={4}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            ></textarea>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleImageUpload}
                className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Attach Pictures
              </button>
              <div className="flex space-x-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-20 h-14 rounded object-cover"
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-700"
            >
              Save Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const AssignedPatientsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientList, setPatientList] = useState<Patient[]>(initialPatients);

  const handleSaveHistory = (patientId: number, newHistory: PatientHistory) => {
    const updatedPatientList = patientList.map((p) => {
      if (p.id === patientId) {
        const updatedHistory = [newHistory, ...p.history];
        return { ...p, history: updatedHistory };
      }
      return p;
    });
    setPatientList(updatedPatientList);
    setSelectedPatient(
      updatedPatientList.find((p) => p.id === patientId) || null
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar doctor={doctorInfo} onEditProfile={() => setIsModalOpen(true)} />

      <main className="w-4/5 bg-gray-50 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {selectedPatient ? (
            <PatientDetailView
              patient={selectedPatient}
              onBack={() => setSelectedPatient(null)}
              onSaveHistory={handleSaveHistory}
            />
          ) : (
            <>
              <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800">
                  Assigned Patients
                </h1>
                <button className="bg-white text-gray-700 font-semibold py-2 px-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                  Dashboard
                </button>
              </header>

              <div className="space-y-4">
                {patientList.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onSelect={setSelectedPatient}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {isModalOpen && (
        <EditProfileModal
          doctor={doctorInfo}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AssignedPatientsPage;
