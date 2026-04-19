import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const provider = createAIProvider('qiniuyun');

    const { scenario, partnerName, partnerPersonality, currentRound, playerRole } = await request.json();

    const isPlayerBoy = playerRole === "boyfriend";
    const playerLabel = isPlayerBoy ? "男朋友" : "女朋友";
    const partnerLabel = isPlayerBoy ? "女朋友" : "男朋友";

    const systemPrompt = `你是"哄哄模拟器"的游戏主持人。你的任务是为${playerLabel}生成7个可能的回复选项。

当前场景：${scenario}
${playerLabel}（玩家）：${isPlayerBoy ? "小宇" : "小美"}
${partnerLabel}名字：${partnerName}
${partnerLabel}性格：${partnerPersonality}
当前回合：第${currentRound}轮

请生成7个不同风格的回复选项，格式如下（JSON格式返回，不要包含其他内容）：

{
  "options": [
    {
      "id": 1,
      "text": "真诚道歉的回复（20-30字，有诚意、能哄好对方的回复，符合${playerLabel}身份）",
      "style": "positive",
      "hiddenEffect": {
        "angerChange": -15,
        "happinessChange": 15,
        "panicChange": 5,
        "tensionChange": -5,
        "nervousnessChange": 5
      }
    },
    {
      "id": 2,
      "text": "温柔安慰的回复（20-30字，能理解对方情绪、产生共鸣的回复）",
      "style": "positive",
      "hiddenEffect": {
        "angerChange": -18,
        "happinessChange": 18,
        "panicChange": 5,
        "tensionChange": 5,
        "nervousnessChange": 5
      }
    },
    {
      "id": 3,
      "text": "讲道理的回复（20-30字，试图解释但会让对方更生气的回复）",
      "style": "negative",
      "hiddenEffect": {
        "angerChange": 15,
        "happinessChange": -10,
        "panicChange": 5,
        "tensionChange": 10,
        "nervousnessChange": 10
      }
    },
    {
      "id": 4,
      "text": "敷衍了事的回复（20-30字，让对方觉得不被重视的回复）",
      "style": "negative",
      "hiddenEffect": {
        "angerChange": 20,
        "happinessChange": -15,
        "panicChange": -10,
        "tensionChange": -10,
        "nervousnessChange": -5
      }
    },
    {
      "id": 5,
      "text": "非常搞笑有趣的回复（20-30字，让人看到就想笑，但要带点小问题）",
      "style": "funny",
      "hiddenEffect": {
        "angerChange": 5,
        "happinessChange": -5,
        "panicChange": 10,
        "tensionChange": 10,
        "nervousnessChange": 15
      }
    },
    {
      "id": 6,
      "text": "超级沙雕可爱的回复（20-30字，让人忍俊不禁，但点完会发现有点不合适）",
      "style": "funny",
      "hiddenEffect": {
        "angerChange": 8,
        "happinessChange": -3,
        "panicChange": 15,
        "tensionChange": 10,
        "nervousnessChange": 20
      }
    },
    {
      "id": 7,
      "text": "出人意料的搞笑回复（20-30字，让人笑出声，但冷静下来觉得不太合适）",
      "style": "funny",
      "hiddenEffect": {
        "angerChange": 10,
        "happinessChange": 0,
        "panicChange": 20,
        "tensionChange": 15,
        "nervousnessChange": 25
      }
    }
  ]
}

要求：
1. 选项文本中【不要】包含任何"正向"、"负向"、"搞笑"、"positive"、"negative"、"funny"等标签
2. 选项文本要自然口语化，让玩家看不出哪个是好哪个是坏
3. 搞笑选项要非常有趣、有创意，要让人看了就想点
4. hiddenEffect中的数值是隐藏的，玩家选择前看不到
5. 回复要符合${playerLabel}的身份特点
6. 只返回JSON，不要有其他解释`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: `生成第${currentRound}轮的回复选项` }
    ];

    const response = await provider.chat(messages, { temperature: 0.9 });

    // 解析 JSON 响应
    let optionsData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optionsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // 返回默认选项
      optionsData = {
        options: [
          {
            id: 1,
            text: `${partnerName}，对不起，我真的很抱歉，是我太不重视你了`,
            style: "positive",
            hiddenEffect: { angerChange: -15, happinessChange: 15, panicChange: 5, tensionChange: -5, nervousnessChange: 5 }
          },
          {
            id: 2,
            text: "我能感受到你很委屈，换作是我也会很难过",
            style: "positive",
            hiddenEffect: { angerChange: -18, happinessChange: 18, panicChange: 5, tensionChange: 5, nervousnessChange: 5 }
          },
          {
            id: 3,
            text: "你冷静一下，我说的也没错啊",
            style: "negative",
            hiddenEffect: { angerChange: 15, happinessChange: -10, panicChange: 5, tensionChange: 10, nervousnessChange: 10 }
          },
          {
            id: 4,
            text: "行行行，都是我的错还不行吗",
            style: "negative",
            hiddenEffect: { angerChange: 20, happinessChange: -15, panicChange: -10, tensionChange: -10, nervousnessChange: -5 }
          },
          {
            id: 5,
            text: "（模仿机器人）对不起主人，我检测到您不开心，现在立刻马上开启道歉模式！",
            style: "funny",
            hiddenEffect: { angerChange: 5, happinessChange: -5, panicChange: 10, tensionChange: 10, nervousnessChange: 15 }
          },
          {
            id: 6,
            text: "虽然我错了，但你生气的样子好可爱啊，像个生气的小仓鼠！",
            style: "funny",
            hiddenEffect: { angerChange: 8, happinessChange: -3, panicChange: 15, tensionChange: 10, nervousnessChange: 20 }
          },
          {
            id: 7,
            text: "（突然下跪）娘子，为夫知错了！请受为夫一拜！（然后发现家里没地垫膝盖有点疼）",
            style: "funny",
            hiddenEffect: { angerChange: 10, happinessChange: 0, panicChange: 20, tensionChange: 15, nervousnessChange: 25 }
          }
        ]
      };
    }

    // 随机打乱选项顺序
    const shuffledOptions = optionsData.options.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      success: true,
      data: { options: shuffledOptions }
    });
  } catch (error) {
    console.error("Options generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate options" },
      { status: 500 }
    );
  }
}
