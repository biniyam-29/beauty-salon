import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, Scissors } from 'lucide-react';
import type { BookingFormProps } from '../../../lib/types/phoneBookingTypes';
import { InputWithIcon, cn } from './phoneBookingComponents';
import { CalendarPicker } from './CalendarPicker';

export const BookingForm: React.FC<BookingFormProps> = ({
  formData,
  errors,
  loading,
  editingBooking,
  onInputChange,
  onResetForm,
  onSubmit,
  onDateTimeSelect
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');

  const formatDisplayDate = (): string => {
    if (!formData.booking_date || !formData.booking_time) return 'Select date and time';
    
    const date = new Date(`${formData.booking_date}T${formData.booking_time}`);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    onDateTimeSelect('booking_date', dateStr);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onDateTimeSelect('booking_time', time);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8"
      id="booking-form"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-rose-500" />
          {editingBooking ? 'Edit Booking' : 'New Booking'}
        </h2>
        {editingBooking && (
          <button
            onClick={onResetForm}
            className="text-sm text-rose-500 hover:text-rose-600 font-medium"
            type="button"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Customer Name */}
        <InputWithIcon
          icon={<User className="w-5 h-5" />}
          type="text"
          name="customer_name"
          value={formData.customer_name}
          onChange={onInputChange}
          placeholder="Enter customer name"
          error={errors.customer_name}
          required
        />

        {/* Phone Number */}
        <InputWithIcon
          icon={<Phone className="w-5 h-5" />}
          type="tel"
          name="customer_phone"
          value={formData.customer_phone}
          onChange={onInputChange}
          placeholder="Enter phone number"
          error={errors.customer_phone}
          required
        />

        {/* Service Type */}
        <InputWithIcon
          icon={<Scissors className="w-5 h-5" />}
          type="text"
          name="service_name"
          value={formData.service_name}
          onChange={onInputChange}
          placeholder="Enter service type (e.g., Haircut, Facial, Massage...)"
          error={errors.service_name}
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Type any service name as provided by the customer
        </p>

        {/* Date & Time Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date & Time *
          </label>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={cn(
                'w-full flex items-center justify-between p-4 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200',
                errors.booking_date ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-rose-300'
              )}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-rose-500" />
                <span className={formData.booking_date ? 'text-gray-900' : 'text-gray-500'}>
                  {formatDisplayDate()}
                </span>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </button>

            <CalendarPicker
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              isOpen={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              errors={errors}
              formData={formData}
              setFormData={() => {}}
            />
          </div>

          {errors.booking_date && (
            <p className="mt-2 text-sm text-rose-600">{errors.booking_date}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={onInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
            placeholder="Any special requests, allergies, preferences, or remarks..."
          />
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-rose-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed transition-colors duration-200 focus:ring-4 focus:ring-rose-200 focus:outline-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {editingBooking ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            editingBooking ? 'Update Booking' : 'Save Booking'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};