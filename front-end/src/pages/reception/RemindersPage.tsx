import React, { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";

// --- Helper Functions & Placeholders ---
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

// --- Type Definitions (assuming structure from new API) ---
interface Reminder {
  customer_id: number;
  full_name: string;
  phone: string;
  last_session_date: string;
  days_since_last_session: number;
}

// --- UI Component Placeholders ---
const Card: FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn(
      "bg-white rounded-2xl shadow-lg border border-gray-200",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardContent: FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

const Button: FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline";
    size?: "sm";
  }
> = ({ children, variant, size, className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5",
      variant === "outline"
        ? "bg-transparent border border-pink-600 text-pink-700 hover:bg-pink-50"
        : "bg-pink-600 text-white hover:bg-pink-700",
      size === "sm" ? "px-3 py-1.5 text-xs" : "px-6 py-3",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const CheckIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);


export const RemindersPage: React.FC = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dbUrl = "https://beauty-api.biniyammarkos.com";

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${dbUrl}/reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch reminders.");

      const data = await response.json();
      setReminders(data.reminders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompleteReminder = async (customerId: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${dbUrl}/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id: customerId,
          status: "completed",
        }),
      });
      if (!response.ok)
        throw new Error("Failed to mark reminder as completed.");
      // Refresh data from server to update the list
      fetchData();
    } catch (error) {
      console.error("Error completing reminder:", error);
      setError("Could not complete the reminder. Please try again.");
    }
  };

  if (isLoading)
    return (
      <div className="text-center text-pink-700 font-bold p-10">
        Loading Reminders...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 font-bold p-10">
        Error: {error}
      </div>
    );

  return (
    <div className="w-full animate-fade-in p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-display text-pink-900">
          Follow-Up Reminders
        </h1>
        <Button onClick={() => navigate("/reception")} variant="outline">
          Back to Dashboard
        </Button>
      </div>
      <p className="text-gray-600 mb-6">
        Showing patients whose last session was more than 30 days ago.
      </p>

      {reminders.length === 0 ? (
        <Card className="text-center">
          <CardContent>
            <p className="py-12 text-gray-500 font-semibold">
              No follow-up reminders at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders.map((reminder) => (
            <Card
              key={reminder.customer_id}
              className="transition-transform duration-300 hover:scale-105 hover:shadow-pink-300/50 relative"
            >
              <Button
                variant="outline"
                size="sm"
                className="absolute top-3 right-3 !p-2 h-auto rounded-full z-10"
                onClick={() => handleCompleteReminder(reminder.customer_id)}
                title="Mark as complete"
              >
                <CheckIcon className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-200 rounded-full flex items-center justify-center text-pink-600 text-2xl font-bold font-display">
                    {reminder.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-gray-800">
                      {reminder.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">{reminder.phone}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Last visit:{" "}
                      <span className="font-bold">
                        {new Date(
                          reminder.last_session_date
                        ).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-xs text-pink-700">
                      ({reminder.days_since_last_session} days ago)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
