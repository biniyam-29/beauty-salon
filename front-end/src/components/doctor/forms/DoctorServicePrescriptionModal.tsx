import React, { useState, useMemo } from "react";
import { X, Search, Clock, DollarSign, Check } from "lucide-react";
import { Button, cn } from "./PatientUpdateComponents";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string; // e.g., "60min", "90min"
  category: string;
}

interface DoctorServicePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerId: number | string;
  onPrescribe: (serviceId: number, dateTime: string, notes: string) => Promise<void>;
}

// Mock services - you would fetch these from your API
const mockServices: Service[] = [
  { id: 1, name: "Classic Facial", description: "Deep cleansing, exfoliation, extraction, mask", price: 1200, duration: "60min", category: "Facial" },
  { id: 2, name: "Hydrafacial MD", description: "Medical-grade hydradermabrasion", price: 2500, duration: "75min", category: "Advanced" },
  { id: 3, name: "Chemical Peel", description: "Professional chemical exfoliation", price: 1800, duration: "45min", category: "Treatment" },
  { id: 4, name: "LED Light Therapy", description: "Anti-acne and anti-aging light treatment", price: 1500, duration: "30min", category: "Therapy" },
  { id: 5, name: "Microdermabrasion", description: "Mechanical exfoliation", price: 2000, duration: "60min", category: "Treatment" },
  { id: 6, name: "Dermaplaning", description: "Manual exfoliation with surgical blade", price: 1700, duration: "45min", category: "Treatment" },
  { id: 7, name: "Oxygen Facial", description: "Infusion of oxygen and vitamins", price: 2200, duration: "60min", category: "Advanced" },
  { id: 8, name: "Teen Facial", description: "Specialized treatment for teen skin", price: 1000, duration: "45min", category: "Facial" },
];

export const DoctorServicePrescriptionModal: React.FC<DoctorServicePrescriptionModalProps> = ({
  isOpen,
  onClose,
  customerName,
  onPrescribe,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredServices = useMemo(() => {
    return mockServices.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSubmit = async () => {
    if (!selectedService || !appointmentDate || !appointmentTime) {
      alert("Please select a service, date, and time");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateTime = `${appointmentDate}T${appointmentTime}`;
      await onPrescribe(selectedService.id, dateTime, notes);
      // Reset form
      setSelectedService(null);
      setAppointmentDate("");
      setAppointmentTime("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Error prescribing service:", error);
      alert("Failed to prescribe service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Prescribe Service</h2>
            <p className="text-sm text-gray-500">For: {customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-100px)]">
          {/* Service Selection */}
          <div className="lg:w-1/2 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all",
                    selectedService?.id === service.id
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
                  )}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{service.name}</h3>
                        {selectedService?.id === service.id && (
                          <Check size={16} className="text-rose-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock size={14} />
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <DollarSign size={14} />
                          <span>ETB {service.price.toLocaleString()}</span>
                        </div>
                        <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs">
                          {service.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Service
                    </label>
                    {selectedService ? (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-gray-800">{selectedService.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-rose-600">ETB {selectedService.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{selectedService.duration}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No service selected</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        step="900" // 15-minute increments
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treatment Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any specific instructions or notes for this treatment..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-rose-600">
                      ETB {selectedService ? selectedService.price.toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium text-gray-800">{customerName}</p>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedService || !appointmentDate || !appointmentTime || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Prescribing..." : "Prescribe Service"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};