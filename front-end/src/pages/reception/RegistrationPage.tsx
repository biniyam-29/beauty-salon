import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PatientRegistrationWizard, type PatientData } from "../../components/PatientRegistrationWizard";

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

export default RegistrationPage;
