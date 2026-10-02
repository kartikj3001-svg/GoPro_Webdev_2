"use client";

import { ArrowUp, Calendar, AlertTriangle, ShieldCheck, MapPin } from "lucide-react";
import { usePosts } from "@/contexts/PostsContext";
import { useLocation } from "@/contexts/LocationContext";
import { CATEGORY_CONFIG } from "@/lib/categories";
import Link from "next/link";

export default function RightSidebar() {
  const { posts } = usePosts();
  const { currentGeofence, radiusKm } = useLocation();

  const emergencies = posts.filter((p) => p.category === "Emergency" && p.status !== "Resolved" && p.status !== "Expired");
  const resolvedThisWeek = posts.filter((p) => p.status === "Resolved");
  const verifiedCount = posts.filter((p) => p.status === "Verified").length;
  const trustPercent = posts.length > 0 ? Math.round((verifiedCount / posts.length) * 100) : 0;

  // Top trending = highest engagement
  const trending = [...posts]
    .sort((a, b) => (b.upvotes + b.views) - (a.upvotes + a.views))
    .slice(0, 4);

  // Upcoming events
  const events = posts.filter((p) => p.category === "Event" && p.status !== "Expired");

  return (
    <aside
      className="hidden lg:block w-[35%] xl:w-[30%] h-full overflow-y-auto border-l p-6"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="space-y-8">
        {/* Community Pulse */}
        <section>
          <h2
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ring-4 ring-green-100 dark:ring-green-900/40" />
            Community Pulse
          </h2>
          <div className="space-y-3">
            <PulseCard
              icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
              title={`${emergencies.length} Active Emergencies`}
              sub={`in your ${radiusKm}km radius`}
            />
            <PulseCard
              icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
              title={`${resolvedThisWeek.length} Resolved Issues`}
              sub="this week"
            />
            <PulseCard
              icon={<ShieldCheck className="w-4 h-4 text-indigo-500" />}
              title={`${trustPercent}% Trust Score`}
              sub="Community average"
            />
            {currentGeofence && (
              <PulseCard
                icon={<MapPin className="w-4 h-4 text-purple-500" />}
                title={`Zone: ${currentGeofence.name}`}
                sub={`Pincode ${currentGeofence.pincode}`}
              />
            )}
          </div>
        </section>

        {/* Trending Near You */}
        <section>
          <h2
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <ArrowUp className="w-5 h-5" style={{ color: "var(--primary)" }} />
            Trending Near You
          </h2>
          <div className="space-y-2">
            {trending.map((post) => {
              const cat = CATEGORY_CONFIG[post.category];
              return (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="flex flex-col p-3 rounded-lg cursor-pointer transition-colors group"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: cat.hex }}
                  >
                    {post.category}
                  </span>
                  <span
                    className="font-medium transition-colors text-sm group-hover:opacity-80"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {post.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Upcoming Events */}
        {events.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold mb-4 flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Events
            </h2>
            <div className="space-y-3">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/post/${ev.id}`}
                  className="block p-4 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ev.title}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ev.location.name}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}

function PulseCard({
  title,
  sub,
  icon,
}: {
  title: string;
  sub: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="p-4 rounded-xl border transition-colors"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div
          className="font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </div>
      </div>
      <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
        {sub}
      </div>
    </div>
  );
}
