import React from "react";
import type { FormData } from "../formData";

type Props = {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const FinalQuestionsSection: React.FC<Props> = ({ formData, onChange }) => (
  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Final Questions</h3>
    <input
      name="howDidYouHear"
      value={formData.howDidYouHear}
      onChange={onChange}
      placeholder="How did you hear about us?"
      className="form-input mb-2"
    />
  </div>
);

export default FinalQuestionsSection;
