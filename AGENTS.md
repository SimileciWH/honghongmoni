# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **LLM**: SiliconFlow LLM API
- **TTS**: SiliconFlow TTS API

## 项目概述

哄哄模拟器 - 情侣沟通的安全演练场

### 核心功能
- 角色扮演：玩家可以选择扮演男朋友或女朋友
- 话题选择：10个预设吵架话题，或随机生成
- 对话系统：选项式盲选对话，大模型生成回复
- 情绪系统：愤怒值、幸福值、恐慌值、紧张值等
- TTS语音：女生回复带语音朗读
- 胜负判定：10轮内达成目标为成功

### 预设话题
1. 忘记纪念日/生日
2. 约会迟到
3. 打游戏忽略对方
4. 答应的事没做到
5. 和异性走太近
6. 加班太晚/太忙
7. 说谎/隐瞒
8. 只顾着玩手机
9. 忘带/丢了东西
10. 争吵后冷战

## 目录结构

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── game/
│   │   │   │   ├── init/route.ts      # 游戏初始化API
│   │   │   │   ├── options/route.ts  # 生成选项API
│   │   │   │   └── reply/route.ts    # 生成回复API
│   │   │   └── tts/route.ts          # 语音合成API
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                   # 游戏主页面
│   ├── components/ui/                 # Shadcn UI 组件库
│   ├── hooks/
│   │   └── useGame.ts                # 游戏状态管理Hook
│   └── lib/utils.ts
├── public/
├── scripts/
├── package.json
└── tsconfig.json
```

## API 接口

### POST /api/game/init
初始化游戏，返回随机/指定场景

**请求参数**：
```typescript
{
  role?: "boyfriend" | "girlfriend"  // 玩家角色
  topicId?: number                     // 话题ID (1-10)
}
```

**响应**：
```typescript
{
  success: true,
  data: {
    scenario: string,           // 场景描述
    playerRole: string,        // 玩家角色
    partnerName: string,       // 伴侣名字
    partnerPersonality: string, // 伴侣性格
    initialAnger: number,      // 初始愤怒值
    initialHappiness: number,  // 初始幸福值
    initialEmotion: string     // 初始情绪
  }
}
```

### POST /api/game/options
生成回复选项

**请求参数**：
```typescript
{
  scenario: string,
  partnerName: string,
  partnerPersonality: string,
  currentRound: number,
  playerRole: string
}
```

### POST /api/game/reply
生成伴侣回复

**请求参数**：
```typescript
{
  scenario: string,
  partnerName: string,
  partnerPersonality: string,
  currentRound: number,
  selectedOption: string,
  currentAnger: number,
  currentHappiness: number,
  conversationHistory: ConversationItem[],
  playerRole: string
}
```

### POST /api/tts
文字转语音

**请求参数**：
```typescript
{
  text: string,    // 要转换的文字
  emotion: string  // 情绪类型
}
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器

## 开发规范

- **项目理解加速**：依赖 package.json 和本文件理解项目
- **Hydration 错误预防**：动态数据必须使用 useEffect + useState
- **AI流式输出**：LLM集成使用流式响应优先
