import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import type { PatientData } from "./types";
import { CustomerListPage } from "./pages/reception/CustomerListPage";
import LandingPage from "./pages/reception/LandingPage";
import { PatientRegistrationWizard } from "./components/PatientRegistrationWizard";
import LoginPage from "./pages/LoginPage";
import  ProfessionalDashboardPage  from "./pages/professionals/ProfessionalDashboardPage";
import { ProfessionalSessionPage } from "./pages/professionals/ProfessionalSessionPage";
import { RemindersPage } from "./pages/reception/RemindersPage";
import AssignedPatientsPage from "./pages/admin/AdminDashboardPage";
import HomePage from "./pages/HomePage";
import PrescriptionFulfillmentPage from "./pages/reception/ProductDeductionPage";

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

// --- Routes & App Content ---
const AppRoutes: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
    console.log("User logged out");
  };

  return (
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

      {/* Login Routes */}
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <LoginRouteWrapper />
          </RedirectIfAuth>
        }
      />

      {/* Receptionist Routes */}
      <Route
        path="/reception"
        element={
          <RequireAuth role="reception">
            <LandingPage onLogout={handleLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/reception/customers"
        element={
          <RequireAuth role="reception">
            <GradientLayout>
              <CustomerListPage />
            </GradientLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/reception/register"
        element={
          <RequireAuth role="reception">
            <GradientLayout>
              <RegistrationPage />
            </GradientLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/reception/reminders"
        element={
          <RequireAuth role="reception">
            <GradientLayout>
              <RemindersPage />
            </GradientLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/reception/product-deduction"
        element={
          <RequireAuth role="reception">
            <GradientLayout>
              <PrescriptionFulfillmentPage />
            </GradientLayout>
          </RequireAuth>
        }
      />

      {/* Professional Routes */}
      <Route
        path="/professional"
        element={
          <RequireAuth role="doctor">
            <GradientLayout>
              <ProfessionalDashboardPage />
            </GradientLayout>
          </RequireAuth>
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
          <RequireAuth role="super-admin">
            <AssignedPatientsPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

// --- Login Wrapper ---
const LoginRouteWrapper: React.FC = () => {
  const navigate = useNavigate();

  return (
    <FullscreenLayout>
      <LoginPage
        navigate={(path) => navigate(path)}
        onLoginSuccess={() => console.log("Login successful!")}
      />
    </FullscreenLayout>
  );
};

// --- Auth Wrappers ---
const RequireAuth = ({
  children,
  role,
}: {
  children: React.ReactElement;
  role: string;
}) => {
  const isAuthenticated = !!localStorage.getItem("auth_token");
  const roleValue = localStorage.getItem("role");

  return isAuthenticated && roleValue === role ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};


const RedirectIfAuth = ({ children }: { children: React.ReactElement }) => {
  switch (localStorage.getItem("role")) {
    case "reception":
      return <Navigate to="/reception" replace />;
    case "super-admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "doctor":
      return <Navigate to="/professional" replace />;

    default:
      return children;
      break;
  }
};

// --- Main App ---
const App: React.FC = () => (
  <>
    <FontLink />
    <Router>
      <AppRoutes />
    </Router>

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
