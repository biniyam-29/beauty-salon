import React, { useState } from "react";
import { ClipboardList, Scissors, Package, Calendar, FileText } from "lucide-react";
import { useCustomerDetails } from "../../../hooks/UseCustomer";
import { useCustomerServicePrescriptions } from "../../../hooks/UseServicePrescription";
import { usePrescriptions } from "../../../hooks/UseProductPrescriptions";
import { DetailSection } from "./shared/DetailSection";
import { cn } from "../../ui";

interface Props {
  customerId: number | string;
}

export const CustomerPrescriptions: React.FC<Props> = ({ customerId }) => {
  const [activeTab, setActiveTab] = useState<"services" | "products">("services");

  const numId = Number(customerId);

  const { data: customer } = useCustomerDetails(numId);
  const { data: serviceData } = useCustomerServicePrescriptions(numId);
  const { data: productData } = usePrescriptions({ customer_id: numId });

  const services = serviceData?.service_prescriptions || [];
  const products = productData || [];

  const isLoading = !customer || !serviceData || !productData;

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 animate-pulse">
        <DetailSection title="Prescription History" icon={<ClipboardList size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </DetailSection>
      </div>
    );
  }

  const hasServices = services.length > 0;
  const hasProducts = products.length > 0;

  return (
    <div className="p-6 md:p-8">
      <DetailSection title="Prescription History" icon={<ClipboardList size={20} />}>
        {(!hasServices && !hasProducts) ? (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No prescriptions yet</p>
            <p className="text-sm mt-2">This customer has no service or product prescriptions recorded.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("services")}
                className={cn(
                  "flex-1 py-4 px-5 font-medium text-center transition-all flex items-center justify-center gap-2",
                  activeTab === "services"
                    ? "border-b-3 border-rose-600 text-rose-700 bg-rose-50/30"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                )}
              >
                <Scissors size={18} />
                Services
                {hasServices && (
                  <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-medium">
                    {services.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("products")}
                className={cn(
                  "flex-1 py-4 px-5 font-medium text-center transition-all flex items-center justify-center gap-2",
                  activeTab === "products"
                    ? "border-b-3 border-rose-600 text-rose-700 bg-rose-50/30"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                )}
              >
                <Package size={18} />
                Products
                {hasProducts && (
                  <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-medium">
                    {products.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
              {activeTab === "services" && (
                <>
                  {hasServices ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {services.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">{s.name}</h4>
                            <span
                              className={cn(
                                "text-xs px-3 py-1 rounded-full font-medium",
                                s.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              )}
                            >
                              {s.status}
                            </span>
                          </div>

                          <div className="space-y-3 text-sm">
                            {s.prescription_notes && (
                              <p className="text-gray-700 leading-relaxed">
                                <span className="font-medium text-gray-800">Notes:</span>{" "}
                                {s.prescription_notes}
                              </p>
                            )}
                            <div className="flex justify-between items-center text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                {new Date(s.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </div>
                              <div className="font-bold text-rose-600">
                                ETB {s.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <Scissors size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No service prescriptions</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "products" && (
                <>
                  {hasProducts ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {products.map((p) => (
                        <div
                          key={p.prescription_id}
                          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">{p.product_name}</h4>
                            <span
                              className={cn(
                                "text-xs px-3 py-1 rounded-full font-medium",
                                p.status === "sold"
                                  ? "bg-green-100 text-green-800"
                                  : p.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              )}
                            >
                              {p.status}
                            </span>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <span className="font-medium text-gray-800">Quantity:</span>
                              <strong>{p.quantity}</strong>
                            </div>

                            {p.instructions && (
                              <p className="text-gray-700 leading-relaxed">
                                <span className="font-medium text-gray-800">Instructions:</span>{" "}
                                {p.instructions}
                              </p>
                            )}

                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <Package size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No product prescriptions</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </DetailSection>
    </div>
  );
};