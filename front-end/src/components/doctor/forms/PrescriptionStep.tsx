import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Label, Button, Textarea } from "./PatientUpdateComponents";

interface Service {
  id: number;
  name: string;
  price: number;
}

interface ServicePrescription {
  service_id: number;
  service_name: string;
  price: number;
  quantity: number;
  instructions: string;
}

interface StepProps {
  formData: {
    servicePrescriptions?: ServicePrescription[]; 
  };
  updateFormData: (updates: Partial<StepProps["formData"]>) => void;
  lookups: {
    services?: Service[];
  };
}

export const PrescriptionStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  lookups,
}) => {
  const services = lookups.services ?? [];
  const prescriptions = formData.servicePrescriptions ?? []; 

  const addPrescription = () => {
    updateFormData({
      servicePrescriptions: [
        ...prescriptions,
        {
          service_id: 0,
          service_name: "",
          price: 0,
          instructions: "",
          quantity: 1,
        },
      ],
    });
  };

  const removePrescription = (index: number) => {
    updateFormData({
      servicePrescriptions: prescriptions.filter((_, i) => i !== index),
    });
  };

  const updatePrescription = (index: number, updates: Partial<ServicePrescription>) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], ...updates };
    updateFormData({ servicePrescriptions: updated });
  };

  const handleServiceSelect = (index: number, serviceId: string | number) => {
    const selectedService = services.find((s) => s.id === Number(serviceId));
    if (selectedService) {
      updatePrescription(index, {
        service_id: selectedService.id,
        service_name: selectedService.name,
        price: selectedService.price,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Service Prescription</h3>
        <p className="text-gray-600">
          Prescribe services for this client based on their consultation and needs.
        </p>
      </div>

      <div className="space-y-4">
        {prescriptions.map((prescription, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-gray-700">Prescribed Service #{index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removePrescription(index)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`service-${index}`}>Select Service</Label>
                <select
                  id={`service-${index}`}
                  className="w-full border rounded p-3 bg-white/70 border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  value={prescription.service_id}
                  onChange={(e) => handleServiceSelect(index, e.target.value)}
                >
                  <option value={0}>Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                <input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  className="w-full border rounded p-3 bg-white/70 border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  value={prescription.quantity}
                  onChange={(e) =>
                    updatePrescription(index, {
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor={`instructions-${index}`} helperText="Specific instructions for this service">
                  Instructions
                </Label>
                <Textarea
                  id={`instructions-${index}`}
                  placeholder="e.g., Apply twice daily, Use only at night, Combine with serum..."
                  value={prescription.instructions}
                  onChange={(e) =>
                    updatePrescription(index, { instructions: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            {prescription.service_id > 0 && (
              <div className="mt-4 p-3 bg-rose-50 rounded-lg">
                <p className="text-sm font-semibold text-rose-700">
                  {prescription.service_name} × {prescription.quantity}
                </p>
                <p className="text-sm text-gray-600">
                  Total: ${(prescription.price * prescription.quantity).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addPrescription} className="w-full">
        <Plus size={16} className="mr-2" />
        Add Another Service
      </Button>

      {prescriptions.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <h4 className="font-semibold text-rose-800 mb-2">Prescription Summary</h4>
          <div className="space-y-2">
            {prescriptions.map((prescription, index) =>
              prescription.service_id > 0 ? (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {prescription.service_name} × {prescription.quantity}
                  </span>
                  <span>${(prescription.price * prescription.quantity).toFixed(2)}</span>
                </div>
              ) : null
            )}
            <div className="border-t pt-2 mt-2 font-semibold text-rose-700">
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span>
                  $
                  {prescriptions
                    .reduce((sum, p) => sum + p.price * p.quantity, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};