import type { FC } from "react";
import { Pill } from "lucide-react";
import type { Prescription } from "../types";

const PrescriptionCard: FC<{ prescription: Prescription }> = ({ prescription }) => (
  <div className="py-4 flex items-center gap-4">
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-rose-100/60 rounded-lg">
      <Pill className="w-6 h-6 text-rose-600" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">{prescription.product_name} (Qty: {prescription.quantity})</h4>
      <p className="text-sm text-gray-600">{prescription.instructions}</p>
    </div>
  </div>
);

interface PrescriptionsTabProps {
  prescriptions: Prescription[];
}

export const PrescriptionsTab: FC<PrescriptionsTabProps> = ({ prescriptions }) => (
  <div className="divide-y divide-rose-100/60">
    {prescriptions.length > 0 ? (
      prescriptions.map((p) => (
        <PrescriptionCard key={p.prescription_id} prescription={p} />
      ))
    ) : (
      <p className="text-gray-500 text-center py-8">No prescription history.</p>
    )}
  </div>
);