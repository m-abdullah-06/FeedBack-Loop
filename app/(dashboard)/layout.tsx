"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/review", icon: "🔍", label: "New Review" },
];

const BOTTOM_ITEMS = [
  { href: "/pricing", icon: "⚡", label: "Upgrade to Pro" },
  { href: "/api/auth/signout", icon: "👋", label: "Sign out" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 w-60 border-r border-border bg-surface flex flex-col transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="px-5 h-16 flex items-center justify-between border-b border-border shrink-0">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            feedback<span className="text-accent">loop</span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="lg:hidden text-text-muted hover:text-text-primary text-lg"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                pathname === item.href
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-muted hover:text-text-primary hover:bg-bg"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-1 shrink-0">
          {BOTTOM_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main wrapper */}
      <div className="lg:ml-60 min-h-screen flex flex-col">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 h-14 border-b border-border bg-surface flex items-center justify-between px-4 shrink-0">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            feedback<span className="text-accent">loop</span>
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 text-text-muted hover:text-text-primary flex flex-col gap-1.5"
            aria-label="Open menu"
          >
            <span className="block w-5 h-0.5 bg-current rounded" />
            <span className="block w-5 h-0.5 bg-current rounded" />
            <span className="block w-5 h-0.5 bg-current rounded" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}