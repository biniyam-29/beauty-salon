import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { PatientData } from "../types";
import { dbUrl } from "../config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from "../components/ui";
import { CustomerDetailView } from "../components/CustomerDetailView";

// =================================================================================
// FILE: src/pages/CustomerListPage.tsx
// =================================================================================

// --- Modal Component (Internal to this page) ---
type CustomerDetailModalProps = {
  customer: PatientData;
  onClose: () => void;
};
const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex justify-between items-center sticky top-0 z-10">
          <CardTitle className="text-pink-800">Customer Details</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-pink-600 transition-colors text-3xl leading-none"
          >
            &times;
          </button>
        </CardHeader>
        <CardContent className="p-8">
          <CustomerDetailView user={customer} />
        </CardContent>
      </div>
    </div>
  );
};

// --- Main List Page Component ---
export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<PatientData | null>(
    null
  );

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(dbUrl);
        if (!response.ok)
          throw new Error("Failed to fetch customers from the server.");
        const data: PatientData[] = await response.json();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      ),
    [customers, searchTerm]
  );

  if (isLoading)
    return (
      <div className="text-center text-pink-700 font-bold">
        Loading customers...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 font-bold">Error: {error}</div>
    );

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-display text-pink-900">All Customers</h1>
        <Button onClick={() => navigate("/reception")} variant="outline">
          Back to Welcome
        </Button>
      </div>
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {filteredCustomers.length === 0 ? (
        <Card className="text-center">
          <CardContent>
            <p className="py-12 text-gray-500 font-semibold">
              No customers found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className="transition-transform duration-300 hover:scale-105 hover:shadow-pink-300/50"
            >
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-200 rounded-full flex items-center justify-center text-pink-600 text-2xl font-bold font-display">
                    {customer.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-gray-800">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

// =================================================================================
// END FILE: src/pages/CustomerListPage.tsx
// =================================================================================
