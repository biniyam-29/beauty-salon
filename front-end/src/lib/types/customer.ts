export type PhoneBookingData = {
  id?: number;
  receptionId: number;
  customerName: string;
  phone: string;
  appointmentTime: string;
  callReceivedAt?: string;
  createdAt?: string; // add this for sorting/display
};