import { DashboardNav } from "../../../../components/dashboard-nav";
import { redirect } from "next/navigation";
import { auth } from "../../../../lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <DashboardNav />
      <div className="mt-6 mx-6">{children}</div>
    </main>
  );
}
