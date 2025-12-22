import React from "react";
import type { Customer } from "../../../../hooks/UseCustomer";
import { AvatarPlaceholder } from "./AvatarPlaceholder";

interface CustomerListItemProps {
  customer: Customer;
  isSelected: boolean;
  onClick: () => void;
}

export const CustomerListItem: React.FC<CustomerListItemProps> = ({
  customer,
  isSelected,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors duration-200 ${
      isSelected ? "bg-rose-100/60" : "hover:bg-rose-100/40"
    }`}
  >
    <AvatarPlaceholder
      name={customer.full_name}
      className="w-12 h-12 text-xl"
    />
    <div className="overflow-hidden">
      <h3 className="font-bold text-gray-800 truncate">{customer.full_name}</h3>
      <p className="text-sm text-gray-500 truncate">{customer.phone}</p>
    </div>
  </div>
);