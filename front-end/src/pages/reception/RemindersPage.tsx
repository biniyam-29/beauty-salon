import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Phone, Check, Bell, ChevronLeft, Loader2 } from "lucide-react";

// --- Type Definitions ---
interface Reminder {
  customer_id: number;
  full_name: string;
  phone: string;
  last_session_date: string;
  days_since_last_session: number;
}

// --- API Functions ---
const API_BASE_URL = "https://beauty-api.biniyammarkos.com";

const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

const fetchReminders = async (): Promise<Reminder[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reminders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch reminders.");
  const data = await response.json();
  return data.reminders || [];
};

const completeReminder = async (customerId: number): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reminders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ customer_id: customerId, status: "completed" }),
  });
  if (!response.ok) throw new Error("Failed to mark reminder as completed.");
};

// --- Modern UI Components ---
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "ghost";
    size?: "sm" | "icon";
  }
> = ({ children, variant, size, className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px",
      variant === "ghost"
        ? "bg-transparent shadow-none text-rose-600 hover:bg-rose-100/50"
        : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200",
      size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5",
      size === "icon" && "h-10 w-10 p-0 shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const DaysAgoBadge: React.FC<{ days: number }> = ({ days }) => {
  const color =
    days > 60
      ? "bg-red-100 text-red-800"
      : days > 30
      ? "bg-amber-100 text-amber-800"
      : "bg-green-100 text-green-800";
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", color)}>
      {days} days ago
    </span>
  );
};

const ReminderItem: React.FC<{
  reminder: Reminder;
  onComplete: () => void;
  isCompleting: boolean;
}> = ({ reminder, onComplete, isCompleting }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-rose-100/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-shadow hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center text-rose-600 text-xl font-bold flex-shrink-0">
        {reminder.full_name?.charAt(0)}
      </div>
      <div>
        <h3 className="font-bold text-gray-800">{reminder.full_name}</h3>
        <p className="text-sm text-gray-500">{reminder.phone}</p>
      </div>
    </div>
    <div className="w-full sm:w-auto flex items-center justify-between gap-4">
      <DaysAgoBadge days={reminder.days_since_last_session} />
      <div className="flex items-center gap-2">
        <a href={`tel:${reminder.phone}`}>
          <Button size="icon" variant="ghost" title="Call Client">
            <Phone size={18} />
          </Button>
        </a>
        <Button
          size="icon"
          onClick={onComplete}
          disabled={isCompleting}
          title="Mark as Complete"
        >
          {isCompleting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Check size={18} />
          )}
        </Button>
      </div>
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
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
      </div>
    ))}
  </div>
);

// --- Main Reminders Page Component ---
export const RemindersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: reminders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reminders"],
    queryFn: fetchReminders,
  });

  const completeMutation = useMutation({
    mutationFn: completeReminder,
    onMutate: async (customerId: number) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ["reminders"] });
      const previousReminders = queryClient.getQueryData<Reminder[]>([
        "reminders",
      ]);
      queryClient.setQueryData<Reminder[]>(["reminders"], (old) =>
        old ? old.filter((r) => r.customer_id !== customerId) : []
      );
      return { previousReminders };
    },
    onError: (_err, _customerId, context) => {
      // Roll back on error
      if (context?.previousReminders) {
        queryClient.setQueryData(["reminders"], context.previousReminders);
      }
    },
    onSettled: () => {
      // Refetch after mutation to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });

  return (
    <div className="w-full bg-[#FDF8F5] min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Follow-Up Reminders
            </h1>
            <p className="text-gray-500 mt-1">
              Clients needing a follow-up call after their last session.
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
        ) : reminders.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-rose-100/60">
            <Bell size={48} className="mx-auto text-green-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              All Caught Up!
            </h3>
            <p className="mt-1 text-gray-500">
              There are no follow-up reminders at this time. Great work!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <ReminderItem
                key={reminder.customer_id}
                reminder={reminder}
                onComplete={() => completeMutation.mutate(reminder.customer_id)}
                isCompleting={
                  completeMutation.isPending &&
                  completeMutation.variables === reminder.customer_id
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersPage;
