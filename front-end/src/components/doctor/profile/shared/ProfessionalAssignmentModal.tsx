import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Users,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useProfessionals,
  useAssignProfessional,
} from "../../../../hooks/UseCustomer";
import { AvatarPlaceholder } from "./AvatarPlaceholder";
import { showToast } from "./Toast";

interface ProfessionalAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: number;
  customerName: string;
}

export const ProfessionalAssignmentModal: React.FC<
  ProfessionalAssignmentModalProps
> = ({ isOpen, onClose, consultationId, customerName }) => {
  const [selectedProfessional, setSelectedProfessional] = useState<
    number | null
  >(null);

  const { data: professionals, isLoading, isError } = useProfessionals();
  const { mutate: assignProfessional, isPending: isAssigning } =
    useAssignProfessional();

  const handleAssign = async () => {
    if (selectedProfessional && consultationId) {
      assignProfessional(
        { consultationId, doctorId: selectedProfessional },
        {
          onSuccess: () => {
            showToast("Professional assigned successfully!", "success");
            setSelectedProfessional(null);
            onClose();
          },
          onError: (error) => {
            showToast(
              error.message || "Failed to assign professional",
              "error"
            );
          },
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-rose-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-rose-200 pb-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-rose-700">
              Assign a Professional
            </h2>
            <p className="text-gray-600 mt-1">
              Assigning professional for {customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-rose-500 hover:text-rose-700 font-semibold text-lg p-1"
            disabled={isAssigning}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={48} className="text-rose-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading professionals...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            <AlertCircle size={48} className="mx-auto mb-4" />
            <p>Failed to load professionals. Please try again.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {professionals?.map((professional) => (
                <div
                  key={professional.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProfessional === professional.id
                      ? "border-rose-500 bg-rose-50/50"
                      : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/30"
                  } ${isAssigning ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() =>
                    !isAssigning && setSelectedProfessional(professional.id)
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <AvatarPlaceholder
                        name={professional.name}
                        className="w-12 h-12 text-lg"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {professional.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {professional.role}
                        </p>
                      </div>
                    </div>
                    {selectedProfessional === professional.id && (
                      <CheckCircle2
                        size={20}
                        className="text-rose-500 flex-shrink-0"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} />
                      <span>{professional.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} />
                      <span>{professional.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    <div className="text-center flex-1">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-bold">
                          {professional.assigned_patients_count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Assigned</p>
                    </div>
                    <div className="text-center flex-1">
                      <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-bold">
                          {professional.untreated_assigned_patients_count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Untreated</p>
                    </div>
                    <div className="text-center flex-1">
                      <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-bold">
                          {professional.todays_followups_count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Today's Follow-ups</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {professionals?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4" />
                <p>No professionals available at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 border-t border-rose-200 pt-4">
          <button
            onClick={onClose}
            disabled={isAssigning}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedProfessional || isAssigning}
            className={`px-5 py-2 text-white rounded-lg transition font-medium ${
              selectedProfessional && !isAssigning
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isAssigning ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              "Assign Professional"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};