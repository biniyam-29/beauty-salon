import React, { useState, useMemo, useEffect } from "react";
import { X, Search, DollarSign, Check, AlertCircle } from "lucide-react";
import { Button, cn } from "./PatientUpdateComponents";
import { useServices, type Service } from "../../../hooks/UseService";
import { 
  useCreateServicePrescription, 
  type CreateServicePrescriptionInput,
  type ServicePrescription,
} from "../../../hooks/UseServicePrescription";

interface DoctorServicePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerId: number | string;
  onPrescribe?: (servicePrescription: ServicePrescription) => void; // Optional callback for success
}

export const DoctorServicePrescriptionModal: React.FC<DoctorServicePrescriptionModalProps> = ({
  isOpen,
  onClose,
  customerName,
  customerId,
  onPrescribe,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [notes, setNotes] = useState("");
  const [customServiceName, setCustomServiceName] = useState("");
  const [customServicePrice, setCustomServicePrice] = useState("");
  const [useCustomService, setUseCustomService] = useState(false);
  const [showError, setShowError] = useState("");

  // Fetch available services using your useServices hook
  const { 
    data: servicesData, 
    isLoading: isLoadingServices,
    error: servicesError 
  } = useServices(1, 50); // Fetch all services with large page size

  // Use create service prescription mutation
  const { 
    mutate: createServicePrescription, 
    isPending: isSubmitting,
    error: createError
  } = useCreateServicePrescription({
    onSuccess: (data) => {
      // Show success message
      alert(`Service prescription created successfully!`);
      
      // Call the optional callback if provided
      if (onPrescribe) {
        onPrescribe(data);
      }
      
      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: (error) => {
      console.error("Error creating service prescription:", error);
      setShowError(error.message || "Failed to create service prescription. Please try again.");
    }
  });

  // Available services from the API
  const services = useMemo(() => {
    return servicesData?.services || [];
  }, [servicesData]);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;
    
    const term = searchTerm.toLowerCase();
    return services.filter(service =>
      service.name.toLowerCase().includes(term) ||
      service.description?.toLowerCase().includes(term)
    );
  }, [services, searchTerm]);

  // Handle custom service validation
  const validateCustomService = (): boolean => {
    if (!customServiceName.trim()) {
      setShowError("Custom service name is required");
      return false;
    }
    
    const price = parseFloat(customServicePrice);
    if (isNaN(price) || price < 0) {
      setShowError("Price must be a valid positive number");
      return false;
    }
    
    return true;
  };

  // Validate regular service selection
  const validateRegularService = (): boolean => {
    if (!selectedService) {
      setShowError("Please select a service");
      return false;
    }
    
    if (!selectedService.price || selectedService.price < 0) {
      setShowError("Selected service has invalid price");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setShowError(""); // Clear previous errors
    
    if (useCustomService) {
      // Validate custom service
      if (!validateCustomService()) return;
      
      const data: CreateServicePrescriptionInput = {
        name: customServiceName.trim(),
        prescription_notes: notes.trim(),
        price: Math.round(parseFloat(customServicePrice)),
        customer_id: Number(customerId),
        status: 'pending'
      };
      
      createServicePrescription(data);
      
    } else {
      // Validate regular service
      if (!validateRegularService()) return;
      
      const data: CreateServicePrescriptionInput = {
        name: selectedService!.name,
        prescription_notes: notes.trim(),
        price: Math.round(selectedService!.price),
        customer_id: Number(customerId),
        status: 'pending'
      };
      
      createServicePrescription(data);
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setSelectedService(null);
    setNotes("");
    setCustomServiceName("");
    setCustomServicePrice("");
    setUseCustomService(false);
    setShowError("");
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Prescribe Service</h2>
            <p className="text-sm text-gray-500">For: {customerName}</p>
            {customerId && (
              <p className="text-xs text-gray-400">Customer ID: {customerId}</p>
            )}
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-100px)]">
          {/* Service Selection */}
          <div className="lg:w-1/2 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="mb-6 space-y-4">
              {/* Custom Service Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUseCustomService(!useCustomService)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    useCustomService 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Check size={16} />
                  {useCustomService ? 'Using Custom Service' : 'Use Custom Service'}
                </button>
                <span className="text-sm text-gray-500">
                  {useCustomService ? 'Create custom service' : 'Select from existing'}
                </span>
              </div>

              {useCustomService ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Service Name *
                    </label>
                    <input
                      type="text"
                      value={customServiceName}
                      onChange={(e) => setCustomServiceName(e.target.value)}
                      placeholder="Enter service name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (ETB) *
                    </label>
                    <input
                      type="number"
                      value={customServicePrice}
                      onChange={(e) => setCustomServicePrice(e.target.value)}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={isSubmitting || isLoadingServices}
                    />
                  </div>

                  {/* Services List */}
                  <div className="space-y-3">
                    {isLoadingServices ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                      </div>
                    ) : servicesError ? (
                      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                        <p className="flex items-center gap-2">
                          <AlertCircle size={16} />
                          Error loading services. Please try again.
                        </p>
                      </div>
                    ) : filteredServices.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {searchTerm ? 'No services found matching your search' : 'No services available'}
                      </div>
                    ) : (
                      filteredServices.map((service) => (
                        <div
                          key={service.id}
                          className={cn(
                            "p-4 rounded-lg border-2 cursor-pointer transition-all",
                            selectedService?.id === service.id
                              ? "border-rose-500 bg-rose-50"
                              : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
                          )}
                          onClick={() => {
                            if (!isSubmitting) {
                              setSelectedService(service);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800">{service.name}</h3>
                                {selectedService?.id === service.id && (
                                  <Check size={16} className="text-rose-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {service.description || 'No description available'}
                              </p>
                              
                              <div className="flex items-center gap-4 mt-3 text-sm">
                                <div className="flex items-center gap-1 text-gray-500">
                                  <DollarSign size={14} />
                                  <span>ETB {service.price.toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                  Created: {new Date(service.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Prescription Details */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Prescription Details</h3>
                
                <div className="space-y-4">
                  {/* Service Summary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {useCustomService ? 'Custom Service' : 'Selected Service'}
                    </label>
                    {useCustomService ? (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="space-y-2">
                          <h4 className="font-bold text-gray-800">{customServiceName || 'Custom Service'}</h4>
                          <p className="text-sm text-gray-600">
                            {customServicePrice ? `Price: ETB ${parseFloat(customServicePrice).toLocaleString()}` : 'Price not set'}
                          </p>
                          <p className="text-xs text-rose-500 italic">
                            This will create a new service prescription with the custom name and price.
                          </p>
                        </div>
                      </div>
                    ) : selectedService ? (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-gray-800">{selectedService.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedService.description || 'No description available'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-rose-600">
                              ETB {selectedService.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {selectedService.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {isLoadingServices ? 'Loading services...' : 'No service selected'}
                      </p>
                    )}
                  </div>

                  {/* Prescription Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prescription Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any specific instructions or notes for this service prescription..."
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Add treatment instructions, precautions, or other notes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {showError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle size={16} />
                    <p className="text-sm">{showError}</p>
                  </div>
                </div>
              )}

              {createError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle size={16} />
                    <p className="text-sm">{createError.message}</p>
                  </div>
                </div>
              )}

              {/* Summary and Submit */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-rose-600">
                      {useCustomService 
                        ? customServicePrice 
                          ? `ETB ${parseFloat(customServicePrice).toLocaleString()}`
                          : 'ETB 0'
                        : selectedService 
                          ? `ETB ${selectedService.price.toLocaleString()}`
                          : 'ETB 0'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium text-gray-800">{customerName}</p>
                    <p className="text-xs text-gray-500">ID: {customerId}</p>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || 
                    (useCustomService 
                      ? !customServiceName.trim() || !customServicePrice
                      : !selectedService
                    )
                  }
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Prescription...
                    </>
                  ) : (
                    'Create Service Prescription'
                  )}
                </Button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  This will create a service prescription with status: <span className="font-semibold">Pending</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};