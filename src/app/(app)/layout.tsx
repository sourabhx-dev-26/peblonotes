"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "authed"; email: string }
    | { status: "guest" }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me.ok) {
        setState({ status: "guest" });
        router.push("/login");
        return;
      }
      setState({ status: "authed", email: me.user.email });
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  if (state.status === "guest") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={state.email} />
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}