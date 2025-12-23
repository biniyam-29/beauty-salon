import React from "react";
import { CustomerListItem, ListSkeleton } from "../doctor/profile/shared";

interface CustomerListProps {
  customers: any[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selectedCustomerId: number | string | null;
  onSelectCustomer: (id: number | string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  isLoading,
  isError,
  error,
  selectedCustomerId,
  onSelectCustomer,
}) => {
  // Filter customers who have consultations but haven't been signed by a professional
  // Note: This assumes consultations are available in customer data
  const customersToShow = customers.filter(customer => {
    // If customer has no consultations, show them (they need to have a consultation first)
    if (!customer.consultations || customer.consultations.length === 0) {
      return true;
    }
    
    // Check if any consultation is unsigned (no professional_id)
    const hasUnsignedConsultation = customer.consultations.some(
      (consultation: any) => !consultation.professional_id
    );
    
    return hasUnsignedConsultation;
  });

  if (isLoading) {
    return <ListSkeleton />;
  }

  if (isError) {
    return <p className="p-4 text-red-500">{error?.message || "Error loading customers"}</p>;
  }

  if (customersToShow.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="mb-2">No clients requiring signature found.</p>
        <p className="text-sm text-gray-400">
          All consultations have been signed by professionals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {customersToShow.map((customer) => (
        <CustomerListItem
          key={customer.id}
          customer={customer}
          isSelected={selectedCustomerId === customer.id}
          onClick={() => onSelectCustomer(customer.id)}
        />
      ))}
    </div>
  );
};