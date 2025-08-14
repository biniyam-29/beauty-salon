import { Sidebar } from "../components/sidebar"
import { InventoryManagementView } from "../components/inventory-management-view"

export default function InventoryPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <InventoryManagementView />
      </main>
    </div>
  )
}
