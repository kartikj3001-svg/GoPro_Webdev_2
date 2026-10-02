"use client";

import { useState } from "react";
import { Bell, AlertTriangle, CheckCircle, Clock, FileEdit, Shield, Package } from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/lib/mockData";
import type { Notification } from "@/types";
import Link from "next/link";

const ICON_MAP: Record<Notification["type"], React.ReactNode> = {
  verified: <CheckCircle className="w-5 h-5 text-green-500" />,
  update_suggested: <FileEdit className="w-5 h-5 text-blue-500" />,
  emergency: <AlertTriangle className="w-5 h-5 text-red-500" />,
  report_reviewed: <Shield className="w-5 h-5 text-indigo-500" />,
  expiring: <Clock className="w-5 h-5 text-amber-500" />,
  update_accepted: <CheckCircle className="w-5 h-5 text-cyan-500" />,
  claim_request: <Package className="w-5 h-5 text-orange-500" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.read);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <main className="w-full h-full overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" style={{ color: "var(--primary)" }} />
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Notifications
            </h1>
            {unread.length > 0 && (
              <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unread.length}
              </span>
            )}
          </div>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-medium"
              style={{ color: "var(--primary)" }}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.postId ? `/post/${n.postId}` : "#"}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                n.read
                  ? ""
                  : "bg-indigo-50/50 dark:bg-indigo-950/20"
              }`}
              style={{
                backgroundColor: n.read ? "var(--bg-card)" : undefined,
                borderColor: n.read ? "var(--border-color)" : "var(--primary)",
              }}
            >
              <div className="shrink-0 mt-0.5">{ICON_MAP[n.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-sm font-semibold`}
                    style={{ color: n.read ? "var(--text-secondary)" : "var(--text-primary)" }}
                  >
                    {n.title}
                  </h3>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "var(--primary)" }} />
                  )}
                </div>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{n.message}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {timeAgo(n.timestamp)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
