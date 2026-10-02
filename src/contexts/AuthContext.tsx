"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@/types";
import { MOCK_USERS } from "@/lib/mockData";
import { getDistrictForLocality } from "@/lib/geofencing";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  loginWithOtp: (email: string, otp: string) => { success: boolean; error?: string };
  sendOtp: (email: string) => { success: boolean; otp?: string; error?: string };
  register: (userData: Partial<User>) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  pendingOtp: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("locult_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("locult_user"); }
    }
  }, []);

  const login = (email: string, password: string) => {
    const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem("locult_user", JSON.stringify(found));
      return { success: true };
    }
    // Also check dynamically registered users
    const stored = localStorage.getItem("locult_registered_users");
    if (stored) {
      const users: User[] = JSON.parse(stored);
      const found2 = users.find((u) => u.email === email && u.password === password);
      if (found2) {
        setUser(found2);
        localStorage.setItem("locult_user", JSON.stringify(found2));
        return { success: true };
      }
    }
    return { success: false, error: "Invalid email or password" };
  };

  // Mod 6: OTP-based login
  const sendOtp = (email: string) => {
    const allUsers = [...MOCK_USERS];
    const stored = localStorage.getItem("locult_registered_users");
    if (stored) allUsers.push(...JSON.parse(stored));

    const found = allUsers.find((u) => u.email === email);
    if (!found) return { success: false, error: "No account found with this email" };

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setPendingOtp(otp);

    // In production, send via email service (see OTP_SETUP_INSTRUCTIONS)
    // For demo, we return it so it can be shown to the user
    console.log(`[LoCult OTP] Code for ${email}: ${otp}`);
    return { success: true, otp };
  };

  const loginWithOtp = (email: string, otp: string) => {
    if (!pendingOtp || otp !== pendingOtp) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    const allUsers = [...MOCK_USERS];
    const stored = localStorage.getItem("locult_registered_users");
    if (stored) allUsers.push(...JSON.parse(stored));

    const found = allUsers.find((u) => u.email === email);
    if (!found) return { success: false, error: "No account found" };

    setUser(found);
    localStorage.setItem("locult_user", JSON.stringify(found));
    setPendingOtp(null);
    return { success: true };
  };

  // Mod 5: Registration with address, city, district
  const register = (userData: Partial<User>) => {
    if (!userData.email || !userData.name || !userData.district || !userData.city) {
      return { success: false, error: "Name, email, city, and district are required" };
    }

    const allUsers = [...MOCK_USERS];
    const stored = localStorage.getItem("locult_registered_users");
    if (stored) allUsers.push(...JSON.parse(stored));

    if (allUsers.find((u) => u.email === userData.email)) {
      return { success: false, error: "An account with this email already exists" };
    }

    const community = userData.city || userData.district || "Unknown";

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: userData.name!,
      email: userData.email!,
      password: userData.password || "demo123",
      community,
      organization: userData.organization || "",
      address: userData.address || "",
      city: userData.city!,
      district: userData.district!,
      pincode: userData.pincode || "",
      trustScore: 10,
      postsShared: 0,
      verified: 0,
      helpfulContributions: 0,
      badges: [],
      following: [],
      saved: [],
    };

    // Save to localStorage registry
    const existing: User[] = stored ? JSON.parse(stored) : [];
    existing.push(newUser);
    localStorage.setItem("locult_registered_users", JSON.stringify(existing));

    setUser(newUser);
    localStorage.setItem("locult_user", JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("locult_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem("locult_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithOtp, sendOtp, register, logout, updateUser, pendingOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
