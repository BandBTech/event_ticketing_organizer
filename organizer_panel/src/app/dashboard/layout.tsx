import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 p-6">
            
        </main>
      </div>
    </div>
  );
}
