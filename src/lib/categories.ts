import type { PostCategory, PostStatus } from "@/types";

// ── Category colors — using Lucide icon names and SVG markers ──
export const CATEGORY_CONFIG: Record<
  PostCategory,
  {
    color: string;
    bg: string;
    border: string;
    hex: string;
    lucideIcon: string;
    darkBg: string;
    darkBorder: string;
    /** SVG symbol used in map markers */
    markerSymbol: string;
  }
> = {
  "Local Issue": {
    color: "text-yellow-700 dark:text-yellow-400",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    hex: "#eab308",
    lucideIcon: "construction",
    darkBg: "dark:bg-yellow-950",
    darkBorder: "dark:border-yellow-800",
    markerSymbol: "⚠",
  },
  Emergency: {
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50",
    border: "border-red-200",
    hex: "#ef4444",
    lucideIcon: "alert-triangle",
    darkBg: "dark:bg-red-950",
    darkBorder: "dark:border-red-800",
    markerSymbol: "!",
  },
  Internship: {
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50",
    border: "border-purple-200",
    hex: "#a855f7",
    lucideIcon: "briefcase",
    darkBg: "dark:bg-purple-950",
    darkBorder: "dark:border-purple-800",
    markerSymbol: "💼",
  },
  "Lost & Found": {
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50",
    border: "border-orange-200",
    hex: "#f97316",
    lucideIcon: "search",
    darkBg: "dark:bg-orange-950",
    darkBorder: "dark:border-orange-800",
    markerSymbol: "?",
  },
  Event: {
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50",
    border: "border-blue-200",
    hex: "#3b82f6",
    lucideIcon: "calendar",
    darkBg: "dark:bg-blue-950",
    darkBorder: "dark:border-blue-800",
    markerSymbol: "★",
  },
  Scholarship: {
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-50",
    border: "border-green-200",
    hex: "#22c55e",
    lucideIcon: "graduation-cap",
    darkBg: "dark:bg-green-950",
    darkBorder: "dark:border-green-800",
    markerSymbol: "🎓",
  },
  Announcement: {
    color: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    hex: "#6366f1",
    lucideIcon: "megaphone",
    darkBg: "dark:bg-indigo-950",
    darkBorder: "dark:border-indigo-800",
    markerSymbol: "📢",
  },
};

export const STATUS_CONFIG: Record<
  PostStatus,
  { bg: string; text: string }
> = {
  Draft: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-400" },
  Active: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-400" },
  "Under Review": { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300" },
  Verified: { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-400" },
  Updated: { bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-700 dark:text-cyan-400" },
  Flagged: { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400" },
  Resolved: { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400" },
  Expired: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400" },
};

export const ALL_CATEGORIES: PostCategory[] = [
  "Local Issue",
  "Emergency",
  "Internship",
  "Lost & Found",
  "Event",
  "Scholarship",
  "Announcement",
];
