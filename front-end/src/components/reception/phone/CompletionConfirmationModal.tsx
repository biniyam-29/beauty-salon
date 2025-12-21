import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Calendar, Phone, AlertCircle } from 'lucide-react';
import type { PhoneBooking } from '../../../lib/types/phoneBookingTypes';
import { LoadingSpinner } from './phoneBookingComponents';

interface CompletionConfirmationModalProps {
  booking: PhoneBooking;
  isOpen: boolean;
  onConfirm: (shouldRegister: boolean) => void;
  onCancel: () => void;
  loading: boolean;
}

export const CompletionConfirmationModal: React.FC<CompletionConfirmationModalProps> = ({
  booking,
  isOpen,
  onConfirm,
  onCancel,
  loading
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-green-500" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Complete Booking
              </h3>
              
              {/* Booking Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                <p className="font-semibold text-gray-900 mb-1">{booking.customer_name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Phone className="w-4 h-4" />
                  <span>{booking.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(`${booking.booking_date}T${booking.booking_time}`).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Warning Message */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-800 text-sm">
                  <span className="font-semibold">Important:</span> This booking history will be 
                  automatically cleared after 24 hours. To preserve customer information in your 
                  system, consider registering them as a permanent customer.
                </p>
              </div>
              
              <p className="text-gray-600 mb-6">
                Do you want to register this customer in your system?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onConfirm(false)}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 flex-1"
                  type="button"
                >
                  Just Mark Completed
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onConfirm(true)}
                  disabled={loading}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:bg-green-300 transition-colors duration-200 flex-1 flex items-center justify-center gap-2"
                  type="button"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Register Customer
                    </>
                  )}
                </motion.button>
              </div>
              
              <button
                onClick={onCancel}
                disabled={loading}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                type="button"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};