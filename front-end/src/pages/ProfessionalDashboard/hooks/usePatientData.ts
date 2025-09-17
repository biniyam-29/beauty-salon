// src/pages/ProfessionalDashboard/hooks/usePatientData.ts
import { useQueries } from "@tanstack/react-query";
import {
  fetchPatientDetails,
  fetchPatientConsultations,
  fetchAllSoldPrescriptions,
} from "../services/api";

export const usePatientData = (patientId: number) => {
  const results = useQueries({
    queries: [
      {
        queryKey: ["patientDetails", patientId],
        queryFn: () => fetchPatientDetails(patientId),
        enabled: !!patientId,
      },
      {
        queryKey: ["consultations", patientId],
        queryFn: () => fetchPatientConsultations(patientId),
        enabled: !!patientId,
      },
      {
        queryKey: ["allSoldPrescriptions"],
        queryFn: fetchAllSoldPrescriptions,
      },
    ],
  });

  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);

  const [patientDetailsQuery, consultationsQuery, prescriptionsQuery] = results;

  return {
    patient: patientDetailsQuery.data,
    consultations: consultationsQuery.data,
    allPrescriptions: prescriptionsQuery.data,
    isLoading,
    isError,
  };
};