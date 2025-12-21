import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Phone, Scissors, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import type { BookingCardProps } from '../../../lib/types/phoneBookingTypes';
import { StatusBadge, IconButton, cn } from './phoneBookingComponents';
import { CompletionConfirmationModal } from './CompletionConfirmationModal';

export const BookingCard: React.FC<BookingCardProps & {
  onNavigateToRegister: () => void;
}> = ({
  booking,
  index,
  onEdit,
  onRemove,
  onStatusUpdate,
  onNavigateToRegister
}) => {
  const [year, month, day] = booking.booking_date.split('-').map(Number);
  const [hour, minute] = booking.booking_time.split(':').map(Number);
  const bookingDateTime = new Date(year, month - 1, day, hour, minute);
  const now = new Date();
  now.setSeconds(0, 0);
  
  const isPast = bookingDateTime.getTime() < now.getTime();
  const isReallyPast = booking.status === 'scheduled' && isPast;
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleMarkCompleted = () => {
    setShowCompletionModal(true);
  };

  const handleCompletionConfirm = (shouldRegister: boolean) => {
    setShowCompletionModal(false);
    
    if (shouldRegister) {
      // Navigate to registration page with pre-filled customer data
      onNavigateToRegister();
    } else {
      // Just mark as completed
      onStatusUpdate(booking.id, 'completed');
    }
  };

  const handleCompletionCancel = () => {
    setShowCompletionModal(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`
          p-4 rounded-xl border-2 transition-all duration-300
          ${isReallyPast
            ? 'border-rose-200 bg-rose-50 opacity-70' 
            : 'border-gray-100 bg-white hover:shadow-md hover:border-rose-100'
          }
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={cn(
                'font-semibold text-lg',
                isReallyPast ? 'text-rose-700 line-through' : 'text-gray-900'
              )}>
                {booking.customer_name}
              </h3>
              <StatusBadge status={booking.status} />
              {isReallyPast && booking.status === 'scheduled' && (
                <CheckCircle2 className="w-5 h-5 text-rose-500" />
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{booking.customer_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                <span className={cn(isReallyPast ? 'text-rose-600' : '', 'font-medium')}>
                  {booking.service_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className={isReallyPast ? 'text-rose-600' : ''}>
                  {new Date(`${booking.booking_date}T${booking.booking_time}`).toLocaleString()}
                </span>
              </div>
              {booking.notes && (
                <p className="text-gray-500 mt-2 italic">"{booking.notes}"</p>
              )}
              {booking.reception_name && (
                <p className="text-gray-400 text-xs mt-1">Created by: {booking.reception_name}</p>
              )}
            </div>

            {/* Status Actions */}
            {booking.status === 'scheduled' && !isReallyPast && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleMarkCompleted}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                  type="button"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => onStatusUpdate(booking.id, 'cancelled')}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="flex gap-1">
            <IconButton
              icon={<Edit3 className="w-4 h-4" />}
              onClick={() => onEdit(booking)}
              variant="ghost"
              aria-label="Edit booking"
            />
            <IconButton
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => onRemove(booking)}
              variant="ghost"
              aria-label="Delete booking"
            />
          </div>
        </div>
      </motion.div>

      {/* Completion Confirmation Modal */}
      <CompletionConfirmationModal
        booking={booking}
        isOpen={showCompletionModal}
        onConfirm={handleCompletionConfirm}
        onCancel={handleCompletionCancel}
        loading={false}
      />
    </>
  );
};