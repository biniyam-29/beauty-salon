import React from 'react';
import { AlertTriangle, X, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: Check,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const { icon: Icon, iconBg, iconColor, button } = variantStyles[variant];
  const isProcessing = isLoading || isDeleting;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`${iconBg} p-4 rounded-full mb-4`}>
            <Icon className={`${iconColor} h-12 w-12`} />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-6 px-4">{message}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 text-base font-semibold"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`${button} flex-1 py-3 text-base font-semibold text-white`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;