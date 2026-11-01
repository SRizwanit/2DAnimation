import { loadFont } from "@remotion/google-fonts/NotoSansBengali";

// ---------- ফন্ট ----------
// Noto Sans Bengali — বাংলা অক্ষর সঠিকভাবে রেন্ডার করার জন্য
const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["bengali", "latin"],
});
export const FONT_FAMILY = `${fontFamily}, "Noto Sans Bengali", "Hind Siliguri", sans-serif`;

// ---------- ক্যানভাস ----------
export const CANVAS = {
  width: 1920,
  height: 1080,
  groundY: 800, // মাটির রেখা (এর নিচে মাটি, উপরে আকাশ/দৃশ্য)
};

// ---------- রঙের প্যালেট ----------
export const COLORS = {
  gold: "#e8c66a",
  goldLight: "#f5e6b3",
  goldDark: "#b8892b",
  sand: "#e9c98b",
  sandDark: "#c99a5b",
  sandDeep: "#a8763e",
  green: "#1f7a5a",
  greenDark: "#14563f",
  nightBlue: "#0b1d3a",
  deepBlue: "#16365f",
  skyBlue: "#6ec1ee",
  white: "#fbf8ef",
  cream: "#f3e9cf",
  ink: "#1b1b2a",
  red: "#a83a3a",
  wood: "#6b4a2b",
  stone: "#d9c7a0",
  stoneDark: "#b39d73",
  glow: "#ffd96b",
};

// ---------- দিনের সময় অনুযায়ী আকাশের রং ----------
export type TimeOfDay =
  | "dawn"
  | "morning"
  | "noon"
  | "afternoon"
  | "dusk"
  | "night";

export const SKY: Record<TimeOfDay, { top: string; bottom: string }> = {
  dawn: { top: "#2b3b6b", bottom: "#f2a97a" },
  morning: { top: "#4aa3df", bottom: "#fbe3b0" },
  noon: { top: "#2f8fd6", bottom: "#bfe6fa" },
  afternoon: { top: "#3d8fcf", bottom: "#f6d9a0" },
  dusk: { top: "#3a2a5e", bottom: "#f08a4b" },
  night: { top: "#050d22", bottom: "#17325c" },
};

// ---------- ছোট সহায়ক ফাংশন ----------
/** সেকেন্ড → ফ্রেম */
export const sec = (s: number, fps = 30): number => Math.round(s * fps);

/** মসৃণ দুলুনি: bob(frame, গতি, পরিমাণ, ফেজ) */
export const bob = (
  frame: number,
  speed: number,
  amp: number,
  phase = 0,
): number => Math.sin(frame * speed + phase) * amp;

/** ছায়া/আভার জন্য সাধারণ ড্রপ-শ্যাডো */
export const SOFT_SHADOW = "0 12px 40px rgba(0,0,0,0.35)";
