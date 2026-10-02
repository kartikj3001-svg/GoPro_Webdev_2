"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { findGeofence, GEOFENCES } from "@/lib/geofencing";
import type { GeoFence } from "@/types";

interface LocationContextType {
  userLat: number | null;
  userLng: number | null;
  currentGeofence: GeoFence | null;
  locationError: string | null;
  isLocating: boolean;
  radiusKm: number;
  setRadiusKm: (r: number) => void;
  refreshLocation: () => void;
  geofences: GeoFence[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default to Bhayandar West for demo purposes
const DEFAULT_LAT = 19.296;
const DEFAULT_LNG = 72.847;

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLat, setUserLat] = useState<number | null>(DEFAULT_LAT);
  const [userLng, setUserLng] = useState<number | null>(DEFAULT_LNG);
  const [currentGeofence, setCurrentGeofence] = useState<GeoFence | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation API not available. Using default location.");
      setUserLat(DEFAULT_LAT);
      setUserLng(DEFAULT_LNG);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationError(null);
        setIsLocating(false);

        const gf = findGeofence(pos.coords.latitude, pos.coords.longitude);
        setCurrentGeofence(gf ?? null);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location permission denied. Falling back to Pincode view (FR-05)."
            : `Location error: ${err.message}`
        );
        // FR-05 fallback: use default static location
        setUserLat(DEFAULT_LAT);
        setUserLng(DEFAULT_LNG);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Initial location fetch
  useEffect(() => {
    // Set default geofence
    const gf = findGeofence(DEFAULT_LAT, DEFAULT_LNG);
    setCurrentGeofence(gf ?? null);
    refreshLocation();
  }, [refreshLocation]);

  return (
    <LocationContext.Provider
      value={{
        userLat,
        userLng,
        currentGeofence,
        locationError,
        isLocating,
        radiusKm,
        setRadiusKm,
        refreshLocation,
        geofences: GEOFENCES,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx)
    throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
