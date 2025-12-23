import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
  Loader2,
  Sparkles,
  ShoppingCart,
  Check,
  AlertTriangle,
  Filter,
  Search,
  CreditCard,
  ShoppingBag,
  X,
  LogOut
} from "lucide-react";
import {
  usePendingPrescriptions,
  useProcessCheckout,
  useUpdatePrescriptionStatus,
  checkoutUtils,
  type Prescription,
} from "../../hooks/UseCheckout";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { PrescriptionCard } from "./PrescriptionCard";



// Filter Controls Component
const FilterControls: React.FC<{
  filterType: 'all' | 'product' | 'service';
  onFilterChange: (type: 'all' | 'product' | 'service') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ filterType, onFilterChange, searchQuery, onSearchChange }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex gap-2">
            {(['all', 'product', 'service'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onFilterChange(type)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  filterType === type
                    ? "bg-rose-100 text-rose-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {type === 'all' ? 'All' : type === 'product' ? 'Products' : 'Services'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full lg:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

// Summary Panel Component
const SummaryPanel: React.FC<{
  selectedPrescriptions: Prescription[];
  onCheckout: () => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}> = ({ selectedPrescriptions, onCheckout, onClearSelection, isProcessing }) => {
  const totals = useMemo(() => {
    const productCount = selectedPrescriptions.filter(p => p.type === 'product').length;
    const serviceCount = selectedPrescriptions.filter(p => p.type === 'service').length;
    const totalAmount = selectedPrescriptions.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
    
    return { productCount, serviceCount, totalAmount };
  }, [selectedPrescriptions]);

  const { canProcess, reasons } = checkoutUtils.canProcessAll(selectedPrescriptions);
  const hasErrors = reasons.length > 0;

  return (
    <div className="sticky top-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <ShoppingBag size={20} />
        Order Summary
      </h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Selected Items</span>
          <span className="font-bold text-gray-800">{selectedPrescriptions.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Products</span>
          <span className="font-bold text-gray-800">{totals.productCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Services</span>
          <span className="font-bold text-gray-800">{totals.serviceCount}</span>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-800 font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-rose-600">
              {checkoutUtils.formatPrice(totals.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {hasErrors && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-red-700 font-medium">
            <AlertTriangle size={16} />
            Issues Found
          </div>
          <ul className="text-sm text-red-600 space-y-1">
            {reasons.slice(0, 2).map((reason, idx) => (
              <li key={idx}>• {reason}</li>
            ))}
            {reasons.length > 2 && (
              <li className="text-red-500">... and {reasons.length - 2} more</li>
            )}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={onCheckout}
          disabled={selectedPrescriptions.length === 0 || !canProcess || isProcessing}
          className="w-full py-3.5"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={20} className="mr-2" />
              Process Checkout ({selectedPrescriptions.length})
            </>
          )}
        </Button>
        
        {selectedPrescriptions.length > 0 && (
          <Button
            variant="outline"
            onClick={onClearSelection}
            className="w-full"
            disabled={isProcessing}
          >
            <X size={16} className="mr-2" />
            Clear Selection
          </Button>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="text-center p-12 bg-gradient-to-br from-white to-rose-50 rounded-2xl border border-rose-200/50">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 mb-6">
      <Sparkles size={32} className="text-green-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-3">All Caught Up!</h3>
    <p className="text-gray-600 max-w-md mx-auto">
      There are no pending prescriptions to process. All services and products have been checked out successfully.
    </p>
  </div>
);

// Loading Skeleton
const SkeletonLoader: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded-lg"></div>
              <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
          <div className="lg:w-48 space-y-2">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Main Page Component
export const PrescriptionCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use the checkout hooks
  const { 
    data: prescriptionsResponse, 
    isLoading, 
    isError, 
    error 
  } = usePendingPrescriptions();
  
  const prescriptions = prescriptionsResponse?.data || [];

  const checkoutMutation = useProcessCheckout({
    onSuccess: (data) => {
      toast.success(data.message || "Checkout processed successfully!");
      setSelectedIds([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process checkout.");
    },
  });

  const updateStatusMutation = useUpdatePrescriptionStatus();

  // Filter and search prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => {
      // Filter by type
      if (filterType !== 'all' && prescription.type !== filterType) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          prescription.name.toLowerCase().includes(query) ||
          prescription.customer_name.toLowerCase().includes(query) ||
          (prescription.instructions?.toLowerCase().includes(query) || false) ||
          prescription.doctor_name.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [prescriptions, filterType, searchQuery]);

  // Get selected prescriptions
  const selectedPrescriptions = useMemo(() => {
    return filteredPrescriptions.filter(p => selectedIds.includes(p.id));
  }, [filteredPrescriptions, selectedIds]);

  // Check if all selected prescriptions can be processed
  const { canProcess } = checkoutUtils.canProcessAll(selectedPrescriptions);

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCheckout = () => {
    if (selectedPrescriptions.length === 0 || !canProcess) return;
    
    checkoutMutation.mutate({ prescription_ids: selectedIds });
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    const allProcessableIds = filteredPrescriptions
      .filter(p => checkoutUtils.canProcessPrescription(p))
      .map(p => p.id);
    setSelectedIds(allProcessableIds);
  };

  const handleProcessCustomer = (customerId: number) => {
    const customerPrescriptions = prescriptions.filter(p => p.customer_id === customerId);
    const processableIds = customerPrescriptions
      .filter(p => checkoutUtils.canProcessPrescription(p))
      .map(p => p.id);
    
    if (processableIds.length > 0) {
      checkoutMutation.mutate({ prescription_ids: processableIds });
    } else {
      toast.warning("No processable prescriptions found for this customer.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const isProcessing = checkoutMutation.isPending || updateStatusMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 via-white to-emerald-50/20 font-sans">
      <Toaster 
        position="top-right" 
        richColors 
        toastOptions={{
          className: 'font-sans',
        }}
      />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-rose-600 to-rose-500 rounded-lg">
                  <ShoppingCart size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Prescription Checkout
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Process product and service prescriptions for customers
                  </p>
                </div>
              </div>
              
              {prescriptions.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
                    <span className="text-gray-600">Total: </span>
                    <span className="font-semibold text-gray-800">{prescriptions.length}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
                    <span className="text-gray-600">Products: </span>
                    <span className="font-semibold text-blue-600">
                      {prescriptions.filter(p => p.type === 'product').length}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
                    <span className="text-gray-600">Services: </span>
                    <span className="font-semibold text-purple-600">
                      {prescriptions.filter(p => p.type === 'service').length}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-rose-100/50 transition-colors"
              >
                <LogOut size={20} className="text-red-600" />
                Logout
              </button>
              
              {selectedPrescriptions.length > 0 && canProcess && (
                <Button
                  variant="secondary"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="min-w-[180px]"
                >
                  {isProcessing ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : (
                    <Check size={18} className="mr-2" />
                  )}
                  Checkout ({selectedPrescriptions.length})
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filter Controls */}
            <FilterControls
              filterType={filterType}
              onFilterChange={setFilterType}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            
            {/* Select All Button */}
            {filteredPrescriptions.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                </div>
                <button
                  onClick={handleSelectAll}
                  disabled={isProcessing}
                  className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                >
                  Select All Processable
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && <SkeletonLoader />}
            
            {/* Error State */}
            {isError && (
              <div className="text-center p-10 bg-white rounded-2xl border border-red-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Failed to Load Prescriptions
                </h3>
                <p className="text-gray-600 mb-4">{error?.message}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredPrescriptions.length === 0 && (
              <EmptyState />
            )}

            {/* Prescriptions List */}
            {!isLoading && !isError && filteredPrescriptions.length > 0 && (
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    isSelected={selectedIds.includes(prescription.id)}
                    onToggleSelect={handleToggleSelect}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <SummaryPanel
              selectedPrescriptions={selectedPrescriptions}
              onCheckout={handleCheckout}
              onClearSelection={handleClearSelection}
              isProcessing={isProcessing}
            />
            
            {/* Quick Actions */}
            {prescriptions.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
                <div className="space-y-3">
                  {Array.from(new Set(prescriptions.map(p => p.customer_id)))
                    .slice(0, 3)
                    .map(customerId => {
                      const customerName = prescriptions.find(p => p.customer_id === customerId)?.customer_name;
                      const customerPrescriptions = prescriptions.filter(p => p.customer_id === customerId);
                      const processableCount = customerPrescriptions.filter(p => 
                        checkoutUtils.canProcessPrescription(p)
                      ).length;
                      
                      return (
                        <button
                          key={customerId}
                          onClick={() => handleProcessCustomer(customerId)}
                          disabled={processableCount === 0 || isProcessing}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="font-medium text-gray-800">{customerName}</div>
                          <div className="text-sm text-gray-500">
                            {processableCount} processable prescriptions
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCheckoutPage;