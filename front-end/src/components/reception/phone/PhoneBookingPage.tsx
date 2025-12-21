import React, { useState } from 'react';
// import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  PhoneBooking, 
  FormData 
} from '../../../lib/types/phoneBookingTypes';
import { 
  fetchPhoneBookings, 
  createPhoneBooking, 
  updatePhoneBooking, 
  deletePhoneBooking,
  getUniqueServices 
} from '../../../lib/api/phoneBookingApi';
import { 
  BackButton, 
  PageHeader 
} from './phoneBookingComponents';
import { BookingForm } from './BookingForm';
import { BookingsList } from './BookingsList';
import { ConfirmationModal } from './ConfirmationModal';

const PhoneBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State management
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    customer_phone: '',
    service_name: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingBooking, setEditingBooking] = useState<PhoneBooking | null>(null);
  const [bookingToRemove, setBookingToRemove] = useState<PhoneBooking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterService, setFilterService] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // TanStack Query for bookings
  const { 
    data: bookings = [], 
    isLoading: isLoadingBookings,
    refetch: refetchBookings 
  } = useQuery({
    queryKey: ['phoneBookings'],
    queryFn: fetchPhoneBookings,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createPhoneBooking,
    onSuccess: () => {
      toast.success('Booking saved successfully!');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['phoneBookings'] });
    },
    onError: (error: any) => {
      if (error.response?.data?.details) {
        const backendErrors: Record<string, string> = {};
        Object.keys(error.response.data.details).forEach(key => {
          backendErrors[key] = error.response.data.details[key];
        });
        setErrors(backendErrors);
        toast.error('Please fix the validation errors below');
      } else {
        toast.error(error.message || 'Failed to save booking');
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => 
      updatePhoneBooking(id, data),
    onSuccess: () => {
      toast.success('Booking updated successfully!');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['phoneBookings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update booking');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePhoneBooking,
    onSuccess: () => {
      toast.success('Booking deleted successfully!');
      setShowModal(false);
      setBookingToRemove(null);
      queryClient.invalidateQueries({ queryKey: ['phoneBookings'] });
    },
    onError: () => {
      toast.error('Failed to delete booking');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PhoneBooking['status'] }) =>
      updatePhoneBooking(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phoneBookings'] });
    }
  });

  // Form validation
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

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingBooking) {
      updateMutation.mutate({ id: editingBooking.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Form reset
  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      service_name: '',
      booking_date: '',
      booking_time: '',
      notes: ''
    });
    setEditingBooking(null);
    setErrors({});
  };

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // DateTime change handler
  const handleDateTimeSelect = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Edit booking handler
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
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Remove booking handler
  const handleRemoveBooking = (booking: PhoneBooking) => {
    setBookingToRemove(booking);
    setShowModal(true);
  };

  const confirmRemoveBooking = () => {
    if (bookingToRemove) {
      deleteMutation.mutate(bookingToRemove.id);
    }
  };

  // Status update handler
  const handleStatusUpdate = (bookingId: number, newStatus: PhoneBooking['status']) => {
    statusMutation.mutate({ id: bookingId, status: newStatus }, {
      onSuccess: () => {
        toast.success(`Booking marked as ${newStatus.replace('_', ' ')}`);
      },
      onError: () => {
        toast.error('Failed to update booking status');
      }
    });
  };

  const handleNavigateToRegister = (booking: PhoneBooking) => {
    // First mark the booking as completed
    statusMutation.mutate({ id: booking.id, status: 'completed' }, {
      onSuccess: () => {
        // Then navigate to registration with pre-filled data
        navigate('/reception/register', {
          state: {
            prefillData: {
              name: booking.customer_name,
              phone: booking.customer_phone,
            }
          }
        });
      }
    });
  };

  // Filter handlers
  const handleClearFilters = () => {
    setFilterService('all');
    setFilterDate('');
    setFilterStatus('all');
    toast.success('Filters cleared');
  };

  const isFilterActive = filterService !== 'all' || filterDate !== '' || filterStatus !== 'all';

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesService = filterService === 'all' || booking.service_name === filterService;
    const matchesDate = !filterDate || booking.booking_date === filterDate;
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesService && matchesDate && matchesStatus;
  });

  const uniqueServices = getUniqueServices(bookings);

  // Navigation
  const handleBackToDashboard = () => {
    navigate('/reception');
  };

  // Loading state
  const loading = isLoadingBookings || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

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

      {/* Back to Dashboard */}
      <BackButton onClick={handleBackToDashboard} />

      {/* Page Header */}
      <PageHeader
        title="Phone Bookings"
        description="Register new phone bookings and manage upcoming appointments."
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Form */}
        <BookingForm
          formData={formData}
          errors={errors}
          loading={loading}
          editingBooking={editingBooking}
          onInputChange={handleInputChange}
          onResetForm={resetForm}
          onSubmit={handleSubmit}
          onDateTimeSelect={handleDateTimeSelect}
        />

        {/* Bookings List */}
        <BookingsList
          bookings={filteredBookings}
          loading={isLoadingBookings}
          filterService={filterService}
          filterDate={filterDate}
          filterStatus={filterStatus}
          isFilterActive={isFilterActive}
          onFilterServiceChange={setFilterService}
          onFilterDateChange={setFilterDate}
          onFilterStatusChange={setFilterStatus}
          onClearFilters={handleClearFilters}
          onRefresh={refetchBookings}
          onEditBooking={handleEditBooking}
          onRemoveBooking={handleRemoveBooking}
          onStatusUpdate={handleStatusUpdate}
          uniqueServices={uniqueServices}
          onNavigateToRegister={handleNavigateToRegister}
        />
      </div>

      {/* Confirmation Modal */}
      {showModal && bookingToRemove && (
        <ConfirmationModal
          booking={bookingToRemove}
          onConfirm={confirmRemoveBooking}
          onCancel={() => {
            setShowModal(false);
            setBookingToRemove(null);
          }}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default PhoneBookingPage;