import React from "react";
import { CustomerListItem, ListSkeleton } from "../doctor/profile/shared";
import { useCustomersWithPendingProfessional } from "../../hooks/UseConsultations";
import type { Customer } from "../../hooks/UseCustomer";

interface CustomerListProps {
  selectedCustomerId: number | string | null;
  onSelectCustomer: (id: number | string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  selectedCustomerId,
  onSelectCustomer,
}) => {
  const { data: response, isLoading, isError, error } = useCustomersWithPendingProfessional();

  // Safely extract the actual customers array
  const customers = Array.isArray(response) ? response : response?.data ?? [];

  if (isLoading) {
    return <ListSkeleton />;
  }

  if (isError) {
    return (
      <p className="p-4 text-red-500">
        {error?.message || "Error loading customers with pending professional signature"}
      </p>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="mb-2">No clients requiring professional signature found.</p>
        <p className="text-sm text-gray-400">
          All consultations have been signed by professionals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {customers.map((customer: any) => (
        <CustomerListItem
          key={customer.customer_id}
          customer={
            {
              id: customer.customer_id,
              full_name: customer.full_name,
              phone: customer.phone,
              email: customer.email ?? null,
              created_at: "",
              updated_at: "",
            } as Customer
          }
          isSelected={selectedCustomerId === customer.customer_id}
          onClick={() => onSelectCustomer(customer.customer_id)}
        />
      ))}
    </div>
  );
};