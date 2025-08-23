import React, { useState } from "react";
import { adminUser } from "../../data";
import type { User } from "../../types";
import { Sidebar } from "../../components/sidebar";
import { UserManagementView } from "../../components/UserManagement";
import { ProductManagementView } from "../../components/ProductManagement";
import { UserModal } from "../../components/Modals";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("User Management");
  const navigate = useNavigate();

  const handleSaveUser = (updatedUser: User) => {
    if (activeUser && activeUser.id === updatedUser.id) {
      setActiveUser(updatedUser);
    }
    setEditingUser(null);
  };

  const handleSaveAdmin = (updatedAdmin: User) => {
    console.log("Saving admin:", updatedAdmin);
    setIsAdminProfileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
    console.log("User logged out");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "User Management":
        return <UserManagementView />;
      case "Product Management":
        return <ProductManagementView />;
      default:
        return <UserManagementView />;
    }
  };

  return (
    <div className="h-screen w-screen flex font-sans overflow-hidden overflow-x-hidden bg-gray-50">
      {/* Sidebar always flush left */}
      <div className="shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAdminProfileClick={() => setIsAdminProfileOpen(true)}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content fills the rest */}
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>

      {editingUser && (
        <UserModal
          title="Edit User"
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {isAdminProfileOpen && (
        <UserModal
          title="Admin Profile"
          user={adminUser}
          onClose={() => setIsAdminProfileOpen(false)}
          onSave={handleSaveAdmin}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
