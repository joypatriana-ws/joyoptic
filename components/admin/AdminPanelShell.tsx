import AdminSidebar from "./AdminSidebar";

/** Shell-ul din kulttur: sidebar fix + header + zona de conținut cu scroll propriu. */
export default function AdminPanelShell({
  userName,
  unread,
  children,
}: {
  userName: string;
  unread: number;
  children: React.ReactNode;
}) {
  return (
    <div data-admin="true" className="fixed inset-0 overflow-hidden bg-gray-50 flex">
      <AdminSidebar unread={unread} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
          <div className="lg:hidden text-sm font-medium text-gray-500 pl-10">Joy Optic Admin</div>
          <div className="hidden lg:block" />
          <span className="text-sm text-gray-500">{userName}</span>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 flex flex-col">{children}</main>
      </div>
    </div>
  );
}
