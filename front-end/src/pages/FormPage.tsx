import React, { useState } from "react";
import ClientInfoSection from "../components/ClientInfoSection";
import SkinHealthSection from "../components/SkinCareHistorySection.tsx";
import SkinCareHistorySection from "../components/SkinCareHistorySection.tsx";
import SkinConcernsSection from "../components/SkinConcernsSection.tsx";
import TreatmentHistorySection from "../components/TreatmentHistorySection.tsx";
import HealthHistorySection from "../components/HealthHistorySection.tsx";
import FinalQuestionsSection from "../components/FinalQuestionsSection.tsx";
import AgreementSection from "../components/AgreementSection.tsx";
import {
  skinCareProductsList,
  skinConcernsList,
  healthHistoryList,
  initialFormData,
} from "../formData";
import type { FormData } from "../formData";

const FormPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submissionMessage, setSubmissionMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
        ? [...(formData as any)[name], value]
        : (formData as any)[name].filter((item: string) => item !== value),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionMessage("Form submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center items-center font-sans text-gray-900">
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 text-indigo-700">
          FACIAL TREATMENT
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 text-gray-600">
          consultation form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <ClientInfoSection formData={formData} onChange={handleInputChange} />
          <SkinHealthSection
            formData={formData}
            onChange={handleInputChange}
            onCheckbox={handleCheckboxChange}
            options={skinCareProductsList}
          />
          <SkinCareHistorySection
            formData={formData}
            onChange={handleInputChange}
            onCheckbox={handleCheckboxChange}
            options={skinCareProductsList}
          />
          <SkinConcernsSection
            formData={formData}
            onCheckbox={handleCheckboxChange}
            options={skinConcernsList}
          />
          <TreatmentHistorySection
            formData={formData}
            onChange={handleInputChange}
          />
          <HealthHistorySection
            formData={formData}
            onCheckbox={handleCheckboxChange}
            onChange={handleInputChange}
            options={healthHistoryList}
          />
          <FinalQuestionsSection
            formData={formData}
            onChange={handleInputChange}
          />
          <AgreementSection formData={formData} onChange={handleInputChange} />
          <div className="text-center">
            <button
              type="submit"
              className="px-8 py-3 text-white font-bold bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out"
            >
              Submit Form
            </button>
            {submissionMessage && (
              <p className="mt-4 text-green-600 font-medium">
                {submissionMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormPage;
