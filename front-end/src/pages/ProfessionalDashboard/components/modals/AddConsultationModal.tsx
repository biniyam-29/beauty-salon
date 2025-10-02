import React, { useState } from "react";
import type { FC } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X, PlusCircle, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "../../types";
import { addConsultation, uploadConsultationImages } from "../../services/api"; // Import the new function
import { Button } from "../ui/Button";

const ListItem: FC<{ text: string; onRemove: () => void }> = ({ text, onRemove }) => (
  <div className="flex items-center justify-between bg-rose-50/70 text-rose-800 text-sm font-medium px-3 py-2 rounded-lg animate-fade-in-fast">
    <span>{text}</span>
    <button
      type="button"
      onClick={onRemove}
      className="p-1 rounded-full text-rose-500 hover:bg-rose-200/50 hover:text-rose-700"
    >
      <X size={16} />
    </button>
  </div>
);

interface ImagePreview {
  file: File;
  previewUrl: string;
  id: string;
}

interface AddConsultationModalProps {
  patient: Patient;
  onClose: () => void;
  onSaveSuccess: (consultationId: number) => void;
}

export const AddConsultationModal: FC<AddConsultationModalProps> = ({
  patient,
  onClose,
  onSaveSuccess,
}) => {
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<string[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [goalItems, setGoalItems] = useState<string[]>([]);
  const [currentGoal, setCurrentGoal] = useState("");
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = [];
    
    Array.from(files).forEach(file => {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error(`File "${file.name}" is not an image`);
        return;
      }

      // Check file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image "${file.name}" is too large. Maximum size is 5MB`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        file,
        previewUrl,
        id: Math.random().toString(36).substring(2, 9)
      });
    });

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId: string) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const clearAllImages = () => {
    selectedImages.forEach(image => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setSelectedImages([]);
  };

  const consultationMutation = useMutation({
    mutationFn: addConsultation,
  });

  const imageUploadMutation = useMutation({
    mutationFn: uploadConsultationImages, // Use the new function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations", patient.id] });
    },
  });

  const handleAddFeedback = () => {
    if (currentFeedback.trim()) {
      setFeedbackItems([...feedbackItems, currentFeedback.trim()]);
      setCurrentFeedback("");
    }
  };

  const handleRemoveFeedback = (indexToRemove: number) => {
    setFeedbackItems(feedbackItems.filter((_, index) => index !== indexToRemove));
  };

  const handleAddGoal = () => {
    if (currentGoal.trim()) {
      setGoalItems([...goalItems, currentGoal.trim()]);
      setCurrentGoal("");
    }
  };

  const handleRemoveGoal = (indexToRemove: number) => {
    setGoalItems(goalItems.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (followUpDate) {
      const today = new Date();
      const selectedDate = new Date(followUpDate);
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        setDateError("Follow-up date must be in the future.");
        return;
      }
    }
    setDateError(null);

    const consultationPromise = consultationMutation.mutateAsync({
      patientId: patient.id,
      notes,
      feedback: feedbackItems,
      goals: goalItems,
      followUpDate,
    });

    toast.promise(consultationPromise, {
      loading: "Saving consultation details...",
      success: async (data) => {
        const { consultationId } = data;
        
        // Upload all selected images in one request
        if (selectedImages.length > 0) {
          await imageUploadMutation.mutateAsync({
            consultationId,
            imageFiles: selectedImages.map(img => img.file), // Pass array of files
            // Optional: add descriptions if needed
            // descriptions: selectedImages.map(img => `Image ${img.id}`)
          });
        }
        
        onSaveSuccess(consultationId);
        onClose();
        return "Consultation saved successfully!";
      },
      error: (err: Error) => err.message || "Could not save consultation.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">New Consultation for {patient.full_name}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Previous Treatment Feedback</label>
            <div className="flex gap-2">
              <input type="text" value={currentFeedback} onChange={(e) => setCurrentFeedback(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeedback())} placeholder="Type feedback and click Add" className="flex-grow bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none" />
              <Button type="button" onClick={handleAddFeedback} className="px-4" aria-label="Add Feedback"><PlusCircle size={18} /><span className="ml-2 hidden sm:inline">Add</span></Button>
            </div>
            <div className="mt-3 space-y-2">{feedbackItems.map((item, index) => (<ListItem key={index} text={item} onRemove={() => handleRemoveFeedback(index)} />))}</div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Treatment Goals Today</label>
            <div className="flex gap-2">
              <input type="text" value={currentGoal} onChange={(e) => setCurrentGoal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())} placeholder="Type a goal and click Add" className="flex-grow bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none" />
              <Button type="button" onClick={handleAddGoal} className="px-4" aria-label="Add Goal"><PlusCircle size={18} /><span className="ml-2 hidden sm:inline">Add</span></Button>
            </div>
            <div className="mt-3 space-y-2">{goalItems.map((item, index) => (<ListItem key={index} text={item} onRemove={() => handleRemoveGoal(index)} />))}</div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">Attach Patient Photos (Optional)</label>
              {selectedImages.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllImages}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {selectedImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {selectedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      <img 
                        src={image.previewUrl} 
                        alt={`Patient preview ${image.id}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeImage(image.id)}
                      className="absolute top-1 right-1 p-1 bg-white/80 text-red-600 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {image.file.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <label className="relative block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/50">
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-600">
                Click to upload images (multiple supported)
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {selectedImages.length} image(s) selected
              </span>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Doctor's Notes *</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} required rows={5} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Next Follow-up Date (Optional)</label>
            <input type="date" value={followUpDate} onChange={(e) => { setFollowUpDate(e.target.value); setDateError(null); }} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none" />
            {dateError && <p className="text-sm text-red-600 mt-1">{dateError}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-8">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={consultationMutation.isPending || imageUploadMutation.isPending}
            >
              {consultationMutation.isPending || imageUploadMutation.isPending ? (
                <><Loader2 className="animate-spin mr-2" /> Saving...</>
              ) : (
                `Save Consultation${selectedImages.length > 0 ? ` (${selectedImages.length} image${selectedImages.length === 1 ? '' : 's'})` : ''}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};