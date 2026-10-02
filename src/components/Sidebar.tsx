"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  PlusSquare,
  AlertTriangle,
  Search,
  Bell,
  User,
  LogOut,
  Sun,
  Moon,
  MapPinned,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/create", icon: PlusSquare, label: "Share Information" },
  { href: "/local-issues", icon: AlertTriangle, label: "Local Issues" },
  { href: "/lost-found", icon: Search, label: "Lost & Found" },
  { href: "/emergency-map", icon: MapPinned, label: "Emergency Map" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <aside
      className="w-[20%] hidden md:flex flex-col border-r p-4 shrink-0"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Brand with Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 mb-8 px-2"
      >
        <Image
          src="/logo.png"
          alt="LoCult"
          width={140}
          height={40}
          className="h-9 w-auto object-contain"
          priority
        />
      </Link>

      {/* User card */}
      <Link
        href="/profile"
        className="flex items-center gap-3 mb-6 p-3 rounded-xl border transition-colors"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
          }}
        >
          {user?.name?.charAt(0) ?? "?"}
        </div>
        <div className="overflow-hidden">
          <div
            className="font-semibold text-sm truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {user?.name ?? "Guest"}
          </div>
          <div
            className="text-xs truncate"
            style={{ color: "var(--text-muted)" }}
          >
            {user?.community ?? "—"}
          </div>
        </div>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "text-white shadow-md font-medium"
                  : "hover:opacity-90"
              }`}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                    }
                  : {
                      color: "var(--text-secondary)",
                    }
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto space-y-1.5">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full"
          style={{ color: "var(--text-secondary)" }}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500" />
          )}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <Link
          href="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === "/profile"
              ? "text-white shadow-md font-medium"
              : ""
          }`}
          style={
            pathname === "/profile"
              ? {
                  background:
                    "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                }
              : {
                  color: "var(--text-secondary)",
                }
          }
        >
          <User className="w-5 h-5" />
          <span>Settings and Profile</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors w-full"
          style={{ color: "var(--text-secondary)" }}
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
