// ── Post lifecycle statuses (from PRD §15) ──
export type PostStatus =
  | "Draft"
  | "Active"
  | "Under Review"
  | "Verified"
  | "Updated"
  | "Flagged"
  | "Resolved"
  | "Expired";

export type PostCategory =
  | "Local Issue"
  | "Emergency"
  | "Internship"
  | "Lost & Found"
  | "Event"
  | "Scholarship"
  | "Announcement";

export type UrgencyLevel = "Normal" | "Important" | "Urgent" | "Emergency";

// ── User ──
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  community: string;
  organization?: string;
  // District-based geofencing (Mod 5)
  address: string;
  city: string;
  district: string;
  pincode: string;
  trustScore: number;
  postsShared: number;
  verified: number;
  helpfulContributions: number;
  badges: string[];
  following: string[];
  saved: string[];
}

// ── Post ──
export interface Post {
  id: string;
  authorId: string;
  category: PostCategory;
  urgency: UrgencyLevel;
  title: string;
  description: string;
  location: {
    name: string;
    lat: number;
    lng: number;
    pincode: string;
    district: string;
    fuzzed?: boolean;
  };
  status: PostStatus;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  imageUrl?: string;

  // Engagement — Mod 3: track who voted
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  views: number;
  comments: Comment[];
  repostCount: number;
  shareCount: number;

  // Verification
  verifyScore: number;
  verifiedBy: string[];

  // Reports
  reportCount: number;
  reportedBy: string[];

  // Lost & Found specific (FR-10)
  claimChallenge?: string;
  claimStatus?: "unclaimed" | "pending" | "claimed";
  claimantId?: string;
}

// ── Comment ──
export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  isOfficialReply: boolean;
  replies: Comment[];
}

// ── Notification ──
export interface Notification {
  id: string;
  type:
    | "verified"
    | "update_suggested"
    | "emergency"
    | "report_reviewed"
    | "expiring"
    | "update_accepted"
    | "claim_request";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  postId?: string;
}

// ── Geofence ──
export interface GeoFence {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number;
  pincode: string;
  district: string;
  type: "locality" | "district";
}

// ── AI Pipeline output ──
export interface StructuredPostData {
  title: string;
  category: PostCategory;
  urgency: UrgencyLevel;
  description: string;
  entities: string[];
  tags: string[];
  toxicityScore: number;
  safetyScore: number;
  language: string;
}

// ── District definition ──
export interface District {
  name: string;
  center: { lat: number; lng: number };
  radius: number; // metres
  localities: string[];
}
