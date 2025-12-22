import React, { useState } from "react";
import {
  useCustomerConsultations,
  useConsultationImages,
  type Consultation,
} from "../../../hooks/UseCustomer";
import { DetailSection } from "./shared/DetailSection";
import { ConsultationDetailModal } from "./shared/ConsultationDetailModal";
import { FileText } from "lucide-react";

interface CustomerConsultationsProps {
  customerId: number | string;
  customerName: string;
}

const ConsultationItem: React.FC<{
  consultation: Consultation;
  onClick: () => void;
}> = ({ consultation, onClick }) => {
  const { data: images } = useConsultationImages(consultation.id);
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
          {new Date(consultation.consultation_date).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}
        </p>
        {images && images.length > 0 && (
          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
            {images.length} photo{images.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-3">
        with {consultation.doctor_name}
      </p>

      {firstImage && (
        <div className="my-3 w-48 h-32 overflow-hidden rounded-lg border border-gray-200">
          <img
            src={`${firstImage.image_url}`}
            alt="Consultation visual note"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/192x128?text=No+Image";
            }}
          />
        </div>
      )}

      <p className="text-gray-700 line-clamp-2">
        {consultation.doctor_notes || consultation.notes}
      </p>
    </div>
  );
};

export const CustomerConsultations: React.FC<CustomerConsultationsProps> = ({
  customerId,
  customerName,
}) => {
  const [selectedConsultation, setSelectedConsultation] = useState<number | null>(null);

  const {
    data: consultations,
    isLoading: areConsultationsLoading,
    isError: isConsultationsError,
  } = useCustomerConsultations(customerId);

  if (areConsultationsLoading) {
    return (
      <div className="p-8">
        <DetailSection title="Consultation History" icon={<FileText size={20} />}>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>
    );
  }

  if (isConsultationsError) {
    return (
      <div className="p-8">
        <DetailSection title="Consultation History" icon={<FileText size={20} />}>
          <div className="text-red-500">Error loading consultations.</div>
        </DetailSection>
      </div>
    );
  }

  return (
    <div className="p-8">
      <DetailSection title="Consultation History" icon={<FileText size={20} />}>
        <div className="space-y-6">
          {(consultations?.length ?? 0) > 0 ? (
            consultations?.map((consultation) => (
              <ConsultationItem
                key={consultation.id}
                consultation={consultation}
                onClick={() => setSelectedConsultation(consultation.id)}
              />
            ))
          ) : (
            <p className="text-gray-500">No consultation history found.</p>
          )}
        </div>
      </DetailSection>

      {/* Consultation Detail Modal */}
      {selectedConsultation && (
        <ConsultationDetailModal
          consultationId={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    </div>
  );
};