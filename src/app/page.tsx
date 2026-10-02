"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostsContext";
import { useLocation } from "@/contexts/LocationContext";
import PostCard from "@/components/PostCard";
import RightSidebar from "@/components/RightSidebar";
import { filterPostsByHierarchy } from "@/lib/geofencing";
import Link from "next/link";
import {
  PlusSquare,
  AlertTriangle,
  Search,
  Construction,
  MapPin,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { posts } = usePosts();
  const { userLat, userLng, radiusKm, currentGeofence } = useLocation();

  // Mod 5: use hierarchy-based filtering (locality first, then district)
  const nearbyPosts =
    userLat && userLng && user
      ? filterPostsByHierarchy(
          posts,
          userLat,
          userLng,
          user.district,
          radiusKm * 1000
        )
      : posts;

  // Only show active, non-expired, non-flagged posts
  const feedPosts = nearbyPosts.filter(
    (p) => p.status !== "Expired" && p.status !== "Flagged" && p.status !== "Draft"
  );

  const greeting = getGreeting();

  return (
    <>
      {/* Center Feed */}
      <main
        className="w-full lg:w-[65%] xl:w-[70%] h-full overflow-y-auto"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-2xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <header className="mb-8">
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {greeting}, {user?.name} — What&apos;s happening around your
              community?
            </h1>
            {currentGeofence && (
              <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <MapPin className="w-4 h-4" style={{ color: "var(--primary)" }} />
                {currentGeofence.name} · Pincode {currentGeofence.pincode} ·{" "}
                {feedPosts.length} active posts nearby
              </p>
            )}
          </header>

          {/* Quick Actions */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <QuickAction
              href="/create"
              title="Share Information"
              icon={<PlusSquare className="w-4 h-4" />}
              color="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800"
            />
            <QuickAction
              href="/create?cat=Emergency"
              title="Emergency"
              icon={<AlertTriangle className="w-4 h-4" />}
              color="bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
            />
            <QuickAction
              href="/lost-found"
              title="Lost & Found"
              icon={<Search className="w-4 h-4" />}
              color="bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800"
            />
            <QuickAction
              href="/local-issues"
              title="Report Issue"
              icon={<Construction className="w-4 h-4" />}
              color="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800"
            />
          </div>

          {/* Feed */}
          <div className="space-y-6 mt-8">
            {feedPosts.length === 0 ? (
              <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
                <p className="text-lg">No posts nearby.</p>
                <p className="text-sm mt-2">
                  Try increasing your radius or be the first to share!
                </p>
              </div>
            ) : (
              feedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />
    </>
  );
}

function QuickAction({
  title,
  color,
  href,
  icon,
}: {
  title: string;
  color: string;
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap px-4 py-2.5 rounded-full font-medium text-sm border transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 ${color}`}
    >
      {icon}
      {title}
    </Link>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
