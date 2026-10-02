"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { Post, PostCategory, Comment } from "@/types";
import { MOCK_POSTS } from "@/lib/mockData";

interface PostsContextType {
  posts: Post[];
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  getPost: (id: string) => Post | undefined;
  getPostsByCategory: (category: PostCategory) => Post[];
  getPostsByAuthor: (authorId: string) => Post[];
  // Mod 3: mutually exclusive, single-use voting
  upvotePost: (id: string, userId: string) => void;
  downvotePost: (id: string, userId: string) => void;
  verifyPost: (id: string, userId: string) => void;
  reportPost: (id: string, userId: string) => void;
  resolvePost: (id: string) => void;
  addComment: (postId: string, comment: Comment) => void;
  submitClaim: (postId: string, claimantId: string) => void;
  approveClaim: (postId: string) => void;
  searchPosts: (query: string) => Post[];
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  const addPost = (post: Post) => setPosts((prev) => [post, ...prev]);

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deletePost = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));

  const getPost = (id: string) => posts.find((p) => p.id === id);
  const getPostsByCategory = (category: PostCategory) => posts.filter((p) => p.category === category);
  const getPostsByAuthor = (authorId: string) => posts.filter((p) => p.authorId === authorId);

  // ── Mod 3: Fixed upvote/downvote ──
  // Rule: One user can EITHER upvote OR downvote, not both.
  // Voting again on the same button toggles it off.
  const upvotePost = (id: string, userId: string) => {
    const post = getPost(id);
    if (!post) return;

    const alreadyUpvoted = post.upvotedBy.includes(userId);
    const alreadyDownvoted = post.downvotedBy.includes(userId);

    let newUpvotedBy = [...post.upvotedBy];
    let newDownvotedBy = [...post.downvotedBy];
    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;

    if (alreadyUpvoted) {
      // Toggle off upvote
      newUpvotedBy = newUpvotedBy.filter((u) => u !== userId);
      newUpvotes--;
    } else {
      // Remove downvote if exists
      if (alreadyDownvoted) {
        newDownvotedBy = newDownvotedBy.filter((u) => u !== userId);
        newDownvotes--;
      }
      // Add upvote
      newUpvotedBy.push(userId);
      newUpvotes++;
    }

    updatePost(id, { upvotes: newUpvotes, downvotes: newDownvotes, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy });
  };

  const downvotePost = (id: string, userId: string) => {
    const post = getPost(id);
    if (!post) return;

    const alreadyUpvoted = post.upvotedBy.includes(userId);
    const alreadyDownvoted = post.downvotedBy.includes(userId);

    let newUpvotedBy = [...post.upvotedBy];
    let newDownvotedBy = [...post.downvotedBy];
    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;

    if (alreadyDownvoted) {
      // Toggle off downvote
      newDownvotedBy = newDownvotedBy.filter((u) => u !== userId);
      newDownvotes--;
    } else {
      // Remove upvote if exists
      if (alreadyUpvoted) {
        newUpvotedBy = newUpvotedBy.filter((u) => u !== userId);
        newUpvotes--;
      }
      // Add downvote
      newDownvotedBy.push(userId);
      newDownvotes++;
    }

    updatePost(id, { upvotes: newUpvotes, downvotes: newDownvotes, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy });
  };

  const verifyPost = (id: string, userId: string) => {
    const post = getPost(id);
    if (!post || post.verifiedBy.includes(userId)) return;
    const newVerifiedBy = [...post.verifiedBy, userId];
    const newScore = Math.min(100, Math.round((newVerifiedBy.length / (newVerifiedBy.length + 2)) * 100));
    const updates: Partial<Post> = { verifiedBy: newVerifiedBy, verifyScore: newScore };
    if (newScore >= 80 && post.status === "Active") updates.status = "Verified";
    updatePost(id, updates);
  };

  const reportPost = (id: string, userId: string) => {
    const post = getPost(id);
    if (!post || post.reportedBy.includes(userId)) return;
    const newReportedBy = [...post.reportedBy, userId];
    const updates: Partial<Post> = { reportCount: post.reportCount + 1, reportedBy: newReportedBy };
    if (newReportedBy.length >= 5) updates.status = "Flagged";
    updatePost(id, updates);
  };

  const resolvePost = (id: string) => updatePost(id, { status: "Resolved" });

  const addComment = (postId: string, comment: Comment) => {
    const post = getPost(postId);
    if (!post) return;
    updatePost(postId, { comments: [...post.comments, comment] });
  };

  const submitClaim = (postId: string, claimantId: string) => updatePost(postId, { claimStatus: "pending", claimantId });
  const approveClaim = (postId: string) => updatePost(postId, { claimStatus: "claimed", status: "Resolved" });

  const searchPosts = (query: string) => {
    const lower = query.toLowerCase();
    return posts.filter((p) =>
      p.title.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.includes(lower)) ||
      p.location.name.toLowerCase().includes(lower)
    );
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, updatePost, deletePost, getPost, getPostsByCategory, getPostsByAuthor, upvotePost, downvotePost, verifyPost, reportPost, resolvePost, addComment, submitClaim, approveClaim, searchPosts }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within PostsProvider");
  return ctx;
}
