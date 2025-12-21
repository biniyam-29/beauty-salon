import React from "react";
import type { Customer } from "../../../hooks/UseCustomer";
import { ListSkeleton } from "./skeletons/ListSkeleton";
import { CustomerListItem } from "./shared/CustomerListItem";

interface CustomerListProps {
  customers: Customer[];
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
  if (isLoading) {
    return <ListSkeleton />;
  }

  if (isError) {
    return <p className="p-4 text-red-500">{error?.message || "Error loading customers"}</p>;
  }

  if (customers.length === 0) {
    return <p className="p-4 text-center text-gray-500">No clients found.</p>;
  }

  return (
    <div className="space-y-2">
      {customers.map((customer) => (
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