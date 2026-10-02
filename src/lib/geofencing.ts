/**
 * Geofencing — PRD §4.2 — UPDATED for district-based boundaries (Mod 5)
 *
 * Notification hierarchy:
 *   1. Locality level (same area, e.g. Bhayandar West) — highest priority
 *   2. District level (same district, e.g. Thane) — medium priority
 *   3. Cross-district emergencies — lowest, emergency-only
 */

import type { GeoFence, Post, District } from "@/types";

const EARTH_RADIUS_M = 6_371_000;

// ── Haversine distance ──
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinRadius(userLat: number, userLng: number, postLat: number, postLng: number, radiusMetres: number): boolean {
  return haversineDistance(userLat, userLng, postLat, postLng) <= radiusMetres;
}

// ── Privacy coordinate fuzzing (FR-07) ──
export function fuzzCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  const distance = 250 + Math.random() * 250;
  const bearing = Math.random() * 2 * Math.PI;
  const dLat = (distance * Math.cos(bearing)) / EARTH_RADIUS_M;
  const dLng = (distance * Math.sin(bearing)) / (EARTH_RADIUS_M * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + (dLat * 180) / Math.PI, lng: lng + (dLng * 180) / Math.PI };
}

// ── District definitions (Mod 5) ──
export const DISTRICTS: District[] = [
  {
    name: "Thane",
    center: { lat: 19.2183, lng: 72.9781 },
    radius: 25000,
    localities: ["Bhayandar West", "Bhayandar East", "Mira Road", "Thane City", "Naupada", "Ghodbunder"],
  },
  {
    name: "Mumbai Suburban",
    center: { lat: 19.1726, lng: 72.8561 },
    radius: 20000,
    localities: ["Borivali", "Dahisar", "Andheri", "Goregaon", "Malad", "Kandivali", "DBIT Campus"],
  },
  {
    name: "Mumbai City",
    center: { lat: 18.975, lng: 72.8258 },
    radius: 15000,
    localities: ["Fort", "Colaba", "Dadar", "Parel", "Worli", "Bandra"],
  },
];

// ── Locality geofences ──
export const GEOFENCES: GeoFence[] = [
  // Thane District
  { id: "gf-1", name: "Bhayandar West", center: { lat: 19.296, lng: 72.847 }, radius: 3000, pincode: "401101", district: "Thane", type: "locality" },
  { id: "gf-2", name: "Mira Road", center: { lat: 19.2812, lng: 72.8654 }, radius: 3000, pincode: "401107", district: "Thane", type: "locality" },
  { id: "gf-6", name: "Thane City", center: { lat: 19.2183, lng: 72.9781 }, radius: 4000, pincode: "400601", district: "Thane", type: "locality" },
  // Mumbai Suburban District
  { id: "gf-3", name: "DBIT Campus", center: { lat: 19.2458, lng: 72.8563 }, radius: 1500, pincode: "400070", district: "Mumbai Suburban", type: "locality" },
  { id: "gf-4", name: "Dahisar", center: { lat: 19.2588, lng: 72.8609 }, radius: 2500, pincode: "400068", district: "Mumbai Suburban", type: "locality" },
  { id: "gf-5", name: "Borivali", center: { lat: 19.2307, lng: 72.8567 }, radius: 3000, pincode: "400092", district: "Mumbai Suburban", type: "locality" },
  // District-level geofences
  { id: "gf-d1", name: "Thane District", center: { lat: 19.2183, lng: 72.9781 }, radius: 25000, pincode: "", district: "Thane", type: "district" },
  { id: "gf-d2", name: "Mumbai Suburban District", center: { lat: 19.1726, lng: 72.8561 }, radius: 20000, pincode: "", district: "Mumbai Suburban", type: "district" },
  { id: "gf-d3", name: "Mumbai City District", center: { lat: 18.975, lng: 72.8258 }, radius: 15000, pincode: "", district: "Mumbai City", type: "district" },
];

export function findGeofence(lat: number, lng: number): GeoFence | undefined {
  // Prefer locality-level geofence
  return GEOFENCES.find((gf) => gf.type === "locality" && isWithinRadius(lat, lng, gf.center.lat, gf.center.lng, gf.radius));
}

export function findDistrict(lat: number, lng: number): string | undefined {
  const gf = GEOFENCES.find((g) => g.type === "district" && isWithinRadius(lat, lng, g.center.lat, g.center.lng, g.radius));
  return gf?.district;
}

export function getDistrictForLocality(localityName: string): string | undefined {
  for (const d of DISTRICTS) {
    if (d.localities.includes(localityName)) return d.name;
  }
  return undefined;
}

// ── Notification hierarchy (Mod 5) ──
// Priority 1: Same locality (nearby alerts)
// Priority 2: Same district
// Priority 3: Cross-district emergencies only
export function filterPostsByHierarchy(
  posts: Post[],
  userLat: number,
  userLng: number,
  userDistrict: string,
  radiusMetres: number = 5000
): Post[] {
  const nearby: Post[] = [];
  const districtLevel: Post[] = [];
  const crossDistrictEmergencies: Post[] = [];

  for (const p of posts) {
    if (p.status === "Expired" || p.status === "Flagged" || p.status === "Draft") continue;

    const dist = haversineDistance(userLat, userLng, p.location.lat, p.location.lng);

    if (dist <= radiusMetres) {
      // Priority 1: nearby
      nearby.push(p);
    } else if (p.location.district === userDistrict) {
      // Priority 2: same district
      districtLevel.push(p);
    } else if (p.category === "Emergency" && p.urgency === "Emergency") {
      // Priority 3: cross-district emergencies only
      crossDistrictEmergencies.push(p);
    }
  }

  return [...nearby, ...districtLevel, ...crossDistrictEmergencies];
}

export function filterPostsByRadius(posts: Post[], userLat: number, userLng: number, radiusMetres: number = 5000): Post[] {
  return posts.filter((p) => isWithinRadius(userLat, userLng, p.location.lat, p.location.lng, radiusMetres));
}

export function filterPostsByPincode(posts: Post[], pincode: string): Post[] {
  return posts.filter((p) => p.location.pincode === pincode);
}

export function filterPostsByDistrict(posts: Post[], district: string): Post[] {
  return posts.filter((p) => p.location.district === district);
}

export function applyPrivacyFuzzing(post: Post): Post {
  if (post.category === "Lost & Found") {
    const fuzzed = fuzzCoordinates(post.location.lat, post.location.lng);
    return { ...post, location: { ...post.location, lat: fuzzed.lat, lng: fuzzed.lng, fuzzed: true } };
  }
  return post;
}

export function getDistanceLabel(userLat: number, userLng: number, postLat: number, postLng: number): string {
  const d = haversineDistance(userLat, userLng, postLat, postLng);
  if (d < 1000) return `${Math.round(d)}m away`;
  return `${(d / 1000).toFixed(1)}km away`;
}
