// FILE: src/components/Sidebar.tsx
import React from "react";

// A new SVG icon for the logout button
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAdminProfileClick: () => void;
  onLogout: () => void; // Added a prop for the logout handler
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onAdminProfileClick,
  onLogout,
}) => {
  const menuItems = ["User Management", "Product Management"];
  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col">
      <div>
        <div
          onClick={onAdminProfileClick}
          className="p-6 flex items-center space-x-3 cursor-pointer hover:bg-gray-50"
        >
          <div className="w-10 h-10 bg-red-100 text-red-600 flex items-center justify-center rounded-lg font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">ADMIN</p>
            <p className="text-xs text-gray-500">TRATBOMENT</p>
          </div>
        </div>
        <nav className="mt-6">
          <ul>
            {menuItems.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item);
                  }}
                  className={`flex items-center px-6 py-3 text-sm font-semibold transition-colors duration-200 ${
                    activeTab === item
                      ? "bg-red-50 text-red-600 border-r-4 border-red-500"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="w-6 h-6 mr-3"></span>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Logout Button added at the bottom */}
      <div className="mt-auto p-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <LogoutIcon />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  );
};
