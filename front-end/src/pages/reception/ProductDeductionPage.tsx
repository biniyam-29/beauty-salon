import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

// --- Type Definitions (Updated to match API response) ---
interface Prescription {
  prescription_id: number;
  quantity: number;
  instructions: string;
  product_id: number;
  product_name: string;
  product_image: string | null; // Changed from product_picture
  customer_name: string;
  customer_phone: string;
}

// --- API Functions ---
const API_BASE_URL = "https://beauty-api.biniyammarkos.com";

const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

// ** UPDATED: Fetches live data from the API **
const fetchPendingPrescriptions = async (): Promise<Prescription[]> => {
  const token = getAuthToken();
  const response = await fetch(
    `${API_BASE_URL}/prescriptions?status=prescribed`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch pending prescriptions.");
  }
  const data = await response.json();
  return data || []; // API returns a direct array
};

const fulfillPrescription = async (prescriptionId: number): Promise<void> => {
  console.log(`Fulfilling prescription ID: ${prescriptionId}`);
  // This would be the real API call to deduct the product
  // const token = getAuthToken();
  // const response = await fetch(`${API_BASE_URL}/prescriptions/fulfill`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  //   body: JSON.stringify({ prescription_id: prescriptionId }),
  // });
  // if (!response.ok) throw new Error("Failed to fulfill prescription.");
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
};

// --- Modern UI Components ---
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "ghost";
  }
> = ({ children, variant, className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-lg text-sm font-semibold px-5 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px",
      variant === "ghost"
        ? "bg-transparent shadow-none text-rose-600 hover:bg-rose-100/50"
        : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const PrescriptionCard: React.FC<{
  prescription: Prescription;
  onFulfill: () => void;
  isFulfilling: boolean;
}> = ({ prescription, onFulfill, isFulfilling }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-rose-100/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-shadow hover:shadow-md animate-fade-in">
    {/* Product Info */}
    <div className="flex items-center gap-4 w-full sm:w-1/2">
      <img
        src={
          prescription.product_image ||
          "https://placehold.co/100x100/fecdd3/4c0519?text=Product"
        }
        alt={prescription.product_name}
        className="w-16 h-16 rounded-lg object-cover bg-rose-100 flex-shrink-0"
      />
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          Product (Qty: {prescription.quantity})
        </p>
        <h3 className="font-bold text-gray-800">{prescription.product_name}</h3>
        <p className="text-xs text-gray-500 mt-1 italic">
          "{prescription.instructions}"
        </p>
      </div>
    </div>

    {/* Divider */}
    <div className="h-px sm:h-12 w-full sm:w-px bg-rose-200/60"></div>

    {/* Customer Info & Action */}
    <div className="flex items-center justify-between w-full sm:w-1/2">
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          Client
        </p>
        <h3 className="font-bold text-gray-800">
          {prescription.customer_name}
        </h3>
        <p className="text-sm text-gray-500">{prescription.customer_phone}</p>
      </div>
      <Button onClick={onFulfill} disabled={isFulfilling} className="w-40">
        {isFulfilling ? (
          <>
            <Loader2 size={18} className="animate-spin mr-2" /> Fulfilling...
          </>
        ) : (
          <>
            <CheckCircle size={18} className="mr-2" /> Fulfill
          </>
        )}
      </Button>
    </div>
  </div>
);

const SkeletonLoader: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl p-5 flex items-center justify-between animate-pulse"
      >
        <div className="flex items-center gap-4 w-1/2">
          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex items-center justify-between w-1/2">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page Component ---
export const PrescriptionFulfillmentPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: prescriptions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: fetchPendingPrescriptions,
  });

  const fulfillMutation = useMutation({
    mutationFn: fulfillPrescription,
    onMutate: async (prescriptionId: number) => {
      await queryClient.cancelQueries({ queryKey: ["prescriptions"] });
      const previousPrescriptions = queryClient.getQueryData<Prescription[]>([
        "prescriptions",
      ]);
      queryClient.setQueryData<Prescription[]>(["prescriptions"], (old) =>
        old ? old.filter((p) => p.prescription_id !== prescriptionId) : []
      );
      return { previousPrescriptions };
    },
    onError: (err, _prescriptionId, context) => {
      if (context?.previousPrescriptions) {
        queryClient.setQueryData(
          ["prescriptions"],
          context.previousPrescriptions
        );
      }
      console.error("Failed to fulfill prescription:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });

  return (
    <div className="w-full bg-[#FDF8F5] min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Prescription Fulfillment
            </h1>
            <p className="text-gray-500 mt-1">
              Deduct prescribed products for clients from the inventory.
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/reception")}>
            <ChevronLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </header>

        {isLoading ? (
          <SkeletonLoader />
        ) : isError ? (
          <div className="text-center text-red-500 p-10 bg-white rounded-2xl">
            Error: {error.message}
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-rose-100/60">
            <Sparkles size={48} className="mx-auto text-green-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              All Prescriptions Fulfilled!
            </h3>
            <p className="mt-1 text-gray-500">
              There are no pending product deductions. Well done!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p) => (
              <PrescriptionCard
                key={p.prescription_id}
                prescription={p}
                onFulfill={() => fulfillMutation.mutate(p.prescription_id)}
                isFulfilling={
                  fulfillMutation.isPending &&
                  fulfillMutation.variables === p.prescription_id
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionFulfillmentPage;
