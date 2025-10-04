// PhoneBookingPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Scissors, 
  CheckCircle2,
  Trash2,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://beauty-api.biniyammarkos.com";

// Type definitions
interface PhoneBooking {
  id: number;
  customer_id?: number | null;
  reception_id: number;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  is_expired: boolean;
  created_at: string;
  updated_at: string;
  reception_name?: string;
}

interface FormData {
  customer_name: string;
  customer_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  notes: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isDisabled: boolean;
}

interface BookingCardProps {
  booking: PhoneBooking;
  index: number;
  onEdit: (booking: PhoneBooking) => void;
  onRemove: (booking: PhoneBooking) => void;
  onStatusUpdate: (bookingId: number, newStatus: PhoneBooking['status']) => void;
}

interface ConfirmationModalProps {
  booking: PhoneBooking;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const PhoneBookingPage: React.FC = () => {
  const [bookings, setBookings] = useState<PhoneBooking[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [bookingToRemove, setBookingToRemove] = useState<PhoneBooking | null>(null);
  const [filterService, setFilterService] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [editingBooking, setEditingBooking] = useState<PhoneBooking | null>(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    customer_phone: '',
    service_name: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load bookings from API
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/phone-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const result = await response.json();
      setBookings(result.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Load bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Get unique services for filter dropdown
  const uniqueServices = ['all', ...new Set(bookings.map(booking => booking.service_name))];

  // Time slots for the time picker
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30'
  ];

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startingDay = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    
    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isDisabled: true
      });
    }
    
    // Add current month's days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled = date < today;
      
      days.push({
        date,
        isCurrentMonth: true,
        isDisabled
      });
    }
    
    // Add next month's days to complete the grid
    const totalCells = 42; // 6 weeks
    const nextMonthDays = totalCells - days.length;
    for (let day = 1; day <= nextMonthDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isDisabled: true
      });
    }
    
    return days;
  };

  // Handle date selection
  const handleDateSelect = (date: CalendarDay) => {
    if (date.isDisabled) return;
    
    setSelectedDate(date.date);
    
    // If time is already selected, update the form
    if (selectedTime) {
      const selectedDateStr = date.date.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        booking_date: selectedDateStr,
        booking_time: selectedTime
      }));
    } else {
      const selectedDateStr = date.date.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        booking_date: selectedDateStr
      }));
    }
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    
    // If date is already selected, update the form
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        booking_date: selectedDateStr,
        booking_time: time
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        booking_time: time
      }));
    }
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Format date for display
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

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = 'Please enter a valid phone number';
    }

    if (!formData.service_name.trim()) {
      newErrors.service_name = 'Service type is required';
    }

    if (!formData.booking_date || !formData.booking_time) {
      newErrors.booking_date = 'Date and time are required';
    } else {
      const bookingDateTime = new Date(`${formData.booking_date}T${formData.booking_time}`);
      if (bookingDateTime < new Date()) {
        newErrors.booking_date = 'Please select a future date and time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = editingBooking 
        ? `${API_BASE_URL}/phone-bookings/${editingBooking.id}`
        : `${API_BASE_URL}/phone-bookings`;
      
      const method = editingBooking ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save booking');
      }

      await response.json();
      
      toast.success(editingBooking ? 'Booking updated successfully!' : 'Booking saved successfully!');
      
      // Reset form and refresh bookings
      resetForm();
      fetchBookings();
      
    } catch (error) {
      console.error('Error saving booking:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save booking';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      service_name: '',
      booking_date: '',
      booking_time: '',
      notes: ''
    });
    setSelectedDate(null);
    setSelectedTime('');
    setEditingBooking(null);
    setErrors({});
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle edit booking
  const handleEditBooking = (booking: PhoneBooking) => {
    setFormData({
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      service_name: booking.service_name,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      notes: booking.notes || ''
    });
    setEditingBooking(booking);
    setSelectedDate(new Date(booking.booking_date));
    setSelectedTime(booking.booking_time);
    
    // Scroll to form
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Remove booking after confirmation
  const confirmRemoveBooking = async () => {
    if (!bookingToRemove) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/phone-bookings/${bookingToRemove.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      toast.success('Booking deleted successfully!');
      fetchBookings();
      
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    } finally {
      setLoading(false);
      setShowModal(false);
      setBookingToRemove(null);
    }
  };

  // Cancel booking removal
  const cancelRemoveBooking = () => {
    setShowModal(false);
    setBookingToRemove(null);
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: number, newStatus: PhoneBooking['status']) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/phone-bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      toast.success(`Booking marked as ${newStatus.replace('_', ' ')}`);
      fetchBookings();
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  // Filter bookings based on selected filters
  const filteredBookings = bookings.filter(booking => {
    const matchesService = filterService === 'all' || booking.service_name === filterService;
    const matchesDate = !filterDate || booking.booking_date === filterDate;
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesService && matchesDate && matchesStatus;
  });

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate('/reception');
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            border: '1px solid #f3f4f6'
          },
          success: {
            iconTheme: {
              primary: '#e11d48',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Back to Dashboard Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-medium transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Dashboard
        </motion.button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Phone Bookings
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Register new phone bookings and manage upcoming appointments.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Form */}
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
                onClick={resetForm}
                className="text-sm text-rose-500 hover:text-rose-600 font-medium"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 ${
                    errors.customer_name ? 'border-rose-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer name"
                />
              </div>
              {errors.customer_name && (
                <p className="mt-2 text-sm text-rose-600">{errors.customer_name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 ${
                    errors.customer_phone ? 'border-rose-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.customer_phone && (
                <p className="mt-2 text-sm text-rose-600">{errors.customer_phone}</p>
              )}
            </div>

            {/* Service Type - Free Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type *
              </label>
              <div className="relative">
                <Scissors className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 ${
                    errors.service_name ? 'border-rose-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter service type (e.g., Haircut, Facial, Massage...)"
                />
              </div>
              {errors.service_name && (
                <p className="mt-2 text-sm text-rose-600">{errors.service_name}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Type any service name as provided by the customer
              </p>
            </div>

            {/* Beautiful Date & Time Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time *
              </label>
              
              {/* Custom Date Time Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`w-full flex items-center justify-between p-4 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 ${
                    errors.booking_date ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    <span className={formData.booking_date ? 'text-gray-900' : 'text-gray-500'}>
                      {formatDisplayDate()}
                    </span>
                  </div>
                  <Clock className="w-5 h-5 text-gray-400" />
                </button>

                {/* Date Picker Modal */}
                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-4"
                    >
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={prevMonth}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <h3 className="font-semibold text-gray-900">
                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        
                        <button
                          onClick={nextMonth}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                          const isSelected = selectedDate && 
                            day.date.getDate() === selectedDate.getDate() &&
                            day.date.getMonth() === selectedDate.getMonth() &&
                            day.date.getFullYear() === selectedDate.getFullYear();
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleDateSelect(day)}
                              disabled={day.isDisabled}
                              className={`
                                h-10 rounded-lg text-sm font-medium transition-all duration-200
                                ${day.isDisabled
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : day.isCurrentMonth
                                    ? isSelected
                                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                                      : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                                    : 'text-gray-400'
                                }
                                ${!day.isCurrentMonth && 'opacity-50'}
                              `}
                            >
                              {day.date.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      {/* Time Picker Section */}
                      {selectedDate && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-gray-100"
                        >
                          <h4 className="font-medium text-gray-900 mb-3">Select Time</h4>
                          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                            {timeSlots.map(time => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => handleTimeSelect(time)}
                                className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                                  selectedTime === time
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200'
                                    : 'text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDatePicker(false);
                            setSelectedDate(null);
                            setSelectedTime('');
                            setFormData(prev => ({ 
                              ...prev, 
                              booking_date: '', 
                              booking_time: '' 
                            }));
                          }}
                          className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                onChange={handleInputChange}
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
                  <Loader className="w-5 h-5 animate-spin" />
                  {editingBooking ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                editingBooking ? 'Update Booking' : 'Save Booking'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0 flex items-center gap-2">
              <Clock className="w-6 h-6 text-rose-500" />
              Bookings
              {filteredBookings.length > 0 && (
                <span className="bg-rose-100 text-rose-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {filteredBookings.length}
                </span>
              )}
            </h2>
            
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Services</option>
                  {uniqueServices.filter(service => service !== 'all').map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              />

              <button
                onClick={fetchBookings}
                disabled={loading}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-rose-300 transition-colors text-sm flex items-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {loading ? (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
                  <p className="text-gray-500">Loading bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-16 h-16 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg">
                    No bookings found — register one now!
                  </p>
                </motion.div>
              ) : (
                filteredBookings.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    onEdit={handleEditBooking}
                    onRemove={(booking) => {
                      setBookingToRemove(booking);
                      setShowModal(true);
                    }}
                    onStatusUpdate={updateBookingStatus}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && bookingToRemove && (
          <ConfirmationModal
            booking={bookingToRemove}
            onConfirm={confirmRemoveBooking}
            onCancel={cancelRemoveBooking}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Booking Card Component
const BookingCard: React.FC<BookingCardProps> = ({ booking, index, onEdit, onRemove, onStatusUpdate }) => {
  const isPast = new Date(`${booking.booking_date}T${booking.booking_time}`) < new Date();
  const isExpired = booking.is_expired;
  
  const getStatusColor = (status: PhoneBooking['status']): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
        isExpired || isPast
          ? 'border-rose-200 bg-rose-50 opacity-70' 
          : 'border-gray-100 bg-white hover:shadow-md hover:border-rose-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`font-semibold text-lg ${
              isExpired || isPast ? 'text-rose-700 line-through' : 'text-gray-900'
            }`}>
              {booking.customer_name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status.replace('_', ' ')}
            </span>
            {(isExpired || isPast) && booking.status === 'scheduled' && (
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
              <span className={`${isExpired || isPast ? 'text-rose-600' : ''} font-medium`}>
                {booking.service_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className={isExpired || isPast ? 'text-rose-600' : ''}>
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
          {booking.status === 'scheduled' && !isExpired && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onStatusUpdate(booking.id, 'completed')}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
              >
                Mark Completed
              </button>
              <button
                onClick={() => onStatusUpdate(booking.id, 'cancelled')}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(booking)}
            className="p-2 text-blue-400 hover:text-blue-600 transition-colors duration-200"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(booking)}
            className="p-2 text-gray-400 hover:text-rose-500 transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Confirmation Modal Component
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ booking, onConfirm, onCancel, loading }) => {
  return (
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
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 disabled:bg-rose-300 transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
              Delete Booking
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhoneBookingPage;