import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminPanelShell from "@/components/admin/AdminPanelShell";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/token";
import { connectDb } from "@/lib/db";
import { Message, User } from "@/lib/models";

// proxy.ts verifică deja tokenul; aici luăm contul (activ) și numărul de mesaje necitite pentru sidebar.
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;
  if (!session) redirect("/admin/login");

  await connectDb();
  const [user, unread] = await Promise.all([
    User.findById(session.userId).select("name active").lean(),
    Message.countDocuments({ read: false }),
  ]);
  if (!user?.active) redirect("/admin/login");

  return (
    <AdminPanelShell userName={user.name} unread={unread}>
      {children}
    </AdminPanelShell>
  );
}
