import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { PatientData } from "./types";
import { WelcomePage } from "./pages/reception/WelcomePage";
import { CustomerListPage } from "./pages/reception/CustomerListPage";
import { PhoneNumberCheckPage } from "./pages/reception/PhoneNumberCheckPage";
import { UserProfilePage } from "./pages/reception/UserProfilePage";
import { PatientRegistrationWizard } from "./components/PatientRegistrationWizard";
import { LoginPage } from "./pages/LoginPage";
import { ProfessionalLoginPage } from "./pages/professionals/ProfessionalLoginPage";
import { ProfessionalDashboardPage } from "./pages/professionals/ProfessionalDashboardPage";
import { ProfessionalSessionPage } from "./pages/professionals/ProfessionalSessionPage";
import { RemindersPage } from "./pages/reception/RemindersPage";
import { ProductManagementPage } from "./pages/admin/ProductManagementPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";

// =================================================================================
// FILE: src/App.tsx
// This is the main application component that controls the flow and renders pages.
// =================================================================================

// --- Font Import Component ---
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@700&display=swap"
    rel="stylesheet"
  />
);

// --- Registration Page Wrapper ---
// This component is needed to get the 'phone' state passed from the PhoneNumberCheckPage
const RegistrationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone || "";

  const handleRegistrationComplete = (newUser: PatientData) => {
    if (newUser.id) {
      navigate(`/reception/profile/${newUser.id}`, {
        state: { fromRegistration: true },
      });
    }
  };

  return (
    <PatientRegistrationWizard
      phone={phone}
      onRegistrationComplete={handleRegistrationComplete}
    />
  );
};

// --- Main App Controller ---
const App: React.FC = () => (
  <>
    <FontLink />
    <div className="bg-gradient-to-br from-rose-50 to-pink-100 min-h-screen p-4 sm:p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        <Router>
          <Routes>
            {/* Login Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/professional-login"
              element={<ProfessionalLoginPage />}
            />
            <Route path="/admin-login" element={<AdminLoginPage />} />

            {/* Receptionist Routes */}
            <Route path="/reception" element={<WelcomePage />} />
            <Route path="/reception/find" element={<PhoneNumberCheckPage />} />
            <Route path="/reception/customers" element={<CustomerListPage />} />
            <Route path="/reception/register" element={<RegistrationPage />} />
            <Route
              path="/reception/profile/:customerId"
              element={<UserProfilePage />}
            />
            <Route path="/reception/reminders" element={<RemindersPage />} />

            {/* Professional Routes */}
            <Route
              path="/professional/:professionalId"
              element={<ProfessionalDashboardPage />}
            />
            <Route
              path="/professional/session/:customerId"
              element={<ProfessionalSessionPage />}
            />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<ProductManagementPage />} />
          </Routes>
        </Router>
      </div>
    </div>
    <style>{`
            .font-display { font-family: 'Playfair Display', serif; }
            .font-sans { font-family: 'Lato', sans-serif; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            @keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in-fast { animation: fadeInFast 0.2s ease-out forwards; }
            @keyframes slideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
            .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
        `}</style>
  </>
);

export default App;
// =================================================================================
// END FILE: src/App.tsx
// =================================================================================
