import React from "react";
import { Composition } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { Story } from "./Story";
import type { StoryProps } from "./Story";
import durations from "./durations.json";

// ---------- ভিডিও স্পেক ----------
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// প্রতিটি দৃশ্যের অডিও শেষ হওয়ার পর অতিরিক্ত বিরতি (সেকেন্ড)
const SCENE_PADDING_SECONDS = 0.8;
// দৃশ্যের মাঝের ফেড ট্রানজিশনের দৈর্ঘ্য (ফ্রেম) — ধাপ ৯-এ ব্যবহার হবে
const TRANSITION_FRAMES = 12;

type DurationsFile = {
  scenes: { id: string; seconds: number; audio?: string }[];
};

// durations.json থেকে দৃশ্যের ফ্রেম-সংখ্যা বের করা
const buildScenes = (file: DurationsFile): StoryProps["scenes"] =>
  file.scenes.map((s) => ({
    id: s.id,
    seconds: s.seconds,
    audio: s.audio,
    frames: Math.max(1, Math.ceil((s.seconds + SCENE_PADDING_SECONDS) * FPS)),
  }));

const defaultProps: StoryProps = {
  scenes: buildScenes(durations as DurationsFile),
  transitionFrames: TRANSITION_FRAMES,
};

// মোট ভিডিও দৈর্ঘ্য = দৃশ্যের যোগফল − ওভারল্যাপ হওয়া ট্রানজিশন
const calculateMetadata: CalculateMetadataFunction<StoryProps> = async ({
  props,
}) => {
  const n = props.scenes.length;
  const sum = props.scenes.reduce((acc, s) => acc + s.frames, 0);
  const overlap = Math.max(0, n - 1) * props.transitionFrames;
  return {
    durationInFrames: Math.max(1, sum - overlap),
    props,
  };
};

export const Root: React.FC = () => {
  return (
    <Composition
      id="Story"
      component={Story}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={300}
      defaultProps={defaultProps}
      calculateMetadata={calculateMetadata}
    />
  );
};
