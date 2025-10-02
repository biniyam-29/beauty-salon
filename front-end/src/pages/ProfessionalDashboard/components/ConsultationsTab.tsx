import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, X, ZoomIn } from "lucide-react";
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

const ImageGallery: FC<{ images: any[] }> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm">
        <h3 className="text-rose-700 font-semibold mb-3">Patient Photos ({images.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-rose-300 transition-colors"
              onClick={() => setSelectedImage(`${baseUrl}/${image.image_url}`)}
            >
              <img
                src={`${baseUrl}/${image.image_url}`}
                alt={`Consultation photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-rose-200 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged consultation photo"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

const ConsultationDetailModal: FC<{ id: number; onClose: () => void }> = ({ id, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["consultationDetail", id],
    queryFn: () => fetchConsultationDetail(id),
  });

  if (!data) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-rose-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-rose-200 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-rose-700">Consultation Detail</h2>
          <button
            onClick={onClose}
            className="text-rose-500 hover:text-rose-700 font-semibold text-lg p-1"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-6">Loading...</p>
        ) : (
          <div className="space-y-5">
            {/* Date & Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-600 uppercase font-semibold">Consultation Date</p>
                <p className="text-gray-800 font-medium">
                  {new Date(data.consultation_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-600 uppercase font-semibold">Follow-up Date</p>
                <p className="text-gray-800 font-medium">
                  {data.follow_up_date ? (
                    new Date(data.follow_up_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    <span className="text-gray-500">Not scheduled</span>
                  )}
                </p>
              </div>
            </div>

            {/* Images Gallery */}
            {data.images && data.images.length > 0 && (
              <ImageGallery images={data.images} />
            )}

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

            {/* Created At */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">Record Created</p>
              <p className="text-gray-700 text-sm">
                {new Date(data.created_at).toLocaleDateString("en-US", {
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

const ConsultationItem: FC<{ consultation: Consultation; onClick: () => void }> = ({ consultation, onClick }) => {
  const { data: images } = useQuery({
    queryKey: ["consultationImages", consultation.id],
    queryFn: () => fetchConsultationImages(consultation.id),
  });

  const firstImage = images?.[0];

  return (
    <div
      onClick={onClick}
      className="relative pl-8 cursor-pointer hover:bg-rose-50 p-4 rounded-lg transition group border border-transparent hover:border-rose-200"
    >
      <div className="absolute left-0 top-4 h-[calc(100%-2rem)] border-l-2 border-rose-200"></div>
      <div className="absolute left-[-6px] top-4 w-3 h-3 bg-rose-500 rounded-full border-2 border-white group-hover:bg-rose-600 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-2">
        <p className="font-bold text-rose-800">
          {new Date(consultation.consultation_date).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </p>
        {images && images.length > 0 && (
          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
            {images.length} photo{images.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mb-3">with {consultation.doctor_name}</p>

      {firstImage && (
        <div className="my-3 w-48 h-32 overflow-hidden rounded-lg border border-gray-200">
          <img
            src={`${baseUrl}/${firstImage.image_url}`}
            alt="Consultation visual note"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <p className="text-gray-700 line-clamp-2">{consultation.doctor_notes}</p>
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
      <div className="space-y-6">
        {consultations.length > 0 ? (
          consultations.map((c) => (
            <ConsultationItem key={c.id} consultation={c} onClick={() => setSelectedId(c.id)} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-3">
              <PlusCircle size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">No consultation history</p>
            <p className="text-gray-400 text-sm mt-1">Add your first consultation to get started</p>
          </div>
        )}
      </div>

      {selectedId && (
        <ConsultationDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
};
