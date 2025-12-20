import React from "react";
import type { User } from "../../lib/types/types";

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAdminProfileClick: () => void;
  onLogout: () => void;
  admin?: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onAdminProfileClick,
  onLogout,
  admin,
}) => {
  const displayAdmin:any = admin; // 👈 fallback if no logged-in admin

  return (
    <div className="h-full w-64 bg-white shadow flex flex-col">
      {/* Admin info section */}
      <div className="p-4 border-b">
        <p className="font-semibold">{displayAdmin.name}</p>
        <p className="text-sm text-gray-500">{displayAdmin.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          className={`block w-full text-left p-2 rounded ${
            activeTab === "User Management" ? "bg-gray-200" : ""
          }`}
          onClick={() => setActiveTab("User Management")}
        >
          User Management
        </button>
        <button
          className={`block w-full text-left p-2 rounded ${
            activeTab === "Product Management" ? "bg-gray-200" : ""
          }`}
          onClick={() => setActiveTab("Product Management")}
        >
          Product Management
        </button>
        <button
          className={`block w-full text-left p-2 rounded ${
            activeTab === "Customize Options" ? "bg-gray-200" : ""
          }`}
          onClick={() => setActiveTab("Customize Options")}
        >
          Customize Options
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <button
          onClick={onAdminProfileClick}
          className="block w-full text-left mb-2 text-blue-600"
        >
          Admin Profile
        </button>
        <button
          onClick={onLogout}
          className="block w-full text-left text-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
