import type { FC } from "react";
import type { Patient } from "../types";
import { PatientListSkeleton } from "./ui/PatientListSkeleton"; // Assuming these are now in a ui directory
import { AvatarPlaceholder } from "./ui/Avatar";
import { cn } from "../services/utils"; // Assuming cn is moved to utils

interface PatientListProps {
  patients?: Patient[];
  isLoading: boolean;
  selectedPatientId: number | null;
  onSelectPatient: (id: number) => void;
}

export const PatientList: FC<PatientListProps> = ({
  patients,
  isLoading,
  selectedPatientId,
  onSelectPatient,
}) => {
  return (
    <div className="w-full md:w-2/5 lg:w-1/3 border-r border-rose-100/60 flex flex-col">
      <div className="p-4 border-b border-rose-100/60">
        <h2 className="font-bold text-gray-800">
          Your Patients ({patients?.length || 0})
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <PatientListSkeleton />
        ) : (
          patients?.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors",
                selectedPatientId === patient.id
                  ? "bg-rose-100/60"
                  : "hover:bg-rose-100/40"
              )}
            >
              <AvatarPlaceholder
                name={patient.full_name}
                className="w-12 h-12 text-xl"
              />
              <div>
                <h3 className="font-bold text-gray-800">{patient.full_name}</h3>
                <p className="text-sm text-gray-500">{patient.phone}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};