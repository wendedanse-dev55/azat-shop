import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth (middleware also guards these routes).
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-x-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
