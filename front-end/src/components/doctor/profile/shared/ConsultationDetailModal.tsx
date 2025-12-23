import React from "react";
import { 
  X, 
  Calendar, 
  FileText, 
  Target, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Image as ImageIcon,
  UserCog,
  BadgeCheck,
  UserX,
  PenLine
} from "lucide-react";
import { useConsultation, useConsultationOperations } from "../../../../hooks/UseConsultations";
import { ImageGallery } from "./ImageGallery";

interface ConsultationDetailModalProps {
  consultationId: number;
  onClose: () => void;
}

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  icon,
  children,
  className = "",
}) => (
  <div className={`bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 bg-rose-50 rounded-lg">
        <div className="text-rose-600">{icon}</div>
      </div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="text-gray-700">{children}</div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: {
      bgColor: "bg-amber-100",
      textColor: "text-amber-800",
      borderColor: "border-amber-200",
      icon: Clock,
      label: "Pending"
    },
    completed: {
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-800",
      borderColor: "border-emerald-200",
      icon: BadgeCheck,
      label: "Completed"
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
      <Icon size={14} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

const ProfessionalSignatureSection: React.FC<{
  consultationId: number;
  professionalName?: string;
  professionalId?: number;
}> = ({ consultationId, professionalName, professionalId }) => {
  const { professionalSignature, refreshConsultation } = useConsultationOperations();
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isProfessional = currentUser?.role === "professional";
  const userId = currentUser?.id;
  const userName = currentUser?.name;

  // Check if signature button should be shown
  const shouldShowSignatureButton = isProfessional && (!professionalId || !professionalName);

  const handleSign = () => {
    if (!userId || !userName) return;

    professionalSignature(
      { consultationId, data: { professional_id: userId, professional_name: userName } },
      {
        onSuccess: () => {
          // Refresh consultation data to show updated signature
          refreshConsultation(consultationId);
          // You may add a nice toast notification here
          // Example: toast.success("Consultation signed successfully");
        },
        onError: (error) => {
          // You may add error toast here
          // Example: toast.error("Failed to sign consultation");
          console.error("Signature error:", error);
        }
      }
    );
  };

  if (!isProfessional && !professionalName) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PenLine size={20} className="text-indigo-600" />
          <div>
            <h4 className="font-medium text-gray-800">Professional Signature</h4>
            {professionalName && professionalId ? (
              <p className="text-sm text-emerald-600">
                Signed by {professionalName} (ID: {professionalId})
              </p>
            ) : (
              <p className="text-sm text-gray-500">Awaiting professional signature</p>
            )}
          </div>
        </div>

        {shouldShowSignatureButton && (
          <button
            onClick={handleSign}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     transition-colors flex items-center gap-2 shadow-sm font-medium"
          >
            <PenLine size={16} />
            Sign Consultation
          </button>
        )}
      </div>
    </div>
  );
};

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
  consultationId,
  onClose,
}) => {
  const { data: consultation, isLoading, error } = useConsultation(consultationId);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!consultation && !isLoading && !error) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-2 sm:p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Consultation Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  ID: #{consultationId} • Customer ID: {consultation?.customer_id || "N/A"}
                </p>
              </div>
              {consultation?.status && (
                <StatusBadge status={consultation.status} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <X size={24} className="text-red-500" />
              </div>
              <p className="text-red-600 font-medium">Failed to load consultation details</p>
              <p className="text-gray-500 text-sm mt-2">Please try again later</p>
            </div>
          ) : consultation ? (
            <div className="space-y-6">
              {/* Top Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <InfoCard
                  title="Consultation Date"
                  icon={<Calendar size={18} />}
                >
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(consultation.consultation_date).toLocaleDateString("en-US", {
                      weekday: 'short',
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(consultation.consultation_date).toLocaleTimeString("en-US", {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </InfoCard>

                <InfoCard
                  title="Professional"
                  icon={<UserCog size={18} />}
                  className={!consultation.professional_name ? "opacity-75" : ""}
                >
                  {consultation.professional_name ? (
                    <>
                      <p className="text-lg font-semibold text-gray-900">
                        {consultation.professional_name}
                      </p>
                      {consultation.professional_id && (
                        <p className="text-sm text-gray-500 mt-1">
                          ID: {consultation.professional_id}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <UserX size={24} className="text-gray-400 mb-2" />
                      <p className="text-gray-500 text-center">No professional assigned</p>
                    </div>
                  )}
                </InfoCard>

                <InfoCard
                  title="Follow-up Date"
                  icon={<Clock size={18} />}
                  className={!consultation.follow_up_date ? "opacity-75" : ""}
                >
                  {consultation.follow_up_date ? (
                    <>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(consultation.follow_up_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-amber-600 mt-1 font-medium">
                        Scheduled
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500 text-lg">Not scheduled</p>
                  )}
                </InfoCard>

                <InfoCard
                  title="Status"
                  icon={consultation.status === 'completed' ? <BadgeCheck size={18} /> : <Clock size={18} />}
                >
                  <div className="mb-2">
                    <StatusBadge status={consultation.status || 'pending'} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {consultation.status === 'completed' ? 'Consultation completed' : 'Awaiting completion'}
                  </p>
                </InfoCard>
              </div>

              {/* Professional Signature Control */}
              <ProfessionalSignatureSection 
                consultationId={consultationId}
                professionalName={consultation.professional_name}
                professionalId={consultation.professional_id}
              />

              {/* Images Gallery */}
              {consultation.images && consultation.images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={20} className="text-rose-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Visual Notes</h3>
                    <span className="text-sm bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
                      {consultation.images.length} image{consultation.images.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ImageGallery images={consultation.images.map((img: any) => ({
                    id: img.id,
                    image_url: img.image_url,
                    description: img.description,
                    created_at: img.created_at,
                    consultation_id: consultation.id
                  }))} />
                </div>
              )}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Notes */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Doctor Notes */}
                  <InfoCard
                    title="Doctor's Notes"
                    icon={<FileText size={18} />}
                  >
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {consultation.doctor_notes || "No notes provided"}
                      </p>
                    </div>
                  </InfoCard>

                  {/* Treatment Goals */}
                  {consultation.treatment_goals_today && typeof consultation.treatment_goals_today === 'object' && (
                    <InfoCard
                      title="Treatment Goals"
                      icon={<Target size={18} />}
                    >
                      {'primary' in consultation.treatment_goals_today && consultation.treatment_goals_today.primary && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 mb-2">Primary Goal</h4>
                          <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            {consultation.treatment_goals_today.primary}
                          </p>
                        </div>
                      )}
                      
                      {'secondary' in consultation.treatment_goals_today && 
                       consultation.treatment_goals_today.secondary && 
                       Array.isArray(consultation.treatment_goals_today.secondary) && 
                       consultation.treatment_goals_today.secondary.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Secondary Goals</h4>
                          <ul className="space-y-2">
                            {consultation.treatment_goals_today.secondary.map((goal: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </InfoCard>
                  )}
                </div>

                {/* Right Column - Feedback & Metadata */}
                <div className="space-y-6">
                  {/* Previous Feedback - All sections */}
                  {consultation.previous_treatment_feedback && typeof consultation.previous_treatment_feedback === 'object' && (
                    <InfoCard
                      title="Treatment Feedback"
                      icon={<MessageSquare size={18} />}
                    >
                      <div className="space-y-4">
                        {'strengths' in consultation.previous_treatment_feedback && 
                         consultation.previous_treatment_feedback.strengths && 
                         Array.isArray(consultation.previous_treatment_feedback.strengths) && 
                         consultation.previous_treatment_feedback.strengths.length > 0 && (
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                            <ul className="space-y-1">
                              {consultation.previous_treatment_feedback.strengths.map((strength: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                                  <span className="text-gray-700">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {'weaknesses' in consultation.previous_treatment_feedback && 
                         consultation.previous_treatment_feedback.weaknesses && 
                         Array.isArray(consultation.previous_treatment_feedback.weaknesses) && 
                         consultation.previous_treatment_feedback.weaknesses.length > 0 && (
                          <div>
                            <h4 className="font-medium text-amber-700 mb-2">Areas for Improvement</h4>
                            <ul className="space-y-1">
                              {consultation.previous_treatment_feedback.weaknesses.map((weakness: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-gray-700">{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {'next_steps' in consultation.previous_treatment_feedback && 
                         consultation.previous_treatment_feedback.next_steps && 
                         Array.isArray(consultation.previous_treatment_feedback.next_steps) && 
                         consultation.previous_treatment_feedback.next_steps.length > 0 && (
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2">Next Steps</h4>
                            <ul className="space-y-1">
                              {consultation.previous_treatment_feedback.next_steps.map((step: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-gray-700">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </InfoCard>
                  )}

                  {/* Metadata */}
                  <InfoCard
                    title="Record Information"
                    icon={<Calendar size={18} />}
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                          Created
                        </p>
                        <p className="text-sm text-gray-700">
                          {new Date(consultation.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                          Customer ID
                        </p>
                        <p className="text-sm text-gray-700 font-mono">
                          #{consultation.customer_id}
                        </p>
                      </div>
                    </div>
                  </InfoCard>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">
                Consultation ID: <span className="font-mono">#{consultationId}</span>
              </p>
              {consultation?.status === 'pending' && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                  Action Required
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg hover:from-rose-700 hover:to-rose-600 transition-all font-medium shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};