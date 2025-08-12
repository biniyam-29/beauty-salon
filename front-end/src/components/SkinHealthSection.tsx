import React from "react";
import type { FormData } from "../formData";

type Props = {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SkinHealthSection: React.FC<Props> = ({ formData, onChange }) => (
  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Skin Health</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        name="skinType"
        value={formData.skinType}
        onChange={onChange}
        placeholder="Skin Type"
        className="form-input"
      />
      <input
        name="sunExposure"
        value={formData.sunExposure}
        onChange={onChange}
        placeholder="Sun Exposure"
        className="form-input"
      />
      <input
        name="foundationType"
        value={formData.foundationType}
        onChange={onChange}
        placeholder="Foundation Type"
        className="form-input"
      />
      <input
        name="skinHeal"
        value={formData.skinHeal}
        onChange={onChange}
        placeholder="How does your skin heal?"
        className="form-input"
      />
      <input
        name="bruiseEasily"
        value={formData.bruiseEasily}
        onChange={onChange}
        placeholder="Do you bruise easily?"
        className="form-input"
      />
    </div>
  </div>
);

export default SkinHealthSection;
