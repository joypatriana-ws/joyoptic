import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Joy Optic",
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="font-sans text-gray-900">{children}</div>;
}
