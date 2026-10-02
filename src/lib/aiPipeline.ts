/**
 * AI Pipeline — PRD §4.1 — UPDATED
 *
 * FR-01: Voice Input (Web Speech API)
 * FR-02: Toxicity Guard — context-aware, separates toxicity from safety
 * FR-03: Auto-Categorize
 * FR-04: Language detection
 *
 * Mod 4 Fix: "bomb alert" and emergency language is NOT toxic.
 *   - Toxicity = hate speech, harassment, personal attacks, spam
 *   - Safety   = dangerous situations that need urgent attention
 *   Both scores are reported separately.
 */

import type { PostCategory, UrgencyLevel, StructuredPostData } from "@/types";

// ── FR-01 Voice Transcription ──
export function startVoiceTranscription(
  onResult: (text: string) => void,
  onError: (err: string) => void,
  lang: string = "en-IN"
): { stop: () => void } | null {
  const SpeechRecognition =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      : null;

  if (!SpeechRecognition) {
    onError("Web Speech API is not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(`Speech recognition error: ${event.error}`);
  };

  recognition.start();
  return { stop: () => recognition.stop() };
}

// ── FR-02 Toxicity Detection (Mod 4 — context-aware) ──

// These indicate EMERGENCY context — NOT toxicity
const EMERGENCY_CONTEXT_INDICATORS = [
  /\b(alert|warning|advisory|notice|reported|detected|spotted)\b/i,
  /\b(stay safe|avoid|take care|be careful|evacuate|rescue)\b/i,
  /\b(emergency services|police|fire brigade|ambulance|ndrf)\b/i,
  /\b(caution|danger zone|hazard|safety|update|breaking)\b/i,
  /\b(flood|waterlog|earthquake|storm|cyclone|landslide|collapse)\b/i,
  /\b(road block|traffic|accident|crash|stalled|derail)\b/i,
];

function isEmergencyContext(text: string): boolean {
  const lower = text.toLowerCase();
  let matches = 0;
  for (const pattern of EMERGENCY_CONTEXT_INDICATORS) {
    if (pattern.test(lower)) matches++;
  }
  return matches >= 1; // at least 1 emergency indicator
}

// Genuinely toxic patterns (hate, harassment, personal attacks)
const TOXIC_PATTERNS_STRICT = [
  { pattern: /\b(hate|hatred|despise)\s+(you|them|all|everyone|people)\b/gi, weight: 0.4, label: "Hate speech" },
  { pattern: /\b(racist|sexist|bigot|slur|n[i1]gg|f[a@]g)\b/gi, weight: 0.5, label: "Discriminatory language" },
  { pattern: /\b(i('ll|m going to|will)\s+(kill|murder|hurt|attack)\s+(you|them|him|her))\b/gi, weight: 0.6, label: "Direct threat" },
  { pattern: /\b(go\s+die|kill\s+yourself|kys)\b/gi, weight: 0.7, label: "Severe harassment" },
  { pattern: /\b(abuse|harass|bully|stalk)\s+(you|them|her|him)\b/gi, weight: 0.4, label: "Harassment" },
];

// Spam patterns
const SPAM_PATTERNS = [
  { pattern: /\b(buy\s+now|click\s+here|free\s+money|limited\s+offer|act\s+now)\b/gi, weight: 0.3, label: "Spam content" },
  { pattern: /(.)\1{6,}/g, weight: 0.2, label: "Character spam" },
  { pattern: /\b(earn\s+from\s+home|guaranteed\s+income|mlm|pyramid)\b/gi, weight: 0.3, label: "Scam content" },
];

// Safety/danger indicators (NOT toxic, but high urgency)
const SAFETY_PATTERNS = [
  /\b(bomb|explosive|blast|detonation|ied)\b/gi,
  /\b(fire|blaze|inferno|burning)\b/gi,
  /\b(shoot|gunshot|weapon|armed)\b/gi,
  /\b(flood|waterlog|submerge|drown)\b/gi,
  /\b(collapse|earthquake|tremor|sinkhole)\b/gi,
  /\b(attack|terror|riot|violence)\b/gi,
  /\b(poison|toxic|chemical|gas\s+leak|radiation)\b/gi,
  /\b(kidnap|missing\s+child|abduct)\b/gi,
];

export function checkToxicity(text: string): {
  score: number;
  flagged: boolean;
  reasons: string[];
  safetyScore: number;
  safetyReasons: string[];
  isEmergency: boolean;
} {
  const lower = text.toLowerCase();
  let toxScore = 0;
  const toxReasons: string[] = [];
  let safetyScore = 0;
  const safetyReasons: string[] = [];

  const emergency = isEmergencyContext(text);

  // ── TOXICITY scoring (genuine hate/harassment/spam) ──
  for (const { pattern, weight, label } of TOXIC_PATTERNS_STRICT) {
    // Reset regex state
    pattern.lastIndex = 0;
    const matches = lower.match(pattern);
    if (matches) {
      toxScore += weight * matches.length;
      toxReasons.push(`${label}: "${matches[0]}"`);
    }
  }

  for (const { pattern, weight, label } of SPAM_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = lower.match(pattern);
    if (matches) {
      toxScore += weight * matches.length;
      toxReasons.push(label);
    }
  }

  // ALL CAPS penalty (aggressive tone)
  const words = text.split(/\s+/).filter(w => w.length > 2);
  const capsRatio = words.filter(w => w === w.toUpperCase() && /[A-Z]/.test(w)).length / Math.max(words.length, 1);
  if (capsRatio > 0.6 && words.length > 3) {
    toxScore += 0.1;
    toxReasons.push("Excessive capitalization");
  }

  toxScore = Math.min(toxScore, 1);

  // ── SAFETY scoring (dangerous situation — NOT toxic) ──
  for (const pattern of SAFETY_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = lower.match(pattern);
    if (matches) {
      safetyScore += 0.25 * matches.length;
      safetyReasons.push(`Safety concern: "${matches[0]}"`);
    }
  }

  safetyScore = Math.min(safetyScore, 1);

  return {
    score: Math.round(toxScore * 100) / 100,
    flagged: toxScore >= 0.8,
    reasons: toxReasons,
    safetyScore: Math.round(safetyScore * 100) / 100,
    safetyReasons,
    isEmergency: emergency,
  };
}

// ── FR-03 Auto-Categorization ──
const CATEGORY_KEYWORDS: Record<PostCategory, string[]> = {
  Emergency: [
    "flood", "fire", "accident", "emergency", "waterlog", "collapse",
    "earthquake", "storm", "rescue", "ambulance", "urgent", "danger",
    "stalled", "injured", "critical", "bomb", "alert", "evacuate",
    "cyclone", "landslide", "explosion", "gas leak",
  ],
  "Local Issue": [
    "road", "blockage", "pothole", "garbage", "water supply", "electricity",
    "sewage", "broken", "construction", "traffic", "noise", "civic",
    "infrastructure", "maintenance", "drainage",
  ],
  "Lost & Found": [
    "lost", "found", "missing", "wallet", "phone", "keys", "bag",
    "id card", "pet", "dog", "cat", "belong",
  ],
  Internship: [
    "internship", "intern", "hiring", "job", "developer", "designer",
    "frontend", "backend", "recruitment", "placement", "opening",
    "vacancy", "stipend",
  ],
  Event: [
    "event", "workshop", "seminar", "camp", "donation", "drive",
    "festival", "meetup", "conference", "celebration", "webinar",
    "competition", "hackathon",
  ],
  Scholarship: [
    "scholarship", "grant", "fellowship", "financial aid", "tuition",
    "merit", "stipend", "award", "bursary",
  ],
  Announcement: [
    "announcement", "notice", "update", "advisory", "circular",
    "memo", "bulletin", "important notice",
  ],
};

const URGENCY_KEYWORDS: Record<UrgencyLevel, string[]> = {
  Emergency: ["emergency", "urgent", "critical", "danger", "immediately", "sos", "bomb", "evacuate", "life threatening"],
  Urgent: ["urgent", "asap", "important", "soon", "hurry", "alert"],
  Important: ["important", "attention", "note", "please note"],
  Normal: [],
};

export function autoCategorize(text: string): {
  category: PostCategory;
  urgency: UrgencyLevel;
  entities: string[];
  confidence: number;
} {
  const lower = text.toLowerCase();
  let bestCategory: PostCategory = "Announcement";
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat as PostCategory;
    }
  }

  let urgency: UrgencyLevel = "Normal";
  for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        urgency = level as UrgencyLevel;
        break;
      }
    }
    if (urgency !== "Normal") break;
  }

  const entityPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  const entities: string[] = [];
  let match;
  const skipWords = ["The", "This", "That", "There", "What", "Where", "When", "How", "Please", "Today", "Tomorrow"];
  while ((match = entityPattern.exec(text)) !== null) {
    if (!skipWords.includes(match[1])) entities.push(match[1]);
  }

  const confidence = bestScore > 0 ? Math.min(bestScore / 3, 1) : 0.2;

  return { category: bestCategory, urgency, entities: [...new Set(entities)], confidence: Math.round(confidence * 100) / 100 };
}

// ── FR-04 Language Detection ──
export function detectLanguage(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

// ── Full pipeline ──
export function processText(text: string): StructuredPostData {
  const toxicity = checkToxicity(text);
  const categorization = autoCategorize(text);
  const language = detectLanguage(text);

  const firstSentence = text.split(/[.!?\n]/)[0].trim();
  const title = firstSentence.length > 60 ? firstSentence.slice(0, 57) + "..." : firstSentence;

  return {
    title,
    category: categorization.category,
    urgency: categorization.urgency,
    description: text,
    entities: categorization.entities,
    tags: categorization.entities.map((e) => e.toLowerCase().replace(/\s+/g, "")),
    toxicityScore: toxicity.score,
    safetyScore: toxicity.safetyScore,
    language,
  };
}
