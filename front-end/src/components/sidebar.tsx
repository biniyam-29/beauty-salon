// FILE: src/components/Sidebar.tsx
import React from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAdminProfileClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onAdminProfileClick,
}) => {
  const menuItems = ["User Management", "Product Management"];
  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0">
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
    </aside>
  );
};
