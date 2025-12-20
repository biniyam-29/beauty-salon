import React, { useState, useEffect } from "react";
import type { User } from "../../lib/types/types";
import { Sidebar } from "../../components/admin/sidebar";
import  UserManagementView from "../../components/admin/user/UserManagement";
import  ProductManagementView  from "../../components/admin/product/ProductManagement";
import { UserModal } from "../../components/admin/user/Modals";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import  LookupsManagementView  from "../../components/admin/lookups/LookupsManagementView";

const AdminDashboard: React.FC = () => {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("User Management");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggedInAdmin, setLoggedInAdmin] = useState<User | null>(null);

  const navigate = useNavigate();

  // Load logged-in admin from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setLoggedInAdmin(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid user JSON in localStorage", err);
      }
    }
  }, []);

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
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
    console.log("User logged out");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "User Management":
        return <UserManagementView />;
      case "Product Management":
        return <ProductManagementView />;
      case "Customize Options":
        return <LookupsManagementView />;
      default:
        return <UserManagementView />;
    }
  };

  return (
    <div className="h-screen w-screen flex font-sans overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block shrink-0">
        {/* MODIFIED: Conditionally render Sidebar only when admin data is loaded */}
        {loggedInAdmin && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAdminProfileClick={() => setIsAdminProfileOpen(true)}
            onLogout={handleLogout}
            admin={loggedInAdmin}
          />
        )}
      </div>

      {/* Mobile Sidebar (Drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 bg-white shadow-xl">
            {/* MODIFIED: Conditionally render Sidebar only when admin data is loaded */}
            {loggedInAdmin && (
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }}
                onAdminProfileClick={() => {
                  setIsAdminProfileOpen(true);
                  setSidebarOpen(false);
                }}
                onLogout={handleLogout}
                admin={loggedInAdmin}
              />
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">{activeTab}</h1>
        </div>

        <div className="p-4">{renderContent()}</div>
      </main>

      {/* Modals */}
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
          user={loggedInAdmin}
          onClose={() => setIsAdminProfileOpen(false)}
          onSave={handleSaveAdmin}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
