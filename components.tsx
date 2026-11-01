import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CANVAS, COLORS, SKY, bob } from "./theme";
import type { TimeOfDay } from "./theme";

const { width: W, height: H, groundY: GY } = CANVAS;

// =====================================================================
// ১) আকাশ — সময় অনুযায়ী রং, from→to প্রগ্রেসে মসৃণ বদল
// =====================================================================
export const Sky: React.FC<{
  from?: TimeOfDay;
  to?: TimeOfDay;
  progress?: number; // 0..1
}> = ({ from = "noon", to, progress = 0 }) => {
  const target = to ?? from;
  const top = interpolateColors(
    progress,
    [0, 1],
    [SKY[from].top, SKY[target].top],
  );
  const bottom = interpolateColors(
    progress,
    [0, 1],
    [SKY[from].bottom, SKY[target].bottom],
  );
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${top} 0%, ${bottom} 75%)`,
      }}
    />
  );
};

// =====================================================================
// ২) সূর্য — progress 0→1 এ আকাশে চাপ আঁকে (পূর্ব→পশ্চিম)
// =====================================================================
export const Sun: React.FC<{
  progress?: number;
  size?: number;
  color?: string;
}> = ({ progress = 0.5, size = 130, color = "#ffe27a" }) => {
  const frame = useCurrentFrame();
  const x = interpolate(progress, [0, 1], [160, W - 160]);
  const y = interpolate(progress, [0, 0.5, 1], [GY - 160, 150, GY - 160]);
  const pulse = 1 + bob(frame, 0.08, 0.04);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size * 2.5,
        top: y - size * 2.5,
        width: size * 5,
        height: size * 5,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, ${color} ${
          100 / 5
        }%, rgba(255,226,122,0.35) 28%, rgba(255,226,122,0) 62%)`,
        transform: `scale(${pulse})`,
      }}
    />
  );
};

// =====================================================================
// ৩) চাঁদ
// =====================================================================
export const Moon: React.FC<{ x?: number; y?: number; size?: number }> = ({
  x = 1500,
  y = 180,
  size = 90,
}) => (
  <svg
    style={{ position: "absolute", left: 0, top: 0 }}
    width={W}
    height={H}
    viewBox={`0 0 ${W} ${H}`}
  >
    <defs>
      <radialGradient id="moonGlow">
        <stop offset="0%" stopColor="#fff6cf" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#fff6cf" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={size * 2.6} fill="url(#moonGlow)" />
    <circle cx={x} cy={y} r={size} fill="#fff6cf" />
    <circle cx={x + size * 0.45} cy={y - size * 0.1} r={size * 0.9} fill={SKY.night.top} opacity={0.0} />
  </svg>
);

// =====================================================================
// ৪) তারা — টুইঙ্কল সহ (opacity দিয়ে ফেড-ইন/আউট)
// =====================================================================
export const Stars: React.FC<{ count?: number; opacity?: number }> = ({
  count = 70,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, opacity }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`star-x-${i}`) * W;
        const y = random(`star-y-${i}`) * (GY - 120);
        const r = 1.2 + random(`star-r-${i}`) * 2.4;
        const tw = 0.55 + 0.45 * Math.sin(frame * 0.07 + i * 1.7);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="#fffbe6"
            opacity={tw}
          />
        );
      })}
    </svg>
  );
};

// =====================================================================
// ৫) মেঘ — ধীরে ভেসে যায়
// =====================================================================
const Cloud: React.FC<{ x: number; y: number; s: number; color: string }> = ({
  x,
  y,
  s,
  color,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
    <ellipse cx="0" cy="0" rx="90" ry="32" />
    <ellipse cx="-55" cy="8" rx="55" ry="24" />
    <ellipse cx="60" cy="10" rx="62" ry="26" />
    <ellipse cx="-12" cy="-22" rx="52" ry="30" />
    <ellipse cx="34" cy="-14" rx="40" ry="24" />
  </g>
);

export const Clouds: React.FC<{
  count?: number;
  speed?: number;
  color?: string;
  opacity?: number;
}> = ({ count = 5, speed = 0.6, color = "#ffffff", opacity = 0.9 }) => {
  const frame = useCurrentFrame();
  const span = W + 700;
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, opacity }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const base = random(`cloud-x-${i}`) * span;
        const x = ((base + frame * speed * (0.6 + random(`cloud-v-${i}`))) % span) - 350;
        const y = 90 + random(`cloud-y-${i}`) * 260;
        const s = 0.7 + random(`cloud-s-${i}`) * 0.9;
        return <Cloud key={i} x={x} y={y} s={s} color={color} />;
      })}
    </svg>
  );
};

// =====================================================================
// ৬) বালির টিলা (পিছনের স্তর) — প্যারালাক্স সহ
// =====================================================================
const wavePath = (
  baseY: number,
  amp: number,
  freq: number,
  phase: number,
  offsetX = 0,
): string => {
  let d = `M -100 ${H}`;
  for (let x = -100; x <= W + 100; x += 40) {
    const y =
      baseY +
      Math.sin((x + offsetX) * freq + phase) * amp +
      Math.sin((x + offsetX) * freq * 2.3 + phase * 1.7) * amp * 0.4;
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  d += ` L ${W + 100} ${H} Z`;
  return d;
};

export const Dunes: React.FC<{
  colors?: [string, string, string];
  parallax?: number; // ফ্রেম প্রতি পিক্সেল সরণ (০ = স্থির)
}> = ({ colors = ["#dcb878", "#cfa563", "#bd8f4f"], parallax = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0 }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      <path d={wavePath(GY - 150, 55, 0.0042, 0.5, frame * parallax * 0.3)} fill={colors[0]} />
      <path d={wavePath(GY - 80, 45, 0.0057, 2.1, frame * parallax * 0.6)} fill={colors[1]} />
      <path d={wavePath(GY - 25, 30, 0.0075, 4.0, frame * parallax)} fill={colors[2]} />
    </svg>
  );
};

// =====================================================================
// ৭) মাটি
// =====================================================================
export const Ground: React.FC<{ top?: string; bottom?: string }> = ({
  top = COLORS.sand,
  bottom = COLORS.sandDeep,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: GY,
      width: W,
      height: H - GY,
      background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`,
    }}
  />
);

// =====================================================================
// ৮) কার্পেট / সভার স্থান (মুনাজেরার মঞ্চ)
// =====================================================================
export const Carpet: React.FC<{
  x?: number; // কেন্দ্র
  y?: number; // ওপরের প্রান্ত
  width?: number;
  height?: number;
  color?: string;
}> = ({ x = W / 2, y = GY + 40, width = 1100, height = 150, color = "#8c2f39" }) => {
  const left = x - width / 2;
  const stars = Math.floor(width / 110);
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0 }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      <rect x={left + 10} y={y + height - 4} width={width} height={16} fill="rgba(0,0,0,0.25)" rx={8} />
      <rect x={left} y={y} width={width} height={height} fill={color} rx={10} />
      <rect x={left + 14} y={y + 14} width={width - 28} height={height - 28} fill="none" stroke={COLORS.gold} strokeWidth={4} rx={6} />
      {Array.from({ length: stars }).map((_, i) => (
        <path
          key={i}
          d={eightStarPath(left + 70 + i * ((width - 140) / Math.max(1, stars - 1)), y + height / 2, 26)}
          fill={COLORS.gold}
          opacity={0.9}
        />
      ))}
    </svg>
  );
};

// =====================================================================
// ৯) আট-কোণা ইসলামী তারা (জ্যামিতিক নকশা) — সহায়ক
// =====================================================================
export const eightStarPath = (cx: number, cy: number, r: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const rad = i % 2 === 0 ? r : r * 0.62;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

// =====================================================================
// ১০) মসজিদ
// =====================================================================
export const Mosque: React.FC<{
  x?: number; // কেন্দ্র
  baseY?: number; // ভিত্তির রেখা
  scale?: number;
  windowGlow?: number; // 0..1 (রাতে জানালা জ্বলে)
  body?: string;
  dome?: string;
}> = ({
  x = 1500,
  baseY = GY + 10,
  scale = 1,
  windowGlow = 0,
  body = COLORS.stone,
  dome = COLORS.green,
}) => {
  const winColor = interpolateColors(windowGlow, [0, 1], ["#3c4a63", COLORS.glow]);
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0 }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        {/* ছায়া */}
        <ellipse cx="0" cy="6" rx="300" ry="16" fill="rgba(0,0,0,0.22)" />
        {/* মিনার (বাম) */}
        <g>
          <rect x="-270" y="-380" width="46" height="380" fill={body} />
          <rect x="-278" y="-395" width="62" height="18" fill={COLORS.stoneDark} />
          <path d="M -270 -395 L -247 -470 L -224 -395 Z" fill={dome} />
          <circle cx="-247" cy="-478" r="7" fill={COLORS.gold} />
          <rect x="-256" y="-330" width="18" height="34" rx="9" fill={winColor} />
          <rect x="-256" y="-250" width="18" height="34" rx="9" fill={winColor} />
        </g>
        {/* মিনার (ডান) */}
        <g>
          <rect x="224" y="-380" width="46" height="380" fill={body} />
          <rect x="216" y="-395" width="62" height="18" fill={COLORS.stoneDark} />
          <path d="M 224 -395 L 247 -470 L 270 -395 Z" fill={dome} />
          <circle cx="247" cy="-478" r="7" fill={COLORS.gold} />
          <rect x="238" y="-330" width="18" height="34" rx="9" fill={winColor} />
          <rect x="238" y="-250" width="18" height="34" rx="9" fill={winColor} />
        </g>
        {/* মূল ভবন */}
        <rect x="-210" y="-210" width="420" height="210" fill={body} />
        <rect x="-210" y="-222" width="420" height="16" fill={COLORS.stoneDark} />
        {/* বড় গম্বুজ */}
        <path d="M -150 -222 C -150 -380 150 -380 150 -222 Z" fill={dome} />
        <path d="M -150 -222 C -150 -380 150 -380 150 -222 Z" fill="url(#domeShine)" />
        <defs>
          <linearGradient id="domeShine" x1="0" x2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* গম্বুজের মাথায় চাঁদ-তারা */}
        <rect x="-3" y="-330" width="6" height="40" fill={COLORS.gold} />
        <circle cx="0" cy="-345" r="14" fill={COLORS.gold} />
        <circle cx="6" cy="-348" r="11" fill={dome} />
        {/* ছোট দুই গম্বুজ */}
        <path d="M -200 -222 C -200 -290 -110 -290 -110 -222 Z" fill={dome} />
        <path d="M 110 -222 C 110 -290 200 -290 200 -222 Z" fill={dome} />
        {/* দরজা (খিলান) */}
        <path d="M -42 0 L -42 -95 C -42 -150 42 -150 42 -95 L 42 0 Z" fill={COLORS.wood} />
        <path d="M -30 0 L -30 -92 C -30 -130 30 -130 30 -92 L 30 0 Z" fill="#3a2713" />
        {/* জানালা */}
        {[-165, -105, 105, 165].map((wx) => (
          <path
            key={wx}
            d={`M ${wx - 17} -70 L ${wx - 17} -125 C ${wx - 17} -158 ${wx + 17} -158 ${wx + 17} -125 L ${wx + 17} -70 Z`}
            fill={winColor}
          />
        ))}
      </g>
    </svg>
  );
};

// =====================================================================
// ১১) শহরের ঘরবাড়ি (৩ ধরন)
// =====================================================================
export const CityBuilding: React.FC<{
  x?: number;
  baseY?: number;
  scale?: number;
  variant?: 0 | 1 | 2;
  color?: string;
  windowGlow?: number;
}> = ({
  x = 300,
  baseY = GY + 6,
  scale = 1,
  variant = 0,
  color = "#e4cfa0",
  windowGlow = 0,
}) => {
  const win = interpolateColors(windowGlow, [0, 1], ["#4b5a73", COLORS.glow]);
  const dims = [
    { w: 170, h: 190 },
    { w: 150, h: 270 },
    { w: 230, h: 150 },
  ][variant];
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0 }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <ellipse cx="0" cy="4" rx={dims.w * 0.62} ry="10" fill="rgba(0,0,0,0.2)" />
        <rect x={-dims.w / 2} y={-dims.h} width={dims.w} height={dims.h} fill={color} />
        <rect x={-dims.w / 2 - 6} y={-dims.h - 12} width={dims.w + 12} height={14} fill={COLORS.sandDark} />
        {Array.from({ length: Math.floor(dims.h / 90) + 1 }).map((_, r) =>
          [-1, 1].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={c * (dims.w / 4) - 14}
              y={-dims.h + 28 + r * 80}
              width={28}
              height={40}
              rx={14}
              fill={win}
            />
          )),
        )}
        <path d={`M -22 0 L -22 -58 C -22 -86 22 -86 22 -58 L 22 0 Z`} fill={COLORS.wood} />
      </g>
    </svg>
  );
};

// =====================================================================
// ১২) খেজুর গাছ — বাতাসে দোলে
// =====================================================================
export const Palm: React.FC<{
  x?: number;
  baseY?: number;
  scale?: number;
  sway?: number;
}> = ({ x = 120, baseY = GY + 12, scale = 1, sway = 1 }) => {
  const frame = useCurrentFrame();
  const angle = bob(frame, 0.04, 2.5 * sway, x);
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0 }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <ellipse cx="0" cy="4" rx="46" ry="8" fill="rgba(0,0,0,0.2)" />
        <g transform={`rotate(${angle * 0.4} 0 0)`}>
          <path d="M -12 0 C -8 -140 10 -250 18 -340 L 32 -340 C 22 -250 8 -140 14 0 Z" fill="#7a5530" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d="M 0 0 C 50 -40 120 -30 160 20 C 110 -10 50 -12 0 0 Z"
              fill={i % 2 ? COLORS.green : COLORS.greenDark}
              transform={`translate(25 -340) rotate(${-150 + i * 50 + angle * (i % 2 ? 1 : -1)})`}
            />
          ))}
          <circle cx="22" cy="-332" r="8" fill="#5b3b1a" />
          <circle cx="36" cy="-326" r="7" fill="#5b3b1a" />
        </g>
      </g>
    </svg>
  );
};

// =====================================================================
// ১৩) ইসলামী বর্ডার — কোণে আট-কোণা তারা + দ্বিস্তর ফ্রেম
// =====================================================================
export const IslamicBorder: React.FC<{
  color?: string;
  inset?: number;
  opacity?: number;
}> = ({ color = COLORS.gold, inset = 36, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const rot = frame * 0.15;
  const corners: [number, number][] = [
    [inset, inset],
    [W - inset, inset],
    [inset, H - inset],
    [W - inset, H - inset],
  ];
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, opacity }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      <rect x={inset} y={inset} width={W - inset * 2} height={H - inset * 2} fill="none" stroke={color} strokeWidth={5} />
      <rect x={inset + 14} y={inset + 14} width={W - (inset + 14) * 2} height={H - (inset + 14) * 2} fill="none" stroke={color} strokeWidth={2} />
      {corners.map(([cx, cy], i) => (
        <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
          <path d={eightStarPath(cx, cy, 46)} fill={color} />
          <path d={eightStarPath(cx, cy, 24)} fill={COLORS.nightBlue} />
        </g>
      ))}
    </svg>
  );
};

// =====================================================================
// ১৪) ভাসমান ধুলো/আলোর কণা
// =====================================================================
export const Dust: React.FC<{
  count?: number;
  color?: string;
  opacity?: number;
}> = ({ count = 30, color = "#fff1c2", opacity = 0.5 }) => {
  const frame = useCurrentFrame();
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, opacity }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const speed = 0.3 + random(`dust-v-${i}`) * 0.8;
        const x = (random(`dust-x-${i}`) * W + frame * speed + Math.sin(frame * 0.02 + i) * 25) % W;
        const y = H - ((random(`dust-y-${i}`) * H + frame * speed * 0.4) % H);
        const r = 1.5 + random(`dust-r-${i}`) * 3;
        return <circle key={i} cx={x} cy={y} r={r} fill={color} />;
      })}
    </svg>
  );
};

// =====================================================================
// ১৫) ভিনিয়েট (কোণ ঘন করা, সিনেমাটিক)
// =====================================================================
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.45 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

// =====================================================================
// ১৬) ক্যামেরা — ধীর জুম + প্যান (দৃশ্য মোড়াতে ব্যবহার করুন)
// =====================================================================
export const Camera: React.FC<{
  children: React.ReactNode;
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number; // মোট পিক্সেল সরণ (সময়ের সাথে)
  panY?: number;
  originX?: number; // % (জুমের কেন্দ্র)
  originY?: number;
}> = ({
  children,
  zoomFrom = 1,
  zoomTo = 1.08,
  panX = 0,
  panY = 0,
  originX = 50,
  originY = 60,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const last = Math.max(1, durationInFrames - 1);
  const z = interpolate(frame, [0, last], [zoomFrom, zoomTo]);
  const px = interpolate(frame, [0, last], [0, panX]);
  const py = interpolate(frame, [0, last], [0, panY]);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${px}px, ${py}px) scale(${z})`,
        transformOrigin: `${originX}% ${originY}%`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
