"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Repeat2,
  Share,
  Bookmark,
  ShieldCheck,
  MapPin,
  Calendar,
  ArrowLeft,
  Flag,
  CheckCircle2,
  Pin,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostsContext";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "@/lib/categories";
import { MOCK_USERS } from "@/lib/mockData";
import type { Comment } from "@/types";
import Link from "next/link";

// Lifecycle stages (Design Doc §15)
const LIFECYCLE = [
  "Draft",
  "Active",
  "Under Review",
  "Verified",
  "Updated",
  "Resolved",
  "Expired",
] as const;

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    getPost,
    upvotePost,
    downvotePost,
    verifyPost,
    reportPost,
    resolvePost,
    addComment,
  } = usePosts();

  const postId = params.id as string;
  const post = getPost(postId);

  const [newComment, setNewComment] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  if (!post) {
    return (
      <main className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>Post not found.</p>
          <Link
            href="/"
            className="font-medium mt-2 inline-block"
            style={{ color: "var(--primary)" }}
          >
            ← Back to feed
          </Link>
        </div>
      </main>
    );
  }

  const author = MOCK_USERS.find((u) => u.id === post.authorId);
  const catConfig = CATEGORY_CONFIG[post.category];
  const statusConfig = STATUS_CONFIG[post.status];

  const userUpvoted = user ? post.upvotedBy.includes(user.id) : false;
  const userDownvoted = user ? post.downvotedBy.includes(user.id) : false;

  const handleAddComment = () => {
    if (!user || !newComment.trim()) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      content: newComment,
      timestamp: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      isPinned: false,
      isOfficialReply: false,
      replies: [],
    };
    addComment(post.id, comment);
    setNewComment("");
  };

  const handleReport = (reason: string) => {
    if (user) {
      reportPost(post.id, user.id);
      setShowReportModal(false);
      alert(`Post reported: ${reason}`);
    }
  };

  return (
    <main className="w-full h-full overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-sm transition-colors hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Post card */}
        <article
          className="rounded-2xl border shadow-sm overflow-hidden mb-6"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white"
                  style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
                >
                  {author?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {author?.name}
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {author?.community} · {timeAgo(post.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-semibold border ${catConfig.color} ${catConfig.bg} ${catConfig.border} ${catConfig.darkBg} ${catConfig.darkBorder}`}
                >
                  {post.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-md text-xs border border-transparent ${statusConfig.bg} ${statusConfig.text}`}
                >
                  {post.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              {post.title}
            </h1>
            <p className="leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              {post.description}
            </p>

            {/* Metadata */}
            <div
              className="flex items-center gap-5 text-sm mb-6 pb-6 border-b flex-wrap"
              style={{ color: "var(--text-muted)", borderColor: "var(--border-color)" }}
            >
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {post.location.name}
                {post.location.fuzzed && (
                  <span className="text-orange-500"> (Fuzzed 250-500m)</span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Valid till:{" "}
                {new Date(post.validUntil).toLocaleDateString("en-IN")}
              </span>
            </div>

            {/* Engagement summary */}
            <div className="flex items-center gap-4 text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              <span>{post.views} views</span>
              <span>{post.upvotes} upvotes</span>
              <span>{post.downvotes} downvotes</span>
              <span>{post.comments.length} comments</span>
              <span>{post.repostCount} reposts</span>
            </div>

            {/* Verification + Actions */}
            <div
              className="flex items-center justify-between flex-wrap gap-3 pb-6 border-b"
              style={{ borderColor: "var(--border-color)" }}
            >
              <button
                onClick={() => user && verifyPost(post.id, user.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify: Accurate ({post.verifyScore}%)
              </button>

              <div className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <ActionBtn
                  icon={<ArrowUp className="w-5 h-5" />}
                  count={post.upvotes}
                  onClick={() => user && upvotePost(post.id, user.id)}
                  active={userUpvoted}
                  activeColor="text-green-500"
                />
                <ActionBtn
                  icon={<ArrowDown className="w-5 h-5" />}
                  count={post.downvotes}
                  onClick={() => user && downvotePost(post.id, user.id)}
                  active={userDownvoted}
                  activeColor="text-red-500"
                />
                <button className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Bookmark className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Repeat2 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Share className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lifecycle visualization (Design Doc §15) */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                Information Lifecycle
              </h3>
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {LIFECYCLE.map((stage, idx) => {
                  const isCurrent = post.status === stage;
                  const isPast =
                    LIFECYCLE.indexOf(post.status as any) > idx;
                  return (
                    <div key={stage} className="flex items-center shrink-0">
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isCurrent
                            ? "text-white shadow-md"
                            : isPast
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                        }`}
                        style={
                          isCurrent
                            ? { background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }
                            : undefined
                        }
                      >
                        {stage}
                      </div>
                      {idx < LIFECYCLE.length - 1 && (
                        <div
                          className={`w-4 h-0.5 ${
                            isPast ? "bg-indigo-300 dark:bg-indigo-700" : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolve button (FR-09) */}
            {user &&
              (post.authorId === user.id || user.trustScore >= 80) &&
              post.status !== "Resolved" &&
              post.status !== "Expired" && (
                <button
                  onClick={() => resolvePost(post.id)}
                  className="mt-4 w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-medium text-sm rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Resolved (FR-09)
                </button>
              )}
          </div>
        </article>

        {/* Comments Section (Design Doc §25) */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Discussion ({post.comments.length})
          </h2>

          {/* Add comment */}
          <div className="flex gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2.5 text-white rounded-xl disabled:opacity-50 transition-colors"
                style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comment list */}
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="rounded-2xl p-6 max-w-md w-full shadow-2xl border"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Report Information
              </h3>
              <div className="space-y-2">
                {[
                  "Incorrect information",
                  "Outdated information",
                  "Duplicate",
                  "Spam",
                  "Misleading",
                  "Inappropriate",
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleReport(reason)}
                    className="w-full text-left px-4 py-3 rounded-lg border text-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-800 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-full mt-4 py-2 text-sm hover:opacity-80 transition-opacity"
                style={{ color: "var(--text-muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
      >
        {comment.authorName.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {comment.authorName}
          </span>
          {comment.isOfficialReply && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 text-xs rounded-full font-medium">
              Official
            </span>
          )}
          {comment.isPinned && (
            <Pin className="w-3 h-3 text-amber-500" />
          )}
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {timeAgo(comment.timestamp)}
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <button className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: "var(--text-muted)" }}>
            <ArrowUp className="w-3 h-3" /> {comment.upvotes}
          </button>
          <button className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: "var(--text-muted)" }}>
            <ArrowDown className="w-3 h-3" /> {comment.downvotes}
          </button>
          <button className="text-xs font-medium" style={{ color: "var(--primary)" }}>
            Reply
          </button>
        </div>

        {/* Threaded replies */}
        {comment.replies.length > 0 && (
          <div
            className="mt-3 ml-3 pl-3 border-l-2 space-y-3"
            style={{ borderColor: "var(--border-color)" }}
          >
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
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
      className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors group hover:bg-slate-100 dark:hover:bg-slate-800 ${
        active ? activeColor : ""
      }`}
      style={!active ? { color: "var(--text-muted)" } : undefined}
    >
      <span className={active ? activeColor : "group-hover:opacity-80 transition-opacity"}>
        {icon}
      </span>
      {count !== undefined && (
        <span className={`text-sm font-medium ${active ? activeColor : ""}`}>
          {count}
        </span>
      )}
    </button>
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
