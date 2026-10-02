"use client";

import { usePosts } from "@/contexts/PostsContext";
import PostCard from "@/components/PostCard";
import { Construction } from "lucide-react";

export default function LocalIssuesPage() {
  const { getPostsByCategory } = usePosts();
  const issues = getPostsByCategory("Local Issue").filter(
    (p) => p.status !== "Expired" && p.status !== "Flagged"
  );

  return (
    <main className="w-full h-full overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
            <Construction className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Local Issues</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Civic problems, road blocks, infrastructure, drainage and more
            </p>
          </div>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <p className="text-lg">No local issues reported.</p>
            <p className="text-sm mt-2">Your community is doing great!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {issues.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
