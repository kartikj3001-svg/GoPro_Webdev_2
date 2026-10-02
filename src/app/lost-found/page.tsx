"use client";

import { useState } from "react";
import { usePosts } from "@/contexts/PostsContext";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/PostCard";
import { Lock, Send, CheckCircle, Search, KeyRound } from "lucide-react";

export default function LostFoundPage() {
  const { user } = useAuth();
  const { getPostsByCategory, submitClaim, approveClaim } = usePosts();
  const posts = getPostsByCategory("Lost & Found").filter(
    (p) => p.status !== "Expired" && p.status !== "Flagged"
  );

  const [claimingPostId, setClaimingPostId] = useState<string | null>(null);
  const [claimAnswer, setClaimAnswer] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  const handleSubmitClaim = (postId: string) => {
    if (!user || !claimAnswer.trim()) return;
    submitClaim(postId, user.id);
    setClaimSubmitted(true);
    setTimeout(() => {
      setClaimingPostId(null);
      setClaimAnswer("");
      setClaimSubmitted(false);
    }, 2000);
  };

  return (
    <main className="w-full h-full overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
            <Search className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Lost & Found
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              FR-10: Blind Handshake claim workflow — secure challenge-response
              verification
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-400 text-sm">
                Privacy-Protected Claims
              </h3>
              <p className="text-xs text-orange-700 dark:text-orange-500 mt-1">
                All Lost & Found posts have coordinates fuzzed by 250–500m
                (FR-07). To claim an item, you must answer the finder&apos;s
                challenge question. The anonymous chat only unlocks upon
                approval.
              </p>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <p className="text-lg">No lost or found items.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <div key={post.id}>
                <PostCard post={post} />

                {/* Claim section */}
                {post.claimChallenge && post.claimStatus !== "claimed" && (
                  <div className="mt-2 ml-4 mr-4 mb-4">
                    {claimingPostId === post.id ? (
                      <div
                        className="p-4 rounded-xl border space-y-3"
                        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          <Lock className="w-4 h-4" style={{ color: "var(--primary)" }} />
                          Challenge Question:
                        </div>
                        <p
                          className="text-sm p-3 rounded-lg"
                          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                        >
                          {post.claimChallenge}
                        </p>

                        {claimSubmitted ? (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Claim submitted! Waiting for finder approval...
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={claimAnswer}
                              onChange={(e) => setClaimAnswer(e.target.value)}
                              placeholder="Your answer..."
                              className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                            />
                            <button
                              onClick={() => handleSubmitClaim(post.id)}
                              disabled={!claimAnswer.trim()}
                              className="px-4 py-2 text-white text-sm rounded-lg disabled:opacity-50 flex items-center gap-2"
                              style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
                            >
                              <Send className="w-4 h-4" />
                              Submit
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setClaimingPostId(null);
                            setClaimAnswer("");
                          }}
                          className="text-xs" style={{ color: "var(--text-muted)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setClaimingPostId(post.id)}
                        className="w-full py-2.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 font-medium text-sm rounded-xl hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        This is mine — Submit Claim
                      </button>
                    )}

                    {/* Finder approval (for post author) */}
                    {post.claimStatus === "pending" &&
                      post.authorId === user?.id && (
                        <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                          <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium mb-2">
                            Someone has submitted a claim for this item!
                          </p>
                          <button
                            onClick={() => approveClaim(post.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve Claim
                          </button>
                        </div>
                      )}
                  </div>
                )}

                {post.claimStatus === "claimed" && (
                  <div className="mt-2 ml-4 mr-4 mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Item successfully claimed and returned!
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
