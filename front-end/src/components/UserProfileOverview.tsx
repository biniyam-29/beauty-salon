// FILE: src/components/UserProfileOverview.tsx
import React from "react";
import type { User } from "../types";

interface UserProfileOverviewProps {
  activeUser: User | null;
  onEditClick: (user: User) => void;
}

export const UserProfileOverview: React.FC<UserProfileOverviewProps> = ({
  activeUser,
  onEditClick,
}) => {
  if (!activeUser) {
    return (
      <aside className="w-80 bg-white p-6 border-l border-gray-200">
        <div className="text-center text-gray-500 mt-20">
          <p>Select a user to see their profile.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white p-6 border-l border-gray-200">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800">
          User Profile Overview
        </h2>
        <img
          className="w-20 h-20 rounded-full mx-auto my-4"
          src={activeUser.avatar}
          alt={`${activeUser.name} avatar`}
        />
        <h3 className="font-bold text-gray-900">{activeUser.name}</h3>
        <p className="text-sm text-gray-500 capitalize">
          {activeUser.role.replace("-", " ")}
        </p>
        <button
          onClick={() => onEditClick(activeUser)}
          className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
        >
          Edit User
        </button>
      </div>
    </aside>
  );
};
