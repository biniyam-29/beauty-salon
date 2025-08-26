import React from "react";
import { Link } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";

// --- Custom SVG Icons for a Unique Salon Vibe ---
const ClientPlusIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="19" x2="19" y1="8" y2="14"></line>
    <line x1="22" x2="16" y1="11" y2="11"></line>
  </svg>
);
const ClientListIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
const CalendarCheckIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" x2="16" y1="2" y2="6"></line>
    <line x1="8" x2="8" y1="2" y2="6"></line>
    <line x1="3" x2="21" y1="10" y2="10"></line>
    <path d="m9 16 2 2 4-4" />
  </svg>
);
// ** NEW ** Icon for Product Deduction
const PackageMinusIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16.5 9.4a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0Z" />
    <path d="M12 14v7" />
    <path d="M12 2v2.5" />
    <path d="M21.17 11.83l-1.83-1.83" />
    <path d="M4.66 10l-1.83 1.83" />
    <path d="m2 14 7 7 7-7" />
    <path d="M9 18H2.5a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H6" />
    <path d="M15 21h6.5a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5H18" />
  </svg>
);

// --- Type Definitions ---
interface Action {
  label: string;
  icon: React.ReactElement;
  path: string;
  description: string;
}
interface ActionCardProps {
  label: string;
  icon: React.ReactElement;
  description: string;
}
interface LandingPageProps {
  onLogout: () => void;
}

// --- Data for the Page ---
// ** UPDATED ** with new action
const actions: Action[] = [
  {
    label: "New Client",
    icon: <ClientPlusIcon />,
    path: "/reception/register",
    description: "Onboard a new client profile.",
  },
  {
    label: "Client Profiles",
    icon: <ClientListIcon />,
    path: "/reception/customers",
    description: "Search and manage all clients.",
  },
  {
    label: "Daily Follow-ups",
    icon: <CalendarCheckIcon />,
    path: "/reception/reminders",
    description: "View today's tasks and reminders.",
  },
  {
    label: "Product Deduction",
    icon: <PackageMinusIcon />,
    path: "/reception/product-deduction",
    description: "Deduct products used for a client.",
  },
];

const mockAppointments = [
  { time: "10:00 AM", client: "Eleanor Vance", service: "HydraFacial" },
  { time: "11:30 AM", client: "Marcus Thorne", service: "Chemical Peel" },
  {
    time: "01:00 PM",
    client: "Seraphina Croft",
    service: "Laser Hair Removal",
  },
  { time: "02:30 PM", client: "Julian Hayes", service: "Consultation" },
  { time: "04:00 PM", client: "Isabelle Rossi", service: "Microneedling" },
];

const beautyQuotes = [
  "Invest in your skin. It is going to represent you for a very long time.",
  "The best foundation you can wear is glowing healthy skin.",
  "Beauty is being comfortable and confident in your own skin.",
  "Filters are great, but great skin is better.",
  "Be good to your skin. You'll wear it every day for the rest of your life.",
];

// --- Helper Functions to Add "Life" ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const getRandomQuote = () => {
  return beautyQuotes[Math.floor(Math.random() * beautyQuotes.length)];
};

// --- Reusable Components ---
const ActionCard: React.FC<ActionCardProps> = ({
  label,
  icon,
  description,
}) => (
  <div className="group relative flex flex-col items-start p-6 bg-white rounded-2xl border border-pink-100/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
    <div className="p-4 rounded-full bg-pink-50 text-pink-500 mb-4 transition-colors group-hover:bg-pink-100">
      {icon}
    </div>
    <h3 className="font-semibold text-gray-800 text-lg mb-1">{label}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

const TodaysSchedule: React.FC = () => (
  <div className="mt-12">
    <h3 className="text-xl font-semibold text-gray-800 mb-6">
      Today's Schedule
    </h3>
    <div className="bg-white rounded-2xl border border-pink-100/60 p-4 shadow-sm">
      <div className="max-h-80 overflow-y-auto pr-2">
        {mockAppointments.map((appt, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 ${
              index < mockAppointments.length - 1
                ? "border-b border-pink-50"
                : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-medium text-pink-600 w-24">
                {appt.time}
              </span>
              <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
              <span className="font-semibold text-gray-700">{appt.client}</span>
            </div>
            <span className="text-sm text-gray-500 bg-pink-50 px-3 py-1 rounded-full">
              {appt.service}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Main Dashboard Component ---
const LandingPage: React.FC<LandingPageProps> = ({ onLogout }) => {
  const greeting = getGreeting();
  const quote = getRandomQuote();
  const userName = "Reception";

  return (
    <div className="w-full min-h-screen bg-[#FDF8F5] font-sans">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white p-8 hidden lg:flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <Sparkles className="text-pink-500" size={24} />
              <h1 className="text-xl font-bold text-gray-800">
                Glow Skin Clinic
              </h1>
            </div>
            <p className="text-gray-500 italic">"{quote}"</p>
          </div>
          <div
            className="w-full h-96 rounded-2xl bg-cover bg-center shadow-inner"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?q=80&w=1887&auto=format&fit=crop')",
            }}
          ></div>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 p-6 sm:p-10">
          <header className="flex justify-between items-center mb-10">
            <div>
              <p className="text-lg font-medium text-pink-600">
                {greeting}, {userName}!
              </p>
              <h2 className="text-3xl font-bold text-gray-800 mt-1">
                Your Dashboard
              </h2>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-pink-100/50 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </header>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Quick Actions
            </h3>
            {/* ** UPDATED ** Grid layout for better balance with 4 items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {actions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ActionCard
                    label={action.label}
                    icon={action.icon}
                    description={action.description}
                  />
                </Link>
              ))}
            </div>
          </div>

          <TodaysSchedule />
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
