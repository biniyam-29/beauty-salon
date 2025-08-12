import React from "react";
import type { FormData } from "../formData";

type Props = {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TreatmentHistorySection: React.FC<Props> = ({ formData, onChange }) => (
  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Treatment History</h3>
    <input
      name="firstFacial"
      value={formData.firstFacial}
      onChange={onChange}
      placeholder="Is this your first facial?"
      className="form-input mb-2"
    />
    <input
      name="previousTreatmentLikes"
      value={formData.previousTreatmentLikes}
      onChange={onChange}
      placeholder="What did you like/dislike about previous treatments?"
      className="form-input mb-2"
    />
    <input
      name="achieveToday"
      value={formData.achieveToday}
      onChange={onChange}
      placeholder="What do you want to achieve today?"
      className="form-input mb-2"
    />
    <input
      name="usedDerivatives"
      value={formData.usedDerivatives}
      onChange={onChange}
      placeholder="Have you used retinol/derivatives?"
      className="form-input mb-2"
    />
    <input
      name="botoxFillers"
      value={formData.botoxFillers}
      onChange={onChange}
      placeholder="Botox/fillers?"
      className="form-input mb-2"
    />
    <input
      name="acneMedication"
      value={formData.acneMedication}
      onChange={onChange}
      placeholder="Acne medication?"
      className="form-input mb-2"
    />
    <input
      name="acneMedicationDetails"
      value={formData.acneMedicationDetails}
      onChange={onChange}
      placeholder="Acne medication details"
      className="form-input mb-2"
    />
  </div>
);

export default TreatmentHistorySection;
