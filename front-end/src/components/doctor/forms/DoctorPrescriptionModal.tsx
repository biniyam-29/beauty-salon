import React, { useState, useMemo, useEffect } from "react";
import { X, Search, CheckCircle, Package, Scissors, Check, AlertCircle } from "lucide-react";
import { Button, cn } from "./PatientUpdateComponents";
import { useServices, type Service } from "../../../hooks/UseService";
import { useProducts, type Product } from "../../../hooks/UseProduct";
import {
  useCreateServicePrescription,
  type CreateServicePrescriptionInput,
} from "../../../hooks/UseServicePrescription";
import {
  useCreatePrescription,
  type CreatePrescriptionInput,
} from "../../../hooks/UseProductPrescriptions";
import { QuickConsultationModal } from "./QuickConsultationModal";

interface DoctorPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerId: number | string;
  consultationId?: number;
  onPrescribe?: () => void;
}

export const DoctorPrescriptionModal: React.FC<DoctorPrescriptionModalProps> = ({
  isOpen,
  onClose,
  customerName,
  customerId,
  consultationId,
  onPrescribe,
}) => {
  const [mode, setMode] = useState<"service" | "product">("service");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [error, setError] = useState("");
  const [showQuickConsultModal, setShowQuickConsultModal] = useState(false);
  const [pendingProductPrescription, setPendingProductPrescription] = useState<CreatePrescriptionInput | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data: servicesData, isLoading: loadingServices } = useServices(1, 100);
  const { data: productsData, isLoading: loadingProducts } = useProducts(1);

  const services = useMemo(() => servicesData?.services || [], [servicesData]);
  const products = useMemo(() => productsData?.products || [], [productsData]);

  const createService = useCreateServicePrescription({
    onSuccess: () => {
      setSuccessMessage("Service prescription created successfully!");
      setShowSuccessModal(true);
    },
    onError: (err) => setError(err.message || "Failed to create service prescription"),
  });

  const createProductPrescription = useCreatePrescription({
    onSuccess: () => {
      setSuccessMessage("Product prescription created successfully!");
      setShowSuccessModal(true);
    },
    onError: (err) => setError(err.message || "Failed to create product prescription"),
  });

  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;
    const term = searchTerm.toLowerCase();
    return services.filter(
      (s) => s.name.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term)
    );
  }, [services, searchTerm]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const isSubmitting =
    createService.isPending ||
    createProductPrescription.isPending;

  const validateCustom = () => {
    if (!customName.trim()) {
      setError("Name is required");
      return false;
    }
    if (mode === "service") {
      const price = parseFloat(customPrice);
      if (isNaN(price) || price <= 0) {
        setError("Valid positive price is required for services");
        return false;
      }
    }
    return true;
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onPrescribe?.();
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    setError("");

    if (useCustom) {
      if (!validateCustom()) return;

      if (mode === "service") {
        const priceNum = Math.round(parseFloat(customPrice));
        const data: CreateServicePrescriptionInput = {
          name: customName.trim(),
          prescription_notes: notes.trim() || undefined,
          price: priceNum,
          customer_id: Number(customerId),
          status: "pending",
        };
        createService.mutate(data);
      } else {
        if (!consultationId) {
          setPendingProductPrescription({
            consultation_id: 0,
            product_name_custom: customName.trim(),
            quantity: parseInt(quantity) || 1,
            instructions: notes.trim() || undefined,
          });
          setShowQuickConsultModal(true);
          return;
        }

        const data: CreatePrescriptionInput = {
          consultation_id: consultationId,
          product_name_custom: customName.trim(),
          quantity: parseInt(quantity) || 1,
          instructions: notes.trim() || undefined,
        };
        createProductPrescription.mutate(data);
      }
    } else {
      if (mode === "service") {
        if (!selectedService) {
          setError("Please select a service");
          return;
        }
        const data: CreateServicePrescriptionInput = {
          name: selectedService.name,
          prescription_notes: notes.trim() || undefined,
          price: Math.round(selectedService.price),
          customer_id: Number(customerId),
          status: "pending",
        };
        createService.mutate(data);
      } else {
        if (!selectedProduct) {
          setError("Please select a product");
          return;
        }

        if (!consultationId) {
          setPendingProductPrescription({
            consultation_id: 0,
            product_id: selectedProduct.id,
            quantity: parseInt(quantity) || 1,
            instructions: notes.trim() || undefined,
          });
          setShowQuickConsultModal(true);
          return;
        }

        const data: CreatePrescriptionInput = {
          consultation_id: consultationId,
          product_id: selectedProduct.id,
          quantity: parseInt(quantity) || 1,
          instructions: notes.trim() || undefined,
        };
        createProductPrescription.mutate(data);
      }
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setSelectedService(null);
    setSelectedProduct(null);
    setNotes("");
    setQuantity("1");
    setCustomName("");
    setCustomPrice("");
    setUseCustom(false);
    setError("");
    setShowQuickConsultModal(false);
    setPendingProductPrescription(null);
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Create Prescription</h2>
              <p className="text-sm text-gray-500">For: {customerName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row h-[calc(90vh-100px)]">
            <div className="lg:w-1/2 border-r border-gray-200 p-6 overflow-y-auto">
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setMode("service")}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2",
                    mode === "service" ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  disabled={isSubmitting}
                >
                  <Scissors size={18} /> Service
                </button>
                <button
                  onClick={() => setMode("product")}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2",
                    mode === "product" ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  disabled={isSubmitting}
                >
                  <Package size={18} /> Product
                </button>
              </div>

              <div className="mb-6">
                <button
                  onClick={() => setUseCustom(!useCustom)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    useCustom ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  disabled={isSubmitting}
                >
                  <Check size={16} />
                  {useCustom ? "Custom Entry" : "Use Existing"}
                </button>
              </div>

              {useCustom ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={mode === "service" ? "e.g. Deep Cleansing Facial" : "e.g. Vitamin C Serum 30ml"}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                  {mode === "service" && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Price (ETB) *</label>
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                  {mode === "product" && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Quantity *</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-3">
                    {(mode === "service" ? loadingServices : loadingProducts) ? (
                      <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                      </div>
                    ) : (mode === "service" ? filteredServices : filteredProducts).length === 0 ? (
                      <div className="text-center text-gray-500 py-12">
                        No {mode === "service" ? "services" : "products"} found
                      </div>
                    ) : (
                      (mode === "service" ? filteredServices : filteredProducts).map((item) => {
                        const isSelected =
                          mode === "service"
                            ? selectedService?.id === item.id
                            : selectedProduct?.id === item.id;

                        return (
                          <div
                            key={item.id}
                            onClick={() =>
                              !isSubmitting &&
                              (mode === "service"
                                ? setSelectedService(item as Service)
                                : setSelectedProduct(item as Product))
                            }
                            className={cn(
                              "p-4 border-2 rounded-lg cursor-pointer transition-all",
                              isSelected
                                ? "border-rose-500 bg-rose-50"
                                : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
                            )}
                          >
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.description || "No description"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-rose-600">
                                  ETB {Number(item.price).toLocaleString()}
                                </p>
                                {mode === "product" && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Stock: {(item as Product).stock_quantity}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="mt-3 text-rose-600 text-sm flex items-center gap-1">
                                <Check size={16} /> Selected
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="lg:w-1/2 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Prescription Details</h3>

              <div className="space-y-6">
                {useCustom ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-bold text-gray-800">{customName || "Custom Item"}</h4>
                    {mode === "service" ? (
                      <p className="mt-2 text-gray-700">
                        Price: ETB {customPrice ? parseFloat(customPrice).toLocaleString() : "—"}
                      </p>
                    ) : (
                      <p className="mt-2 text-gray-700">Quantity: {quantity || "1"}</p>
                    )}
                  </div>
                ) : mode === "service" && selectedService ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-bold text-gray-800">{selectedService.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                    <p className="font-bold text-rose-600 mt-2">
                      ETB {selectedService.price.toLocaleString()}
                    </p>
                  </div>
                ) : mode === "product" && selectedProduct ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-bold text-gray-800">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                    <div className="mt-3 flex justify-between text-sm">
                      <span>Price:</span>
                      <span className="font-bold">ETB {Number(selectedProduct.price).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-sm">
                      <span>Quantity:</span>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        className="w-20 p-1.5 border border-gray-300 rounded text-right"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 italic text-center">
                    No item selected yet
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {mode === "service" ? "Service" : "Usage"} Instructions / Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions, frequency, precautions..."
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg bg-rose-600 hover:bg-rose-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </div>
                    ) : (
                      `Create ${mode === "service" ? "Service" : "Product"} Prescription`
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuickConsultationModal
        isOpen={showQuickConsultModal}
        onClose={() => {
          setShowQuickConsultModal(false);
          setPendingProductPrescription(null);
        }}
        customerId={Number(customerId)}
        customerName={customerName}
        onSuccess={(newConsultationId) => {
          if (pendingProductPrescription) {
            const prescriptionData = {
              ...pendingProductPrescription,
              consultation_id: newConsultationId,
            };
            createProductPrescription.mutate(prescriptionData);
          }
        }}
      />

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Success!</h2>
            <p className="text-gray-600 mb-8">{successMessage}</p>
            <Button
              onClick={handleSuccessClose}
              className="w-full py-6 bg-green-600 hover:bg-green-700 text-white text-lg"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </>
  );
};