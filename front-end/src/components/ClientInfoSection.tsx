import React from "react";
import type { FormData } from "../formData";

type Props = {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ClientInfoSection: React.FC<Props> = ({ formData, onChange }) => (
  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
    <h3 className="text-xl font-bold text-gray-800 mb-4">
      Personal Information
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        name="name"
        value={formData.name}
        onChange={onChange}
        placeholder="Name"
        className="form-input"
      />
      <input
        name="address"
        value={formData.address}
        onChange={onChange}
        placeholder="Address"
        className="form-input"
      />
      <input
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={onChange}
        placeholder="Phone Number"
        className="form-input"
      />
      <input
        name="city"
        value={formData.city}
        onChange={onChange}
        placeholder="City"
        className="form-input"
      />
      <input
        name="dateOfBirth"
        value={formData.dateOfBirth}
        onChange={onChange}
        placeholder="Date of Birth"
        className="form-input"
      />
      <input
        name="email"
        value={formData.email}
        onChange={onChange}
        placeholder="Email"
        className="form-input"
      />
      <input
        name="emergencyContact"
        value={formData.emergencyContact}
        onChange={onChange}
        placeholder="Emergency Contact"
        className="form-input"
      />
      <input
        name="emergencyContactPhone"
        value={formData.emergencyContactPhone}
        onChange={onChange}
        placeholder="Emergency Contact Phone"
        className="form-input"
      />
    </div>
  </div>
);

export default ClientInfoSection;
