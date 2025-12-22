import React, { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import {
  useCustomerDetails,
  usePrescriptions,
  type Prescription,
} from "../../../hooks/UseCustomer";
import { DetailSection } from "./shared/DetailSection";

interface CustomerPrescriptionsProps {
  customerId: number | string;
}

const PrescriptionCard: React.FC<{ prescription: Prescription }> = ({
  prescription,
}) => (
  <div className="flex items-start gap-4 p-4 border-b border-rose-100/80 last:border-b-0">
    <img
      src={prescription.product_image || "https://via.placeholder.com/80"}
      alt={prescription.product_name}
      className="w-20 h-20 rounded-lg object-cover bg-rose-100"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "https://via.placeholder.com/80x80?text=No+Image";
      }}
    />
    <div className="flex-1">
      <h3 className="font-bold text-gray-800">{prescription.product_name}</h3>
      <p className="text-sm text-gray-500 mb-2">
        Quantity: {prescription.quantity}
      </p>
      <p className="text-gray-700 text-sm">
        <span className="font-semibold">Instructions:</span>{" "}
        {prescription.instructions}
      </p>
    </div>
  </div>
);

export const CustomerPrescriptions: React.FC<CustomerPrescriptionsProps> = ({
  customerId,
}) => {
  const { data: customer, isLoading: isCustomerLoading } =
    useCustomerDetails(customerId);
  const {
    data: allPrescriptions,
    isLoading: arePrescriptionsLoading,
    isError: isPrescriptionsError,
  } = usePrescriptions();

  const customerPrescriptions = useMemo(() => {
    if (!customer || !allPrescriptions) return [];
    return allPrescriptions.filter(
      (p) =>
        p.customer_name === customer.full_name ||
        p.customer_phone === customer.phone
    );
  }, [customer, allPrescriptions]);

  if (isCustomerLoading || arePrescriptionsLoading) {
    return (
      <div className="p-8">
        <DetailSection title="Prescription History" icon={<ClipboardList size={20} />}>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>
    );
  }

  if (isPrescriptionsError) {
    return (
      <div className="p-8">
        <DetailSection title="Prescription History" icon={<ClipboardList size={20} />}>
          <div className="text-red-500">Error loading prescriptions.</div>
        </DetailSection>
      </div>
    );
  }

  return (
    <div className="p-8">
      <DetailSection title="Prescription History" icon={<ClipboardList size={20} />}>
        <div className="divide-y divide-rose-100/60 -m-6">
          {customerPrescriptions.length > 0 ? (
            customerPrescriptions.map((p) => (
              <PrescriptionCard key={p.prescription_id} prescription={p} />
            ))
          ) : (
            <p className="text-gray-500 p-6">
              No prescriptions found for this client.
            </p>
          )}
        </div>
      </DetailSection>
    </div>
  );
};