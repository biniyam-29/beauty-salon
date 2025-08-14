import { Sidebar } from "../components/sidebar"
import { UserManagementView } from "../components/user-management-view"

export default function UsersPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <UserManagementView />
      </main>
    </div>
  )
}
