import React, { useState } from "react";

// --- Type Definitions ---
interface Doctor {
  name: string;
  specialty: string;
  avatar: string;
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
}

// --- Mock Data ---
const doctorInfo: Doctor = {
  name: "Dr. Evelyn Reed",
  specialty: "Cardiologist",
  avatar: "https://placehold.co/100x100/FFFFFF/E91E63?text=Dr",
};

const patients: Patient[] = [
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
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => (
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

// --- Main Page Component ---

const AssignedPatientsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar doctor={doctorInfo} onEditProfile={() => setIsModalOpen(true)} />

      <main className="w-4/5 bg-gray-50 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800">
              Assigned Patients
            </h1>
            <button className="bg-white text-gray-700 font-semibold py-2 px-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
              Dashboard
            </button>
          </header>

          <div className="space-y-4">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
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
