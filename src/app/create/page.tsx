"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, MicOff, ShieldAlert, Sparkles, Eye, Send, AlertTriangle, ShieldCheck, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostsContext";
import { useLocation } from "@/contexts/LocationContext";
import { startVoiceTranscription, processText, checkToxicity } from "@/lib/aiPipeline";
import { CATEGORY_CONFIG, ALL_CATEGORIES } from "@/lib/categories";
import { GEOFENCES } from "@/lib/geofencing";
import type { PostCategory, UrgencyLevel, Post } from "@/types";

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { addPost } = usePosts();
  const { userLat, userLng, currentGeofence } = useLocation();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PostCategory>(
    (searchParams.get("cat") as PostCategory) || "Announcement"
  );
  const [urgency, setUrgency] = useState<UrgencyLevel>("Normal");
  const [locationName, setLocationName] = useState(currentGeofence?.name ?? "");
  const [validUntil, setValidUntil] = useState("");
  const [tags, setTags] = useState("");

  // AI state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRef, setVoiceRef] = useState<{ stop: () => void } | null>(null);
  const [toxicityResult, setToxicityResult] = useState<{
    score: number;
    flagged: boolean;
    reasons: string[];
    safetyScore: number;
    safetyReasons: string[];
    isEmergency: boolean;
  } | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: PostCategory;
    urgency: UrgencyLevel;
    confidence: number;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Run AI pipeline when description changes
  useEffect(() => {
    if (description.length < 10) {
      setToxicityResult(null);
      setAiSuggestion(null);
      return;
    }

    const timer = setTimeout(() => {
      // FR-02: Toxicity check (Mod 4 — context-aware)
      const tox = checkToxicity(description);
      setToxicityResult(tox);

      // FR-03: Auto-categorize
      const result = processText(description);
      setAiSuggestion({
        category: result.category,
        urgency: result.urgency,
        confidence: 0.85,
      });

      // Auto-fill title if empty
      if (!title && result.title) {
        setTitle(result.title);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  // FR-01: Voice Input
  const toggleVoice = () => {
    if (isRecording && voiceRef) {
      voiceRef.stop();
      setIsRecording(false);
      setVoiceRef(null);
      return;
    }

    const ref = startVoiceTranscription(
      (text) => {
        setDescription((prev) => (prev ? prev + " " + text : text));
        setIsRecording(false);
        setVoiceRef(null);
      },
      (err) => {
        alert(err);
        setIsRecording(false);
        setVoiceRef(null);
      },
      "en-IN"
    );

    if (ref) {
      setIsRecording(true);
      setVoiceRef(ref);
    }
  };

  const acceptAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
      setUrgency(aiSuggestion.urgency);
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    if (toxicityResult?.flagged) {
      alert("Post rejected: toxicity score >= 0.80. Please revise your content.");
      return;
    }

    setPublishing(true);
    await new Promise((r) => setTimeout(r, 800));

    // Find geofence data for selected location
    const selectedGf = GEOFENCES.find((gf) => gf.name === locationName);

    const newPost: Post = {
      id: `p-${Date.now()}`,
      authorId: user.id,
      category,
      urgency,
      title,
      description,
      location: {
        name: locationName || currentGeofence?.name || "Unknown",
        lat: selectedGf?.center.lat ?? userLat ?? 19.296,
        lng: selectedGf?.center.lng ?? userLng ?? 72.847,
        pincode: selectedGf?.pincode || currentGeofence?.pincode || "401101",
        district: selectedGf?.district || user.district || "Thane",
      },
      status: "Active",
      validUntil: validUntil || new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      views: 0,
      comments: [],
      repostCount: 0,
      shareCount: 0,
      verifyScore: 0,
      verifiedBy: [],
      reportCount: 0,
      reportedBy: [],
      ...(category === "Lost & Found" && {
        claimChallenge: "Describe the item in detail to verify ownership.",
        claimStatus: "unclaimed" as const,
      }),
    };

    addPost(newPost);
    setPublishing(false);
    router.push("/");
  };

  const catConfig = CATEGORY_CONFIG[category];

  return (
    <main className="w-full h-full overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
          Share Information
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Column */}
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's happening?"
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
              />
            </div>

            {/* Category + Urgency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PostCategory)}
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            {/* Description + Voice (FR-01) */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Description
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the situation in detail..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none"
                />
                <button
                  onClick={toggleVoice}
                  className={`absolute bottom-3 right-3 p-2.5 rounded-full transition-all ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200"
                      : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400"
                  }`}
                  title="Voice Input (FR-01: Bhashini ASR)"
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </div>
              {isRecording && (
                <p className="text-xs text-red-500 mt-1 animate-pulse flex items-center gap-1">
                  <Mic className="w-3 h-3" /> Listening... speak now (Web Speech API)
                </p>
              )}
            </div>

            {/* AI Pipeline Feedback — Mod 4: Shows toxicity AND safety separately */}
            {toxicityResult && (
              <div
                className={`p-4 rounded-xl border ${
                  toxicityResult.flagged
                    ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                    : "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert
                    className={`w-4 h-4 ${toxicityResult.flagged ? "text-red-600" : "text-green-600"}`}
                  />
                  <span
                    className={`text-sm font-semibold ${toxicityResult.flagged ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}
                  >
                    Toxicity: {(toxicityResult.score * 100).toFixed(0)}%
                    {toxicityResult.flagged
                      ? " — BLOCKED (FR-02)"
                      : " — Content Safe"}
                  </span>
                </div>
                {toxicityResult.reasons.length > 0 && (
                  <ul className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
                    {toxicityResult.reasons.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                )}

                {/* Safety score — separate from toxicity */}
                {toxicityResult.safetyScore > 0 && (
                  <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                        Safety Alert: {(toxicityResult.safetyScore * 100).toFixed(0)}% — Contains urgent safety information
                      </span>
                    </div>
                    {toxicityResult.isEmergency && (
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Detected as emergency context — NOT flagged as toxic
                      </p>
                    )}
                    <ul className="text-xs space-y-1 mt-1" style={{ color: "var(--text-secondary)" }}>
                      {toxicityResult.safetyReasons.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {aiSuggestion && (
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                    AI Auto-Categorization (FR-03)
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Suggested: <strong>{aiSuggestion.category}</strong> ·
                  Urgency: <strong>{aiSuggestion.urgency}</strong>
                </p>
                <button
                  onClick={acceptAiSuggestion}
                  className="mt-2 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors"
                  style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
                >
                  Accept Suggestion
                </button>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Location
              </label>
              <select
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border outline-none"
              >
                <option value="">Select a location...</option>
                {GEOFENCES.filter((gf) => gf.type === "locality").map((gf) => (
                  <option key={gf.id} value={gf.name}>
                    {gf.name} ({gf.pincode}) — {gf.district}
                  </option>
                ))}
              </select>
            </div>

            {/* Valid Until + Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Valid Until
                </label>
                <input
                  type="date"
                  value={validUntil ? validUntil.split("T")[0] : ""}
                  onChange={(e) =>
                    setValidUntil(e.target.value + "T23:59:00")
                  }
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="road, traffic, alert"
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePublish}
                disabled={
                  !title || !description || publishing || !!toxicityResult?.flagged
                }
                className="flex-1 flex items-center justify-center gap-2 py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
              >
                {publishing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Information
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-3 border rounded-xl transition-colors lg:hidden"
                style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className={`${showPreview ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
                Live Preview
              </h2>
              <article
                className="rounded-2xl border shadow-sm overflow-hidden"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
                    >
                      {user?.name?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                        {user?.name}
                      </span>
                      <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                        · Just now
                      </span>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {user?.community}
                      </div>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${catConfig.color} ${catConfig.bg} ${catConfig.border} ${catConfig.darkBg} ${catConfig.darkBorder}`}
                      >
                        {category}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                        Active
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {title || "Your title appears here"}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                    {description || "Your description will appear here..."}
                  </p>
                  <div
                    className="text-xs border-t pt-3 flex items-center gap-1"
                    style={{ color: "var(--text-muted)", borderColor: "var(--border-color)" }}
                  >
                    <MapPin className="w-3.5 h-3.5" /> {locationName || "Location"}
                    {urgency !== "Normal" && (
                      <span className="ml-3 text-red-500 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {urgency}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
