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

export const initialFormData: FormData = {
  name: "",
  address: "",
  phoneNumber: "",
  city: "",
  dateOfBirth: "",
  email: "",
  emergencyContact: "",
  emergencyContactPhone: "",
  howDidYouHear: "",
  skinType: "",
  skinFeel: [],
  sunExposure: "",
  foundationType: "",
  skinHeal: "",
  bruiseEasily: "",
  skinCareProducts: [],
  others: "",
  skinConcerns: [],
  firstFacial: "",
  previousTreatmentLikes: "",
  achieveToday: "",
  usedDerivatives: "",
  botoxFillers: "",
  acneMedication: "",
  acneMedicationDetails: "",
  healthHistory: [],
  anyOtherConditions: "",
  knownAllergies: "",
  allergiesDetails: "",
  supplements: "",
  medication: "",
  alcoholSmoke: "",
  signature: "",
  date: "",
};

export const skinCareProductsList = [
  "Facial cleanser",
  "Sunscreen",
  "Mask",
  "Make-up remover",
  "Bar soap",
  "Eye product",
  "Exfoliants",
  "Face scrub",
  "Toner",
  "Moisturizer",
  "Day cream",
  "Body scrub",
  "Serum",
  "Lip products",
  "Night cream",
  "Body lotion",
  "Face oil",
];

export const skinConcernsList = [
  "Wrinkles",
  "Dryness",
  "Rosacea",
  "Aging",
  "Hyperpigmentation",
  "Melasma",
  "Dark circle",
  "Sun damage",
  "Acne",
  "Flaky skin",
  "Milia",
  "Redness",
  "Acne scarring",
  "Psoriasis",
  "Oily skin",
  "Sensitivity",
];

export const healthHistoryList = [
  "Cancer",
  "Arthritis",
  "Thyroid condition",
  "Epilepsy",
  "High Blood Pressure",
  "Asthma",
  "Auto-immune disorders",
  "Warts",
  "Diabetes",
  "Hepatitis",
  "Low blood pressure",
  "Insomnia",
  "Heart Problem",
  "Migraines",
  "Pregnant",
  "Eczema",
];
