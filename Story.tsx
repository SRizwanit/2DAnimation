import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SCENE_COMPONENTS } from "./scenes";

// ধাপ ৯ — চূড়ান্ত অ্যাসেম্বলি
// দৃশ্যগুলো একটার পর একটা (ফেড ট্রানজিশনে) বসে, প্রতিটিতে নিজের ভয়েসওভার।
// সাবটাইটেল scenes.tsx-এর `Shell`-এর ভেতরেই আছে, তাই এখানে আলাদা বসানো হয়নি।
// Root.tsx এই দুটি টাইপের উপর নির্ভর করে — বদলানো যাবে না।

export type SceneTiming = {
  id: string;
  seconds: number; // অডিও দৈর্ঘ্য
  audio?: string; // অডিও ফাইলের নাম (public/-এ); না থাকলে দৃশ্য নীরব
  frames: number; // অডিও + বিরতি (ফ্রেমে)
};

export type StoryProps = {
  scenes: SceneTiming[];
  transitionFrames: number;
};

// ভয়েসওভারের আওয়াজ (০..১)
const VOICE_VOLUME = 1;
// শেষ দৃশ্যের শেষে কালোতে মিলিয়ে যাওয়ার ফ্রেম
const END_FADE_FRAMES = 18;

export const Story: React.FC<StoryProps> = ({ scenes, transitionFrames }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // শেষে ধীরে কালো হয়ে যাওয়া (ক্লিফহ্যাঙ্গার ফিনিশ)
  const endFade = interpolate(
    frame,
    [durationInFrames - END_FADE_FRAMES, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ট্রানজিশন কখনো দৃশ্যের চেয়ে লম্বা হতে পারবে না
  const minFrames = scenes.reduce(
    (m, s) => Math.min(m, s.frames),
    Number.POSITIVE_INFINITY
  );
  const tf = Math.max(1, Math.min(transitionFrames, Math.floor(minFrames / 2)));

  const items: React.ReactNode[] = [];
  scenes.forEach((scene, i) => {
    const Component = SCENE_COMPONENTS[scene.id];
    if (!Component) {
      throw new Error(
        `scenes.tsx-এর SCENE_COMPONENTS-এ "${scene.id}" আইডি নেই। ` +
          `script.json / script.ts / durations.json / scenes.tsx-এর আইডি মিলিয়ে দেখুন।`
      );
    }

    if (i > 0) {
      items.push(
        <TransitionSeries.Transition
          key={`t-${scene.id}`}
          presentation={fade()}
          timing={linearTiming({ durationInFrames: tf })}
        />
      );
    }

    items.push(
      <TransitionSeries.Sequence
        key={`s-${scene.id}`}
        durationInFrames={scene.frames}
      >
        <Component seconds={scene.seconds} />
        {scene.audio ? (
          <Audio src={staticFile(scene.audio)} volume={VOICE_VOLUME} />
        ) : null}
      </TransitionSeries.Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>{items}</TransitionSeries>
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: endFade,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
