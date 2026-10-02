"use client";

import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Repeat2,
  Share,
  Bookmark,
  MoreHorizontal,
  Calendar,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import type { Post } from "@/types";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "@/lib/categories";
import { MOCK_USERS } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostsContext";

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const { user } = useAuth();
  const { upvotePost, downvotePost, verifyPost } = usePosts();
  const author = MOCK_USERS.find((u) => u.id === post.authorId);
  const catConfig = CATEGORY_CONFIG[post.category];
  const statusConfig = STATUS_CONFIG[post.status];

  const userUpvoted = user ? post.upvotedBy.includes(user.id) : false;
  const userDownvoted = user ? post.downvotedBy.includes(user.id) : false;

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) upvotePost(post.id, user.id);
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) downvotePost(post.id, user.id);
  };

  const handleVerify = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) verifyPost(post.id, user.id);
  };

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article
        className="rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className={compact ? "p-4" : "p-5"}>
          {/* Top row: author + category + status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                }}
              >
                {author?.name?.charAt(0) ?? "?"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {author?.name ?? "Unknown"}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    · {timeAgo(post.createdAt)}
                  </span>
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {author?.community}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${catConfig.color} ${catConfig.bg} ${catConfig.border} ${catConfig.darkBg} ${catConfig.darkBorder}`}
              >
                {post.category}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-xs border border-transparent ${statusConfig.bg} ${statusConfig.text}`}
              >
                {post.status}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 mb-4">
            <h2
              className={`font-bold leading-tight ${compact ? "text-base" : "text-xl"} mb-2`}
              style={{ color: "var(--text-primary)" }}
            >
              {post.title}
            </h2>
            <p
              className="text-sm leading-relaxed line-clamp-3"
              style={{ color: "var(--text-secondary)" }}
            >
              {post.description}
            </p>
          </div>

          {/* Metadata */}
          <div
            className="flex items-center gap-4 text-xs mb-5 pb-5 border-b flex-wrap"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {post.location.name}
              {post.location.fuzzed && (
                <span className="text-orange-500 ml-1">(Fuzzed)</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Valid till: {formatDate(post.validUntil)}
            </div>
          </div>

          {/* Trust & Engagement */}
          <div className="flex items-center justify-between flex-wrap gap-y-3">
            <button
              onClick={handleVerify}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <ShieldCheck
                className={`w-4 h-4 ${post.verifyScore > 80 ? "text-green-500" : "text-yellow-500"}`}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {post.verifyScore}% Verified
              </span>
            </button>

            <div className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <ActionBtn
                icon={<ArrowUp className="w-4 h-4" />}
                count={post.upvotes}
                onClick={handleUpvote}
                active={userUpvoted}
                activeColor="text-green-500"
              />
              <ActionBtn
                icon={<ArrowDown className="w-4 h-4" />}
                count={post.downvotes}
                onClick={handleDownvote}
                active={userDownvoted}
                activeColor="text-red-500"
              />
              <ActionBtn
                icon={<MessageSquare className="w-4 h-4" />}
                count={post.comments.length}
              />
              <ActionBtn
                icon={<Repeat2 className="w-4 h-4" />}
                count={post.repostCount}
              />
              <ActionBtn icon={<Share className="w-4 h-4" />} />
              <ActionBtn icon={<Bookmark className="w-4 h-4" />} />
              <button
                className="p-2 rounded-full transition-colors ml-1"
                style={{ color: "var(--text-muted)" }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function ActionBtn({
  icon,
  count,
  onClick,
  active = false,
  activeColor = "",
}: {
  icon: React.ReactNode;
  count?: number;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors group ${
        active ? activeColor : ""
      }`}
      style={!active ? { color: "var(--text-muted)" } : undefined}
    >
      <span className={active ? activeColor : "group-hover:opacity-80 transition-colors"}>
        {icon}
      </span>
      {count !== undefined && (
        <span className={`text-xs font-medium ${active ? activeColor : ""}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Helpers ──
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}
