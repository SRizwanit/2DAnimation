import React from "react";
import {
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CANVAS, COLORS, FONT_FAMILY, bob } from "./theme";

const { width: W, height: H, groundY: GY } = CANVAS;

// =====================================================================
// নোট: সব চরিত্র মুখহীন সিলুয়েট — কারও মুখমণ্ডল আঁকা হয় না।
// পা মাটিতে (0,0); উচ্চতা ≈ ৪২০ ইউনিট (scale=1 এ)। ডানে/বামে ঘোরাতে flip।
// =====================================================================

export type Mood = "calm" | "impatient" | "curious" | "serious";
export type HeadWear = "turban" | "cap" | "none";

export type PersonProps = {
  x: number; // পায়ের কেন্দ্র (X)
  y?: number; // পায়ের রেখা (Y) — ডিফল্ট: মাটির একটু নিচে
  scale?: number;
  flip?: boolean; // true হলে বামমুখী
  walking?: boolean; // হাঁটার অ্যানিমেশন
  walkSpeed?: number;
  mood?: Mood; // calm | impatient (পা ঠুকা) | curious (মাথা কাত) | serious
  raise?: number; // ডান হাত তোলা 0..1
  raiseLeft?: number; // বাম হাত তোলা 0..1
  sitting?: boolean; // বসা অবস্থা
  headTurn?: number; // -1..1 (মাথা পাশে ঘোরানো)
  robe?: string; // জুব্বা/জামার রং
  cloak?: string; // বাইরের চোগা (ঐচ্ছিক)
  sash?: string; // কোমরবন্ধ (ঐচ্ছিক)
  skin?: string;
  headwear?: HeadWear;
  headwearColor?: string;
  glow?: number; // নূরানী আভা 0..1
  phase?: number; // প্রতিজনের আলাদা ছন্দ
  opacity?: number;
};

// ---------------------------------------------------------------------
// সহায়ক: নির্দিষ্ট সময়ে এক জায়গা থেকে আরেক জায়গায় হাঁটা
// ব্যবহার: const m = moveTo(frame, 30, 120, -200, 900);
//          <Person x={m.x} walking={m.walking} flip={m.dir < 0} />
// ---------------------------------------------------------------------
export const moveTo = (
  frame: number,
  start: number,
  end: number,
  fromX: number,
  toX: number,
): { x: number; walking: boolean; dir: 1 | -1 } => {
  const x = interpolate(frame, [start, end], [fromX, toX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  return {
    x,
    walking: frame >= start && frame < end,
    dir: toX >= fromX ? 1 : -1,
  };
};

// =====================================================================
// PersonGroup — SVG <g> (একই SVG-তে অনেক জনকে বসাতে, যেমন ভিড়)
// =====================================================================
export const PersonGroup: React.FC<PersonProps> = ({
  x,
  y = GY + 90,
  scale = 1,
  flip = false,
  walking = false,
  walkSpeed = 1,
  mood = "calm",
  raise = 0,
  raiseLeft = 0,
  sitting = false,
  headTurn = 0,
  robe = "#f6f1e3",
  cloak,
  sash,
  skin = "#e0b48a",
  headwear = "none",
  headwearColor = "#ffffff",
  glow = 0,
  phase = 0,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const cycle = frame * 0.28 * walkSpeed + phase;

  // --- গতি ---
  const bodyBob = walking
    ? -Math.abs(Math.sin(cycle)) * 7
    : bob(frame, 0.06, 1.2, phase);
  const armSwing = walking ? Math.sin(cycle) * 16 : bob(frame, 0.05, 1.5, phase);

  let headRot = bob(frame, 0.04, 1, phase);
  if (mood === "curious") headRot = 7 + bob(frame, 0.05, 1.5, phase);
  if (mood === "impatient") headRot = bob(frame, 0.17, 3, phase);
  if (mood === "serious") headRot = 0;
  const headDX = headTurn * 7;

  // --- পা ---
  const tap =
    mood === "impatient" && !walking
      ? -Math.max(0, Math.sin(frame * 0.4 + phase)) * 12
      : 0;
  const footLx = walking ? -18 + Math.sin(cycle) * 22 : -18;
  const footLy = walking ? -Math.max(0, Math.cos(cycle)) * 12 : 0;
  const footRx = walking ? 18 - Math.sin(cycle) * 22 : 18;
  const footRy = walking ? -Math.max(0, -Math.cos(cycle)) * 12 : tap;

  // --- আকৃতির মাত্রা ---
  const tb = sitting ? -150 : -26; // ধড়ের নিচের প্রান্ত
  const bw = sitting ? 56 : 70; // নিচের অর্ধ-প্রস্থ
  const upperDY = (sitting ? 90 : 0) + bodyBob;
  const sleeve = cloak ?? robe;

  const angleL = 4 + armSwing * 0.5 + raiseLeft * 130;
  const angleR = -4 + armSwing * 0.5 - raise * 130;

  const shade = "rgba(0,0,0,0.18)";

  return (
    <g
      opacity={opacity}
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
    >
      {/* নূরানী আভা */}
      {glow > 0 && (
        <>
          <defs>
            <radialGradient id="nurAura">
              <stop offset="0%" stopColor="#fff3b0" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#ffe27a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffe27a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle
            cx={0}
            cy={-210}
            r={320}
            fill="url(#nurAura)"
            opacity={glow * (0.78 + 0.22 * Math.sin(frame * 0.06 + phase))}
          />
        </>
      )}

      {/* ছায়া */}
      <ellipse cx={0} cy={4} rx={sitting ? 130 : 78} ry={12} fill="rgba(0,0,0,0.25)" />

      {/* পা (শুধু দাঁড়ানো অবস্থায়) */}
      {!sitting && (
        <>
          <ellipse cx={footLx} cy={-6 + footLy} rx={22} ry={9} fill="#3b2a1c" />
          <ellipse cx={footRx} cy={-6 + footRy} rx={22} ry={9} fill="#3b2a1c" />
        </>
      )}

      {/* বসা অবস্থায় নিচের স্তূপ (জুব্বার ভাঁজ) */}
      {sitting && (
        <path
          d="M -125 0 Q -130 -70 -52 -104 L 52 -104 Q 130 -70 125 0 Z"
          fill={robe}
        />
      )}

      {/* ===== উপরের শরীর ===== */}
      <g transform={`translate(0 ${upperDY})`}>
        {/* ধড় / জুব্বা */}
        <path
          d={`M -46 -300 Q 0 -314 46 -300 L ${bw} ${tb} Q 0 ${tb + 12} ${-bw} ${tb} Z`}
          fill={robe}
        />
        {/* কোমরবন্ধ */}
        {sash && (
          <path d="M -58 -192 L 58 -192 L 61 -174 L -61 -174 Z" fill={sash} />
        )}
        {/* চোগা: দুই পাশের প্যানেল */}
        {cloak && (
          <>
            <path d={`M -48 -298 L -26 -298 L ${-bw + 18} ${tb} L ${-bw - 6} ${tb} Z`} fill={cloak} />
            <path d={`M 48 -298 L 26 -298 L ${bw - 18} ${tb} L ${bw + 6} ${tb} Z`} fill={cloak} />
          </>
        )}
        {/* জুব্বার মাঝের রেখা */}
        <path d={`M 0 -300 L 0 ${tb + 8}`} stroke={shade} strokeWidth={3} />

        {/* বাম হাত */}
        <g transform={`translate(-48 -288) rotate(${angleL})`}>
          <path d="M -13 0 L 13 0 L 11 140 Q 0 150 -11 140 Z" fill={sleeve} />
          <circle cx={0} cy={150} r={13} fill={skin} />
        </g>
        {/* ডান হাত */}
        <g transform={`translate(48 -288) rotate(${angleR})`}>
          <path d="M -13 0 L 13 0 L 11 140 Q 0 150 -11 140 Z" fill={sleeve} />
          <circle cx={0} cy={150} r={13} fill={skin} />
        </g>

        {/* ঘাড় */}
        <rect x={-11} y={-314} width={22} height={20} fill={skin} />

        {/* মাথা (মুখহীন) + পাগড়ি/টুপি */}
        <g transform={`translate(${headDX} 0) rotate(${headRot} 0 -312)`}>
          <ellipse cx={0} cy={-350} rx={33} ry={39} fill={skin} />

          {headwear === "turban" && (
            <>
              <ellipse cx={0} cy={-378} rx={46} ry={30} fill={headwearColor} />
              <ellipse cx={0} cy={-394} rx={37} ry={24} fill={headwearColor} />
              <path d="M -42 -372 Q 0 -352 44 -372" stroke={shade} strokeWidth={3} fill="none" />
              <path d="M -36 -388 Q 0 -366 38 -388" stroke={shade} strokeWidth={3} fill="none" />
              <path d="M -30 -404 Q 0 -384 32 -404" stroke={shade} strokeWidth={3} fill="none" />
              {/* পাগড়ির লেজ */}
              <path d="M 30 -380 Q 64 -360 54 -318 Q 46 -342 26 -366 Z" fill={headwearColor} />
              <path d="M 30 -380 Q 64 -360 54 -318" stroke={shade} strokeWidth={2} fill="none" />
            </>
          )}
          {headwear === "cap" && (
            <>
              <path
                d="M -35 -362 Q -36 -412 0 -414 Q 36 -412 35 -362 Q 0 -374 -35 -362 Z"
                fill={headwearColor}
              />
              <path d="M -35 -362 Q 0 -374 35 -362" stroke={shade} strokeWidth={3} fill="none" />
            </>
          )}
          {headwear === "none" && (
            <path
              d="M -34 -356 Q -36 -396 0 -398 Q 36 -396 34 -356 Q 20 -380 0 -380 Q -20 -380 -34 -356 Z"
              fill="#2b2118"
            />
          )}
        </g>
      </g>
    </g>
  );
};

// =====================================================================
// Person — একক চরিত্র (নিজের SVG সহ)
// =====================================================================
export const Person: React.FC<PersonProps> = (props) => (
  <svg
    style={{ position: "absolute", left: 0, top: 0 }}
    width={W}
    height={H}
    viewBox={`0 0 ${W} ${H}`}
  >
    <PersonGroup {...props} />
  </svg>
);

// =====================================================================
// Imam — হযরত ইমাম আবু হানিফা (রাদিআল্লাহু আনহু)
// মুখহীন সিলুয়েট; সাদা পাগড়ি, সাদা জুব্বা, সবুজ চোগা, নূরানী আভা
// =====================================================================
export const Imam: React.FC<Omit<PersonProps, "robe" | "cloak" | "headwear">> = ({
  glow = 0.8,
  skin = "#e6bf96",
  ...rest
}) => (
  <Person
    {...rest}
    skin={skin}
    glow={glow}
    robe="#f8f4e8"
    cloak="#1f6b52"
    sash="#d9c27a"
    headwear="turban"
    headwearColor="#ffffff"
  />
);

// =====================================================================
// Atheist — নাস্তিক পণ্ডিত: নীল-ধূসর লম্বা কোট, মরুন কোমরবন্ধ, গাঢ় টুপি
// =====================================================================
export const Atheist: React.FC<Omit<PersonProps, "robe" | "cloak" | "headwear">> = ({
  skin = "#c9966b",
  mood = "serious" as Mood,
  ...rest
}) => (
  <Person
    {...rest}
    mood={mood}
    skin={skin}
    robe="#3c4660"
    cloak="#262d40"
    sash="#7a2b34"
    headwear="cap"
    headwearColor="#1f1f2b"
  />
);

// =====================================================================
// Crowd — ভিড়: আসা (arriving) / দাঁড়ানো (standing) / বসা (sitting)
// =====================================================================
const CROWD_ROBES = [
  "#f4efe0", "#d9c9a3", "#8fb3c9", "#6f8f72",
  "#b98c5a", "#9a6a6a", "#4e5d78", "#e0d2b5",
];
const CROWD_SKINS = ["#e0b48a", "#c9966b", "#a8743f", "#f0c8a0", "#8a5a34"];
const CROWD_CAPS = ["#ffffff", "#e9e2cf", "#2f4f46", "#3a3a48", "#7a5a3a"];

export const Crowd: React.FC<{
  count?: number;
  centerX?: number;
  baseY?: number; // সামনের সারির পায়ের Y
  spread?: number; // মোট প্রস্থ
  scale?: number;
  rows?: number;
  mode?: "standing" | "sitting" | "arriving";
  from?: "left" | "right";
  startFrame?: number; // আসা শুরুর ফ্রেম
  arriveFrames?: number; // সবার পৌঁছাতে মোট ফ্রেম
  mood?: Mood;
  moodMix?: number; // 0..1: কত অংশ অধৈর্য (impatient) হবে
  seed?: string;
}> = ({
  count = 24,
  centerX = W / 2,
  baseY = GY + 150,
  spread = 1500,
  scale = 0.6,
  rows = 3,
  mode = "standing",
  from = "left",
  startFrame = 0,
  arriveFrames = 120,
  mood = "calm",
  moodMix = 0,
  seed = "crowd",
}) => {
  const frame = useCurrentFrame();
  const perRow = Math.ceil(count / rows);

  const members = Array.from({ length: count }).map((_, i) => {
    const r = (k: string) => random(`${seed}-${k}-${i}`);
    const row = i % rows;
    const k = Math.floor(i / rows);
    const y = baseY - row * 40;
    const sc = scale * (1 - row * 0.1) * (0.94 + r("h") * 0.12);
    const tx =
      centerX -
      spread / 2 +
      (k + 0.5 + (r("j") - 0.5) * 0.5 + (row % 2) * 0.35) * (spread / perRow);

    const hw = r("hw");
    const headwear: HeadWear = hw < 0.3 ? "turban" : hw < 0.7 ? "cap" : "none";

    // আসার সময়সূচি
    const delay = r("d") * arriveFrames * 0.5;
    const dur = arriveFrames * 0.4 + r("u") * arriveFrames * 0.1;
    const fromX =
      from === "left" ? -200 - r("f") * 500 : W + 200 + r("f") * 500;

    const arriving = mode === "arriving";
    const m = arriving
      ? moveTo(frame, startFrame + delay, startFrame + delay + dur, fromX, tx)
      : { x: tx, walking: false, dir: (tx > centerX ? -1 : 1) as 1 | -1 };

    const settled = !m.walking;
    const impatient = r("m") < moodMix;
    const personMood: Mood = !settled ? "calm" : impatient ? "impatient" : (mood as Mood);

    return {
      i,
      y,
      props: {
        x: m.x,
        y,
        scale: sc,
        flip: m.walking ? m.dir < 0 : tx > centerX,
        walking: m.walking,
        walkSpeed: 0.9 + r("w") * 0.3,
        mood: personMood,
        sitting: mode === "sitting",
        headTurn: settled ? Math.sin(frame * 0.03 + i * 2.1) : 0,
        robe: CROWD_ROBES[Math.floor(r("c") * CROWD_ROBES.length)],
        skin: CROWD_SKINS[Math.floor(r("s") * CROWD_SKINS.length)],
        headwear,
        headwearColor: CROWD_CAPS[Math.floor(r("hc") * CROWD_CAPS.length)],
        phase: r("p") * 10,
        // আসার আগে স্ক্রিনের বাইরে থাকলে আঁকার দরকার নেই
        opacity: m.x < -250 || m.x > W + 250 ? 0 : 1,
      } as PersonProps,
    };
  });

  // পেছনের সারি আগে আঁকা (Y ছোট = দূরে)
  members.sort((a, b) => a.y - b.y);

  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0 }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      {members.map((m) => (
        <PersonGroup key={m.i} {...m.props} />
      ))}
    </svg>
  );
};

// =====================================================================
// SpeechBubble — সংলাপ বাবল (স্প্রিং-এ ফুটে ওঠে)
// (x, y) = বাবলের লেজের ডগা (বক্তার মাথার একটু উপরে)
// =====================================================================
export const SpeechBubble: React.FC<{
  x: number;
  y: number;
  text: string;
  width?: number;
  fontSize?: number;
  startFrame?: number;
  bg?: string;
  color?: string;
}> = ({
  x,
  y,
  text,
  width = 560,
  fontSize = 46,
  startFrame = 0,
  bg = COLORS.white,
  color = COLORS.ink,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 140 },
  });
  if (frame < startFrame) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y,
        width,
        transform: `translateY(-100%) scale(${s})`,
        transformOrigin: "50% 100%",
      }}
    >
      <div
        style={{
          background: bg,
          color,
          fontFamily: FONT_FAMILY,
          fontWeight: 700,
          fontSize,
          lineHeight: 1.35,
          textAlign: "center",
          padding: "26px 34px",
          borderRadius: 34,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          border: `4px solid ${COLORS.gold}`,
        }}
      >
        {text}
      </div>
      {/* লেজ */}
      <div
        style={{
          width: 36,
          height: 36,
          background: bg,
          borderRight: `4px solid ${COLORS.gold}`,
          borderBottom: `4px solid ${COLORS.gold}`,
          transform: "translate(-50%, -20px) rotate(45deg)",
          marginLeft: "50%",
        }}
      />
    </div>
  );
};
