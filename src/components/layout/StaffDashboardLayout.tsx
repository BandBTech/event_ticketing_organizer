import DashboardLayout from "./DashboardLayout";

export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      role={["admin", "subadmin", "organizer", "manager", "staff"]}
    >
      {children}
    </DashboardLayout>
  );
}
