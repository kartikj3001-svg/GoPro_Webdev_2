"use client";

import { useEffect, useRef } from "react";
import type { Post } from "@/types";
import { CATEGORY_CONFIG } from "@/lib/categories";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  posts: Post[];
  center?: [number, number];
  zoom?: number;
  radiusKm?: number;
  className?: string;
}

export default function MapView({
  posts,
  center = [19.296, 72.847],
  zoom = 13,
  radiusKm = 5,
  className = "w-full h-[500px]",
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current).setView(center, zoom);
    mapRef.current = map;

    // OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Radius circle (geofence visualization)
    L.circle(center, {
      radius: radiusKm * 1000,
      color: "#7c3aed",
      fillColor: "#7c3aed",
      fillOpacity: 0.06,
      weight: 2,
      dashArray: "8 4",
    }).addTo(map);

    // User location marker
    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#7c3aed;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(124,58,237,0.5);"></div>`,
      iconSize: [16, 16],
      className: "",
    });
    L.marker(center, { icon: userIcon })
      .addTo(map)
      .bindPopup("<strong>You are here</strong>");

    // Post markers
    posts.forEach((post) => {
      const catConfig = CATEGORY_CONFIG[post.category];
      const markerIcon = L.divIcon({
        html: `<div style="
          width:32px;height:32px;
          background:${catConfig.hex};
          border:3px solid white;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;color:white;font-weight:bold;
          box-shadow:0 2px 8px rgba(0,0,0,0.2);
          cursor:pointer;
        ">${catConfig.markerSymbol}</div>`,
        iconSize: [32, 32],
        className: "",
      });

      L.marker([post.location.lat, post.location.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:180px;">
            <div style="font-size:10px;color:${catConfig.hex};font-weight:600;text-transform:uppercase;margin-bottom:4px;">${post.category}</div>
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${post.title}</div>
            <div style="font-size:12px;color:#64748b;">${post.location.name}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">
              ${post.verifyScore}% Verified · ${post.status}
              ${post.location.fuzzed ? ' · Fuzzed' : ''}
            </div>
            <a href="/post/${post.id}" style="color:#7c3aed;font-size:12px;font-weight:600;display:block;margin-top:6px;">View Details →</a>
          </div>`
        );
    });

    // Force a size recalculation
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [posts, center, zoom, radiusKm]);

  return <div ref={containerRef} className={`${className} rounded-xl overflow-hidden border`} style={{ borderColor: "var(--border-color)" }} />;
}
