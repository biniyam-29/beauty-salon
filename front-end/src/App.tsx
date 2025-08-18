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
import LandingPage from "./pages/reception/LandingPage";
import { PhoneNumberCheckPage } from "./pages/reception/PhoneNumberCheckPage";
import { UserProfilePage } from "./pages/reception/UserProfilePage";
import { PatientRegistrationWizard } from "./components/PatientRegistrationWizard";
import LoginPage from "./pages/LoginPage";
import { ProfessionalLoginPage } from "./pages/professionals/ProfessionalLoginPage";
import { ProfessionalDashboardPage } from "./pages/professionals/ProfessionalDashboardPage";
import { ProfessionalSessionPage } from "./pages/professionals/ProfessionalSessionPage";
import { RemindersPage } from "./pages/reception/RemindersPage";
import { ProductManagementPage } from "./pages/admin/ProductManagementPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import HomePage from "./pages/HomePage";

// --- Font Import Component ---
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@700&display=swap"
    rel="stylesheet"
  />
);

// --- Registration Page Wrapper ---
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

// --- Layout Wrappers ---
const GradientLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="bg-gradient-to-br from-rose-50 to-pink-100 min-h-screen p-4 sm:p-6 md:p-8 font-sans text-gray-800">
    <div className="max-w-7xl mx-auto">{children}</div>
  </div>
);

const FullscreenLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="w-screen h-screen m-0 p-0">{children}</div>;

// --- Main App Controller ---
const App: React.FC = () => (
  <>
    <FontLink />
    <Router>
      <Routes>
        {/* Public Home */}
        <Route
          path="/"
          element={
            <GradientLayout>
              <HomePage />
            </GradientLayout>
          }
        />

        {/* Login Routes (fullscreen, no gradient) */}
        <Route
          path="/login"
          element={
            <FullscreenLayout>
              <LoginPage />
            </FullscreenLayout>
          }
        />
        <Route
          path="/professional-login"
          element={
            <FullscreenLayout>
              <ProfessionalLoginPage />
            </FullscreenLayout>
          }
        />
        <Route
          path="/admin-login"
          element={
            <FullscreenLayout>
              <AdminLoginPage />
            </FullscreenLayout>
          }
        />

        {/* Receptionist Routes */}
        <Route
          path="/reception"
          element={
            <GradientLayout>
              <WelcomePage />
            </GradientLayout>
          }
        />
        <Route
          path="/reception/find"
          element={
            <GradientLayout>
              <PhoneNumberCheckPage />
            </GradientLayout>
          }
        />
        <Route
          path="/reception/customers"
          element={
            <GradientLayout>
              <CustomerListPage />
            </GradientLayout>
          }
        />
        <Route
          path="/reception/register"
          element={
            <GradientLayout>
              <RegistrationPage />
            </GradientLayout>
          }
        />
        <Route
          path="/reception/profile/:customerId"
          element={
            <GradientLayout>
              <UserProfilePage />
            </GradientLayout>
          }
        />
        <Route
          path="/reception/reminders"
          element={
            <GradientLayout>
              <RemindersPage />
            </GradientLayout>
          }
        />

        <Route
          path="/reception/xyz"
          element={
            <GradientLayout>
              <LandingPage />
            </GradientLayout>
          }
        />

        {/* Professional Routes */}
        <Route
          path="/professional/:professionalId"
          element={
            <GradientLayout>
              <ProfessionalDashboardPage />
            </GradientLayout>
          }
        />
        <Route
          path="/professional/session/:customerId"
          element={
            <GradientLayout>
              <ProfessionalSessionPage />
            </GradientLayout>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <GradientLayout>
              <AdminDashboardPage />
            </GradientLayout>
          }
        />
        <Route
          path="/admin/products"
          element={
            <GradientLayout>
              <ProductManagementPage />
            </GradientLayout>
          }
        />
      </Routes>
    </Router>

    {/* Local styles */}
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
