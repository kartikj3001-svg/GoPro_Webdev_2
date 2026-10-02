"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";

const AUTH_PAGES = ["/login"];

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthPage, router]);

  // Auth pages get a full-width layout with no sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show nothing while redirecting to login
  if (!isAuthenticated) {
    return null;
  }

  // Main dashboard layout — 3-column structure
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Sidebar />
      <div className="flex-1 flex overflow-hidden">{children}</div>
    </div>
  );
}
