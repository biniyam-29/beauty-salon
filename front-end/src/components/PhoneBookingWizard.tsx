import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// Types
type PhoneBookingData = {
  id?: number;
  customerName: string;
  phone: string;
  appointmentTime: string;
  receptionId: number;
  callReceivedAt?: string;
  createdAt?: string;
};

const API_BASE_URL = "https://api.in2skincare.com";

const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

// API Helpers
const createPhoneBooking = async (payload: any): Promise<PhoneBookingData> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/phonebooking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || "Failed to create booking");
  }

  const b = await response.json();
  return {
    id: b.id,
    receptionId: b.reception_id,
    customerName: b.customer_name,
    phone: b.phone,
    appointmentTime: b.appointment_time,
    callReceivedAt: b.call_received_at,
    createdAt: b.created_at,
  };
};

const fetchPhoneBookings = async (): Promise<PhoneBookingData[]> => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/phone`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch phone bookings");

  const body = await res.json();

  // map snake_case → camelCase
  return (body as any[]).map((b) => ({
    id: b.id,
    receptionId: b.reception_id,
    customerName: b.customer_name,
    phone: b.phone,
    appointmentTime: b.appointment_time,
    callReceivedAt: b.call_received_at,
    createdAt: b.created_at,
  }));
};

// Simple UI components
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("bg-white rounded-2xl shadow p-6", className)}>{children}</div>;

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (props) => (
  <label className="block text-sm font-medium mb-2" {...props} />
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="block w-full rounded-lg border border-gray-300 p-3 focus:border-rose-500 focus:ring-rose-500"
    {...props}
  />
);

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outline" }
> = ({ children, variant, ...props }) => (
  <button
    {...props}
    className={cn(
      "px-5 py-2.5 rounded-lg font-semibold transition shadow-sm",
      variant === "outline"
        ? "border border-rose-500 text-rose-600 bg-white hover:bg-rose-50"
        : "bg-rose-600 text-white hover:bg-rose-700"
    )}
  >
    {children}
  </button>
);

// Wizard Steps
const BookingInfoStep: React.FC<{
  formData: PhoneBookingData;
  updateFormData: (u: Partial<PhoneBookingData>) => void;
}> = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div>
      <Label htmlFor="customerName">Customer Name *</Label>
      <Input
        id="customerName"
        value={formData.customerName}
        onChange={(e) => updateFormData({ customerName: e.target.value })}
        required
      />
    </div>
    <div>
      <Label htmlFor="phone">Phone *</Label>
      <Input
        id="phone"
        value={formData.phone}
        onChange={(e) => updateFormData({ phone: e.target.value })}
        required
      />
    </div>
    <div>
      <Label htmlFor="appointmentTime">Appointment Time *</Label>
      <Input
        id="appointmentTime"
        type="datetime-local"
        value={formData.appointmentTime}
        onChange={(e) => updateFormData({ appointmentTime: e.target.value })}
        required
      />
    </div>
  </div>
);

const ConfirmStep: React.FC<{ formData: PhoneBookingData }> = ({ formData }) => (
  <div className="space-y-4">
    <p>
      <strong>Name:</strong> {formData.customerName}
    </p>
    <p>
      <strong>Phone:</strong> {formData.phone}
    </p>
    <p>
      <strong>Appointment:</strong> {formData.appointmentTime}
    </p>
  </div>
);

// Wizard + Booking List
export const PhoneBookingWizard: React.FC<{
  receptionId: number;
  onBookingComplete: (booking: PhoneBookingData) => void;
}> = ({ receptionId, onBookingComplete }) => {
  // const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PhoneBookingData>({
    customerName: "",
    phone: "",
    appointmentTime: "",
    receptionId,
  });

  const steps = [
    { name: "Booking Info", component: BookingInfoStep },
    { name: "Confirm", component: ConfirmStep },
  ];

  const mutation = useMutation({
    mutationFn: createPhoneBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["phone-bookings"] });
      onBookingComplete(data);
      setCurrentStep(0);
      setFormData({ customerName: "", phone: "", appointmentTime: "", receptionId });
    },
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["phone-bookings"],
    queryFn: fetchPhoneBookings,
  });

  const updateFormData = (updates: Partial<PhoneBookingData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      mutation.mutate(formData);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wizard */}
      <form onSubmit={handleSubmit}>
        <Card>
          <h2 className="text-xl font-bold mb-4">{steps[currentStep].name}</h2>
          <CurrentStepComponent formData={formData} updateFormData={updateFormData} />
        </Card>
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => s - 1)}
          >
            <ChevronLeft className="inline mr-2" /> Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button type="submit">
              Next <ChevronRight className="inline ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> Saving...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Booking List */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Recent Phone Bookings</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3">Appointment</th>
                <th className="py-2 px-3">Received At</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .sort(
                  (a, b) =>
                    new Date(b.createdAt || b.callReceivedAt || "").getTime() -
                    new Date(a.createdAt || a.callReceivedAt || "").getTime()
                )
                .map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="py-2 px-3">{b.customerName}</td>
                    <td className="py-2 px-3">{b.phone}</td>
                    <td className="py-2 px-3">
                      {new Date(b.appointmentTime).toLocaleString()}
                    </td>
                    <td className="py-2 px-3">
                      {b.callReceivedAt
                        ? new Date(b.callReceivedAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};
