import { apiClient } from './Api';
import type { PhoneBooking, FormData } from '../types/phoneBookingTypes';

const API_ENDPOINT = '/phone-bookings';

// Helper function to check if a booking is older than 24 hours
const isBookingExpired = (booking: PhoneBooking): boolean => {
  if (booking.status !== 'completed') {
    return false;
  }
  
  const updatedAt = new Date(booking.updated_at);
  const now = new Date();
  const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff >= 24;
};

// Main function to fetch bookings with automatic cleanup
export const fetchPhoneBookings = async (): Promise<PhoneBooking[]> => {
  try {
    const response = await apiClient.get<{ data: PhoneBooking[] }>(API_ENDPOINT);
    const bookings = response.data || [];
    
    // Filter out expired bookings on the client side
    const validBookings = bookings.filter(booking => !isBookingExpired(booking));
    
    // Trigger background cleanup for expired bookings
    if (validBookings.length !== bookings.length) {
      cleanupExpiredBookings(bookings).catch(console.error);
    }
    
    return validBookings;
  } catch (error) {
    console.error('Error fetching phone bookings:', error);
    throw new Error('Failed to load phone bookings');
  }
};

// Function to cleanup expired bookings in background
const cleanupExpiredBookings = async (bookings: PhoneBooking[]): Promise<void> => {
  const expiredBookings = bookings.filter(isBookingExpired);
  
  // Delete each expired booking
  for (const booking of expiredBookings) {
    try {
      await deletePhoneBooking(booking.id);
      console.log(`Auto-deleted expired booking #${booking.id} for ${booking.customer_name}`);
    } catch (error) {
      console.error(`Failed to auto-delete booking #${booking.id}:`, error);
    }
  }
};

export const cleanupOldCompletedBookings = async (): Promise<{ deleted: number; failed: number }> => {
  try {
    // Fetch all bookings first
    const response = await apiClient.get<{ data: PhoneBooking[] }>(API_ENDPOINT);
    const bookings = response.data || [];
    
    const expiredBookings = bookings.filter(isBookingExpired);
    let deleted = 0;
    let failed = 0;
    
    // Delete each expired booking
    for (const booking of expiredBookings) {
      try {
        await deletePhoneBooking(booking.id);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete booking #${booking.id}:`, error);
        failed++;
      }
    }
    
    return { deleted, failed };
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw new Error('Failed to cleanup old bookings');
  }
};

export const setupAutoCleanup = (intervalMinutes: number = 60): NodeJS.Timeout => {
  return setInterval(async () => {
    try {
      const result = await cleanupOldCompletedBookings();
      if (result.deleted > 0) {
        console.log(`Auto-cleanup: Deleted ${result.deleted} expired bookings`);
      }
    } catch (error) {
      console.error('Auto-cleanup failed:', error);
    }
  }, intervalMinutes * 60 * 1000);
};

export const createPhoneBooking = async (bookingData: FormData): Promise<PhoneBooking> => {
  try {
    return await apiClient.post<PhoneBooking>(API_ENDPOINT, bookingData);
  } catch (error) {
    console.error('Error creating phone booking:', error);
    throw error;
  }
};

export const updatePhoneBooking = async (
  bookingId: number,
  bookingData: FormData | { status: PhoneBooking['status'] }
): Promise<PhoneBooking> => {
  try {
    return await apiClient.put<PhoneBooking>(`${API_ENDPOINT}/${bookingId}`, bookingData);
  } catch (error) {
    console.error('Error updating phone booking:', error);
    throw error;
  }
};

export const deletePhoneBooking = async (bookingId: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_ENDPOINT}/${bookingId}`);
  } catch (error) {
    console.error('Error deleting phone booking:', error);
    throw new Error('Failed to delete booking');
  }
};

export const getUniqueServices = (bookings: PhoneBooking[]): string[] => {
  return ['all', ...new Set(bookings.map(booking => booking.service_name))];
};

export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30'
];