import { DashboardNav } from "../../../../components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container mx-auto px-4 py-6">
      <DashboardNav />
      <div className="mt-6 mx-6">{children}</div>
    </main>
  );
}
