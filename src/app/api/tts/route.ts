import { NextRequest, NextResponse } from "next/server";
import { createTTSProvider } from '@/lib/ai';
import { uploadAudioToR2 } from '@/lib/storage/r2';

export const runtime = "nodejs";

// 音色映射 (SiliconFlow MOSS-TTS)
// 女声：alex, anna, bella, claire, diana
// 男声：benjamin, charles, david
const VOICE_ROLE_MAP: Record<number, string> = {
  1: "fnlp/MOSS-TTSD-v0.5:alex",      // 甜萌萝莉
  2: "fnlp/MOSS-TTSD-v0.5:anna",     // 温柔淑女
  3: "fnlp/MOSS-TTSD-v0.5:claire",   // 知性御姐
  4: "fnlp/MOSS-TTSD-v0.5:bella",    // 活泼少女
  5: "fnlp/MOSS-TTSD-v0.5:diana",    // 傲娇小公举
  6: "fnlp/MOSS-TTSD-v0.5:alex",     // 霸道御姐
  7: "fnlp/MOSS-TTSD-v0.5:anna",     // 邻家女孩
  8: "fnlp/MOSS-TTSD-v0.5:diana",    // 高冷女神
  101: "fnlp/MOSS-TTSD-v0.5:benjamin", // 阳光男孩
  102: "fnlp/MOSS-TTSD-v0.5:charles",   // 磁性低音
  103: "fnlp/MOSS-TTSD-v0.5:david",     // 温柔暖男
  104: "fnlp/MOSS-TTSD-v0.5:benjamin", // 儒雅绅士
};

export async function POST(request: NextRequest) {
  try {
    const ttsProvider = createTTSProvider('siliconflow');

    const { text, voiceRoleId } = await request.json();

    const voice = VOICE_ROLE_MAP[voiceRoleId] || "fnlp/MOSS-TTSD-v0.5:alex";

    const response = await ttsProvider.synthesize({
      text: text,
      voice: voice,
    });

    const uploadedAudio = await uploadAudioToR2(response.audioData, {
      source: "tts",
      voiceRoleId,
    });

    return NextResponse.json({
      success: true,
      audioUrl: uploadedAudio.url,
      audioKey: uploadedAudio.key,
      audioSize: response.audioSize
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}
