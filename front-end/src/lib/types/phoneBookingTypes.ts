export interface PhoneBooking {
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

export interface FormData {
  customer_name: string;
  customer_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  notes: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isDisabled: boolean;
}

export interface BookingCardProps {
  booking: PhoneBooking;
  index: number;
  onEdit: (booking: PhoneBooking) => void;
  onRemove: (booking: PhoneBooking) => void;
  onStatusUpdate: (bookingId: number, newStatus: PhoneBooking['status']) => void;
}

export interface ConfirmationModalProps {
  booking: PhoneBooking;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export interface DateTimePickerProps {
  selectedDate: Date | null;
  selectedTime: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  errors: Record<string, string>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export interface BookingFormProps {
  formData: FormData;
  errors: Record<string, string>;
  loading: boolean;
  editingBooking: PhoneBooking | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onResetForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDateTimeSelect: (field: string, value: string) => void;
}

export interface BookingsListProps {
  bookings: PhoneBooking[];
  loading: boolean;
  filterService: string;
  filterDate: string;
  filterStatus: string;
  isFilterActive: boolean;
  onFilterServiceChange: (value: string) => void;
  onFilterDateChange: (value: string) => void;
  onFilterStatusChange: (value: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onEditBooking: (booking: PhoneBooking) => void;
  onRemoveBooking: (booking: PhoneBooking) => void;
  onStatusUpdate: (bookingId: number, newStatus: PhoneBooking['status']) => void;
  uniqueServices: string[];
  onNavigateToRegister?: (booking: PhoneBooking) => void;
}

export interface PhoneBookingContainerProps {
  children?: React.ReactNode;
}