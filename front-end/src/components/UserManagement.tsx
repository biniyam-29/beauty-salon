import React, { useState, useMemo } from "react";
import type { User } from "../types";
import { SearchIcon } from "./Icons";
import { UserModal } from "./Modals";

interface UserManagementViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  setUsers,
  activeUser,
  setActiveUser,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleAddUser = (newUser: User) => {
    setUsers((prevUsers) => [
      {
        ...newUser,
        id: Date.now(),
        avatar: `https://placehold.co/40x40/d1d5db/4b5563?text=${newUser.name.charAt(
          0
        )}`,
      },
      ...prevUsers,
    ]);
    setIsAddModalOpen(false);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
        >
          + Add New
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900 flex items-center">
                  <img
                    className="w-8 h-8 rounded-full mr-3"
                    src={user.avatar}
                    alt={`${user.name} avatar`}
                  />
                  {user.name}
                </td>
                <td className="px-6 py-4 capitalize">
                  {user.role.replace("-", " ")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setActiveUser(user)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      activeUser && activeUser.id === user.id
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {activeUser && activeUser.id === user.id
                      ? "Selected"
                      : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No users match your search.</p>
          </div>
        )}
      </div>
      {isAddModalOpen && (
        <UserModal
          title="Add New User"
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddUser}
        />
      )}
    </section>
  );
};
