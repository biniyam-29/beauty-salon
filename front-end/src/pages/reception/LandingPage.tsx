import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Sparkles, Clock, Menu, X, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// --- Custom SVG Icons for a Unique Salon Vibe ---
const ClientPlusIcon = () => (
  <svg
    width="24"
    height="24"
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
    width="24"
    height="24"
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
    width="24"
    height="24"
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
const PackageMinusIcon = () => (
  <svg
    width="24"
    height="24"
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
interface NavLinkItem {
  label: string;
  icon: React.ReactElement;
  path: string;
}
interface LandingPageProps {
  onLogout: () => void;
}
interface Appointment {
  consultation_id: number;
  follow_up_date: string;
  customer_name: string;
  doctor_name: string;
  skin_concerns: string; // This can be null from the API
}

// --- API Functions ---
const API_BASE_URL = "https://beauty-api.biniyammarkos.com";
const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

const fetchTodaysSchedule = async (): Promise<Appointment[]> => {
  const token = getAuthToken();
  const response = await fetch(
    `${API_BASE_URL}/consultations/follow-ups/today`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch today's schedule.");
  }
  return response.json();
};

// --- Data for the Page ---
const navLinks: NavLinkItem[] = [
  {
    label: "Note a Phone Call",
    icon: <Phone />,
    path: "/reception/phone-book",
  },
  {
    label: "New Client",
    icon: <ClientPlusIcon />,
    path: "/reception/register",
  },
  {
    label: "Client Profiles",
    icon: <ClientListIcon />,
    path: "/reception/customers",
  },
  {
    label: "Daily Follow-ups",
    icon: <CalendarCheckIcon />,
    path: "/reception/reminders",
  },
  {
    label: "Product Prescriptions",
    icon: <PackageMinusIcon />,
    path: "/reception/product-deduction",
  },
];

const beautyQuotes = [
  "Invest in your skin. It is going to represent you for a very long time.",
  "The best foundation you can wear is glowing healthy skin.",
  "Beauty is being comfortable and confident in your own skin.",
];

// --- Helper Functions ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const getRandomQuote = () => {
  return beautyQuotes[Math.floor(Math.random() * beautyQuotes.length)];
};

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

// --- Reusable Components ---
const NavLink: React.FC<{ item: NavLinkItem }> = ({ item }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  return (
    <Link
      to={item.path}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors",
        isActive
          ? "bg-rose-100/60 text-rose-700"
          : "text-gray-600 hover:bg-rose-100/40 hover:text-rose-700"
      )}
    >
      <span className={cn(isActive ? "text-rose-600" : "text-gray-500")}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
};

const ScheduleSkeleton: React.FC = () => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="w-24 h-5 bg-gray-200 rounded-md"></div>
          <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
          <div className="w-32 h-5 bg-gray-200 rounded-md"></div>
        </div>
        <div className="w-28 h-7 bg-gray-200 rounded-full"></div>
      </div>
    ))}
  </div>
);

const TodaysSchedule: React.FC = () => {
  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["todaysSchedule"],
    queryFn: fetchTodaysSchedule,
  });

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Today's Schedule
      </h3>
      <div className="bg-white rounded-2xl border border-rose-100/60 p-4 shadow-sm min-h-[200px]">
        <div className="max-h-96 overflow-y-auto pr-2">
          {isLoading ? (
            <ScheduleSkeleton />
          ) : isError ? (
            <p className="p-4 text-center text-red-500">
              Could not load schedule.
            </p>
          ) : appointments && appointments.length > 0 ? (
            appointments.map((appt) => (
              <div
                key={appt.consultation_id}
                className="flex items-center justify-between p-4 border-b border-pink-50 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <Clock size={16} className="text-pink-400" />
                  <span className="font-semibold text-gray-700">
                    {appt.customer_name}
                  </span>
                </div>
                <span className="text-sm text-gray-500 bg-pink-50 px-3 py-1 rounded-full">
                  {/* MODIFIED: Safely handle null or undefined 'skin_concerns' */}
                  {appt.skin_concerns?.split(",")[0] ?? "N/A"}
                </span>
              </div>
            ))
          ) : (
            <p className="p-12 text-center text-gray-500">
              No appointments scheduled for today.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarContent: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const quote = getRandomQuote();
  return (
    <>
      <div>
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="text-pink-500" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">Glow Clinic</h1>
        </div>
        <nav className="space-y-2">
          {navLinks.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>
      </div>
      <div>
        <p className="text-gray-500 text-sm italic mb-6">"{quote}"</p>
        <div className="border-t border-rose-100/60 pt-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Reception Desk</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-gray-500 rounded-md hover:bg-rose-100/50 hover:text-rose-600 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

// --- Main Dashboard Component ---
const LandingPage: React.FC<LandingPageProps> = ({ onLogout }) => {
  const greeting = getGreeting();
  const userName = "Reception";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="w-full bg-[#FDF8F5] font-sans">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside className="w-72 bg-white/90 backdrop-blur-sm p-6 hidden lg:flex flex-col justify-between border-r border-rose-100/60 flex-shrink-0 h-screen sticky top-0">
          <SidebarContent onLogout={onLogout} />
        </aside>

        {/* Mobile Menu Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-50 lg:hidden transition-all duration-300",
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        >
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          ></div>
          <aside
            className={cn(
              "relative bg-white h-full w-72 max-w-[80vw] p-6 flex flex-col justify-between border-r border-rose-100/60 transition-transform duration-300 ease-in-out",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <SidebarContent onLogout={onLogout} />
          </aside>
        </div>

        {/* Main Content (Scrollable) */}
        <main className="w-full flex-1 p-6 sm:p-10 overflow-y-auto">
          <header className="flex justify-between items-center mb-10">
            <div>
              <p className="text-lg font-medium text-pink-600">
                {greeting}, {userName}!
              </p>
              <h2 className="text-3xl font-bold text-gray-800 mt-1">
                Dashboard
              </h2>
            </div>
            {/* Hamburger Menu Button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-700 p-2"
            >
              <Menu size={28} />
            </button>
          </header>
          <TodaysSchedule />
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
