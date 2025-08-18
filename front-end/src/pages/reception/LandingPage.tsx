import React from "react";

// --- Type Definitions ---

// Defines the shape of an individual action item.
interface Action {
  label: string;
  icon: React.ReactElement;
}

// Defines the props for the reusable ActionCard component.
interface ActionCardProps {
  label: string;
  icon: React.ReactElement;
}

// Defines the props for the main LandingPage component.
interface LandingPageProps {
  onLogout: () => void;
}

// --- Components ---

// Reusable component for an action card on the dashboard.
// Now typed with React.FC and its specific props interface.
const ActionCard: React.FC<ActionCardProps> = ({ label, icon }) => (
  <div className="flex flex-col items-center p-4">
    <div className="flex items-center justify-center w-24 h-24 rounded-full mb-2 bg-rose-100/50 text-rose-600 shadow-md transition-transform hover:scale-105 cursor-pointer">
      {icon}
    </div>
    <span className="text-sm font-medium text-slate-700 text-center">
      {label}
    </span>
  </div>
);

// The main dashboard component for logged-in users.
// Now typed with React.FC and its props interface.
const LandingPage: React.FC<LandingPageProps> = ({ onLogout }) => {
  // Data for the action cards, now strongly typed with the Action interface.
  const actions: Action[] = [
    {
      label: "Schedule New Client",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="19" y1="8" x2="19" y2="14"></line>
          <line x1="22" y1="11" x2="16" y2="11"></line>
        </svg>
      ),
    },
    {
      label: "View All Clients",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      label: "Appointments Today",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[80vh]">
        <div className="w-full p-6 sm:p-8 flex-shrink-0">
          {/* Header Section */}
          <div className="relative p-4 sm:p-6 bg-gradient-to-r from-pink-100 to-rose-50 rounded-2xl shadow-sm mb-6 overflow-hidden">
            <div className="absolute inset-0 z-0">
              {/* Decorative background can go here */}
            </div>
            <div className="relative z-10 flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src="https://placehold.co/40x40/f472b6/ffffff?text=G"
                  alt="Logo"
                  className="w-10 h-10 rounded-full"
                />
                <h1 className="text-xl font-bold text-slate-800">
                  Glow Skin Clinic
                </h1>
              </div>
              <button
                onClick={onLogout}
                className="bg-rose-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors"
              >
                Logout
              </button>
            </div>
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">
                  {new Date().toDateString()}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Welcome to Your Dashboard!
                </h2>
                <p className="text-md sm:text-xl font-bold text-slate-600 mt-2">
                  "Every face tells a story; let yours glow"
                </p>
              </div>
              <div className="hidden sm:block sm:justify-self-end">
                <img
                  src="https://placehold.co/200x200/fbcfe8/831843?text=Staff"
                  alt="User Avatar"
                  className="w-48 h-auto rounded-full"
                />
              </div>
            </div>
          </div>
          {/* Actions Section */}
          <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {actions.map((action, index) => (
                <ActionCard
                  key={index}
                  label={action.label}
                  icon={action.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
