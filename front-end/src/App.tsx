import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
// Make sure to install and import jwt-decode
import { jwtDecode } from "jwt-decode";
// Remove this import since we're using the wizard's type
// import type { PatientData } from "./types";
import { CustomerDashboard } from "./components/reception/customer-profile/CustomerDashboard";
import LandingPage from "./components/reception/LandingPage";
import { PatientRegistrationWizard } from "./components/reception/new-customer/PatientRegistrationWizard";
import LoginPage from "./pages/auth/LoginPage";
import ProfessionalDashboardPage from "./pages/ProfessionalDashboard/index";
import { RemindersPage } from "./components/reception/RemindersPage";
import AssignedPatientsPage from "./pages/admin/AdminPage";
import HomePage from "./pages/HomePage";
import PrescriptionFulfillmentPage from "./components/reception/ProductDeductionPage";
import PhoneBookingPage from "./components/reception/phone/PhoneBookingPage";
import { DoctorCustomerDashboard } from "./components/doctor/DoctorCustomerDashboard";
import PatientUpdateWizard from "./components/doctor/forms/PatientUpdateWizard";

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

  // Use the PatientData type from the wizard component
  const handleRegistrationComplete = (newUser: Parameters<typeof PatientRegistrationWizard>[0]['onRegistrationComplete'] extends (newUser: infer T) => void ? T : never) => {
    if (newUser.id) {
      navigate(`/reception/customers`, {
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


const UpdatePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone || "";

  // Use the PatientData type from the wizard component
  const handleUpdateComplete = (newUser: Parameters<typeof PatientRegistrationWizard>[0]['onRegistrationComplete'] extends (newUser: infer T) => void ? T : never) => {
    if (newUser.id) {
      navigate(`/doctor`, {
        state: { fromRegistration: true },
      });
    }
  };

  return (
    <PatientUpdateWizard
      phone={phone}
      onRegistrationComplete={handleUpdateComplete}
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
              <CustomerDashboard />
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

      <Route
        path="/reception/phone-book"
        element={
          <RequireAuth role="reception">
            <PhoneBookingPage />
          </RequireAuth>
        }
      />

      <Route
        path="/professional"
        element={
            <RequireAuth role="professional">
            <ProfessionalDashboardPage />
          </RequireAuth>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireAuth role="admin">
            <AssignedPatientsPage />
          </RequireAuth>
        }
      />
      {/* Doctor Routes*/}
      <Route 
        path="/doctor" 
        element={
          <RequireAuth role="doctor">
            <DoctorCustomerDashboard />
          </RequireAuth>
        } 
      />
      <Route 
        path="/doctor/patient/:id" 
        element={
          <RequireAuth role="doctor">
            <UpdatePage />
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

/**
 * A component that protects routes requiring authentication.
 * It checks for the presence, validity, and expiration of a JWT,
 * and also verifies the user's role.
 */
const RequireAuth = ({
  children,
  role,
}: {
  children: React.ReactElement;
  role: string;
}) => {
  const token = localStorage.getItem("auth_token");
  const userRole = localStorage.getItem("role");

  // Helper function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  };

  // 1. Check if token exists
  if (!token) {
    return handleLogout();
  }

  try {
    // 2. Decode the token to check expiration
    const decodedToken: { exp: number } = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert ms to seconds

    // 3. Check if token is expired
    if (decodedToken.exp < currentTime) {
      console.log("Auth token expired. Logging out.");
      return handleLogout();
    }

    // 4. Check if the user role matches the required role
    if (userRole === role) {
      return children; // All checks passed, render the component
    } else {
      console.warn(
        `Role mismatch: Required '${role}', but user has '${userRole}'.`
      );
      return handleLogout(); // Role doesn't match, log out
    }
  } catch (error) {
    // 5. Handle cases where the token is malformed
    console.error("Failed to decode auth token:", error);
    return handleLogout();
  }
};

const RedirectIfAuth = ({ children }: { children: React.ReactElement }) => {
  switch (localStorage.getItem("role")) {
    case "reception":
      return <Navigate to="/reception" replace />;
    case "admin":
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
