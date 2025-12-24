import React, { useState, useRef } from "react";
import { X, AlertCircle, Calendar, Upload, Image as ImageIcon, XCircle } from "lucide-react";
import { Button } from "./PatientUpdateComponents";
import {
  useCreateConsultation,
  type CreateConsultationInput,
  type TreatmentGoals,
  type TreatmentFeedback,
  useUploadImagesBatch,
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<{ [key: string]: string }>({});
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createConsultation, isPending: isCreatingConsultation } = useCreateConsultation({
    onSuccess: async (data) => {
      if (selectedImages.length > 0) {
        setIsUploadingImages(true);
        try {
          await uploadImagesBatch({
            consultationId: data.consultationId,
            files: selectedImages,
            description: "Consultation images",
          });
        } catch (err) {
          console.error("Failed to upload images:", err);
        } finally {
          setIsUploadingImages(false);
        }
      }
      onSuccess(data.consultationId);
      onClose();
    },
    onError: (err) => {
      setError(err.message || "Failed to create consultation");
    },
  });

  const { mutateAsync: uploadImagesBatch } = useUploadImagesBatch();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 10 - selectedImages.length);
      setSelectedImages(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    const fileName = selectedImages[index].name;
    const newDescriptions = { ...imageDescriptions };
    delete newDescriptions[fileName];
    setImageDescriptions(newDescriptions);
  };

  // const handleDescriptionChange = (fileName: string, description: string) => {
  //   setImageDescriptions(prev => ({
  //     ...prev,
  //     [fileName]: description,
  //   }));
  // };

  const handleSubmit = async () => {
  setError("");

  // Get doctor_id from authentication
  const authToken = localStorage.getItem('auth_token');
  let doctorId = 1; // Default fallback
  
  if (authToken) {
    try {
      // Decode JWT token to get user info 
      const tokenData = JSON.parse(atob(authToken.split('.')[1]));
      doctorId = tokenData.userId || tokenData.id || 1;
    } catch (e) {
      console.error('Failed to decode token:', e);
      // Use default doctor_id
    }
  }

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
    doctor_id: doctorId, 
    treatment_goals_today: Object.keys(goals).length ? goals : undefined,
    previous_treatment_feedback: Object.keys(feedback).length ? feedback : undefined,
    doctor_notes: doctorNotes.trim() || undefined,
    follow_up_date: followUpDate || undefined,
  };

  createConsultation(data);
};

  const isPending = isCreatingConsultation || isUploadingImages;

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
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon size={20} className="text-rose-600" />
                <h3 className="text-lg font-semibold">Consultation Images</h3>
              </div>
              <span className="text-sm text-gray-500">
                {selectedImages.length}/10 images
              </span>
            </div>

            <div className="space-y-4">
              <div
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors ${selectedImages.length < 10
                    ? "hover:border-rose-400 hover:bg-rose-50 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                  }`}
                onClick={() => selectedImages.length < 10 && fileInputRef.current?.click()}
              >
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload images or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, GIF up to 5MB each
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={selectedImages.length >= 10}
                />
              </div>

              {selectedImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Selected Images:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedImages.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 p-3 bg-white border rounded-lg"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate max-w-[150px]">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          {/* <input
                            type="text"
                            placeholder="Add description (optional)"
                            value={imageDescriptions[file.name] || ""}
                            onChange={(e) => handleDescriptionChange(file.name, e.target.value)}
                            className="w-full text-sm p-2 border border-gray-200 rounded focus:ring-1 focus:ring-rose-500 focus:border-transparent"
                            disabled={isPending}
                          /> */}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          disabled={isPending}
                        >
                          <XCircle size={20} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

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
                {isUploadingImages ? "Uploading Images..." : "Creating..."}
              </span>
            ) : (
              "Create Consultation"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};