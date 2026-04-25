import { NextRequest, NextResponse } from "next/server";
import { createAIProvider, createTTSProvider } from '@/lib/ai';

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

// 预设话题映射
const TOPIC_MAP: Record<number, { title: string; description: string }> = {
  1: { title: "忘记纪念日/生日", description: "重要的纪念日或生日忘记了" },
  2: { title: "约会迟到", description: "让对方等了很久" },
  3: { title: "打游戏忽略对方", description: "沉迷游戏忘了回复消息" },
  4: { title: "答应的事没做到", description: "承诺的事情没有兑现" },
  5: { title: "和异性走太近", description: "和其他异性的关系让对方不安" },
  6: { title: "加班太晚/太忙", description: "工作太忙没时间陪伴" },
  7: { title: "说谎/隐瞒", description: "隐瞒了一些事情被发现" },
  8: { title: "只顾着玩手机", description: "见面时一直玩手机" },
  9: { title: "忘带/丢了东西", description: "把重要的东西弄丢了" },
  10: { title: "争吵后冷战", description: "吵架后谁也不理谁" },
};

// 男生名字和女生名字
const BOY_NAMES = ["小宇", "阿明", "小杰", "阿超", "阿伟"];
const GIRL_NAMES = ["小雨", "小芳", "小丽", "小美", "阿玲"];

export async function POST(request: NextRequest) {
  const initStartedAt = Date.now();
  const initRequestId = `game-init-${initStartedAt}-${Math.random().toString(36).substring(7)}`;

  try {
    const llmProvider = createAIProvider('qiniuyun');
    const ttsProvider = createTTSProvider('siliconflow');

    const { role, topicId, voiceRoleId } = await request.json();

    // 确定角色
    const playerRole = role === "girlfriend" ? "girlfriend" : "boyfriend";
    const isPlayerBoy = playerRole === "boyfriend";
    
    // 角色名称
    const playerName = isPlayerBoy 
      ? BOY_NAMES[Math.floor(Math.random() * BOY_NAMES.length)]
      : GIRL_NAMES[Math.floor(Math.random() * GIRL_NAMES.length)];
    const partnerName = isPlayerBoy 
      ? GIRL_NAMES[Math.floor(Math.random() * GIRL_NAMES.length)]
      : BOY_NAMES[Math.floor(Math.random() * BOY_NAMES.length)];

    // 确定话题
    let topicTitle = "";
    let topicDescription = "";
    
    if (topicId && TOPIC_MAP[topicId]) {
      topicTitle = TOPIC_MAP[topicId].title;
      topicDescription = TOPIC_MAP[topicId].description;
    }

    // 构建生成场景的提示词
    let scenarioPrompt = "";
    if (topicTitle && topicDescription) {
      scenarioPrompt = `你是"哄哄模拟器"的游戏主持人。

请根据以下指定话题生成一个具体的吵架场景：

话题：${topicTitle}
话题说明：${topicDescription}
玩家角色：${playerRole === "boyfriend" ? "男朋友" : "女朋友"}
${playerName}（玩家）的伴侣名字：${partnerName}

请生成一个符合这个话题的吵架场景，格式如下（JSON格式返回，不要包含其他内容）：

{
  "scenario": "具体的场景描述（50-80字，要具体描述发生了什么）",
  "playerRole": "${playerRole}",
  "partnerName": "${partnerName}",
  "partnerPersonality": "伴侣的性格描述（20字左右，要有特点）",
  "initialAnger": 85,
  "initialHappiness": 15,
  "initialEmotion": "初始情绪关键词"
}

要求：
1. 场景要具体且生活化，贴合"${topicTitle}"这个话题
2. 伴侣性格要有特点
3. 初始愤怒值设为80-95之间
4. 初始幸福感设为5-20之间
5. 只返回JSON，不要有其他解释`;
    } else {
      scenarioPrompt = `你是"哄哄模拟器"的游戏主持人。你的任务是生成一个情侣吵架场景。

玩家角色：${playerRole === "boyfriend" ? "男朋友" : "女朋友"}
${playerName}（玩家）的伴侣名字：${partnerName}

请生成一个随机但合理的吵架场景，格式如下（JSON格式返回，不要包含其他内容）：

{
  "scenario": "场景描述（50-80字，要具体描述发生了什么）",
  "playerRole": "${playerRole}",
  "partnerName": "${partnerName}",
  "partnerPersonality": "伴侣的性格描述（20字左右，要有特点）",
  "initialAnger": 85,
  "initialHappiness": 15,
  "initialEmotion": "初始情绪关键词"
}

要求：
1. 场景要具体且生活化，比如"忘记纪念日"、"约会迟到"、"沉迷游戏忽略对方"等
2. 伴侣性格要有特点
3. 初始愤怒值设为80-95之间
4. 初始幸福感设为5-20之间
5. 只返回JSON，不要有其他解释`;
    }

    const messages = [
      { role: "system" as const, content: scenarioPrompt },
      { role: "user" as const, content: topicTitle ? `生成一个关于"${topicTitle}"的吵架场景` : "生成一个随机的情侣吵架场景" }
    ];

    const scenarioStartedAt = Date.now();
    const response = await llmProvider.chat(messages, { temperature: 0.9 });
    console.log(`[${initRequestId}] Game init scenario generated`, {
      duration: Date.now() - scenarioStartedAt,
      hasTopic: Boolean(topicTitle),
    });

    // 解析 JSON 响应
    let gameData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        gameData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      const defaultTopic = topicTitle || "男朋友加班太晚，忘记了答应陪她吃饭的约定";
      gameData = {
        scenario: defaultTopic,
        playerRole: playerRole,
        partnerName: partnerName,
        partnerPersonality: isPlayerBoy ? "有点小脾气，但很在乎你" : "有点傲娇，但很爱你",
        initialAnger: 85,
        initialHappiness: 15,
        initialEmotion: "委屈"
      };
    }

    // ===== 同时生成 TTS 和第一轮选项 =====
    
    // 确定音色
    const speaker = VOICE_ROLE_MAP[voiceRoleId] || VOICE_ROLE_MAP[1];
    
    const playerLabel = isPlayerBoy ? "男朋友" : "女朋友";
    const partnerLabel = isPlayerBoy ? "女朋友" : "男朋友";

    // 生成选项的提示词
    const optionsPrompt = `你是"哄哄模拟器"的游戏主持人。你的任务是为${playerLabel}生成7个可能的回复选项。

当前场景：${gameData.scenario}
${playerLabel}（玩家）：${isPlayerBoy ? "小宇" : "小美"}
${partnerName}性格：${gameData.partnerPersonality}
当前回合：第1轮

请生成7个不同风格的回复选项，格式如下（JSON格式返回，不要包含其他内容）：

{
  "options": [
    {
      "id": 1,
      "text": "真诚道歉的回复（20-30字，有诚意、能哄好对方的回复）",
      "style": "positive",
      "hiddenEffect": {"angerChange": -15, "happinessChange": 15, "panicChange": 5, "tensionChange": -5, "nervousnessChange": 5}
    },
    {
      "id": 2,
      "text": "温柔安慰的回复（20-30字，能理解对方情绪、产生共鸣的回复）",
      "style": "positive",
      "hiddenEffect": {"angerChange": -18, "happinessChange": 18, "panicChange": 5, "tensionChange": 5, "nervousnessChange": 5}
    },
    {
      "id": 3,
      "text": "讲道理的回复（20-30字，试图解释但会让对方更生气的回复）",
      "style": "negative",
      "hiddenEffect": {"angerChange": 15, "happinessChange": -10, "panicChange": 5, "tensionChange": 10, "nervousnessChange": 10}
    },
    {
      "id": 4,
      "text": "敷衍了事的回复（20-30字，让对方觉得不被重视的回复）",
      "style": "negative",
      "hiddenEffect": {"angerChange": 20, "happinessChange": -15, "panicChange": -10, "tensionChange": -10, "nervousnessChange": -5}
    },
    {
      "id": 5,
      "text": "非常搞笑有趣的回复（20-30字，让人看到就想笑）",
      "style": "funny",
      "hiddenEffect": {"angerChange": 5, "happinessChange": -5, "panicChange": 10, "tensionChange": 10, "nervousnessChange": 15}
    },
    {
      "id": 6,
      "text": "超级沙雕可爱的回复（20-30字，让人忍俊不禁）",
      "style": "funny",
      "hiddenEffect": {"angerChange": 8, "happinessChange": -3, "panicChange": 15, "tensionChange": 10, "nervousnessChange": 20}
    },
    {
      "id": 7,
      "text": "出人意料的搞笑回复（20-30字，让人笑出声）",
      "style": "funny",
      "hiddenEffect": {"angerChange": 10, "happinessChange": 0, "panicChange": 20, "tensionChange": 15, "nervousnessChange": 25}
    }
  ]
}

要求：
1. 选项文本中【不要】包含任何"正向"、"负向"、"搞笑"等标签
2. 选项文本要自然口语化，让玩家看不出哪个是好哪个是坏
3. 搞笑选项要非常有趣、有创意
4. 只返回JSON，不要有其他解释`;

    // 并行生成 TTS 和选项
    const parallelStartedAt = Date.now();
    const [ttsResult, optionsResult] = await Promise.all([
      // 生成 TTS
      (async () => {
        const ttsStartedAt = Date.now();
        try {
          const ttsResponse = await ttsProvider.synthesize({
            text: gameData.scenario,
            voice: speaker,
          });
          console.log(`[${initRequestId}] Game init TTS generated`, {
            duration: Date.now() - ttsStartedAt,
          });
          return { success: true, audioData: ttsResponse.audioData.toString('base64') };
        } catch (ttsError) {
          console.error("Init TTS error:", ttsError);
          console.log(`[${initRequestId}] Game init TTS failed`, {
            duration: Date.now() - ttsStartedAt,
          });
          return { success: false, audioData: null };
        }
      })(),
      // 生成选项
      (async () => {
        const optionsStartedAt = Date.now();
        try {
          const optionsResponse = await llmProvider.chat([
            { role: "system" as const, content: optionsPrompt },
            { role: "user" as const, content: "生成第1轮的回复选项" }
          ], { temperature: 0.9 });
          
          const jsonMatch = optionsResponse.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const optionsData = JSON.parse(jsonMatch[0]);
            console.log(`[${initRequestId}] Game init options generated`, {
              duration: Date.now() - optionsStartedAt,
            });
            return { success: true, options: optionsData.options.sort(() => Math.random() - 0.5) };
          }
          throw new Error("No JSON in options response");
        } catch (optionsError) {
          console.error("Options generation error:", optionsError);
          console.log(`[${initRequestId}] Game init options failed`, {
            duration: Date.now() - optionsStartedAt,
          });
          // 返回默认选项
          return {
            success: false,
            options: [
              { id: 1, text: `${partnerName}，对不起，我真的很抱歉`, style: "positive", hiddenEffect: { angerChange: -15, happinessChange: 15, panicChange: 5, tensionChange: -5, nervousnessChange: 5 } },
              { id: 2, text: "我能感受到你很委屈，换作是我也会难过", style: "positive", hiddenEffect: { angerChange: -18, happinessChange: 18, panicChange: 5, tensionChange: 5, nervousnessChange: 5 } },
              { id: 3, text: "你冷静一下，我说的也没错啊", style: "negative", hiddenEffect: { angerChange: 15, happinessChange: -10, panicChange: 5, tensionChange: 10, nervousnessChange: 10 } },
              { id: 4, text: "行行行，都是我的错还不行吗", style: "negative", hiddenEffect: { angerChange: 20, happinessChange: -15, panicChange: -10, tensionChange: -10, nervousnessChange: -5 } },
              { id: 5, text: "（模仿机器人）道歉模式已启动！", style: "funny", hiddenEffect: { angerChange: 5, happinessChange: -5, panicChange: 10, tensionChange: 10, nervousnessChange: 15 } },
              { id: 6, text: "虽然我错了，但你生气的样子好可爱", style: "funny", hiddenEffect: { angerChange: 8, happinessChange: -3, panicChange: 15, tensionChange: 10, nervousnessChange: 20 } },
              { id: 7, text: "（突然下跪）娘子，为夫知错了！", style: "funny", hiddenEffect: { angerChange: 10, happinessChange: 0, panicChange: 20, tensionChange: 15, nervousnessChange: 25 } },
            ]
          };
        }
      })(),
    ]);

    console.log(`[${initRequestId}] Game init parallel tasks completed`, {
      duration: Date.now() - parallelStartedAt,
      ttsSuccess: ttsResult.success,
      optionsSuccess: optionsResult.success,
    });
    console.log(`[${initRequestId}] Game init completed`, {
      duration: Date.now() - initStartedAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...gameData,
        voiceRoleId: voiceRoleId || 1,
        initialAudioData: ttsResult.success ? ttsResult.audioData : null,
        initialOptions: optionsResult.options
      }
    });
  } catch (error) {
    console.error("Game init error:", error);
    console.log(`[${initRequestId}] Game init failed`, {
      duration: Date.now() - initStartedAt,
    });
    return NextResponse.json(
      { success: false, error: "Failed to initialize game" },
      { status: 500 }
    );
  }
}
