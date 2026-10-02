"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostsContext";
import PostCard from "@/components/PostCard";
import { Award, MessageSquare, ShieldCheck, FileCheck, MapPin, Building2 } from "lucide-react";

type Tab = "Posts" | "Saved" | "Verified" | "Resolved";

export default function ProfilePage() {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [activeTab, setActiveTab] = useState<Tab>("Posts");

  if (!user) return null;

  const myPosts = posts.filter((p) => p.authorId === user.id);
  const savedPosts = posts.filter((p) => user.saved.includes(p.id));
  const verifiedPosts = posts.filter((p) => p.verifiedBy.includes(user.id));
  const resolvedPosts = posts.filter(
    (p) => p.authorId === user.id && p.status === "Resolved"
  );

  const tabPosts: Record<Tab, typeof posts> = {
    Posts: myPosts,
    Saved: savedPosts,
    Verified: verifiedPosts,
    Resolved: resolvedPosts,
  };

  const displayPosts = tabPosts[activeTab];

  return (
    <main className="w-full h-full overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Profile header */}
        <div
          className="rounded-2xl border p-6 mb-6"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <div className="flex items-start gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0"
              style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {user.name}
              </h1>
              <p style={{ color: "var(--text-muted)" }}>{user.community}</p>
              {user.organization && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user.organization}</p>
              )}

              {/* Location info */}
              <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {user.city}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {user.district}
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {user.badges.map((b) => (
                  <span
                    key={b}
                    className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-medium rounded-full border border-indigo-100 dark:border-indigo-800"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
                {user.trustScore}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Trust Score</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
            <StatCard
              icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
              value={user.postsShared}
              label="Posts Shared"
            />
            <StatCard
              icon={<ShieldCheck className="w-5 h-5 text-green-500" />}
              value={user.verified}
              label="Verified"
            />
            <StatCard
              icon={<Award className="w-5 h-5 text-amber-500" />}
              value={user.helpfulContributions}
              label="Helpful"
            />
            <StatCard
              icon={<FileCheck className="w-5 h-5 text-indigo-500" />}
              value={resolvedPosts.length}
              label="Resolved"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6" style={{ borderColor: "var(--border-color)" }}>
          {(["Posts", "Saved", "Verified", "Resolved"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-current"
                  : "border-transparent"
              }`}
              style={{
                color: activeTab === tab ? "var(--primary)" : "var(--text-muted)",
                borderColor: activeTab === tab ? "var(--primary)" : "transparent",
              }}
            >
              {tab}
              <span className="ml-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                ({tabPosts[tab].length})
              </span>
            </button>
          ))}
        </div>

        {/* Post list */}
        {displayPosts.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <p className="text-lg">No posts in {activeTab.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {displayPosts.map((post) => (
              <PostCard key={post.id} post={post} compact />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {icon}
      <div>
        <div className="font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
      </div>
    </div>
  );
}
