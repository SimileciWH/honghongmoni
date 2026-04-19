import { NextRequest, NextResponse } from "next/server";
import { TTSClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

// 女声音色映射
const VOICE_ROLE_MAP_FEMALE: Record<number, string> = {
  1: "saturn_zh_female_keainvsheng_tob",  // 甜萌萝莉
  2: "zh_female_santongyongns_saturn_bigtts",  // 温柔淑女
  3: "zh_female_mizai_saturn_bigtts",  // 知性御姐
  4: "zh_female_xvxiaoxiannv_saturn_bigtts",  // 活泼少女
  5: "zh_female_meilinvyou_saturn_bigtts",  // 傲娇小公举
  6: "zh_female_jitangnv_saturn_bigtts",  // 霸道御姐
  7: "zh_female_xiaohe_uranus_bigtts",  // 邻家女孩
  8: "zh_female_vv_uranus_bigtts",  // 高冷女神
};

// 男声音色映射
const VOICE_ROLE_MAP_MALE: Record<number, string> = {
  101: "zh_male_m191_uranus_bigtts",  // 阳光男孩
  102: "zh_male_taocheng_uranus_bigtts",  // 磁性低音
  103: "zh_male_dayi_saturn_bigtts",  // 温柔暖男
  104: "zh_male_ruyayichen_saturn_bigtts",  // 儒雅绅士
};

// 合并音色映射
const VOICE_ROLE_MAP: Record<number, string> = {
  ...VOICE_ROLE_MAP_FEMALE,
  ...VOICE_ROLE_MAP_MALE,
};

export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    const { text, voiceRoleId, playerRole } = await request.json();

    // 确定回复者的性别
    // 当 playerRole 是 "boyfriend" 时，回复者是女朋友（女声）
    // 当 playerRole 是 "girlfriend" 时，回复者是男朋友（男声）
    const isPlayerBoy = playerRole === "boyfriend";
    const isReplyFromGirl = isPlayerBoy; // 玩家是男友时，回复来自女友（女声）
    
    // 根据回复者性别确定音色
    let speaker: string;
    
    if (isReplyFromGirl) {
      // 回复来自女朋友，用女声
      speaker = VOICE_ROLE_MAP_FEMALE[voiceRoleId] || VOICE_ROLE_MAP_FEMALE[7]; // 默认邻家女孩
    } else {
      // 回复来自男朋友，用男声
      speaker = VOICE_ROLE_MAP_MALE[voiceRoleId] || VOICE_ROLE_MAP_MALE[101]; // 默认阳光男孩
    }

    const response = await client.synthesize({
      uid: `game-${Date.now()}`,
      text: text,
      speaker: speaker,
      audioFormat: "mp3",
      sampleRate: 24000
    });

    return NextResponse.json({
      success: true,
      audioUri: response.audioUri,
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
