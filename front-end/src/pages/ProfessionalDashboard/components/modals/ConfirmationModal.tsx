import type { FC } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-fade-in-fast">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center transform animate-slide-up">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100">
          <AlertTriangle className="h-6 w-6 text-rose-600" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={onConfirm}>Yes, Proceed</Button>
        </div>
      </div>
    </div>
  );
};