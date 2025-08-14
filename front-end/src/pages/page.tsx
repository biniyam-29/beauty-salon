import { Sidebar } from "../components/sidebar"
import { DashboardContent } from "../components/dashboard-content"

export default function HomePage() {

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardContent />
      </main>
    </div>
  )
}
