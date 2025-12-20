export type PhoneBookingData = {
  id?: number;
  receptionId: number;
  customerName: string;
  phone: string;
  appointmentTime: string;
  callReceivedAt?: string;
  createdAt?: string; // add this for sorting/display
};

export type FormData = {
  name: string;
  address: string;
  phoneNumber: string;
  city: string;
  dateOfBirth: string;
  email: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  howDidYouHear: string;
  skinType: string;
  skinFeel: string[];
  sunExposure: string;
  foundationType: string;
  skinHeal: string;
  bruiseEasily: string;
  skinCareProducts: string[];
  others: string;
  skinConcerns: string[];
  firstFacial: string;
  previousTreatmentLikes: string;
  achieveToday: string;
  usedDerivatives: string;
  botoxFillers: string;
  acneMedication: string;
  acneMedicationDetails: string;
  healthHistory: string[];
  anyOtherConditions: string;
  knownAllergies: string;
  allergiesDetails: string;
  supplements: string;
  medication: string;
  alcoholSmoke: string;
  signature: string;
  date: string;
};
