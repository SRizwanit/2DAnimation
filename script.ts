import type { TimeOfDay } from "./theme";
import type { Mood } from "./characters";
import scriptData from "./script.json";

// =====================================================================
// স্ক্রিপ্ট ডেটা (ধাপ ৫)
//  • script.json  → বর্ণনার টেক্সট, আইডি, ভয়েস সেটিং (tts.py এটাই পড়ে)
//  • script.ts    → দৃশ্যের ভিজ্যুয়াল তথ্য (সময়, মুড, সংলাপ...) — scenes.tsx এটা পড়ে
//  ⚠️ script.json, script.ts এবং durations.json-এর দৃশ্য-আইডি হুবহু এক হতে হবে।
// =====================================================================

export type SceneMeta = {
  title: string; // সংক্ষিপ্ত নাম (বাংলা)
  visual: string; // কী দেখানো হবে (নির্দেশনা — scenes.tsx এ বাস্তবায়ন)
  timeFrom: TimeOfDay; // আকাশের শুরুর সময়
  timeTo: TimeOfDay; // আকাশের শেষ সময়
  sunFrom: number; // সূর্যের শুরুর অবস্থান 0..1
  sunTo: number; // সূর্যের শেষ অবস্থান 0..1
  crowdMood: Mood;
  showSubtitle: boolean;
  dialogue?: string; // স্পিচ-বাবলে যা দেখাবে
};

export type SceneDef = SceneMeta & {
  id: string;
  narration: string; // সাবটাইটেলে দেখানো টেক্সট
  ttsText: string; // ভয়েসে যা পড়া হবে (না থাকলে narration)
  minSeconds: number; // অডিও না থাকলে ফলব্যাক দৈর্ঘ্য
};

// দৃশ্যভিত্তিক মেটা-তথ্য (আইডি দিয়ে মেলানো)
const SCENE_META: Record<string, SceneMeta> = {
  "s0-title": {
    title: "টাইটেল",
    visual:
      "রাতের আকাশ, ঝিকমিক তারা, চাঁদ; নিচে মসজিদের সিলুয়েট; ইসলামী বর্ডার; সোনালি বড় শিরোনাম ফেড-ইন",
    timeFrom: "night",
    timeTo: "dawn",
    sunFrom: 0,
    sunTo: 0,
    crowdMood: "calm",
    showSubtitle: false,
  },
  "s1-atheist": {
    title: "নাস্তিকের পরিচয় ও মুনাজেরার কথা",
    visual:
      "ভোরের আলো; একপাশে নাস্তিক পণ্ডিত গম্ভীরভাবে দাঁড়িয়ে; অন্যপাশে ইমামের নূরানী সিলুয়েট (ঝাপসা, দূরে); ধীর জুম",
    timeFrom: "dawn",
    timeTo: "morning",
    sunFrom: 0.05,
    sunTo: 0.18,
    crowdMood: "calm",
    showSubtitle: true,
  },
  "s2-topic": {
    title: "মুনাজেরার বিষয়",
    visual:
      "ঘুরন্ত পৃথিবী (গ্লোব), তার উপরে বড় প্রশ্নবোধক চিহ্ন, চারপাশে ভাসমান আলোর কণা; বাংলা প্রশ্ন: 'সৃষ্টিকর্তা কি আছেন?'",
    timeFrom: "morning",
    timeTo: "morning",
    sunFrom: 0.18,
    sunTo: 0.22,
    crowdMood: "curious",
    showSubtitle: true,
  },
  "s3-crowd": {
    title: "শত্রু-মিত্র সবার সমাবেশ",
    visual:
      "মসজিদ/শহরের পটভূমি; ডান ও বাম দিক থেকে ভিড় হেঁটে এসে কার্পেটের চারপাশে জড়ো হচ্ছে; কৌতূহলে মাথা ঘোরাচ্ছে",
    timeFrom: "morning",
    timeTo: "morning",
    sunFrom: 0.22,
    sunTo: 0.28,
    crowdMood: "curious",
    showSubtitle: true,
  },
  "s4-atheist-arrives": {
    title: "নাস্তিক সময়মতো হাজির",
    visual:
      "নাস্তিক হেঁটে এসে সভার মাঝের আসনে দাঁড়ায়/বসে; ভিড় তাকিয়ে দেখছে; ডান পাশের আসন ফাঁকা (ইমামের জন্য)",
    timeFrom: "morning",
    timeTo: "morning",
    sunFrom: 0.28,
    sunTo: 0.32,
    crowdMood: "calm",
    showSubtitle: true,
  },
  "s5-delay": {
    title: "ইমামের দেরি",
    visual:
      "সূর্য আকাশে দ্রুত সরছে (সময় গড়াচ্ছে), আকাশ সকাল→বিকেল; ভিড় অধৈর্য (পা ঠুকছে, মাথা নাড়ছে); শেষ দিকে ইমামের নূরানী সিলুয়েট ধীরে হেঁটে প্রবেশ করছে",
    timeFrom: "morning",
    timeTo: "afternoon",
    sunFrom: 0.32,
    sunTo: 0.66,
    crowdMood: "impatient",
    showSubtitle: true,
  },
  "s6-question": {
    title: "নাস্তিকের প্রশ্ন",
    visual:
      "মুখোমুখি নাস্তিক ও ইমাম; নাস্তিক হাত তুলে প্রশ্ন করছে; স্পিচ-বাবলে সংলাপ; ভিড় নীরবে অপেক্ষায়; ক্লিফহ্যাঙ্গার — শেষে ধীর জুম",
    timeFrom: "afternoon",
    timeTo: "afternoon",
    sunFrom: 0.66,
    sunTo: 0.7,
    crowdMood: "curious",
    showSubtitle: true,
    dialogue: "আপনি এত দেরী করলেন কেন?",
  },
};

type RawScene = {
  id: string;
  narration: string;
  ttsText?: string;
  minSeconds: number;
};

export const STORY_TITLE: string = scriptData.title;
export const VOICE = {
  name: scriptData.voice,
  rate: scriptData.rate,
  pitch: scriptData.pitch,
};

export const SCENES: SceneDef[] = (scriptData.scenes as RawScene[]).map(
  (raw) => {
    const meta = SCENE_META[raw.id];
    if (!meta) {
      throw new Error(
        `script.ts: "${raw.id}" দৃশ্যের মেটা-তথ্য (SCENE_META) পাওয়া যায়নি`,
      );
    }
    return {
      ...meta,
      id: raw.id,
      narration: raw.narration,
      ttsText: raw.ttsText ?? raw.narration,
      minSeconds: raw.minSeconds,
    };
  },
);

export const SCENE_IDS: string[] = SCENES.map((s) => s.id);

export const getScene = (id: string): SceneDef => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`script.ts: "${id}" নামে কোনো দৃশ্য নেই`);
  return s;
};
