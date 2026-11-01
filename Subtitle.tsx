import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY } from "./theme";

// =====================================================================
// বাংলা সাবটাইটেল — নিচে অর্ধস্বচ্ছ বার, শব্দে শব্দে হাইলাইট
//  • যে শব্দ এখন পড়া হচ্ছে সেটি সোনালি + আভা
//  • আগের শব্দ সাদা, পরের শব্দ ঝাপসা
//  • শব্দের "ওজন" = অক্ষর সংখ্যা, তাই লম্বা শব্দে বেশি সময় লাগে
//  • দৃশ্যের (Sequence) ভেতরে ব্যবহার করুন — frame তখন দৃশ্যের নিজস্ব ফ্রেম
// =====================================================================

/** টেক্সটকে শব্দে ভাঙা (ফাঁকা জায়গায়) — শব্দের ভেতরে কখনো ভাঙে না */
export const splitWords = (text: string): string[] =>
  text.split(/\s+/).filter((w) => w.length > 0);

/** প্রতিটি শব্দের শেষ-সীমা (০..১) বের করা — অক্ষর সংখ্যার অনুপাতে */
export const wordBoundaries = (words: string[]): number[] => {
  const weights = words.map((w) => Array.from(w).length + 1);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return weights.map((w) => {
    acc += w;
    return acc / total;
  });
};

export const Subtitle: React.FC<{
  text: string;
  /** কত ফ্রেম ধরে কথাগুলো বলা হচ্ছে (= অডিও দৈর্ঘ্য)। না দিলে পুরো দৃশ্য */
  speakFrames?: number;
  /** দৃশ্য শুরুর কত ফ্রেম পরে কথা শুরু */
  delayFrames?: number;
  fontSize?: number;
  bottom?: number;
  maxWidth?: number;
  highlight?: string;
  fadeFrames?: number;
  visible?: boolean;
}> = ({
  text,
  speakFrames,
  delayFrames = 6,
  fontSize = 56,
  bottom = 64,
  maxWidth = 1560,
  highlight = COLORS.gold,
  fadeFrames = 10,
  visible = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!visible || text.trim().length === 0) return null;

  const words = splitWords(text);
  const bounds = wordBoundaries(words);

  const span = Math.max(1, speakFrames ?? durationInFrames - delayFrames);
  const progress = (frame - delayFrames) / span; // <0 = শুরুর আগে, >1 = শেষ

  // এখন কোন শব্দ চলছে (-1 = কোনোটাই না, words.length = সব শেষ)
  let active = -1;
  if (progress >= 1) {
    active = words.length;
  } else if (progress >= 0) {
    active = bounds.findIndex((b) => progress < b);
    if (active < 0) active = words.length - 1;
  }

  const fadeIn = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);
  const lift = interpolate(frame, [0, fadeFrames], [14, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${lift}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth,
          padding: "22px 44px 26px",
          borderRadius: 30,
          background: "rgba(8, 16, 36, 0.72)",
          border: "2px solid rgba(232, 198, 106, 0.55)",
          boxShadow: "0 14px 40px rgba(0,0,0,0.4)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: fontSize * 0.28,
          rowGap: 4,
          fontFamily: FONT_FAMILY,
          fontWeight: 700,
          fontSize,
          lineHeight: 1.55,
          textAlign: "center",
        }}
      >
        {words.map((w, i) => {
          const isActive = i === active;
          const isPast = i < active;
          return (
            <span
              key={i}
              style={{
                color: isActive ? highlight : COLORS.white,
                opacity: isActive || isPast ? 1 : 0.55,
                textShadow: isActive
                  ? `0 0 18px ${highlight}, 0 2px 6px rgba(0,0,0,0.6)`
                  : "0 2px 6px rgba(0,0,0,0.6)",
                transform: isActive ? "translateY(-3px)" : "none",
                display: "inline-block",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
