import type { FC } from "react";
import { LogOut, Users } from "lucide-react";
import type { Professional } from "../types";
import { AvatarPlaceholder } from "./ui/Avatar";

interface SidebarProps {
  doctorInfo: Professional | null;
  onLogout: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ doctorInfo, onLogout }) => (
  <aside className="w-72 bg-white/90 p-6 hidden lg:flex flex-col justify-between border-r border-rose-100/60 h-screen sticky top-0">
    <div>
      <div className="flex items-center gap-3 mb-10">
        <h1 className="text-2xl font-bold text-gray-800">Professional View</h1>
      </div>
      <div className="space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold bg-rose-100/60 text-rose-700">
          <Users size={20} /> Assigned Patients
        </button>
      </div>
    </div>
    {doctorInfo && (
      <div>
        <div className="border-t border-rose-100/60 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarPlaceholder
              name={doctorInfo.name}
              className="w-10 h-10"
            />
            <div>
              <p className="font-semibold text-gray-800">{doctorInfo.name}</p>
              <p className="text-xs text-gray-500">{doctorInfo.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-gray-500 rounded-md hover:bg-rose-100/50 hover:text-rose-600 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    )}
  </aside>
);