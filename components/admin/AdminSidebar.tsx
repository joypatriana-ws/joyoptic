"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ExternalLink, FileText, LogOut, Mail, Menu, Tag, Users, X } from "lucide-react";
import { useState, useTransition, type ComponentType } from "react";

// Sidebar-ul din kulttur (components/admin/AdminSidebar.tsx), cu meniul JoyOptic.

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }> };

const NAV: NavItem[] = [
  { href: "/admin/programari", label: "Programări", icon: CalendarDays },
  { href: "/admin/mesaje", label: "Mesaje", icon: Mail },
  { href: "/admin/pagini", label: "Pagini", icon: FileText },
  { href: "/admin/oferte", label: "Oferte", icon: Tag },
  { href: "/admin/utilizatori", label: "Utilizatori", icon: Users },
];

const LINK_BASE = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors";
const linkCls = (active: boolean) =>
  `${LINK_BASE} ${active ? "bg-accent/10 text-[#1e7e34] font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`;

function SidebarContent({
  pathname,
  unread,
  onNavigate,
  onLogout,
  pending,
}: {
  pathname: string;
  unread: number;
  onNavigate?: () => void;
  onLogout: () => void;
  pending: boolean;
}) {
  return (
    <>
      <div className="h-14 flex items-center border-b border-gray-200 shrink-0 px-5">
        <span className="font-heading text-[17px] font-bold text-heading">Joy Optic</span>
        <span className="ml-2 text-gray-400 text-xs">Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={onNavigate} className={linkCls(pathname.startsWith(href))}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {href === "/admin/mesaje" && unread > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {unread}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200 shrink-0 space-y-0.5">
        <a href="/" target="_blank" rel="noreferrer" className={linkCls(false)}>
          <ExternalLink className="w-4 h-4 shrink-0" />
          Vezi site-ul
        </a>
        <button
          onClick={onLogout}
          disabled={pending}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Deconectare
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const logout = () => {
    setOpen(false);
    startTransition(async () => {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
    });
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 z-10 flex-col bg-white border-r border-gray-200">
        <SidebarContent pathname={pathname} unread={unread} onLogout={logout} pending={pending} />
      </aside>

      {/* Mobile: hamburger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-0 left-0 z-30 h-14 w-14 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
        aria-label="Deschide meniu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile: backdrop */}
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />}

      {/* Mobile: drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-gray-200 shadow-xl transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          aria-label="Închide meniu"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent
          pathname={pathname}
          unread={unread}
          onNavigate={() => setOpen(false)}
          onLogout={logout}
          pending={pending}
        />
      </aside>
    </>
  );
}
