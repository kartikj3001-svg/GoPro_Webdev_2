"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePosts } from "@/contexts/PostsContext";
import { useLocation } from "@/contexts/LocationContext";
import { AlertTriangle, MapPin, CloudRain } from "lucide-react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Dynamic import for Leaflet (no SSR)
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface RainfallData {
  Year: string;
  Total: number;
}

export default function EmergencyMapPage() {
  const { posts } = usePosts();
  const { userLat, userLng, radiusKm, currentGeofence } = useLocation();
  const [rainfallData, setRainfallData] = useState<RainfallData[]>([]);

  useEffect(() => {
    fetch("/mumbai-monthly-rains.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data
              .map((row: any) => ({
                Year: String(row.Year),
                Total: row.Total || 0,
              }))
              .filter((row: any) => row.Year && row.Total > 0);
            setRainfallData(parsed);
          },
        });
      })
      .catch((err) => console.error("Error fetching rainfall data:", err));
  }, []);

  // Filter to only active emergencies and urgent posts
  const emergencyPosts = posts.filter(
    (p) =>
      p.status !== "Expired" &&
      p.status !== "Flagged" &&
      p.status !== "Draft" &&
      (p.category === "Emergency" || p.urgency === "Emergency" || p.urgency === "Urgent")
  );

  const allActivePosts = posts.filter(
    (p) => p.status !== "Expired" && p.status !== "Flagged" && p.status !== "Draft"
  );

  return (
    <main className="w-full h-full overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Emergency Map
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              All nearby emergencies pinned on one map
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div
            className="p-4 rounded-xl border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="text-2xl font-bold text-red-500">{emergencyPosts.length}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Active Emergencies</div>
          </div>
          <div
            className="p-4 rounded-xl border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{allActivePosts.length}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Total Active Posts</div>
          </div>
          <div
            className="p-4 rounded-xl border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="text-2xl font-bold text-green-500">{radiusKm}km</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Current Radius</div>
          </div>
        </div>

        {currentGeofence && (
          <div
            className="mb-4 p-3 rounded-xl border flex items-center gap-2 text-sm"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <MapPin className="w-4 h-4" style={{ color: "var(--primary)" }} />
            Your zone: {currentGeofence.name} · Pincode {currentGeofence.pincode} · District {currentGeofence.district}
          </div>
        )}

        {/* Map with all posts — emergencies highlighted */}
        <MapView
          posts={allActivePosts}
          center={
            userLat && userLng ? [userLat, userLng] : [19.296, 72.847]
          }
          radiusKm={radiusKm}
          className="w-full h-[600px]"
        />

        {/* Mumbai Rainfall Historical Data Context */}
        {rainfallData.length > 0 && (
          <div className="mt-8 p-6 rounded-2xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <CloudRain className="w-5 h-5 text-blue-500" />
              Historical Rainfall Context (Mumbai)
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Total annual rainfall tracking from 1901 onwards. Identifying historical flood risks.
            </p>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rainfallData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="Year" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "var(--text-primary)" }}
                  />
                  <Area type="monotone" dataKey="Total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Emergency list below map */}
        {emergencyPosts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Active Emergencies ({emergencyPosts.length})
            </h2>
            <div className="space-y-3">
              {emergencyPosts.map((post) => (
                <a
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="block p-4 rounded-xl border transition-colors hover:shadow-md"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {post.title}
                      </div>
                      <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        <MapPin className="w-3.5 h-3.5 inline mr-1" />
                        {post.location.name}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800 shrink-0">
                      {post.urgency}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
