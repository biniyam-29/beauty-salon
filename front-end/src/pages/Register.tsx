import { Sidebar } from "../components/sidebar"
import { PatientRegistrationWizard } from "../components/patient-registration-wizard"

export default function RegisterPatientPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Register New Patient</h1>
              <p className="text-gray-600 mt-1">Complete the consultation form to create a new patient record</p>
            </div>
            <PatientRegistrationWizard />
          </div>
        </div>
      </main>
    </div>
  )
}
