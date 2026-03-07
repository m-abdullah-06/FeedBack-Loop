import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-surface flex flex-col fixed h-screen">
        <div className="px-6 h-16 flex items-center border-b border-border">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            feedback<span className="text-accent">loop</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
          >
            <span>📊</span> Dashboard
          </Link>
          <Link
            href="/review"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
          >
            <span>🔍</span> New Review
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-1">
          <Link
            href="/pricing"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
          >
            <span>⚡</span> Upgrade to Pro
          </Link>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
          >
            <span>👋</span> Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 min-h-screen">{children}</main>
    </div>
  );
}
