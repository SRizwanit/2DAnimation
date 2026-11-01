import { Config } from "@remotion/cli/config";

// এন্ট্রি ফাইল (ধাপ ২-এ তৈরি হবে)
Config.setEntryPoint("./index.ts");

// ভিডিও সেটিংস: MP4 (H.264), পুরনো ফাইল ওভাররাইট
Config.setCodec("h264");
Config.setOverwriteOutput(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);

// GitHub Actions-এর সীমিত মেমোরির জন্য নিরাপদ ডিফল্ট
Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer("swangle");
