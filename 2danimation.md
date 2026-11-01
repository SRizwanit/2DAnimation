# 2danimation.md — ইসলামী কাহিনীর ২ডি অ্যানিমেশন (React + Remotion + GitHub Actions)

> **ব্যবহারের নিয়ম:** টোকেন/কনটেক্সট শেষ হলে নতুন চ্যাটে এই ফাইলটি পেস্ট করে শুধু বলবেন: **"ধাপ ৫ করো"**।
> আমি এই ফাইল দেখে বুঝব ওই ধাপে কোন ফাইল বানাতে হবে, কী নিয়ম মানতে হবে এবং আগের ধাপের কোন ফাইলের উপর নির্ভর করতে হবে।

---

## ০. মূল নিয়ম (সব ধাপে প্রযোজ্য)

1. **কোনো সাবফোল্ডার নয়।** সব ফাইল মেইন রিপোর রুটে থাকবে। একমাত্র ব্যতিক্রম: `.github/workflows/render.yml`।
2. **ডিভাইস লাগবে না।** রেন্ডার হবে GitHub Actions-এ। আপনি শুধু GitHub-এ ফাইল আপলোড/এডিট করবেন (মোবাইল ব্রাউজারেও চলবে)।
3. **অ্যানিমেশন কোড দিয়ে আঁকা।** কোনো ছবি/ভিডিও ডাউনলোড বা ডিজাইন করা লাগবে না। সব চরিত্র, আকাশ, মসজিদ, ভিড় — SVG + CSS + Remotion `interpolate/spring` দিয়ে।
4. **চরিত্রের মুখ আঁকা হবে না।** ইমাম আবু হানিফা (রাহিমাহুল্লাহ) সহ কোনো সম্মানিত ব্যক্তির মুখমণ্ডল দেখানো হবে না। ছায়ামূর্তি/মুখহীন সিলুয়েট + পাগড়ি/টুপি/জুব্বা দিয়ে চেনানো হবে।
5. **ভয়েসওভার:** বিনামূল্যে `edge-tts` (Microsoft বাংলা ভয়েস) GitHub Actions-এ চলবে। অডিও রান-টাইমে তৈরি হবে, রিপোতে কমিট করতে হবে না।
6. **ফন্ট:** `Noto Sans Bengali` / `Hind Siliguri` (`@remotion/google-fonts` থেকে)।
7. **ভিডিও স্পেক:** 1920×1080, 30fps, MP4 (H.264)। (শর্টসের জন্য পরে 1080×1920 কম্পোজিশন যোগ করা যাবে।)
8. **সব টেক্সট বাংলা**, কমেন্ট বাংলা/ইংরেজি মিশ্র হতে পারে।
9. স্ক্রিপ্টে সম্মানসূচক শব্দ (রাদিআল্লাহু আনহু ইত্যাদি) অক্ষত থাকবে।

---

## ১. চূড়ান্ত ফাইল তালিকা (সব রুটে)

| ফাইল | কাজ | কোন ধাপে |
|---|---|---|
| `package.json` | ডিপেন্ডেন্সি ও স্ক্রিপ্ট | ধাপ ১ |
| `tsconfig.json` | TypeScript কনফিগ | ধাপ ১ |
| `remotion.config.ts` | Remotion কনফিগ (entry, codec) | ধাপ ১ |
| `.gitignore` | node_modules, out, public | ধাপ ১ |
| `index.ts` | Remotion এন্ট্রি (registerRoot) | ধাপ ২ |
| `Root.tsx` | Composition রেজিস্টার | ধাপ ২ |
| `theme.ts` | রং, ফন্ট, সাইজ, টাইমিং ধ্রুবক | ধাপ ৩ |
| `components.tsx` | আকাশ, সূর্য, মেঘ, মাটি, মসজিদ, তারা, ইত্যাদি | ধাপ ৩ |
| `characters.tsx` | ইমাম, নাস্তিক, ভিড়, ঘোড়া/হাঁটা অ্যানিমেশন | ধাপ ৪ |
| `script.json` | বর্ণনার টেক্সট, দৃশ্য-আইডি, ভয়েস সেটিং (tts.py এটাই পড়ে) | ধাপ ৫ |
| `script.ts` | দৃশ্যের ভিজ্যুয়াল মেটা (সময়, সূর্য, ভিড়ের মুড, সংলাপ) + script.json এর টাইপড র‍্যাপার | ধাপ ৫ |
| `Subtitle.tsx` | বাংলা সাবটাইটেল (শব্দে শব্দে হাইলাইট) | ধাপ ৬ |
| `scenes.tsx` | প্রতিটি দৃশ্যের কম্পোনেন্ট | ধাপ ৭ |
| `Story.tsx` | সব দৃশ্য + অডিও + ট্রানজিশন জোড়া | ধাপ ৯ |
| `tts.py` | বাংলা ভয়েস তৈরি + দৈর্ঘ্য JSON | ধাপ ৮ |
| `requirements.txt` | Python ডিপেন্ডেন্সি (edge-tts, mutagen) | ধাপ ৮ |
| `durations.json` | (অটো-জেনারেটেড) প্রতি দৃশ্যের অডিও দৈর্ঘ্য | ধাপ ৮ |
| `.github/workflows/render.yml` | অটো রেন্ডার ও আর্টিফ্যাক্ট/রিলিজ | ধাপ ১০ |
| `README.md` | ব্যবহারবিধি (মোবাইল থেকে চালানোর গাইড) | ধাপ ১১ |

> রান-টাইমে (রিপোতে নয়) তৈরি হবে: `public/` (অডিও), `out/` (ভিডিও), `node_modules/`। এগুলো ওয়ার্কফ্লো চলার সময় তৈরি হয়, তাই "সাবফোল্ডার নয়" নিয়ম ভাঙে না।

---

## ২. ধাপসমূহ

### ধাপ ১ — প্রজেক্ট বেস কনফিগ ✅ (সম্পন্ন)
**ফাইল:** `package.json`, `tsconfig.json`, `remotion.config.ts`, `.gitignore`
- ডিপেন্ডেন্সি: `remotion`, `@remotion/cli`, `@remotion/google-fonts`, `@remotion/media-utils`, `@remotion/transitions`, `react`, `react-dom`, `typescript`
- স্ক্রিপ্ট: `start` (প্রিভিউ), `build` (রেন্ডার)
- `remotion.config.ts`: entry = `index.ts`, codec h264, overwrite true
- **সম্পন্ন চিহ্ন:** `npm install` এরর ছাড়া চলে।
- **যা বানানো হয়েছে (ধাপ ১):**
  - `package.json` — Remotion `4.0.200` (সব remotion প্যাকেজ একই সংস্করণে পিন করা, নইলে এরর হয়), React `18.3.1`, TypeScript `5.4.5`। স্ক্রিপ্ট: `start` (প্রিভিউ), `build` (রেন্ডার → `out/video.mp4`), `typecheck`, `tts`।
  - `tsconfig.json` — `jsx: react-jsx`, `strict`, `resolveJsonModule` (কারণ ধাপ ২-এ `durations.json` ইমপোর্ট হবে), শুধু রুটের `*.ts/*.tsx` কম্পাইল।
  - `remotion.config.ts` — entry `./index.ts`, codec h264, overwrite, JPEG ৯০, concurrency ২ (GitHub Actions-এর জন্য নিরাপদ), `swangle` রেন্ডারার।
  - `.gitignore` — `node_modules/`, `out/`, `public/`, লগ ফাইল।
- **নোট:** `package-lock.json` নেই, তাই ওয়ার্কফ্লোতে `npm install` ব্যবহার হবে (`npm ci` নয়)।
- **পরবর্তী ধাপ:** ধাপ ২ (`index.ts`, `Root.tsx`)।

### ধাপ ২ — এন্ট্রি ও কম্পোজিশন ✅ (সম্পন্ন)
**ফাইল:** `index.ts`, `Root.tsx`
- `registerRoot(Root)`
- `<Composition id="Story" ...>` — 1920×1080, 30fps
- `calculateMetadata` দিয়ে `durations.json` থেকে মোট ফ্রেম সংখ্যা বের করা (অডিও দৈর্ঘ্য অনুযায়ী ভিডিও দৈর্ঘ্য অটো)।
- **নির্ভর করে:** ধাপ ১
- **যা বানানো হয়েছে (ধাপ ২):**
  - `index.ts` — `registerRoot(Root)`।
  - `Root.tsx` — `<Composition id="Story">`, 1920×1080, 30fps। ধ্রুবক: `SCENE_PADDING_SECONDS = 0.8` (প্রতি দৃশ্যের অডিওর পর বিরতি), `TRANSITION_FRAMES = 12` (ফেড ট্রানজিশন)। `calculateMetadata` মোট ফ্রেম বের করে: `Σ দৃশ্যের ফ্রেম − (দৃশ্যসংখ্যা−১) × TRANSITION_FRAMES`। এক্সপোর্ট: `FPS`, `WIDTH`, `HEIGHT`, `Root`।
  - `durations.json` — **ডিফল্ট/ফলব্যাক** সময় (৭টি দৃশ্য)। `tts.py` (ধাপ ৮) চালালে এটি প্রকৃত অডিও দৈর্ঘ্য দিয়ে ওভাররাইট হবে।
  - `Story.tsx` — **অস্থায়ী প্লেসহোল্ডার**, যাতে টাইপচেক ও স্টুডিও এখনই চলে। ধাপ ৯-এ পুরো বদলে গেছে ✅।
- **ধাপ ৮ ও ৯-এর জন্য চুক্তি (বদলানো যাবে না):**
  - `durations.json` ফরম্যাট: `{ "generated": bool, "scenes": [ { "id": "<দৃশ্য-আইডি>", "seconds": <সংখ্যা> } ] }` — `id` গুলো `script.ts`-এর দৃশ্য-আইডির সাথে হুবহু মিলতে হবে।
  - `Story.tsx` অবশ্যই `StoryProps = { scenes: SceneTiming[]; transitionFrames: number }` এবং `SceneTiming = { id; seconds; frames }` এক্সপোর্ট করবে।
  - ধাপ ৫-এ দৃশ্য যোগ/বাদ দিলে `durations.json`-এর ফলব্যাক তালিকাও একই সাথে আপডেট করতে হবে।
- **পরবর্তী ধাপ:** ধাপ ৩ (`theme.ts`, `components.tsx`)।

### ধাপ ৩ — থিম ও পরিবেশ (ব্যাকগ্রাউন্ড) কম্পোনেন্ট ✅ (সম্পন্ন)
**ফাইল:** `theme.ts`, `components.tsx`
- রং-প্যালেট: মরুভূমির সোনালি, গভীর নীল রাত, সবুজ-সোনালি ইসলামী টোন
- কম্পোনেন্ট: `Sky` (সময় অনুযায়ী গ্রেডিয়েন্ট), `Sun`, `Clouds` (ভাসমান), `Stars`, `Ground/Dunes`, `Mosque`/`CityBuilding`, `Palm`, `Crowd gathering spot` (মঞ্চ/কার্পেট), ইসলামী জ্যামিতিক বর্ডার
- সব অ্যানিমেশন `useCurrentFrame()` ভিত্তিক।
- **নির্ভর করে:** ধাপ ১, ২
- **যা বানানো হয়েছে (ধাপ ৩):**
  - `theme.ts` — এক্সপোর্ট: `FONT_FAMILY` (Noto Sans Bengali, `@remotion/google-fonts` থেকে লোড), `CANVAS` (`width 1920`, `height 1080`, `groundY 800`), `COLORS` (gold, goldLight, sand, green, nightBlue, stone, glow ইত্যাদি), `TimeOfDay` টাইপ (`dawn | morning | noon | afternoon | dusk | night`), `SKY` (প্রতি সময়ের top/bottom রং), `sec(s, fps)`, `bob(frame, speed, amp, phase)`, `SOFT_SHADOW`।
  - `components.tsx` — সব কম্পোনেন্ট `useCurrentFrame()` ভিত্তিক, ১৯২০×১০৮০ ক্যানভাসে `position:absolute` (একটার উপর আরেকটা স্তর দিয়ে সাজাতে হবে):
    - `Sky {from, to, progress}` — সময়ের রং মসৃণ বদল
    - `Sun {progress, size, color}` — progress 0→1 এ পূর্ব→পশ্চিম চাপ আঁকে (সময় গড়ানো দেখানোর জন্য)
    - `Moon {x, y, size}`, `Stars {count, opacity}` (টুইঙ্কল)
    - `Clouds {count, speed, color, opacity}`
    - `Dunes {colors, parallax}` (৩ স্তর টিলা), `Ground {top, bottom}`
    - `Carpet {x, y, width, height, color}` — মুনাজেরার সভাস্থল/মঞ্চ
    - `Mosque {x, baseY, scale, windowGlow, body, dome}`, `CityBuilding {x, baseY, scale, variant 0|1|2, color, windowGlow}`
    - `Palm {x, baseY, scale, sway}`
    - `IslamicBorder {color, inset, opacity}` + `eightStarPath(cx, cy, r)` (আট-কোণা তারার path)
    - `Dust {count, color, opacity}`, `Vignette {strength}`
    - `Camera {zoomFrom, zoomTo, panX, panY, originX, originY}` — প্রতিটি দৃশ্য এতে মুড়ে ধীর জুম/প্যান
  - ধাপ ৪ (চরিত্র) ও ধাপ ৭ (দৃশ্য) এই নামগুলো ও প্রপস হুবহু ব্যবহার করবে। চরিত্র আঁকার সময় মাটির রেখা `CANVAS.groundY` ধরে বসাতে হবে।
- **সম্ভাব্য সমস্যা:** `theme.ts`-এর `loadFont(... subsets: ["bengali","latin"])` এ যদি টাইপ-এরর আসে, `subsets` লাইনটি মুছে দিলেই চলবে।
- **পরবর্তী ধাপ:** ধাপ ৪ (`characters.tsx`)।

### ধাপ ৪ — চরিত্র (মুখহীন সিলুয়েট ২ডি) ✅ (সম্পন্ন)
**ফাইল:** `characters.tsx`
- `Imam` (সাদা পাগড়ি, দাড়ি-ছায়া নয় — শুধু সিলুয়েট, নূরানী আভা/গ্লো)
- `Atheist` (ভিন্ন পোশাক, গম্ভীর ভঙ্গি, মাথা নাড়া)
- `Crowd` (২০–৩০ জন, এলোমেলো বসা/দাঁড়ানো, মাথা ঘোরানো)
- মুভমেন্ট: হাঁটা (bobbing), আসা-যাওয়া, ইশারা (হাত তোলা), অপেক্ষায় পা ঠুকা
- প্রপস: `translate`, `scale`, `flip`, `mood` (শান্ত/অধৈর্য/আগ্রহী)
- **নির্ভর করে:** ধাপ ৩
- **যা বানানো হয়েছে (ধাপ ৪) — `characters.tsx`:** সব চরিত্র মুখহীন; পা মাটিতে (০,০), উচ্চতা ≈ ৪২০ ইউনিট (scale=1)। ডিফল্ট `y = CANVAS.groundY + 90`।
  - **`PersonProps`:** `x`, `y`, `scale`, `flip`, `walking`, `walkSpeed`, `mood` (`calm | impatient | curious | serious`), `raise` / `raiseLeft` (হাত তোলা ০..১), `sitting`, `headTurn` (−১..১), `robe`, `cloak`, `sash`, `skin`, `headwear` (`turban | cap | none`), `headwearColor`, `glow` (নূরানী আভা ০..১), `phase`, `opacity`।
  - **`moveTo(frame, start, end, fromX, toX)`** → `{ x, walking, dir }` — নির্দিষ্ট সময়ে হেঁটে আসা/যাওয়া। ব্যবহার: `<Imam x={m.x} walking={m.walking} flip={m.dir < 0} />`।
  - **`Person`** (একক, নিজের SVG সহ) এবং **`PersonGroup`** (SVG `<g>`, একই SVG-তে অনেকজন বসাতে)।
  - **`Imam`** — সাদা পাগড়ি, সাদা জুব্বা, সবুজ চোগা, সোনালি কোমরবন্ধ, ডিফল্ট `glow=0.8` (মুখ নেই, শুধু সিলুয়েট + আভা)।
  - **`Atheist`** — নীল-ধূসর কোট, মরুন কোমরবন্ধ, গাঢ় টুপি, ডিফল্ট `mood="serious"`।
  - **`Crowd`** `{ count=24, centerX, baseY, spread, scale, rows=3, mode: standing|sitting|arriving, from: left|right, startFrame, arriveFrames, mood, moodMix (০..১ = কত অংশ অধৈর্য), seed }` — এক SVG-তে সবাই, পেছনের সারি আগে আঁকা; `arriving` মোডে প্রত্যেকে আলাদা সময়ে স্ক্রিনের বাইরে থেকে হেঁটে নিজের জায়গায় পৌঁছায়, পৌঁছে মাথা ঘোরায়।
  - **`SpeechBubble`** `{ x, y, text, width, fontSize, startFrame, bg, color }` — বক্তার মাথার উপরে সংলাপ-বাবল (স্প্রিং-এ ফুটে ওঠে)। (ধাপ ৭-এর `s6-question`-এ লাগবে — এখানেই বানিয়ে রাখা হলো।)
  - **ধাপ ৭-এর জন্য নির্দেশ:** দৃশ্যে স্তর-ক্রম: `Sky → Sun/Stars/Clouds → Dunes → Mosque/CityBuilding/Palm → Ground → Carpet → Crowd/Imam/Atheist → SpeechBubble → Vignette → IslamicBorder`, পুরোটা `Camera`-তে মোড়া।
- **পরবর্তী ধাপ:** ধাপ ৫ (`script.ts`)।

### ধাপ ৫ — স্ক্রিপ্ট ডেটা (দৃশ্য ভাগ) ✅ (সম্পন্ন)
**ফাইল:** `script.ts`
আপনার স্ক্রিপ্ট নিচের দৃশ্যে ভাগ হবে। প্রতিটিতে: `id`, `narration` (বাংলা), `visual` (কী দেখাবে), `mood`।

| দৃশ্য | বর্ণনা (narration) | ভিজ্যুয়াল |
|---|---|---|
| `s0-title` | টাইটেল কার্ড: "ইমাম আবু হানিফা (রাদিআল্লাহু আনহু) ও নাস্তিকের মুনাজেরা" | ইসলামী বর্ডার, ক্যালিগ্রাফি-স্টাইল টাইটেল, তারা |
| `s1-atheist` | "একবার আল্লাহর অস্তিত্বে অস্বীকারকারী এক নাস্তিকের সাথে আমাদের ইমাম হযরত আবু হানিফা (রাদিআল্লাহু আনহু) এর মুনাজেরা হয়েছিল।" | নাস্তিক চরিত্রের পরিচিতি, ইমামের নূরানী সিলুয়েট |
| `s2-topic` | "মুনাজেরার বিষয় ছিল— পৃথিবীর কোনো সৃষ্টিকর্তা আছে কিনা।" | পৃথিবীর গ্লোব ঘুরছে, প্রশ্নবোধক চিহ্ন, বাংলা বড় প্রশ্ন |
| `s3-crowd` | "এতবড় ইমামের সাথে এ গুরুত্বপূর্ণ বিষয়ের মুনাজেরা দেখার জন্য শত্রু-মিত্র সবাই যথা সময়ে মুনাজেরার স্থানে সমবেত হয়ে গেল।" | ভিড় দূর থেকে আসছে, জড়ো হচ্ছে, কৌতূহলী ফিসফাস |
| `s4-atheist-arrives` | "নাস্তিক লোকটিও যথাসময়ে পৌঁছে গেল।" | নাস্তিক সময়মতো এসে আসনে বসে, ঘড়ি/সূর্য |
| `s5-delay` | "কিন্তু হযরত ইমাম আযম নির্ধারিত সময়ের অনেক দেরীতে সমাবেশে তশরীফ আনলেন।" | সময় গড়াচ্ছে (সূর্য সরছে), ভিড় অধৈর্য, ইমাম ধীরে প্রবেশ করছেন |
| `s6-question` | "নাস্তিক পণ্ডিত ব্যক্তিটি জিজ্ঞাসা করলেন, আপনি এত দেরী করলেন কেন?" | নাস্তিক উঠে দাঁড়িয়ে প্রশ্ন, সংলাপ-বাবল "আপনি এত দেরী করলেন কেন?", ক্লিফহ্যাঙ্গার |

- প্রতিটি দৃশ্যে `minSeconds` (অডিও না থাকলে ফলব্যাক)।
- **নির্ভর করে:** কেবল ধাপ ১ (স্বাধীনভাবে করা যায়)
- **যা বানানো হয়েছে (ধাপ ৫):**
  - **`script.json`** (প্লেইন ডেটা — যাতে Python `tts.py` সরাসরি পড়তে পারে): `title`, `voice` (`bn-BD-PradeepNeural`), `rate` (`-8%`), `pitch` (`-2Hz`), `scenes[]` = `{ id, narration, ttsText?, minSeconds }`। `ttsText` শুধু উচ্চারণ ঠিক রাখতে (যেমন বন্ধনী বাদ দিয়ে কমা)। আপনার মূল স্ক্রিপ্ট হুবহু `narration`-এ আছে (শুধু "গেল ।" → "গেল।")।
  - **`script.ts`**: `SceneMeta` টাইপ `{ title, visual, timeFrom, timeTo, sunFrom, sunTo, crowdMood, showSubtitle, dialogue? }`; `SceneDef` = `SceneMeta + { id, narration, ttsText, minSeconds }`। এক্সপোর্ট: `SCENES` (৭টি), `SCENE_IDS`, `getScene(id)`, `STORY_TITLE`, `VOICE`। আইডি না মিললে স্পষ্ট এরর দেয়।
  - **৭টি দৃশ্য ও আইডি:** `s0-title` (৪সে, রাত→ভোর, সাবটাইটেল বন্ধ), `s1-atheist` (৯সে, ভোর→সকাল), `s2-topic` (৫সে), `s3-crowd` (১১সে), `s4-atheist-arrives` (৪সে), `s5-delay` (৮সে, সূর্য ০.৩২→০.৬৬, সকাল→বিকেল, ভিড় অধৈর্য), `s6-question` (৬সে, `dialogue: "আপনি এত দেরী করলেন কেন?"`)। `durations.json`-এর আইডি ও সেকেন্ড এর সাথে মিলিয়ে যাচাই করা হয়েছে ✔।
  - **নিয়ম:** নতুন দৃশ্য যোগ করলে ৩টি জায়গায় একসাথে আপডেট: `script.json` (scenes), `script.ts` (`SCENE_META`), `durations.json` (ফলব্যাক)।
- **পরবর্তী ধাপ:** ধাপ ৬ (`Subtitle.tsx`)।

### ধাপ ৬ — সাবটাইটেল ✅ (সম্পন্ন)
**ফাইল:** `Subtitle.tsx`
- নিচে অর্ধস্বচ্ছ বার, বড় বাংলা টেক্সট, শব্দ ধরে ধরে হাইলাইট (সময়ের অনুপাতে)
- ফেড-ইন/আউট
- **নির্ভর করে:** ধাপ ৩ (থিম), ধাপ ৫
- **যা বানানো হয়েছে (ধাপ ৬) — `Subtitle.tsx`:**
  - **`Subtitle`** প্রপস: `text`, `speakFrames` (কত ফ্রেমে কথা বলা হচ্ছে = অডিও দৈর্ঘ্য; না দিলে পুরো দৃশ্য), `delayFrames=6`, `fontSize=56`, `bottom=64`, `maxWidth=1560`, `highlight` (সোনালি), `fadeFrames=10`, `visible=true`।
  - চলমান শব্দ সোনালি + আভা, আগের শব্দ সাদা, পরের শব্দ ঝাপসা। শব্দের সময় = অক্ষর সংখ্যার অনুপাতে। শব্দের ভেতরে কখনো ভাঙে না, তাই বাংলা যুক্তাক্ষর/মাত্রা নষ্ট হয় না। লাইন আপনা-আপনি ভাঙে।
  - ফেড-ইন/আউট ও হালকা ওঠা-অ্যানিমেশন; `visible={false}` দিলে কিছু আঁকে না (`s0-title`-এর জন্য `showSubtitle:false`)।
  - এক্সপোর্ট: `Subtitle`, `splitWords(text)`, `wordBoundaries(words)`।
  - **ব্যবহারের নিয়ম (ধাপ ৭/৯):** দৃশ্যের `Sequence`-এর ভেতরে বসাতে হবে: `<Subtitle text={scene.narration} speakFrames={Math.round(scene.seconds*fps)} visible={scene.showSubtitle} />`। এখানে `scene.seconds` = `StoryProps.scenes[i].seconds` (অডিও দৈর্ঘ্য)।
- **পরবর্তী ধাপ:** ধাপ ৭ (`scenes.tsx`)।

### ধাপ ৭ — দৃশ্যের কম্পোনেন্ট ✅ (সম্পন্ন)
**ফাইল:** `scenes.tsx`
- ধাপ ৫-এর প্রতিটি দৃশ্যের জন্য একটি React কম্পোনেন্ট: `Scene0Title` … `Scene6Question`
- ক্যামেরা মুভ (slow zoom/pan) প্রতিটি দৃশ্যে
- ধাপ ৩ + ৪ এর কম্পোনেন্ট ব্যবহার
- **নির্ভর করে:** ধাপ ৩, ৪, ৫, ৬
- **যা বানানো হয়েছে (ধাপ ৭) — `scenes.tsx`:**
  - **টাইপ:** `SceneProps = { seconds: number }` (অডিও দৈর্ঘ্য, সেকেন্ডে — `Story.tsx` থেকে আসবে)।
  - **এক্সপোর্ট:** `Scene0Title`, `Scene1Atheist`, `Scene2Topic`, `Scene3Crowd`, `Scene4AtheistArrives`, `Scene5Delay`, `Scene6Question` এবং **`SCENE_COMPONENTS: Record<id, Component>`** (আইডি → কম্পোনেন্ট; ধাপ ৯-এ এটা দিয়েই দৃশ্য বসবে)।
  - **ভেতরের সহায়ক (এক্সপোর্ট নয়):** `Backdrop` (আকাশ/সূর্য/মেঘ/টিলা/ঘরবাড়ি/মসজিদ/খেজুর/মাটি — সময়, সূর্য ও রাতের অন্ধকার `script.ts`-এর দৃশ্য-মেটা থেকে অটো), `Shell` (`Camera` + `Vignette` + `IslamicBorder` + `Subtitle` — **সাবটাইটেল এখানেই বসানো, তাই ধাপ ৯-এ আলাদা করে বসাতে হবে না**), `CrowdSides` (বাম/ডান দুই দল, সিড `L`/`R`, সব দৃশ্যে একই জায়গা), `EmptySeat` (ইমামের ফাঁকা আসন), `Globe` (ঘুরন্ত পৃথিবী + কক্ষপথে `?`)।
  - **স্থির অবস্থান (সব দৃশ্যে এক):** নাস্তিক `x=760`, ইমাম `x=1160`, কার্পেট কেন্দ্র `x=960`, মসজিদ কেন্দ্র `x=960`।
  - **দৃশ্যভিত্তিক ঘটনা:**
    - `s0` রাত→ভোর, চাঁদ-তারা, তিন লাইনে টাইটেল স্প্রিং-এ ফুটে ওঠে, সাবটাইটেল বন্ধ।
    - `s1` নাস্তিক বাঁ থেকে হেঁটে এসে দাঁড়ায়; দূরে ছোট, আভাময় ইমাম-সিলুয়েট ফুটে ওঠে।
    - `s2` ঘুরন্ত গ্লোব, কক্ষপথে ৩টি `?`, নিচে "পৃথিবীর কোন সৃষ্টিকর্তা আছে কিনা?"।
    - `s3` দুই দিক থেকে ২৪ জন হেঁটে এসে কার্পেটের দুই পাশে জড়ো হয়।
    - `s4` নাস্তিক এসে দাঁড়ায়, ইমামের জন্য ফাঁকা আসন স্পন্দিত হয়।
    - `s5` মেঘ দ্রুত ছোটে, সূর্য সরে সকাল→বিকেল, ভিড় অধৈর্য (পা ঠুকা), দৃশ্যের মাঝ থেকে ইমাম ডান দিক থেকে ধীরে এসে আসনে পৌঁছান।
    - `s6` নাস্তিক হাত তোলে, স্পিচ-বাবলে "আপনি এত দেরী করলেন কেন?", ইমাম নীরব, ধীর জুম।
  - **ধাপ ৯-এর জন্য চুক্তি:** `Story.tsx` প্রতিটি দৃশ্যের জন্য `const C = SCENE_COMPONENTS[id]; <C seconds={scene.seconds} />` ব্যবহার করবে; আইডি না মিললে এরর দেবে।
- **পরবর্তী ধাপ:** ধাপ ৮ (`tts.py`) — তারপর ধাপ ৯ (`Story.tsx`)।

### ধাপ ৮ — বাংলা ভয়েসওভার (TTS) ✅ (সম্পন্ন)
**ফাইল:** `tts.py` (আউটপুট: রান-টাইমে `public/*.mp3` + `durations.json`)
- `edge-tts` দিয়ে `bn-BD-PradeepNeural` (পুরুষ) বা `bn-BD-NabanitaNeural` (নারী)
- `script.json` পড়ে (`ttsText` থাকলে সেটা, নইলে `narration`) প্রতিটি দৃশ্যের জন্য mp3 বানানো; ভয়েস/রেট/পিচ `script.json` থেকে
- `ffprobe`/`mutagen` দিয়ে দৈর্ঘ্য মেপে `durations.json` লেখা
- রেট/পিচ সামঞ্জস্য (ধীর ও গম্ভীর টোন)
- **নির্ভর করে:** ধাপ ৫ (`script.json`)
- **যা বানানো হয়েছে (ধাপ ৮):**
  - **`requirements.txt`** — `edge-tts>=6.1.9`, `mutagen>=1.47.0` (ওয়ার্কফ্লোতে `pip install -r requirements.txt`)।
  - **`tts.py`** — `script.json` পড়ে প্রতিটি দৃশ্যের জন্য `public/<দৃশ্য-আইডি>.mp3` বানায়, `mutagen` দিয়ে আসল দৈর্ঘ্য মেপে `durations.json` ওভাররাইট করে।
    - বিকল্প ভয়েস: মূল `bn-BD-PradeepNeural` ফেইল করলে পরপর `bn-BD-NabanitaNeural`, `bn-IN-BashkarNeural`, `bn-IN-TanishaaNeural`; প্রতিটিতে ৩ বার চেষ্টা (`--retries`)।
    - ফ্ল্যাগ: `--strict` (কোনো দৃশ্যের ভয়েস ফেইল করলে exit 1 — **ধাপ ১০-এ ব্যবহার করতে হবে**), `--offline` (ইন্টারনেট ছাড়া, শুধু `minSeconds` লেখে, অডিও নয়), `--force` (আগের mp3 থাকলেও নতুন করে), `--script/--out/--durations` (পথ বদল)।
    - কোনো দৃশ্যের ভয়েস না হলে ওই দৃশ্য নীরব চলে (`audio` ফিল্ড থাকে না, সময় = `minSeconds`)।
  - **`durations.json` ফরম্যাট (সম্প্রসারিত):** `{ "generated": true, "voice": "...", "scenes": [ { "id", "seconds", "audio": "<id>.mp3" } ] }` — `audio` ঐচ্ছিক।
  - **ধাপ ২-এর চুক্তিতে ছোট সংযোজন:** `Root.tsx`-এর `DurationsFile` ও `Story.tsx`-এর `SceneTiming`-এ ঐচ্ছিক `audio?: string` যোগ হয়েছে; `Root.tsx` এটা `StoryProps.scenes[i].audio`-তে পাঠায়। ধাপ ৯-এ `Story.tsx` লেখার সময় এই `audio?` টাইপ রাখতে হবে।
  - **ধাপ ৯-এর জন্য:** `scene.audio` থাকলেই কেবল `<Audio src={staticFile(scene.audio)} />` বসাবে; নইলে বাদ। অডিও `public/`-এ থাকে (রান-টাইমে তৈরি, `.gitignore`-এ আছে)।
  - **যাচাই:** `--offline` মোড চালিয়ে দেখা হয়েছে (৭টি দৃশ্য, সঠিক JSON)। আসল edge-tts সংযোগ এই পরিবেশে (ইন্টারনেট বন্ধ) পরীক্ষা করা যায়নি — প্রথম GitHub Actions রানে যাচাই হবে।
  - **লোকালি চালালে:** `pip install -r requirements.txt && python tts.py` (এতে `public/` ফোল্ডার তৈরি হয় — এটি `.gitignore`-এ আছে, কমিট হবে না)।
- **পরবর্তী ধাপ:** ধাপ ৯ (`Story.tsx`)।

### ধাপ ৯ — চূড়ান্ত অ্যাসেম্বলি ✅ (সম্পন্ন)
**ফাইল:** `Story.tsx`
- `Series`/`TransitionSeries` দিয়ে দৃশ্য পরপর
- প্রতিটি দৃশ্যে `<Audio src={staticFile(...)} />`
- ব্যাকগ্রাউন্ড মিউজিক ঐচ্ছিক (রয়্যালটি-ফ্রি; না থাকলে বাদ — শুধু ভয়েস, দফ-ছাড়া নাশীদ-স্টাইল নীরবতা)
- সাবটাইটেল ওভারলে
- **নির্ভর করে:** ধাপ ২, ৬, ৭, ৮
- **যা বানানো হয়েছে (ধাপ ৯) — `Story.tsx` (ধাপ ২-এর প্লেসহোল্ডার সম্পূর্ণ বদলে):**
  - **টাইপ অপরিবর্তিত (Root.tsx-এর চুক্তি):** `SceneTiming = { id; seconds; audio?; frames }`, `StoryProps = { scenes; transitionFrames }` — এক্সপোর্ট আগের মতোই।
  - **`TransitionSeries`** (`@remotion/transitions`) + `fade()` + `linearTiming({ durationInFrames })`। প্রতিটি দৃশ্য `TransitionSeries.Sequence` (`durationInFrames = scene.frames`), মাঝে ফেড ট্রানজিশন (`transitionFrames` = ১২, Root.tsx থেকে)। ট্রানজিশন কখনো সবচেয়ে ছোট দৃশ্যের অর্ধেকের বেশি হয় না (সুরক্ষা)।
  - **অডিও:** `scene.audio` থাকলেই কেবল দৃশ্যের `Sequence`-এর ভেতরে `<Audio src={staticFile(scene.audio)} volume={1} />`; না থাকলে দৃশ্য নীরব। অডিও দৃশ্যের শুরুতেই চলে; প্রতি দৃশ্যের শেষে ০.৮ সেকেন্ড বিরতি থাকায় ট্রানজিশনে অডিও কাটে না।
  - **দৃশ্য বসানো:** `SCENE_COMPONENTS[scene.id]` → `<Component seconds={scene.seconds} />`। আইডি না মিললে স্পষ্ট বাংলা এরর দেয় (কোন কোন ফাইল মেলাতে হবে সহ)।
  - **সাবটাইটেল:** আলাদা বসানো হয়নি, কারণ `scenes.tsx`-এর `Shell`-এর ভেতরেই আছে (ধাপ ৭ দেখুন)।
  - **শেষ ফিনিশ:** ভিডিওর শেষ ১৮ ফ্রেমে ধীরে কালোতে মিলিয়ে যায় (ক্লিফহ্যাঙ্গার)। ব্যাকগ্রাউন্ড কালো।
  - **ব্যাকগ্রাউন্ড মিউজিক:** বাদ রাখা হয়েছে (ঐচ্ছিক, রয়্যালটি-ফ্রি ফাইল ছাড়া যোগ করা হয়নি)। পরে চাইলে `Story.tsx`-এ `<Audio loop volume={0.08} />` যোগ করা যাবে।
  - **যাচাই:** এই পরিবেশে npm রেজিস্ট্রি পৌঁছানো যায়নি, তাই লোকালি `tsc` চালানো যায়নি। কোড কেবল সোর্স-রিভিউ হয়েছে; আসল টাইপচেক/রেন্ডার প্রথম GitHub Actions রানে (`npx tsc --noEmit` ধাপে) হবে। ওখানে এরর এলে লগ পেস্ট করলে ঠিক করে দেব।
- **পরবর্তী ধাপ:** ধাপ ১০ (`render.yml`)।

### ধাপ ১০ — GitHub Actions রেন্ডার ✅ (সম্পন্ন)
**ফাইল:** `.github/workflows/render.yml`
- ট্রিগার: `workflow_dispatch` (হাতে চালু) + `push` (ঐচ্ছিক)
- ধাপ: checkout → Node 20 → Python 3.11 → `pip install edge-tts mutagen` → `npm ci/install` → `mkdir public && python tts.py` → ffmpeg ইনস্টল → Chromium + বাংলা ফন্ট (`fonts-noto`) → `npx remotion render Story out/video.mp4`
- আউটপুট: `actions/upload-artifact` এবং ঐচ্ছিক GitHub Release
- **নির্ভর করে:** ধাপ ১–৯
- **যা বানানো হয়েছে (ধাপ ১০) — `.github/workflows/render.yml` (এটাই একমাত্র সাবফোল্ডার-ব্যতিক্রম):**
  - **ট্রিগার:** `workflow_dispatch` (ইনপুট: `scale` ডিফল্ট `1` — টেস্টে `0.5` দিন; `release` ডিফল্ট `false`) + `push` (শুধু `main` ব্রাঞ্চে এবং শুধু স্ক্রিপ্ট/দৃশ্য/কোড ফাইল বদলালে — যেমন `script.json`, `scenes.tsx`, `tts.py`; README বদলালে রেন্ডার হবে না)। `concurrency` দিয়ে একই ব্রাঞ্চে পুরনো রান বাতিল। `timeout-minutes: 60`।
  - **ধাপ ক্রম:** checkout@v4 → Node 20 → Python 3.11 → `apt-get` (`ffmpeg`, `fonts-noto`, `fonts-noto-core`, `fontconfig`, Chromium-এর লাইব্রেরি) + `fc-cache` → `pip install -r requirements.txt` → `npm install` (`npm ci` নয়, কারণ `package-lock.json` নেই) → **`npx tsc --noEmit`** (টাইপ ভুল থাকলে এখানেই থামে) → `mkdir -p public && python tts.py --strict` (কোনো দৃশ্যের ভয়েস ফেইল করলে রান ব্যর্থ — নীরব ভিডিও বেরোবে না) → `cat durations.json` → `npx remotion render index.ts Story out/video.mp4 --concurrency=2 --scale=$SCALE`।
  - **আউটপুট:** `actions/upload-artifact@v4` (নাম `video`, ৩০ দিন রাখে) এবং `release=true` দিলে `softprops/action-gh-release@v2` দিয়ে Release (`video-<রান নম্বর>` ট্যাগ; এর জন্য `permissions: contents: write` দেওয়া আছে)।
  - **ব্যবহার (মোবাইল):** GitHub → Actions → "Render Video" → Run workflow → শেষ হলে রানের পাতার নিচে Artifacts থেকে `video` ডাউনলোড।
  - **যাচাই:** YAML সিনট্যাক্স পার্স করে ঠিক পাওয়া গেছে। আসল রান এই পরিবেশে সম্ভব নয়; প্রথম রানে `libasound2t64` প্যাকেজ নাম ফেইল করলে (পুরনো উবুন্টুতে `libasound2`) জানাবেন।
  - **রেন্ডার সময়:** ২ কনকারেন্সিতে ~৫০ সেকেন্ডের ১০৮০p ভিডিও সাধারণত ১০–২৫ মিনিট। দ্রুত টেস্টে `scale=0.5`।
- **পরবর্তী ধাপ:** ধাপ ১১ (`README.md`)।

### ধাপ ১১ — README ও মোবাইল-গাইড
**ফাইল:** `README.md`
- কীভাবে ফাইল আপলোড করবেন (GitHub মোবাইল ব্রাউজার)
- Actions ট্যাবে "Run workflow" চাপা, ভিডিও ডাউনলোড (Artifacts)
- কীভাবে নতুন গল্প যোগ করবেন (ধাপ ১২)
- সমস্যা সমাধান (ফন্ট না আসা, অডিও ফেইল, টাইমআউট)

### ধাপ ১২ — নতুন গল্প যোগ করার টেমপ্লেট
**ফাইল:** `script.ts`, `scenes.tsx` (পরিবর্তন)
- শুধু `script.ts`-এ নতুন দৃশ্য-অ্যারে বসালেই যেন কাজ করে (জেনেরিক দৃশ্য-টেমপ্লেট: `{background, characters[], narration, mood}`)
- আপনি পুরো গল্প (ইমামের জবাব-সহ) পাঠালে আমি আরও দৃশ্য যোগ করব।

### ধাপ ১৩ — পরীক্ষা ও ডিবাগ চেকলিস্ট
- লোকালি না চালিয়েও ভুল ধরার জন্য: `npx tsc --noEmit` ওয়ার্কফ্লোর আগে চালানো
- লগ দেখে ঠিক করার নির্দেশনা
- রেন্ডার সময় কমানো: `--concurrency`, কম রেজোলিউশন টেস্ট (`--scale=0.5`)

### ধাপ ১৪ — (ঐচ্ছিক) শর্টস/রিলস ভার্সন
- 1080×1920 দ্বিতীয় কম্পোজিশন `StoryVertical` (Root.tsx-এ যোগ)
- লেআউট অ্যাডাপ্টেশন

---

## ৩. অগ্রগতি ট্র্যাকার (প্রতিটি ধাপ শেষে টিক দিন)

- [x] ধাপ ১ — বেস কনফিগ ✅
- [x] ধাপ ২ — এন্ট্রি ও কম্পোজিশন ✅
- [x] ধাপ ৩ — থিম ও পরিবেশ ✅
- [x] ধাপ ৪ — চরিত্র ✅
- [x] ধাপ ৫ — স্ক্রিপ্ট ডেটা ✅
- [x] ধাপ ৬ — সাবটাইটেল ✅
- [x] ধাপ ৭ — দৃশ্য কম্পোনেন্ট ✅
- [x] ধাপ ৮ — ভয়েসওভার (TTS) ✅
- [x] ধাপ ৯ — চূড়ান্ত অ্যাসেম্বলি ✅
- [x] ধাপ ১০ — render.yml ✅
- [ ] ধাপ ১১ — README
- [ ] ধাপ ১২ — নতুন গল্পের টেমপ্লেট
- [ ] ধাপ ১৩ — ডিবাগ চেকলিস্ট
- [ ] ধাপ ১৪ — শর্টস ভার্সন (ঐচ্ছিক)

---

## ৪. নতুন চ্যাটে পুনরায় শুরু করার পদ্ধতি

1. এই `2danimation.md` পুরোটা পেস্ট করুন।
2. লিখুন: **"ধাপ N করো"** (যেমন: "ধাপ ৪ করো")।
3. আগের ধাপের ফাইল দরকার হলে সেগুলোও পেস্ট করুন (বিশেষ করে `theme.ts`, `script.ts`)।
4. আমি শুধু ওই ধাপের ফাইলগুলো দেব, বাকি অংশ নয়।

---

## ৫. মূল স্ক্রিপ্ট (সংরক্ষিত কপি)

> একবার আল্লাহর অস্তিত্বে অস্বীকারকারী এক নাস্তিকের সাথে আমাদের ইমাম হযরত আবু হানিফা (রাদিআল্লাহু আনহু) এর মুনাজেরা হয়েছিল। মুনাজেরার বিষয় ছিল- পৃথিবীর কোন সৃষ্টিকর্তা আছে কিনা। এতবড় ইমামের সাথে এ গুরুত্বপূর্ণ বিষয়ের মুনাজেরা দেখার জন্য শত্রু-মিত্র সবাই যথা সময়ে মুনাজেরার স্থানে সমবেত হয়ে গেল। নাস্তিক লোকটিও যথাসময়ে পৌঁছে গেল। কিন্তু হযরত ইমাম আযম নির্ধারিত সময়ের অনেক দেরীতে সমাবেশে তশরীফ আনলেন। নাস্তিক পণ্ডিত ব্যক্তিটি জিজ্ঞাসা করলেন, আপনি এত দেরী করলেন কেন?
