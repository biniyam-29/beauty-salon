import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { PatientData } from "../../types";
import { PatientRegistrationWizard } from "../../components/PatientRegistrationWizard";

// =================================================================================
// FILE: src/pages/RegistrationPage.tsx
// =================================================================================

// This component acts as a wrapper to pass props from the router to the wizard
const RegistrationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve the phone number passed from the PhoneNumberCheckPage
  const phone = location.state?.phone || "";

  // Define what happens after a new user is successfully created
  const handleRegistrationComplete = (newUser: PatientData) => {
    if (newUser.id) {
      // Navigate to the new user's profile page and pass a state to indicate it's a new registration
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

export default RegistrationPage;

// =================================================================================
// END FILE: src/pages/RegistrationPage.tsx
// =================================================================================
