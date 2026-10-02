"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, SlidersHorizontal, MapIcon, LayoutList } from "lucide-react";
import { usePosts } from "@/contexts/PostsContext";
import { useLocation } from "@/contexts/LocationContext";
import PostCard from "@/components/PostCard";
import { ALL_CATEGORIES, CATEGORY_CONFIG } from "@/lib/categories";
import { filterPostsByRadius } from "@/lib/geofencing";
import type { PostCategory } from "@/types";

// Dynamic import for Leaflet (no SSR)
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type SortOption = "relevant" | "newest" | "verified" | "nearby" | "expiring";

export default function DiscoverPage() {
  const { posts, searchPosts } = usePosts();
  const { userLat, userLng, radiusKm, setRadiusKm } = useLocation();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "All">("All");
  const [sort, setSort] = useState<SortOption>("relevant");
  const [viewMode, setViewMode] = useState<"feed" | "map">("feed");
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredPosts = useMemo(() => {
    let result = query ? searchPosts(query) : [...posts];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (verifiedOnly) {
      result = result.filter((p) => p.status === "Verified");
    }

    result = result.filter(
      (p) => p.status !== "Expired" && p.status !== "Flagged" && p.status !== "Draft"
    );

    switch (sort) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "verified":
        result.sort((a, b) => b.verifyScore - a.verifyScore);
        break;
      case "nearby":
        if (userLat && userLng) {
          result = filterPostsByRadius(result, userLat, userLng, radiusKm * 1000);
        }
        break;
      case "expiring":
        result.sort((a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime());
        break;
      default:
        result.sort((a, b) => b.upvotes + b.verifyScore + b.views - (a.upvotes + a.verifyScore + a.views));
    }

    return result;
  }, [posts, query, selectedCategory, sort, verifiedOnly, userLat, userLng, radiusKm, searchPosts]);

  return (
    <main className="w-full h-full overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Discover</h1>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search keywords, locations, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border outline-none transition-all text-lg"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
          <CategoryChip
            label="All"
            active={selectedCategory === "All"}
            onClick={() => setSelectedCategory("All")}
          />
          {ALL_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              color={CATEGORY_CONFIG[cat].hex}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg border text-sm outline-none"
            >
              <option value="relevant">Most Relevant</option>
              <option value="newest">Newest</option>
              <option value="verified">Most Verified</option>
              <option value="nearby">Nearby</option>
              <option value="expiring">Expiring Soon</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                showFilters
                  ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400"
                  : ""
              }`}
              style={!showFilters ? { borderColor: "var(--border-color)", color: "var(--text-secondary)" } : undefined}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* View toggle */}
          <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
            <button
              onClick={() => setViewMode("feed")}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                viewMode === "feed" ? "text-white" : ""
              }`}
              style={
                viewMode === "feed"
                  ? { background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }
                  : { backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }
              }
            >
              <LayoutList className="w-4 h-4" />
              Feed
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                viewMode === "map" ? "text-white" : ""
              }`}
              style={
                viewMode === "map"
                  ? { background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }
                  : { backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }
              }
            >
              <MapIcon className="w-4 h-4" />
              Map
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div
            className="mb-6 p-4 rounded-xl border flex items-center gap-6 flex-wrap"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Verified Only
            </label>

            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span>Radius:</span>
              <input
                type="range"
                min={1}
                max={20}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-32 accent-indigo-600"
              />
              <span className="font-medium">{radiusKm}km</span>
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""} found
        </p>

        {/* Content */}
        {viewMode === "map" ? (
          <MapView
            posts={filteredPosts}
            center={userLat && userLng ? [userLat, userLng] : [19.296, 72.847]}
            radiusKm={radiusKm}
            className="w-full h-[600px]"
          />
        ) : (
          <div className="space-y-5">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
                <p className="text-lg">No posts match your filters.</p>
                <p className="text-sm mt-2">Try broadening your search or adjusting filters.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function CategoryChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? "text-white shadow-md scale-105"
          : "border"
      }`}
      style={
        active
          ? { backgroundColor: color ?? "var(--primary)" }
          : { borderColor: "var(--border-color)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }
      }
    >
      {label}
    </button>
  );
}
