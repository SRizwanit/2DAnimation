#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ধাপ ৮ — বাংলা ভয়েসওভার (বিনামূল্যে, edge-tts)

কাজ:
  1. script.json পড়ে (ttsText থাকলে সেটা, নইলে narration)
  2. প্রতিটি দৃশ্যের জন্য  public/<দৃশ্য-আইডি>.mp3  বানায়
  3. mutagen দিয়ে অডিওর প্রকৃত দৈর্ঘ্য মেপে durations.json আপডেট করে

ব্যবহার:
  pip install -r requirements.txt
  python tts.py                 # সাধারণ রান (ইন্টারনেট লাগবে)
  python tts.py --strict        # কোনো দৃশ্যের ভয়েস ফেইল করলে এরর দিয়ে থামবে (GitHub Actions-এ ব্যবহার)
  python tts.py --offline       # ইন্টারনেট ছাড়া: শুধু minSeconds দিয়ে durations.json বানায়, অডিও নয়
  python tts.py --force         # আগের mp3 থাকলেও নতুন করে বানাবে

durations.json ফরম্যাট (Root.tsx এটা পড়ে):
  { "generated": true, "scenes": [ { "id": "...", "seconds": 7.42, "audio": "<id>.mp3" } ] }
  "audio" না থাকলে ওই দৃশ্য নীরব চলবে (সময় = minSeconds)।
"""

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path

# বিকল্প বাংলা ভয়েস — মূল ভয়েস ফেইল করলে এগুলো চেষ্টা হবে
FALLBACK_VOICES = [
    "bn-BD-NabanitaNeural",
    "bn-IN-BashkarNeural",
    "bn-IN-TanishaaNeural",
]


def clean_text(text: str) -> str:
    """বাড়তি ফাঁকা/লাইন-ব্রেক সরিয়ে একলাইন করা"""
    return re.sub(r"\s+", " ", text).strip()


def audio_length_seconds(path: Path) -> float:
    """MP3-এর দৈর্ঘ্য (সেকেন্ড)"""
    from mutagen.mp3 import MP3

    return float(MP3(str(path)).info.length)


async def synth(text: str, voice: str, rate: str, pitch: str, out: Path) -> None:
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(str(out))


async def synth_with_retry(
    text: str, voices: list, rate: str, pitch: str, out: Path, retries: int
) -> str:
    """প্রতিটি ভয়েসে retries বার চেষ্টা; সফল ভয়েসের নাম ফেরত দেয়"""
    last_err = None
    for voice in voices:
        for attempt in range(1, retries + 1):
            try:
                if out.exists():
                    out.unlink()
                await synth(text, voice, rate, pitch, out)
                if out.exists() and out.stat().st_size > 1000:
                    return voice
                raise RuntimeError("অডিও ফাইল খুব ছোট/খালি")
            except Exception as e:  # noqa: BLE001
                last_err = e
                wait = 2 * attempt
                print(
                    f"   ⚠️  {voice} (চেষ্টা {attempt}/{retries}) ব্যর্থ: {e} — {wait}s পরে আবার",
                    flush=True,
                )
                await asyncio.sleep(wait)
        print(f"   ↪️  {voice} বাদ, পরের ভয়েস চেষ্টা হচ্ছে…", flush=True)
    raise RuntimeError(f"সব ভয়েস ব্যর্থ: {last_err}")


async def main_async(args: argparse.Namespace) -> int:
    script_path = Path(args.script)
    out_dir = Path(args.out)
    dur_path = Path(args.durations)

    if not script_path.exists():
        print(f"❌ {script_path} পাওয়া যায়নি", file=sys.stderr)
        return 2

    data = json.loads(script_path.read_text(encoding="utf-8"))
    scenes = data.get("scenes", [])
    if not scenes:
        print("❌ script.json-এ কোনো দৃশ্য নেই", file=sys.stderr)
        return 2

    ids = [s["id"] for s in scenes]
    if len(ids) != len(set(ids)):
        print("❌ script.json-এ দৃশ্য-আইডি ডুপ্লিকেট আছে", file=sys.stderr)
        return 2

    voice = data.get("voice", "bn-BD-PradeepNeural")
    rate = data.get("rate", "+0%")
    pitch = data.get("pitch", "+0Hz")
    voices = [voice] + [v for v in FALLBACK_VOICES if v != voice]

    out_dir.mkdir(parents=True, exist_ok=True)

    result = []
    failed = []
    used_voice = None

    print(f"🎙️  ভয়েস: {voice}  রেট: {rate}  পিচ: {pitch}")
    print(f"📄 দৃশ্য সংখ্যা: {len(scenes)}\n")

    for idx, sc in enumerate(scenes, 1):
        sid = sc["id"]
        min_sec = float(sc.get("minSeconds", 4))
        text = clean_text(sc.get("ttsText") or sc.get("narration") or "")
        mp3 = out_dir / f"{sid}.mp3"
        print(f"[{idx}/{len(scenes)}] {sid}")

        if args.offline or not text:
            result.append({"id": sid, "seconds": min_sec})
            print(f"   ⏭️  অডিও নয় — ফলব্যাক {min_sec}s\n")
            continue

        try:
            if mp3.exists() and mp3.stat().st_size > 1000 and not args.force:
                print("   ♻️  আগের mp3 আছে, পুনরায় ব্যবহার (নতুন করে বানাতে --force)")
            else:
                used = await synth_with_retry(
                    text, voices, rate, pitch, mp3, args.retries
                )
                used_voice = used_voice or used
            length = audio_length_seconds(mp3)
            seconds = round(max(length, 0.5), 2)
            result.append({"id": sid, "seconds": seconds, "audio": mp3.name})
            print(f"   ✅ {mp3.name} — {seconds}s\n")
        except Exception as e:  # noqa: BLE001
            failed.append(sid)
            result.append({"id": sid, "seconds": min_sec})
            print(f"   ❌ ব্যর্থ ({e}) — নীরব ফলব্যাক {min_sec}s\n", file=sys.stderr)

    payload = {
        "generated": not args.offline,
        "voice": used_voice or voice,
        "note": "tts.py দ্বারা স্বয়ংক্রিয়ভাবে তৈরি। হাতে এডিট করবেন না — আবার tts.py চালান।",
        "scenes": result,
    }
    dur_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    total = sum(s["seconds"] for s in result)
    print(f"📝 {dur_path} লেখা হয়েছে — মোট বর্ণনা-সময় ≈ {total:.1f}s")

    if failed:
        print(f"\n⚠️  ভয়েস তৈরি হয়নি: {', '.join(failed)}", file=sys.stderr)
        if args.strict:
            return 1
    return 0


def main() -> None:
    ap = argparse.ArgumentParser(description="script.json থেকে বাংলা ভয়েস ও durations.json তৈরি")
    ap.add_argument("--script", default="script.json")
    ap.add_argument("--out", default="public", help="mp3 রাখার জায়গা (রান-টাইমে তৈরি হয়)")
    ap.add_argument("--durations", default="durations.json")
    ap.add_argument("--retries", type=int, default=3)
    ap.add_argument("--strict", action="store_true", help="কোনো ভয়েস ফেইল করলে exit 1")
    ap.add_argument("--offline", action="store_true", help="অডিও না বানিয়ে শুধু ফলব্যাক সময় লেখা")
    ap.add_argument("--force", action="store_true", help="আগের mp3 থাকলেও নতুন করে বানানো")
    args = ap.parse_args()
    sys.exit(asyncio.run(main_async(args)))


if __name__ == "__main__":
    main()
