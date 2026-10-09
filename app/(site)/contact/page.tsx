import type { Metadata } from "next";
import { Contact } from "@/components/theme/contact";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

/** Contacts/view.ctp */
export default function ContactPage() {
  return <Contact />;
}
