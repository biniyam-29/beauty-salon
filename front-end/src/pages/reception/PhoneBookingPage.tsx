import React from "react";
import { useNavigate } from "react-router-dom";
import { PhoneBookingWizard } from "../../components/PhoneBookingWizard";
import type { PhoneBookingData } from "../../types";

const PhoneBookingPage: React.FC = () => {
  const navigate = useNavigate();

  const receptionId = Number(localStorage.getItem("user_id")); // or however you store logged-in receptionist id

  const handleBookingComplete = (newBooking: PhoneBookingData) => {
    if (newBooking.id) {
      navigate(`/reception/phone-bookings/${newBooking.id}`, {
        state: { fromBooking: true },
      });
    }
  };

  return (
    <PhoneBookingWizard
      receptionId={receptionId}
      onBookingComplete={handleBookingComplete}
    />
  );
};

export default PhoneBookingPage;
