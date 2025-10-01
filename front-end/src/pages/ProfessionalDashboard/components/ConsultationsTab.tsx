import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import type { Consultation } from "../types";
import { Button } from "./ui/Button";
import { fetchConsultationImages } from "../services/api";
import { useState } from "react";
import { baseUrl, authHeaders } from "./config";

// fetch full consultation detail
async function fetchConsultationDetail(id: number) {
  const res = await fetch(`${baseUrl}/consultations/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch consultation");
  return res.json();
}

const ConsultationDetailModal: FC<{ id: number; onClose: () => void }> = ({ id, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["consultationDetail", id],
    queryFn: () => fetchConsultationDetail(id),
  });

  if (!data) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-2xl w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl border border-rose-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-rose-200 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-rose-700">Consultation Detail</h2>
          <button
            onClick={onClose}
            className="text-rose-500 hover:text-rose-700 font-semibold text-lg"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-6">Loading...</p>
        ) : (
          <div className="space-y-5">
            {/* Date & Follow-up */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-600 uppercase font-semibold">Date</p>
                <p className="text-gray-800 font-medium">
                  {new Date(data.consultation_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-600 uppercase font-semibold">Follow-up</p>
                <p className="text-gray-800 font-medium">
                  {new Date(data.follow_up_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Doctor Notes */}
            <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
              <h3 className="text-rose-700 font-semibold mb-2">Doctor Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{data.doctor_notes}</p>
            </div>

            {/* Treatment Goals */}
            {data.treatment_goals_today?.length > 0 && (
              <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
                <h3 className="text-rose-700 font-semibold mb-2">Treatment Goals</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {data.treatment_goals_today.map((goal: string, idx: number) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Previous Feedback */}
            {data.previous_treatment_feedback?.length > 0 && (
              <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
                <h3 className="text-rose-700 font-semibold mb-2">Previous Feedback</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {data.previous_treatment_feedback.map((fb: string, idx: number) => (
                    <li key={idx}>{fb}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const ConsultationItem: FC<{ consultation: Consultation; onClick: () => void }> = ({ consultation, onClick }) => {
  const { data: images } = useQuery({
    queryKey: ["consultationImages", consultation.id],
    queryFn: () => fetchConsultationImages(consultation.id),
  });

  const firstImage = images?.[0];

  return (
    <div
      onClick={onClick}
      className="relative pl-8 cursor-pointer hover:bg-rose-50 p-2 rounded-lg transition"
    >
      <div className="absolute left-0 top-1 h-full border-l-2 border-rose-200"></div>
      <div className="absolute left-[-6px] top-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
      <p className="font-bold text-rose-800">
        {new Date(consultation.consultation_date).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        })}
      </p>
      <p className="text-sm text-gray-500 mb-2">with {consultation.doctor_name}</p>

      {firstImage && (
        <div className="my-3 w-48 h-auto overflow-hidden rounded-lg border">
          <img
            src={`${baseUrl}/${firstImage.image_url}`}
            alt="Consultation visual note"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <p className="text-gray-700 whitespace-pre-wrap">{consultation.doctor_notes}</p>
    </div>
  );
};

interface ConsultationsTabProps {
  consultations: Consultation[];
  onAddConsultation: () => void;
}

export const ConsultationsTab: FC<ConsultationsTabProps> = ({ consultations, onAddConsultation }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <>
      <div className="text-right mb-4">
        <Button onClick={onAddConsultation}>
          <PlusCircle size={16} className="mr-2" />
          Add New Consultation
        </Button>
      </div>
      <div className="space-y-8">
        {consultations.length > 0 ? (
          consultations.map((c) => (
            <ConsultationItem key={c.id} consultation={c} onClick={() => setSelectedId(c.id)} />
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No consultation history.</p>
        )}
      </div>

      {selectedId && (
        <ConsultationDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
};
