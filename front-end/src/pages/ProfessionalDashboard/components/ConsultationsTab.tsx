import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import type { Consultation } from "../types";
import { Button } from "./ui/Button";
import { fetchConsultationImages } from "../services/api";

const ConsultationItem: FC<{ consultation: Consultation }> = ({ consultation }) => {
  const { data: images } = useQuery({
    queryKey: ["consultationImages", consultation.id],
    queryFn: () => fetchConsultationImages(consultation.id),
  });

  const firstImage = images?.[0];

  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1 h-full border-l-2 border-rose-200"></div>
      <div className="absolute left-[-6px] top-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
      <p className="font-bold text-rose-800">
        {new Date(consultation.consultation_date).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric"
        })}
      </p>
      <p className="text-sm text-gray-500 mb-2">with {consultation.doctor_name}</p>
      
      {firstImage && (
        <div className="my-3 w-48 h-auto overflow-hidden rounded-lg border">
          <img 
            src={`https://beauty-api.biniyammarkos.com/${firstImage.image_url}`} 
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

export const ConsultationsTab: FC<ConsultationsTabProps> = ({ consultations, onAddConsultation }) => (
  <>
    <div className="text-right mb-4">
      <Button onClick={onAddConsultation}>
        <PlusCircle size={16} className="mr-2" />
        Add New Consultation
      </Button>
    </div>
    <div className="space-y-8">
      {consultations.length > 0 ? (
        consultations.map((c) => <ConsultationItem key={c.id} consultation={c} />)
      ) : (
        <p className="text-gray-500 text-center py-8">No consultation history.</p>
      )}
    </div>
  </>
);