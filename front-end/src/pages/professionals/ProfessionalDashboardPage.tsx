import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- Type Definitions ---
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
}

interface PatientProfile {
  skin_type: string;
  skin_feel: string;
  sun_exposure: string;
  used_products: string;
}

interface SkinConcern {
  id: number;
  name: string;
}

interface HealthCondition {
  id: number;
  name: string;
}

interface Patient {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  birth_date?: string;
  profile?: PatientProfile;
  skin_concerns?: SkinConcern[];
  health_conditions?: HealthCondition[];
}

interface ConsultationImage {
  id: number;
  image_url: string;
  description: string;
}

interface Consultation {
  id: number;
  consultation_date: string;
  doctor_notes: string;
  doctor_name: string;
  images?: ConsultationImage[];
}

// --- Sub-Components ---

interface SidebarProps {
  doctor: Doctor;
  onEditProfile: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  doctor,
  onEditProfile,
  onLogout,
}) => (
  <div className="w-1/5 bg-rose-800 p-6 flex-col text-white hidden md:flex">
    <div className="text-center mb-10 flex-grow">
      <img
        className="w-24 h-24 rounded-full mx-auto border-4 border-rose-700"
        src={doctor.avatar}
        alt="Doctor Avatar"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = `https://placehold.co/100x100/FFFFFF/E91E63?text=${doctor.name.charAt(
            0
          )}`;
        }}
      />
      <h2 className="font-bold text-xl mt-4">{doctor.name}</h2>
      <p className="text-sm text-rose-200">{doctor.specialty}</p>
    </div>
    <div className="space-y-4">
      <button
        onClick={onEditProfile}
        className="w-full bg-rose-700 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Edit Profile
      </button>
      <button
        onClick={onLogout}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Logout
      </button>
    </div>
  </div>
);

interface PatientCardProps {
  patient: Patient;
  onView: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onView }) => (
  <div className="bg-white rounded-xl shadow-md p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div className="flex items-center space-x-4 flex-grow">
      <img
        className="w-12 h-12 rounded-full"
        src={`https://placehold.co/100x100/E91E63/FFFFFF?text=${patient.full_name.charAt(
          0
        )}`}
        alt={`Patient ${patient.full_name}`}
      />
      <div>
        <p className="font-bold text-gray-900">{patient.full_name}</p>
        <p className="text-sm text-gray-500">{patient.phone}</p>
        <p className="text-sm text-gray-500">{patient.email}</p>
      </div>
    </div>
    <button
      onClick={onView}
      className={`font-semibold py-2 px-8 rounded-lg transition-colors bg-rose-600 text-white hover:bg-rose-700`}
    >
      View
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

// --- Add Consultation Modal ---
const AddConsultationModal: React.FC<{
  patientId: number;
  onClose: () => void;
}> = ({ patientId, onClose }) => {
  const [feedback, setFeedback] = useState("");
  const [goals, setGoals] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageDescription, setImageDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      setError("Authentication error. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      const doctorId = userData.id;

      const payload = {
        customer_id: patientId,
        doctor_id: doctorId,
        previous_treatment_feedback: feedback
          .split("\n")
          .filter((line) => line.trim() !== ""),
        treatment_goals_today: goals
          .split("\n")
          .filter((line) => line.trim() !== ""),
        doctor_notes: notes,
        follow_up_date: followUpDate,
      };

      const response = await fetch(
        "https://beauty-api.biniyammarkos.com/consultations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save consultation.");
      }

      if (image) {
        const consultationsResponse = await fetch(
          `https://beauty-api.biniyammarkos.com/customers/${patientId}/consultations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!consultationsResponse.ok)
          throw new Error(
            "Could not re-fetch consultations to find the latest ID."
          );

        const consultations: Consultation[] =
          await consultationsResponse.json();

        if (consultations && consultations.length > 0) {
          consultations.sort(
            (a, b) =>
              new Date(b.consultation_date).getTime() -
              new Date(a.consultation_date).getTime()
          );
          const latestConsultationId = consultations[0].id;

          const formData = new FormData();
          formData.append("image", image);
          formData.append("description", imageDescription);

          const imageResponse = await fetch(
            `https://beauty-api.biniyammarkos.com/consultations/${latestConsultationId}/images`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (!imageResponse.ok) {
            const imgError = await imageResponse.json();
            throw new Error(
              imgError.message ||
                "Consultation saved, but failed to upload image."
            );
          }
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Add New Consultation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Previous Treatment Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              placeholder="One feedback per line..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Treatment Goals Today
            </label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              placeholder="One goal per line..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Doctor's Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700">
              Attach Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
            />
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="mt-2 rounded-md max-h-40"
              />
            )}
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Image Description
            </label>
            <input
              type="text"
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              placeholder="Brief description of the image..."
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:bg-rose-300"
            >
              {isSubmitting ? "Saving..." : "Save Consultation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Patient Detail Modal ---
const PatientDetailModal: React.FC<{
  patientId: number;
  onClose: () => void;
  onAddConsultation: () => void;
}> = ({ patientId, onClose, onAddConsultation }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }
      setIsLoading(true);
      try {
        // Fetch patient and consultation data in parallel
        const [patientRes, consultRes] = await Promise.all([
          fetch(`https://beauty-api.biniyammarkos.com/customers/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `https://beauty-api.biniyammarkos.com/customers/${patientId}/consultations`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        if (!patientRes.ok) throw new Error("Failed to fetch patient details.");
        if (!consultRes.ok) throw new Error("Failed to fetch consultations.");

        const patientData = await patientRes.json();
        const consultData = await consultRes.json();

        // Fetch images for each consultation
        const consultationsWithImages = await Promise.all(
          consultData.map(async (consult: Consultation) => {
            const imgRes = await fetch(
              `https://beauty-api.biniyammarkos.com/consultations/${consult.id}/images`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!imgRes.ok) return consult; // Return original if image fetch fails
            const images = await imgRes.json();
            return { ...consult, images: images.images };
          })
        );

        setPatient(patientData);
        setConsultations(consultationsWithImages);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [patientId, navigate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Patient Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {patient && (
          <div className="space-y-6">
            {/* ... personal info, profile, concerns sections ... */}
            <div className="pb-4 border-b">
              <h3 className="text-xl font-semibold text-rose-700 mb-2">
                Personal Information
              </h3>
              <p>
                <strong>Name:</strong> {patient.full_name}
              </p>
              <p>
                <strong>Phone:</strong> {patient.phone}
              </p>
              <p>
                <strong>Email:</strong> {patient.email}
              </p>
              <p>
                <strong>Address:</strong> {patient.address}, {patient.city}
              </p>
              <p>
                <strong>Birth Date:</strong> {patient.birth_date}
              </p>
            </div>

            {patient.profile && (
              <div className="pb-4 border-b">
                <h3 className="text-xl font-semibold text-rose-700 mb-2">
                  Skin Profile
                </h3>
                <p>
                  <strong>Skin Type:</strong> {patient.profile.skin_type}
                </p>
                <p>
                  <strong>Skin Feel:</strong> {patient.profile.skin_feel}
                </p>
                <p>
                  <strong>Sun Exposure:</strong> {patient.profile.sun_exposure}
                </p>
                <p>
                  <strong>Used Products:</strong>{" "}
                  {JSON.parse(patient.profile.used_products).join(", ")}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-semibold text-rose-700 mb-2">
                  Skin Concerns
                </h3>
                <ul className="list-disc list-inside">
                  {patient.skin_concerns?.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-rose-700 mb-2">
                  Health Conditions
                </h3>
                <ul className="list-disc list-inside">
                  {patient.health_conditions?.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* --- NEW: Consultation History Section --- */}
            <div>
              <h3 className="text-xl font-semibold text-rose-700 mb-4">
                Consultation History
              </h3>
              <div className="space-y-4">
                {consultations.length > 0 ? (
                  consultations.map((c) => (
                    <div key={c.id} className="bg-gray-50 p-4 rounded-lg">
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(c.consultation_date).toLocaleString()}
                      </p>
                      <p>
                        <strong>Doctor:</strong> {c.doctor_name}
                      </p>
                      <p className="mt-2">
                        <strong>Notes:</strong> {c.doctor_notes}
                      </p>
                      {c.images && c.images.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Images:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {c.images.map((img) => (
                              <div key={img.id}>
                                <img
                                  src={img.image_url}
                                  alt={img.description}
                                  className="w-24 h-24 object-cover rounded-md"
                                />
                                <p className="text-xs text-center">
                                  {img.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No past consultations found.</p>
                )}
              </div>
            </div>

            <div className="pt-4 text-right border-t">
              <button
                onClick={onAddConsultation}
                className="px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
              >
                Add Consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const AssignedPatientsPage: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [viewedPatientId, setViewedPatientId] = useState<number | null>(null);
  const [isAddingConsultation, setIsAddingConsultation] =
    useState<boolean>(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        console.error("Authentication required. Redirecting to login.");
        navigate("/login", { replace: true });
        return;
      }

      setIsLoading(true);
      try {
        const userData = JSON.parse(userStr);
        setDoctorInfo({
          id: userData.id,
          name: userData.full_name || "Doctor",
          specialty: userData.specialty || "Specialist",
          avatar:
            userData.avatar ||
            `https://placehold.co/100x100/FFFFFF/E91E63?text=${
              userData.full_name?.charAt(0) || "D"
            }`,
        });

        const headers = { Authorization: `Bearer ${token}` };
        const patientsResponse = await fetch(
          "https://beauty-api.biniyammarkos.com/customers/assigned",
          { headers }
        );

        if (!patientsResponse.ok) {
          throw new Error(
            `Failed to fetch patients. Status: ${patientsResponse.status}`
          );
        }

        const patientsData = await patientsResponse.json();
        setPatients(patientsData.customers || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleOpenConsultationModal = () => {
    setIsAddingConsultation(true);
  };

  const handleCloseConsultationModal = () => {
    setIsAddingConsultation(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {doctorInfo && (
        <Sidebar
          doctor={doctorInfo}
          onEditProfile={() => setIsEditModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1 bg-gray-50 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800">
              Assigned Patients
            </h1>
            <button
              onClick={() => navigate("/reception")}
              className="bg-white text-gray-700 font-semibold py-2 px-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </button>
          </header>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-500">Loading patients...</p>
            ) : error ? (
              <p className="text-center text-red-500">Error: {error}</p>
            ) : patients.length > 0 ? (
              patients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onView={() => setViewedPatientId(patient.id)}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">No patients assigned.</p>
            )}
          </div>
        </div>
      </main>

      {isEditModalOpen && doctorInfo && (
        <EditProfileModal
          doctor={doctorInfo}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {viewedPatientId && (
        <PatientDetailModal
          patientId={viewedPatientId}
          onClose={() => setViewedPatientId(null)}
          onAddConsultation={handleOpenConsultationModal}
        />
      )}

      {isAddingConsultation && viewedPatientId && (
        <AddConsultationModal
          patientId={viewedPatientId}
          onClose={handleCloseConsultationModal}
        />
      )}
    </div>
  );
};

export default AssignedPatientsPage;
