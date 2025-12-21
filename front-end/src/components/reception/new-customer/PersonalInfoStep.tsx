import React from "react";
import type { StepProps } from "../../../lib/types/patientRegistrationTypes";
import { Input, Label } from "./patientRegistrationComponents";

export const PersonalInfoStep: React.FC<StepProps> = ({ formData, updateFormData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="md:col-span-2">
      <Label htmlFor="name" helperText="Full legal name as it appears on official documents">
        Full Name *
      </Label>
      <Input
        id="name"
        placeholder="e.g., Jane Doe"
        value={formData.name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        required
      />
    </div>

    <div>
      <Label htmlFor="phone" helperText="Primary contact number for appointments and reminders">
        Phone Number *
      </Label>
      <Input
        id="phone"
        placeholder="e.g., 0912345678"
        value={formData.phone}
        onChange={(e) => updateFormData({ phone: e.target.value })}
        required
      />
    </div>

    <div>
      <Label htmlFor="email" helperText="We'll send appointment confirmations and updates here">
        Email Address *
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="e.g., janedoe@example.com"
        value={formData.email}
        onChange={(e) => updateFormData({ email: e.target.value })}
        required
      />
    </div>

    <div>
      <Label htmlFor="address" helperText="Street address for billing and correspondence">
        Street Address
      </Label>
      <Input
        id="address"
        placeholder="e.g., 123 Main St"
        value={formData.address}
        onChange={(e) => updateFormData({ address: e.target.value })}
      />
    </div>

    <div>
      <Label htmlFor="city">City</Label>
      <Input
        id="city"
        placeholder="e.g., Addis Ababa"
        value={formData.city}
        onChange={(e) => updateFormData({ city: e.target.value })}
      />
    </div>

    <div>
      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
      <Input
        id="dateOfBirth"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
        required
      />
    </div>

    <div>
      <Label htmlFor="emergencyContactName" helperText="Person to contact in case of emergency">
        Emergency Contact Name
      </Label>
      <Input
        id="emergencyContactName"
        placeholder="e.g., John Doe"
        value={formData.emergencyContactName}
        onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
      />
    </div>

    <div>
      <Label htmlFor="emergencyContactPhone" helperText="Emergency contact's phone number">
        Emergency Contact Phone
      </Label>
      <Input
        id="emergencyContactPhone"
        placeholder="e.g., 09556671111"
        value={formData.emergencyContactPhone}
        onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
      />
    </div>

    <div className="md:col-span-2">
      <Label htmlFor="howHeard" helperText="Help us understand how clients find us">
        How did you hear about us?
      </Label>
      <select
        id="howHeard"
        className="w-full border rounded p-3 bg-white/70 border-gray-300 focus:border-rose-500 focus:ring-rose-500"
        value={formData.howHeard}
        onChange={(e) => updateFormData({ howHeard: e.target.value })}
      >
        <option value="">Select an option</option>
        <option value="Friend Referral">Friend Referral</option>
        <option value="Social Media">Social Media</option>
        <option value="Advertisement">Advertisement</option>
        <option value="Doctor Referral">Doctor Referral</option>
        <option value="Other">Other</option>
      </select>
    </div>
  </div>
);