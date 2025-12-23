import React, { useState } from "react";
import { X, AlertCircle, Calendar } from "lucide-react";
import { Button } from "./PatientUpdateComponents";
import {
  useCreateConsultation,
  type CreateConsultationInput,
  type TreatmentGoals,
  type TreatmentFeedback,
} from "../../../hooks/UseConsultations";

interface QuickConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  customerName: string;
  onSuccess: (consultationId: number) => void;
}

export const QuickConsultationModal: React.FC<QuickConsultationModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  onSuccess,
}) => {
  const [doctorNotes, setDoctorNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(["", ""]);
  const [strengths, setStrengths] = useState<string[]>(["", ""]);
  const [weaknesses, setWeaknesses] = useState<string[]>(["", ""]);
  const [nextSteps, setNextSteps] = useState<string[]>(["", ""]);
  const [error, setError] = useState("");

  const { mutate: createConsultation, isPending } = useCreateConsultation({
    onSuccess: (data) => {
      onSuccess(data.consultationId);
      onClose();
    },
    onError: (err) => {
      setError(err.message || "Failed to create consultation");
    },
  });

  const handleSubmit = () => {
    setError("");

    const goals: TreatmentGoals = {};
    if (primaryGoal.trim()) goals.primary = primaryGoal.trim();
    const secondary = secondaryGoals.filter(g => g.trim());
    if (secondary.length) goals.secondary = secondary;

    const feedback: TreatmentFeedback = {};
    const strengthsArr = strengths.filter(s => s.trim());
    if (strengthsArr.length) feedback.strengths = strengthsArr;

    const weaknessesArr = weaknesses.filter(w => w.trim());
    if (weaknessesArr.length) feedback.weaknesses = weaknessesArr;

    const nextStepsArr = nextSteps.filter(s => s.trim());
    if (nextStepsArr.length) feedback.next_steps = nextStepsArr;

    const data: CreateConsultationInput = {
      customer_id: customerId,
      doctor_id: 1, // ← Replace with real doctor ID from auth!
      treatment_goals_today: Object.keys(goals).length ? goals : undefined,
      previous_treatment_feedback: Object.keys(feedback).length ? feedback : undefined,
      doctor_notes: doctorNotes.trim() || undefined,
      follow_up_date: followUpDate || undefined,
    };

    createConsultation(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quick Consultation</h2>
            <p className="text-sm text-gray-600 mt-1">For: {customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isPending}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold mb-4">Treatment Goals Today</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
                <input
                  type="text"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  placeholder="e.g. Reduce acne inflammation"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Goals / Expectations</label>
                {secondaryGoals.map((goal, index) => (
                  <input
                    key={index}
                    type="text"
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...secondaryGoals];
                      newGoals[index] = e.target.value;
                      setSecondaryGoals(newGoals);
                    }}
                    placeholder={index === 0 ? "e.g. Improve skin texture" : ""}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={isPending}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Previous Treatment Feedback</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
                {strengths.map((s, i) => (
                  <input
                    key={i}
                    type="text"
                    value={s}
                    onChange={(e) => {
                      const newArr = [...strengths];
                      newArr[i] = e.target.value;
                      setStrengths(newArr);
                    }}
                    placeholder={i === 0 ? "e.g. Good tolerance" : ""}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={isPending}
                  />
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weaknesses</label>
                {weaknesses.map((w, i) => (
                  <input
                    key={i}
                    type="text"
                    value={w}
                    onChange={(e) => {
                      const newArr = [...weaknesses];
                      newArr[i] = e.target.value;
                      setWeaknesses(newArr);
                    }}
                    placeholder={i === 0 ? "e.g. Mild irritation" : ""}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={isPending}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Steps / Recommendations</label>
              {nextSteps.map((step, i) => (
                <input
                  key={i}
                  type="text"
                  value={step}
                  onChange={(e) => {
                    const newArr = [...nextSteps];
                    newArr[i] = e.target.value;
                    setNextSteps(newArr);
                  }}
                  placeholder={i === 0 ? "e.g. Continue same routine" : ""}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  disabled={isPending}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Notes</label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Observations, recommendations, any special instructions..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Follow-up Date (optional)
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                disabled={isPending}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-8 bg-rose-600 hover:bg-rose-700"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Creating...
              </span>
            ) : (
              "Create Consultation & Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};