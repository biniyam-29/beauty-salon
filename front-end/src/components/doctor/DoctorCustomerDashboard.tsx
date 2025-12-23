import React, { useState, useMemo } from "react";
import { LogOut, Search, User as UserIcon, X, Edit2, Stethoscope, Loader2 } from "lucide-react";
import { useCustomers, useSearchCustomers, useCustomerDetails } from "../../hooks/UseCustomer";
import { CustomerList } from "./profile/DoctorCustomerList";
import { CustomerProfile } from "./profile/DoctorCustomerProfile";
import { CustomerConsultations } from "./profile/DoctorCustomerConsultations";
import { CustomerPrescriptions } from "./profile/DoctorCustomerPrescriptions";
import { useNavigate } from "react-router-dom";
import { DoctorCustomerEditModal } from "./DoctorCustomerEditModal";
import { DoctorPrescriptionModal } from "./forms/DoctorPrescriptionModal";

export const DoctorCustomerDashboard: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "consultations" | "prescriptions">("profile");
  const [page, setPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const navigate = useNavigate();

  // Use regular customers (not assigned) since doctor should see all
  const {
    data: customersData,
    isLoading,
    isError,
    error,
  } = useCustomers(page);

  // Use search when there's a search term
  const {
    data: searchData,
    isLoading: isSearching,
  } = useSearchCustomers({ searchTerm, page });

  // Use customer details hook to get full customer data
  const {
    data: selectedCustomerDetails,
    isLoading: isLoadingDetails,
    refetch: refetchCustomerDetails,
  } = useCustomerDetails(selectedCustomerId || '');

  // Determine which data to use for the list
  const customers = searchTerm ? searchData?.customers : customersData?.customers;
  const totalPages = searchTerm ? searchData?.totalPages : customersData?.totalPages;

  const filteredCustomers = useMemo(
    () => customers || [],
    [customers]
  );

  // Get basic customer info from list for display
  const selectedCustomerBasic = useMemo(
    () => customers?.find(c => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  // Use detailed customer data when available
  const selectedCustomer = selectedCustomerDetails || selectedCustomerBasic;

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleEditCustomer = async () => {
    if (selectedCustomerId) {
      try {
        // Fetch full customer details before opening modal
        await refetchCustomerDetails();
        setIsEditModalOpen(true);
      } catch (error) {
        console.error("Failed to fetch customer details:", error);
        alert("Failed to load customer details. Please try again.");
      }
    }
  };

  const handlePrescribeService = () => {
    if (selectedCustomer) {
      setIsPrescriptionModalOpen(true);
    }
  };

  const handleEditSuccess = () => {
    console.log("Customer updated successfully!");
    // Refresh the customer details after edit
    if (selectedCustomerId) {
      refetchCustomerDetails();
    }
  };

  const renderContent = () => {
    if (!selectedCustomerId || !selectedCustomerBasic) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <UserIcon size={48} className="mb-4 text-rose-300" />
          <h2 className="text-xl font-semibold">Select a client</h2>
          <p>Choose a client from the list to view and manage their profile.</p>
        </div>
      );
    }

    if (isLoadingDetails) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-4" />
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "profile":
        return <CustomerProfile customerId={selectedCustomerId} />;
      case "consultations":
        return <CustomerConsultations customerId={selectedCustomerId} customerName={selectedCustomerBasic.full_name} />;
      case "prescriptions":
        return <CustomerPrescriptions customerId={selectedCustomerId} />;
      default:
        return <CustomerProfile customerId={selectedCustomerId} />;
    }
  };

  return (
    <div className="h-screen w-full bg-[#FDF8F5] font-sans flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-rose-200/60 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-800">Client Management</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-rose-100/50 transition-colors"
        >
          <LogOut size={20} className="text-red-600" />
          Logout
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
                onChange={handleSearchChange}
                className="w-full bg-white border border-rose-200/80 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-rose-300 focus:outline-none transition"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <CustomerList
              customers={filteredCustomers}
              isLoading={isLoading || isSearching}
              isError={isError}
              error={error}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={setSelectedCustomerId}
            />
          </div>
          
          {/* Pagination */}
          {totalPages && totalPages > 1 && (
            <div className="p-4 border-t border-rose-200/60 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm rounded-lg border border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm rounded-lg border border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50"
              >
                Next
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#FDF8F5] hidden md:block overflow-y-auto">
          {selectedCustomerId && selectedCustomerBasic && (
            <div className="flex flex-col h-full">
              {/* Header with actions */}
              <div className="p-6 sticky top-0 bg-[#FDF8F5]/80 backdrop-blur-sm z-10 border-b border-rose-100/80">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      {selectedCustomerBasic.full_name}
                    </h1>
                    <p className="text-gray-600">{selectedCustomerBasic.phone}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleEditCustomer}
                      disabled={isLoadingDetails}
                      className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingDetails ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Edit2 size={16} />
                      )}
                      {isLoadingDetails ? "Loading..." : "Edit Profile"}
                    </button>
                    <button
                      onClick={handlePrescribeService}
                      className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Stethoscope size={16} />
                      Prescribe Service
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-rose-200/60">
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {renderContent()}
              </div>
            </div>
          )}
          {!selectedCustomerId && renderContent()}
        </main>
      </div>

      {/* Mobile view */}
      {selectedCustomerId && (
        <div className="md:hidden fixed inset-0 bg-[#FDF8F5] z-50 overflow-y-auto">
          <div className="p-4 border-b border-rose-200/60">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800">{selectedCustomerBasic?.full_name}</h1>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-2"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEditCustomer}
                disabled={isLoadingDetails}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isLoadingDetails ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Edit2 size={16} />
                )}
                {isLoadingDetails ? "Loading..." : "Edit"}
              </button>
              <button
                onClick={handlePrescribeService}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg"
              >
                <Stethoscope size={16} />
                Prescribe
              </button>
            </div>
          </div>
          {renderContent()}
        </div>
      )}

      {/* Modals */}
      {selectedCustomerDetails && (
        <>
          <DoctorCustomerEditModal
            key={`edit-modal-${selectedCustomerId}-${isEditModalOpen}`}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
            }}
            customer={selectedCustomerDetails}
            onSuccess={handleEditSuccess}
          />
          
          <DoctorPrescriptionModal
            isOpen={isPrescriptionModalOpen}
            onClose={() => {
              setIsPrescriptionModalOpen(false);
            }}
            customerName={selectedCustomerBasic?.full_name || ""}
            customerId={selectedCustomerId || ""}
          />
        </>
      )}
    </div>
  );
};

export default DoctorCustomerDashboard;