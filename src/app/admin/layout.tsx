import { redirect } from "next/navigation";
import { getCurrentAppUser, hasPermission } from "~/server/auth/current-user";
import { Permissions } from "~/lib/permissions";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentAppUser();

  if (!hasPermission(user, Permissions.ADMIN_DASHBOARD_READ)) {
    redirect("/");
  }

  return children;
}
