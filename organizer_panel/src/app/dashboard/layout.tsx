
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboardHeader";


export default function DashboardLayout({
  children,}:{children: React.ReactNode;}) {

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* <Topbar /> */}
       <main className="flex-1 overflow-y-auto">
        <DashboardHeader/>
        {children}</main>
      </div>
    </div>
  );
}
