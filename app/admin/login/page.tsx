"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

/** Login admin, după modelul din kulttur (app/admin/login). */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Email sau parolă incorectă");
      }
    } catch {
      setError("Eroare la autentificare");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <h1 className="m-0 text-xl font-semibold text-heading tracking-tight">Joy Optic Admin</h1>
          <p className="m-0 text-xs text-gray-400">Acces restricționat</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
              placeholder="email@joyoptic.ro"
              autoComplete="username"
              autoFocus
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
              placeholder="Parolă"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p role="alert" className="m-0 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-[#218838] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Se autentifică..." : "Autentificare"}
          </button>
        </form>
      </div>
    </div>
  );
}
