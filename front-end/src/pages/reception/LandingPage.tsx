import React from "react";

// Define the type for an action object
interface Action {
  label: string;
  icon: React.ReactElement;
}

// Mock data to populate the dashboard UI
const actions: Action[] = [
  {
    label: "Schedule New Client",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
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
        width="24"
        height="24"
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
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7-3 9-3 9H9s-3-2-3-9"></path>
        <path d="M10.38 21.05a2 2 0 1 0 3.24 0"></path>
        <path d="M16 13.7V10a4 4 0 0 0-4-4V2"></path>
        <path d="M8 13.7V10a4 4 0 0 1 4-4"></path>
      </svg>
    ),
  },
];

// Reusable component for an action card
const ActionCard: React.FC<Action> = ({ label, icon }) => (
  <div className="flex flex-col items-center p-4">
    <div className="flex items-center justify-center w-24 h-24 rounded-full mb-2 bg-rose-100/50 text-rose-600 shadow-md transition-transform hover:scale-105">
      {icon}
    </div>
    <span className="text-sm font-medium text-slate-700 text-center">
      {label}
    </span>
  </div>
);

// Main dashboard component
const LandingPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[80vh]">
        {/* Main content panel */}
        <div className="w-full p-6 sm:p-8 flex-shrink-0">
          {/* Header section */}
          <div className="relative p-4 sm:p-6 bg-gradient-to-r from-pink-100 to-rose-50 rounded-2xl shadow-sm mb-6 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0">
              <svg
                className="w-full h-full text-rose-200 opacity-30"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  fill="currentColor"
                  d="M0,0 L100,0 L100,100 L0,100 Z"
                  opacity="0.1"
                ></path>
                <path
                  fill="currentColor"
                  d="M10,0 L100,90 L90,100 L0,10 Z"
                  opacity="0.1"
                ></path>
              </svg>
            </div>
            {/* Header content */}
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <img
                  src="https://placehold.co/40x40/f472b6/ffffff?text=D"
                  alt="Logo"
                  className="w-10 h-10 rounded-full"
                />
                <h1 className="text-xl font-bold text-slate-800">
                  Glow Skin Clinic
                </h1>
              </div>
              {/* This entire user icon section has been removed as per the screenshot */}
            </div>
            {/* New flex container to hold the welcome text and the user image */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">
                  October 26, 2023
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Welcome to Your Dashboard!
                </h2>
                <p className="text-md sm:text-xl font-bold text-slate-600 mt-2">
                  "Every face tells a story; let yours glow"
                </p>
              </div>
              {/* User image in its own grid column */}
              <div className="sm:mr-8 -ml-10">
                <img
                  src="https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTExL3Jhd3BpeGVsX29mZmljZV8zMl9waG90b19wb3J0cmFpdF9zbWlsaW5nX2luZGlhbl9tYW5faW5fc2hpcnRfYV84MWNjZTNiZS03ZTVjLTRkMDgtODcwYS03OTBlNjhlYWMwNTktbTNwanoycG8ucG5n.png"
                  alt="User Avatar"
                  className="w-48 h-auto"
                />
              </div>
            </div>
          </div>

          {/* Actions section */}
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
