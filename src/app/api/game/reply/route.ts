import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const provider = createAIProvider('qiniuyun');

    const { 
      scenario, 
      partnerName, 
      partnerPersonality, 
      currentRound, 
      selectedOption,
      currentAnger,
      currentHappiness,
      conversationHistory: conversationHistoryParam,
      playerRole
    } = await request.json();

    const conversationHistory = conversationHistoryParam || [];

    const isPlayerBoy = playerRole === "boyfriend";
    const playerLabel = isPlayerBoy ? "男朋友" : "女朋友";
    const partnerLabel = isPlayerBoy ? "女朋友" : "男朋友";

    const systemPrompt = `你是"哄哄模拟器"中的${partnerLabel}角色。

角色设定：
- 名字：${partnerName}
- 性格：${partnerPersonality}
- 当前情绪：愤怒值${currentAnger}，幸福值${currentHappiness}

场景背景：${scenario}

对话历史：
${conversationHistory.length > 0 ? conversationHistory.map((h: any) => `${h.speaker === "player" ? playerLabel : partnerLabel}：${h.text}`).join('\n') : '（这是第一轮对话）'}

当前回合：第${currentRound}轮
${playerLabel}选择了："${selectedOption}"

请生成${partnerName}对这句话的回复，格式如下（JSON格式返回，不要包含其他内容）：

{
  "reply": "${partnerName}的回复内容（30-50字，要有角色特点，符合她的性格和当前情绪）",
  "emotion": "回复时的情绪关键词（如：愤怒、委屈、感动、冷漠等）",
  "isAngry": true/false,
  "effects": {
    "angerChange": -10,
    "happinessChange": 10,
    "panicChange": 5,
    "tensionChange": 5,
    "nervousnessChange": 5
  }
}

要求：
1. 回复要符合${partnerName}的性格（${partnerPersonality}）
2. 回复要自然、口语化
3. 根据${playerLabel}的选择（"${selectedOption}"）决定${partnerName}的情绪变化
4. 如果${playerLabel}说得对/有道理，${partnerName}的愤怒会下降更多
5. 如果${playerLabel}敷衍/讲道理，${partnerName}的愤怒可能会上升
6. 只返回JSON，不要有其他解释`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: `${partnerName}如何回复${playerLabel}的"${selectedOption}"？` }
    ];

    const response = await provider.chat(messages, { temperature: 0.8 });

    // 解析 JSON 响应
    let replyData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        replyData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // 返回默认回复
      replyData = {
        reply: "哼，知道错了？那你说说你错哪儿了？别想随便一句话就蒙混过关！",
        emotion: "愤怒",
        isAngry: true,
        effects: { angerChange: 5, happinessChange: 0, panicChange: 10, tensionChange: 10, nervousnessChange: 10 }
      };
    }

    return NextResponse.json({
      success: true,
      data: replyData
    });
  } catch (error) {
    console.error("Reply generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate reply" },
      { status: 500 }
    );
  }
}
