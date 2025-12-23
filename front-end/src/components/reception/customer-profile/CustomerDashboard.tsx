import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft } from "lucide-react";
import { useCustomers } from "../../../hooks/UseCustomer";
import { CustomerList } from "./CustomerList";
import { CustomerProfile } from "./CustomerProfile";
import { CustomerConsultations } from "./CustomerConsultations";
import { CustomerPrescriptions } from "./CustomerPrescriptions";

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "consultations" | "prescriptions">("profile");

  const {
    data: customersResponse,
    isLoading,
    isError,
    error,
  } = useCustomers();

  // Extract the actual customers array (most common pattern)
  const customers = customersResponse?.customers ?? [];

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [customers, searchTerm]
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  React.useEffect(() => {
    if (
      selectedCustomerId &&
      customers &&
      !filteredCustomers.find((c) => c.id === selectedCustomerId)
    ) {
      setSelectedCustomerId(null);
    }
  }, [filteredCustomers, selectedCustomerId, customers]);

  const renderContent = () => {
    if (!selectedCustomerId || !selectedCustomer) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <User size={48} className="mb-4 text-rose-300" />
          <h2 className="text-xl font-semibold">Select a client</h2>
          <p>Choose a client from the list to view their full profile.</p>
        </div>
      );
    }

    switch (activeTab) {
      case "profile":
        return <CustomerProfile customerId={selectedCustomerId} />;
      case "consultations":
        return <CustomerConsultations customerId={selectedCustomerId} customerName={selectedCustomer.full_name} />;
      case "prescriptions":
        return <CustomerPrescriptions customerId={selectedCustomerId} />;
      default:
        return <CustomerProfile customerId={selectedCustomerId} />;
    }
  };

  return (
    <div className="h-screen w-full bg-[#FDF8F5] font-sans flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-rose-200/60 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-800">Client Profiles</h1>
        <button
          onClick={() => navigate("/reception")}
          className="flex items-center gap-2 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-rose-100/50 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-full md:w-1/3 lg:w-1/4 border-r border-rose-200/60 flex flex-col">
          <div className="p-4 border-b border-rose-200/60">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-rose-200/80 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-rose-300 focus:outline-none transition"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <CustomerList
              customers={filteredCustomers}
              isLoading={isLoading}
              isError={isError}
              error={error}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={setSelectedCustomerId}
            />
          </div>
        </aside>

        <main className="flex-1 bg-[#FDF8F5] hidden md:block overflow-y-auto">
          {selectedCustomerId && selectedCustomer && (
            <div className="flex flex-col h-full">
              <div className="p-8 sticky top-0 bg-[#FDF8F5]/80 backdrop-blur-sm z-10 border-b border-rose-100/80">
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                          {selectedCustomer.full_name}
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex border-b border-rose-200/60">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === "profile"
                        ? "border-b-2 border-rose-500 text-rose-600"
                        : "text-gray-500 hover:text-rose-500"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("consultations")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === "consultations"
                        ? "border-b-2 border-rose-500 text-rose-600"
                        : "text-gray-500 hover:text-rose-500"
                    }`}
                  >
                    Consultations
                  </button>
                  <button
                    onClick={() => setActiveTab("prescriptions")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === "prescriptions"
                        ? "border-b-2 border-rose-500 text-rose-600"
                        : "text-gray-500 hover:text-rose-500"
                    }`}
                  >
                    Prescriptions
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderContent()}
              </div>
            </div>
          )}
          {!selectedCustomerId && renderContent()}
        </main>
      </div>

      {selectedCustomerId && (
        <div className="md:hidden fixed inset-0 bg-[#FDF8F5] z-50 overflow-y-auto">
          <button
            onClick={() => setSelectedCustomerId(null)}
            className="absolute top-4 right-4 z-20 p-2 bg-white/50 rounded-full"
          >
            <X size={24} />
          </button>
          {renderContent()}
        </div>
      )}
    </div>
  );
};

// Helper components
const User: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const X: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default CustomerDashboard;