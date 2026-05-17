"use client";

import { useRouter, usePathname } from "next/navigation";

export function Navbar({
  userEmail,
}: {
  userEmail: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function linkClass(href: string) {
    const active = pathname === href;
    return [
      "rounded-lg px-3 py-2 text-sm font-medium",
      active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50",
    ].join(" ");
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <a className="font-semibold text-gray-900" href="/app">
          PebloNotes
        </a>

        <nav className="flex items-center gap-1">
          <a className={linkClass("/app")} href="/app">
            Notes
          </a>
          <a className={linkClass("/app/dashboard")} href="/app/dashboard">
            Dashboard
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-gray-600 sm:block">
            {userEmail}
          </span>
          <button
            onClick={logout}
            className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}