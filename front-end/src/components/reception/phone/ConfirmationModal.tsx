import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { ConfirmationModalProps } from '../../../lib/types/phoneBookingTypes';
// import { LoadingSpinner } from './phoneBookingComponents';

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  booking,
  onConfirm,
  onCancel,
  loading
}) => {
  return (
    <AnimatePresence>
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
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-rose-500" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Delete Booking
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-900 mb-1">{booking.customer_name}</p>
              <p className="text-sm text-gray-600 mb-2">{booking.service_name}</p>
              <p className="text-sm text-gray-500">
                {new Date(`${booking.booking_date}T${booking.booking_time}`).toLocaleString()}
              </p>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                type="button"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                disabled={loading}
                className="px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 disabled:bg-rose-300 transition-colors duration-200 flex items-center gap-2"
                type="button"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Booking'
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};