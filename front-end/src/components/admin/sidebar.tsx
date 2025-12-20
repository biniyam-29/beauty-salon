import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Users, Box, Settings, User, LogOut } from "lucide-react";
import type { User as UserType } from "../../lib/types/types";

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAdminProfileClick: () => void;
  onLogout: () => void;
  admin?: UserType | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onAdminProfileClick,
  onLogout,
  admin,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const displayAdmin: any = admin;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div 
      className={`h-full bg-white shadow flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header & Toggle Button */}
      <div className="p-4 border-b flex items-center justify-between overflow-hidden">
        {!isCollapsed && (
          <div className="min-w-max">
            <p className="font-semibold truncate">{displayAdmin?.name}</p>
            <p className="text-xs text-gray-500 truncate">{displayAdmin?.email}</p>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-100 rounded-md ml-auto"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <SidebarItem 
          icon={<Users size={20} />} 
          label="User Management" 
          active={activeTab === "User Management"}
          isCollapsed={isCollapsed}
          onClick={() => setActiveTab("User Management")}
        />
        <SidebarItem 
          icon={<Box size={20} />} 
          label="Product Management" 
          active={activeTab === "Product Management"}
          isCollapsed={isCollapsed}
          onClick={() => setActiveTab("Product Management")}
        />
        <SidebarItem 
          icon={<Settings size={20} />} 
          label="Customize Options" 
          active={activeTab === "Customize Options"}
          isCollapsed={isCollapsed}
          onClick={() => setActiveTab("Customize Options")}
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <SidebarItem 
          icon={<User size={20} className="text-blue-600" />} 
          label="Admin Profile" 
          isCollapsed={isCollapsed}
          onClick={onAdminProfileClick}
          className="text-blue-600"
        />
        <SidebarItem 
          icon={<LogOut size={20} className="text-red-600" />} 
          label="Logout" 
          isCollapsed={isCollapsed}
          onClick={onLogout}
          className="text-red-600"
        />
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, isCollapsed, onClick, className = "" }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-2 rounded transition-colors ${
      active ? "bg-gray-200" : "hover:bg-gray-50"
    } ${className}`}
    title={isCollapsed ? label : ""}
  >
    <div className="min-w-[24px]">{icon}</div>
    {!isCollapsed && <span className="ml-3 whitespace-nowrap overflow-hidden transition-opacity">{label}</span>}
  </button>
);