import React, { useState } from "react";
import { initialUsers, adminUser } from "../../data";
import type { User } from "../../types";
import { Sidebar } from "../../components/sidebar";
import { UserProfileOverview } from "../../components/UserProfileOverview";
import { UserManagementView } from "../../components/UserManagement";
import { ProductManagementView } from "../../components/ProductManagement";
import { UserModal } from "../../components/Modals";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("User Management");
  const navigate = useNavigate();

  const handleSaveUser = (updatedUser: User) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setEditingUser(null);
    setActiveUser(updatedUser);
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
            users={users}
            setUsers={setUsers}
            activeUser={activeUser}
            setActiveUser={setActiveUser}
          />
        );
      case "Product Management":
        return <ProductManagementView />;
      default:
        return (
          <UserManagementView
            users={users}
            setUsers={setUsers}
            activeUser={activeUser}
            setActiveUser={setActiveUser}
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
      <main className="flex-1 p-8">{renderContent()}</main>
      {activeTab !== "Product Management" && (
        <UserProfileOverview
          activeUser={activeUser}
          onEditClick={setEditingUser}
        />
      )}
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
