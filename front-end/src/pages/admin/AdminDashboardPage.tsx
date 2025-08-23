import React, { useState } from "react";
import { adminUser } from "../../data";
import type { User } from "../../types";
import { Sidebar } from "../../components/sidebar";
import { UserManagementView } from "../../components/UserManagement";
import { ProductManagementView } from "../../components/ProductManagement";
import { UserModal } from "../../components/Modals";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  // State for the currently selected/active user is managed here
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("User Management");
  const navigate = useNavigate();

  // This function is now passed to the UserModal for editing
  const handleSaveUser = (updatedUser: User) => {
    // In a real app, you would likely refetch the user list here
    // For now, we optimistically update the active user
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
        return (
          <UserManagementView
          />
        );
      case "Product Management":
        return <ProductManagementView />;
      default:
        return (
          <UserManagementView
          />
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAdminProfileClick={() => setIsAdminProfileOpen(true)}
        onLogout={handleLogout}
      />
      <main className="flex-1">{renderContent()}</main>
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
