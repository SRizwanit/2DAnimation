import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CANVAS, COLORS, FONT_FAMILY, bob } from "./theme";
import type { TimeOfDay } from "./theme";
import {
  Camera,
  Carpet,
  CityBuilding,
  Clouds,
  Dunes,
  Dust,
  Ground,
  IslamicBorder,
  Moon,
  Mosque,
  Palm,
  Sky,
  Stars,
  Sun,
  Vignette,
} from "./components";
import { Atheist, Crowd, Imam, SpeechBubble, moveTo } from "./characters";
import type { Mood } from "./characters";
import { Subtitle } from "./Subtitle";
import { getScene } from "./script";

const { width: W, height: H, groundY: GY } = CANVAS;

// দৃশ্যে ব্যবহৃত স্থির অবস্থান (সব দৃশ্যে একই, যাতে ধারাবাহিকতা থাকে)
const ATHEIST_X = 760;
const IMAM_X = 1160;
const CARPET_X = 960;

export type SceneProps = {
  /** এই দৃশ্যের অডিও দৈর্ঘ্য (সেকেন্ড) — Story.tsx থেকে আসে */
  seconds: number;
};

// =====================================================================
// সহায়ক: আকাশ + সূর্য + মেঘ + (ঐচ্ছিক) টিলা, ঘরবাড়ি, মসজিদ, মাটি
// সময়/সূর্য/অন্ধকার script.ts-এর দৃশ্য-মেটা থেকে অটো আসে
// =====================================================================
const DARK: Record<TimeOfDay, number> = {
  night: 1,
  dawn: 0.65,
  morning: 0.08,
  noon: 0,
  afternoon: 0.06,
  dusk: 0.55,
};

const Backdrop: React.FC<{
  sceneId: string;
  scenery?: boolean; // false হলে শুধু আকাশ/সূর্য/মেঘ
  cloudSpeed?: number;
  showMoon?: boolean;
}> = ({ sceneId, scenery = true, cloudSpeed = 0.6, showMoon = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sc = getScene(sceneId);
  const p = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    extrapolateRight: "clamp",
  });
  const dark = interpolate(p, [0, 1], [DARK[sc.timeFrom], DARK[sc.timeTo]]);
  const sunP = interpolate(p, [0, 1], [sc.sunFrom, sc.sunTo]);
  const mix = (day: string, night: string) =>
    interpolateColors(dark, [0, 1], [day, night]);

  const starsOpacity = interpolate(dark, [0.4, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sunOpacity = interpolate(dark, [0.5, 0.9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Sky from={sc.timeFrom} to={sc.timeTo} progress={p} />
      {starsOpacity > 0.01 && <Stars opacity={starsOpacity} />}
      {showMoon && (
        <div style={{ position: "absolute", inset: 0, opacity: starsOpacity }}>
          <Moon />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, opacity: sunOpacity }}>
        <Sun progress={sunP} />
      </div>
      <Clouds
        count={5}
        speed={cloudSpeed}
        opacity={0.9 - 0.7 * dark}
        color={mix("#ffffff", "#8fa0c8")}
      />

      {scenery && (
        <>
          <Dunes
            colors={[
              mix("#dcb878", "#2a3550"),
              mix("#cfa563", "#223049"),
              mix("#bd8f4f", "#1a2740"),
            ]}
            parallax={0.2}
          />
          <CityBuilding x={210} baseY={GY - 8} scale={0.85} variant={0} color={mix("#e4cfa0", "#56648a")} windowGlow={dark} />
          <CityBuilding x={440} baseY={GY - 8} scale={0.85} variant={1} color={mix("#dcc592", "#4d5a7e")} windowGlow={dark} />
          <CityBuilding x={1560} baseY={GY - 8} scale={0.85} variant={2} color={mix("#e4cfa0", "#56648a")} windowGlow={dark} />
          <CityBuilding x={1780} baseY={GY - 8} scale={0.85} variant={0} color={mix("#dcc592", "#4d5a7e")} windowGlow={dark} />
          <Mosque
            x={CARPET_X}
            baseY={GY - 14}
            scale={0.9}
            windowGlow={dark}
            body={mix(COLORS.stone, "#56648a")}
            dome={mix(COLORS.green, "#2a6a5a")}
          />
          <Palm x={90} baseY={GY + 2} scale={0.95} />
          <Palm x={1850} baseY={GY + 2} scale={0.9} sway={1.3} />
          <Ground top={mix(COLORS.sand, "#2b3652")} bottom={mix(COLORS.sandDeep, "#1a2238")} />
          {/* রাতের অন্ধকার ছায়া (সব পটভূমির উপর) */}
          <AbsoluteFill style={{ background: `rgba(5,10,30,${dark * 0.28})` }} />
        </>
      )}
      <Dust count={26} opacity={0.35 + 0.3 * dark} />
    </AbsoluteFill>
  );
};

// =====================================================================
// সহায়ক: দৃশ্যের খোল — ক্যামেরা + ভিনিয়েট + বর্ডার + সাবটাইটেল
// =====================================================================
const Shell: React.FC<{
  id: string;
  seconds: number;
  zoom?: [number, number];
  pan?: [number, number];
  origin?: [number, number];
  border?: boolean;
  children: React.ReactNode;
}> = ({
  id,
  seconds,
  zoom = [1, 1.07],
  pan = [0, 0],
  origin = [50, 60],
  border = true,
  children,
}) => {
  const { fps } = useVideoConfig();
  const scene = getScene(id);
  return (
    <AbsoluteFill style={{ background: COLORS.nightBlue }}>
      <Camera
        zoomFrom={zoom[0]}
        zoomTo={zoom[1]}
        panX={pan[0]}
        panY={pan[1]}
        originX={origin[0]}
        originY={origin[1]}
      >
        {children}
      </Camera>
      <Vignette strength={0.42} />
      {border && <IslamicBorder opacity={0.5} />}
      <Subtitle
        text={scene.narration}
        speakFrames={Math.round(seconds * fps)}
        visible={scene.showSubtitle}
      />
    </AbsoluteFill>
  );
};

// ভিড়ের দুই দল (বাম ও ডান) — সব দৃশ্যে একই সিড, তাই একই জায়গায় দাঁড়ায়
const CrowdSides: React.FC<{
  mode: "standing" | "arriving" | "sitting";
  startFrame?: number;
  arriveFrames?: number;
  mood?: Mood;
  moodMix?: number;
}> = (p) => (
  <>
    <Crowd seed="L" count={12} centerX={430} spread={560} from="left" scale={0.6} {...p} />
    <Crowd seed="R" count={12} centerX={1490} spread={560} from="right" scale={0.6} {...p} />
  </>
);

// ইমামের জন্য ফাঁকা আসন (সোনালি স্পন্দিত বৃত্ত)
const EmptySeat: React.FC<{ x?: number; y?: number; opacity?: number }> = ({
  x = IMAM_X,
  y = GY + 120,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const pulse = 1 + bob(frame, 0.1, 0.06);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, opacity }} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <g transform={`translate(${x} ${y})`}>
        <ellipse cx={0} cy={26} rx={96} ry={14} fill="rgba(0,0,0,0.25)" />
        <rect x={-78} y={-6} width={156} height={34} rx={16} fill="#8c2f39" />
        <rect x={-70} y={0} width={140} height={6} rx={3} fill={COLORS.gold} opacity={0.9} />
        <ellipse
          cx={0}
          cy={10}
          rx={120 * pulse}
          ry={28 * pulse}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={3}
          strokeDasharray="10 10"
          opacity={0.75}
        />
      </g>
    </svg>
  );
};

// =====================================================================
// দৃশ্য ০ — টাইটেল
// =====================================================================
export const Scene0Title: React.FC<SceneProps> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = (delay: number) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 90 } });
    return { opacity: Math.min(1, Math.max(0, s)), transform: `translateY(${(1 - s) * 40}px)` };
  };
  return (
    <Shell id="s0-title" seconds={seconds} zoom={[1.0, 1.1]} origin={[50, 70]}>
      <Backdrop sceneId="s0-title" showMoon cloudSpeed={0.3} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT_FAMILY,
          textAlign: "center",
          paddingBottom: 140,
        }}
      >
        <div style={{ ...line(8), fontSize: 132, fontWeight: 700, color: COLORS.gold, textShadow: "0 0 40px rgba(232,198,106,0.7), 0 6px 14px rgba(0,0,0,0.6)", lineHeight: 1.3 }}>
          ইমাম আবু হানিফা
        </div>
        <div style={{ ...line(24), fontSize: 54, fontWeight: 400, color: COLORS.goldLight, textShadow: "0 4px 10px rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
          (রাদিআল্লাহু আনহু)
        </div>
        <div style={{ ...line(40), fontSize: 92, fontWeight: 700, color: COLORS.white, textShadow: "0 6px 14px rgba(0,0,0,0.6)", lineHeight: 1.4, marginTop: 10 }}>
          ও নাস্তিকের মুনাজেরা
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

// =====================================================================
// দৃশ্য ১ — নাস্তিকের পরিচয় ও মুনাজেরার কথা
// =====================================================================
export const Scene1Atheist: React.FC<SceneProps> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const a = moveTo(frame, 0, 75, -180, 560);
  const imamOpacity = interpolate(frame, [40, 100], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Shell id="s1-atheist" seconds={seconds} zoom={[1, 1.1]} origin={[35, 62]}>
      <Backdrop sceneId="s1-atheist" />
      <Carpet x={CARPET_X} width={1100} />
      <Imam x={1330} y={GY + 40} scale={0.55} opacity={imamOpacity} mood="calm" />
      <Atheist x={a.x} walking={a.walking} flip={a.dir < 0} scale={1} mood="serious" />
    </Shell>
  );
};

// =====================================================================
// দৃশ্য ২ — মুনাজেরার বিষয় (ঘুরন্ত পৃথিবী + প্রশ্নবোধক)
// =====================================================================
const Globe: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => {
  const frame = useCurrentFrame();
  const shift = (frame * 1.4) % 840;
  const land = "#4caf6a";
  const landDark = "#2f8f55";
  return (
    <svg style={{ position: "absolute", left: 0, top: 0 }} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <radialGradient id="oceanG" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#8fd8ff" />
          <stop offset="100%" stopColor="#1a5fa8" />
        </radialGradient>
        <radialGradient id="shadeG" cx="35%" cy="30%" r="80%">
          <stop offset="55%" stopColor="rgba(0,10,40,0)" />
          <stop offset="100%" stopColor="rgba(0,10,40,0.6)" />
        </radialGradient>
        <radialGradient id="atmoG">
          <stop offset="70%" stopColor="rgba(150,220,255,0)" />
          <stop offset="100%" stopColor="rgba(150,220,255,0.55)" />
        </radialGradient>
        <clipPath id="globeClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.22} fill="url(#atmoG)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#oceanG)" />
      <g clipPath="url(#globeClip)">
        {[0, 840].map((off) => (
          <g key={off} transform={`translate(${cx - r - shift + off} ${cy - r})`}>
            <ellipse cx={90} cy={150} rx={80} ry={55} fill={land} />
            <ellipse cx={120} cy={290} rx={42} ry={70} fill={landDark} />
            <ellipse cx={300} cy={120} rx={90} ry={48} fill={landDark} />
            <ellipse cx={340} cy={250} rx={60} ry={85} fill={land} />
            <ellipse cx={520} cy={140} rx={110} ry={55} fill={land} />
            <ellipse cx={580} cy={290} rx={55} ry={42} fill={landDark} />
            <ellipse cx={740} cy={200} rx={70} ry={62} fill={land} />
            <ellipse cx={420} cy={50} rx={60} ry={22} fill="#f2f6fb" opacity={0.9} />
            <ellipse cx={420} cy={385} rx={90} ry={22} fill="#f2f6fb" opacity={0.9} />
          </g>
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="url(#shadeG)" />
      <ellipse cx={cx - r * 0.38} cy={cy - r * 0.45} rx={r * 0.28} ry={r * 0.14} fill="#ffffff" opacity={0.28} transform={`rotate(-30 ${cx - r * 0.38} ${cy - r * 0.45})`} />
      {/* কক্ষপথে ঘুরন্ত প্রশ্নচিহ্ন */}
      {[0, 1, 2].map((i) => {
        const ang = frame * 0.035 + i * ((Math.PI * 2) / 3);
        const x = cx + Math.cos(ang) * r * 1.6;
        const y = cy + Math.sin(ang) * r * 0.5;
        const behind = Math.sin(ang) < 0;
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize={84}
            fontWeight={700}
            fontFamily={FONT_FAMILY}
            fill={COLORS.gold}
            textAnchor="middle"
            opacity={behind ? 0.45 : 1}
            style={{ filter: "drop-shadow(0 0 12px rgba(232,198,106,0.8))" }}
          >
            ?
          </text>
        );
      })}
    </svg>
  );
};

export const Scene2Topic: React.FC<SceneProps> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 22, fps, config: { damping: 14, stiffness: 100 } });
  const floatY = bob(frame, 0.05, 8);
  return (
    <Shell id="s2-topic" seconds={seconds} zoom={[1, 1.06]} origin={[50, 45]}>
      <Backdrop sceneId="s2-topic" scenery={false} cloudSpeed={0.9} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${floatY}px)` }}>
        <Globe cx={960} cy={400} r={200} />
      </div>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 300,
          fontFamily: FONT_FAMILY,
          fontWeight: 700,
          fontSize: 72,
          color: COLORS.white,
          textAlign: "center",
          textShadow: "0 6px 16px rgba(0,0,0,0.65)",
          opacity: Math.min(1, Math.max(0, s)),
          transform: `translateY(${(1 - s) * 30}px)`,
        }}
      >
        <span style={{ color: COLORS.gold }}>পৃথিবীর</span> কোন সৃষ্টিকর্তা আছে কিনা?
      </AbsoluteFill>
    </Shell>
  );
};

// =====================================================================
// দৃশ্য ৩ — শত্রু-মিত্র সবার সমাবেশ
// =====================================================================
export const Scene3Crowd: React.FC<SceneProps> = ({ seconds }) => (
  <Shell id="s3-crowd" seconds={seconds} zoom={[1, 1.08]} origin={[50, 65]}>
    <Backdrop sceneId="s3-crowd" />
    <Carpet x={CARPET_X} width={1100} />
    <CrowdSides mode="arriving" startFrame={8} arriveFrames={210} mood="curious" />
  </Shell>
);

// =====================================================================
// দৃশ্য ৪ — নাস্তিক সময়মতো হাজির
// =====================================================================
export const Scene4AtheistArrives: React.FC<SceneProps> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const a = moveTo(frame, 0, 80, -180, ATHEIST_X);
  const settled = !a.walking;
  return (
    <Shell id="s4-atheist-arrives" seconds={seconds} zoom={[1.0, 1.09]} origin={[42, 62]}>
      <Backdrop sceneId="s4-atheist-arrives" />
      <Carpet x={CARPET_X} width={1100} />
      <EmptySeat />
      <CrowdSides mode="standing" mood="curious" />
      <Atheist
        x={a.x}
        walking={a.walking}
        flip={a.dir < 0}
        mood="serious"
        headTurn={settled ? Math.sin(frame * 0.05) : 0}
      />
    </Shell>
  );
};

// =====================================================================
// দৃশ্য ৫ — ইমামের দেরি (সময় গড়ায়, ভিড় অধৈর্য, শেষে ইমাম আসেন)
// =====================================================================
export const Scene5Delay: React.FC<SceneProps> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const enterStart = Math.round(durationInFrames * 0.5);
  const enterEnd = durationInFrames - 24;
  const m = moveTo(frame, enterStart, enterEnd, W + 220, IMAM_X);
  const imamHere = frame >= enterStart;
  return (
    <Shell id="s5-delay" seconds={seconds} zoom={[1.06, 1.0]} origin={[55, 62]}>
      <Backdrop sceneId="s5-delay" cloudSpeed={2.6} />
      <Carpet x={CARPET_X} width={1100} />
      {!imamHere && <EmptySeat />}
      <CrowdSides mode="standing" mood="curious" moodMix={0.7} />
      <Atheist
        x={ATHEIST_X}
        mood="impatient"
        headTurn={Math.sin(frame * 0.06)}
      />
      {imamHere && (
        <Imam
          x={m.x}
          walking={m.walking}
          flip={m.dir < 0}
          walkSpeed={0.8}
          glow={0.9}
          mood="calm"
        />
      )}
    </Shell>
  );
};

// =====================================================================
// দৃশ্য ৬ — নাস্তিকের প্রশ্ন (ক্লিফহ্যাঙ্গার)
// =====================================================================
export const Scene6Question: React.FC<SceneProps> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const raise = interpolate(frame, [26, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dialogue = getScene("s6-question").dialogue ?? "";
  return (
    <Shell id="s6-question" seconds={seconds} zoom={[1.0, 1.13]} origin={[55, 55]}>
      <Backdrop sceneId="s6-question" />
      <Carpet x={CARPET_X} width={1100} />
      <CrowdSides mode="standing" mood="curious" />
      <Atheist x={ATHEIST_X} mood="serious" raise={raise} headTurn={0.8} />
      <Imam x={IMAM_X} mood="calm" glow={0.9} headTurn={-0.5} />
      <SpeechBubble x={ATHEIST_X} y={430} text={dialogue} width={660} fontSize={50} startFrame={40} />
    </Shell>
  );
};

// =====================================================================
// আইডি → কম্পোনেন্ট (Story.tsx এটা দিয়েই দৃশ্য বসাবে)
// =====================================================================
export const SCENE_COMPONENTS: Record<string, React.FC<SceneProps>> = {
  "s0-title": Scene0Title,
  "s1-atheist": Scene1Atheist,
  "s2-topic": Scene2Topic,
  "s3-crowd": Scene3Crowd,
  "s4-atheist-arrives": Scene4AtheistArrives,
  "s5-delay": Scene5Delay,
  "s6-question": Scene6Question,
};
