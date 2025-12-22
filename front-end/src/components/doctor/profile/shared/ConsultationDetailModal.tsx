import React from "react";
import { X, Users } from "lucide-react";
import {
  useConsultationDetail,
} from "../../../../hooks/UseCustomer";
import { ImageGallery } from "./ImageGallery";

interface ConsultationDetailModalProps {
  consultationId: number;
  onClose: () => void;
  onAssignProfessional: (consultationId: number) => void;
}

export const ConsultationDetailModal: React.FC<
  ConsultationDetailModalProps
> = ({ consultationId, onClose, onAssignProfessional }) => {
  const { data: consultation, isLoading } = useConsultationDetail(consultationId);

  if (!consultation) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-rose-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-rose-200 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-rose-700">
            Consultation Detail
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAssignProfessional(consultation.id)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-medium text-sm"
            >
              <Users size={16} />
              Assign Professional
            </button>
            <button
              onClick={onClose}
              className="text-rose-500 hover:text-rose-700 font-semibold text-lg p-1"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-6">Loading...</p>
        ) : (
          <div className="space-y-5">
            {/* Date & Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-600 uppercase font-semibold">
                  Consultation Date
                </p>
                <p className="text-gray-800 font-medium">
                  {new Date(consultation.consultation_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-600 uppercase font-semibold">
                  Follow-up Date
                </p>
                <p className="text-gray-800 font-medium">
                  {consultation.follow_up_date ? (
                    new Date(consultation.follow_up_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  ) : (
                    <span className="text-gray-500">Not scheduled</span>
                  )}
                </p>
              </div>
            </div>

            {/* Images Gallery */}
            {consultation.images && consultation.images.length > 0 && (
              <ImageGallery images={consultation.images} />
            )}

            {/* Doctor Notes */}
            <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
              <h3 className="text-rose-700 font-semibold mb-2">Doctor Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {consultation.doctor_notes || consultation.notes}
              </p>
            </div>

            {/* Treatment Goals */}
            {consultation.treatment_goals_today &&
              consultation.treatment_goals_today.length > 0 && (
                <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
                  <h3 className="text-rose-700 font-semibold mb-2">
                    Treatment Goals
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {consultation.treatment_goals_today.map(
                      (goal: string, idx: number) => (
                        <li key={idx}>{goal}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Previous Feedback */}
            {consultation.previous_treatment_feedback &&
              consultation.previous_treatment_feedback.length > 0 && (
                <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
                  <h3 className="text-rose-700 font-semibold mb-2">
                    Previous Feedback
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {consultation.previous_treatment_feedback.map(
                      (fb: string, idx: number) => (
                        <li key={idx}>{fb}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Created At */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">
                Record Created
              </p>
              <p className="text-gray-700 text-sm">
                {new Date(consultation.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-rose-200 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};