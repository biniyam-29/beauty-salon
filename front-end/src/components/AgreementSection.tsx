import React from "react";
import type { FormData } from "../formData";

type Props = {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const AgreementSection: React.FC<Props> = ({ formData, onChange }) => (
  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Agreement</h3>
    <input
      name="signature"
      value={formData.signature}
      onChange={onChange}
      placeholder="Signature"
      className="form-input mb-2"
    />
    <input
      name="date"
      value={formData.date}
      onChange={onChange}
      placeholder="Date"
      className="form-input mb-2"
    />
  </div>
);

export default AgreementSection;
