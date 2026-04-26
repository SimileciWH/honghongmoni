"use client";

import { useState, useCallback, useRef, useEffect } from "react";

function createAudioUrlFromBase64(base64Data: string): string {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}

function resolveAudioUrl(audioUrl?: string | null, audioData?: string | null): string | undefined {
  if (audioUrl) {
    return audioUrl;
  }

  if (audioData) {
    return createAudioUrlFromBase64(audioData);
  }

  return undefined;
}

// 预设吵架话题列表
export const PRESET_TOPICS = [
  { id: 1, title: "忘记纪念日/生日", emoji: "🎂", description: "重要的纪念日或生日忘记了" },
  { id: 2, title: "约会迟到", emoji: "⏰", description: "让对方等了很久" },
  { id: 3, title: "打游戏忽略对方", emoji: "🎮", description: "沉迷游戏忘了回复消息" },
  { id: 4, title: "答应的事没做到", emoji: "🤝", description: "承诺的事情没有兑现" },
  { id: 5, title: "和异性走太近", emoji: "👫", description: "和其他异性的关系让对方不安" },
  { id: 6, title: "加班太晚/太忙", emoji: "💼", description: "工作太忙没时间陪伴" },
  { id: 7, title: "说谎/隐瞒", emoji: "🤥", description: "隐瞒了一些事情被发现" },
  { id: 8, title: "只顾着玩手机", emoji: "📱", description: "见面时一直玩手机" },
  { id: 9, title: "忘带/丢了东西", emoji: "😤", description: "把重要的东西弄丢了" },
  { id: 10, title: "争吵后冷战", emoji: "❄️", description: "吵架后谁也不理谁" },
];

// 预设声音角色 - 女声
export const VOICE_ROLES_FEMALE = [
  { id: 1, name: "甜萌萝莉", emoji: "🍰", description: "可爱撒娇型", speaker: "saturn_zh_female_keainvsheng_tob" },
  { id: 2, name: "温柔淑女", emoji: "🌸", description: "轻声细语型", speaker: "zh_female_santongyongns_saturn_bigtts" },
  { id: 3, name: "知性御姐", emoji: "👠", description: "成熟稳重型", speaker: "zh_female_mizai_saturn_bigtts" },
  { id: 4, name: "活泼少女", emoji: "☀️", description: "元气满满型", speaker: "zh_female_xvxiaoxiannv_saturn_bigtts" },
  { id: 5, name: "傲娇小公举", emoji: "👸", description: "口是心非型", speaker: "zh_female_meilinvyou_saturn_bigtts" },
  { id: 6, name: "霸道御姐", emoji: "🔥", description: "气场强大型", speaker: "zh_female_jitangnv_saturn_bigtts" },
  { id: 7, name: "邻家女孩", emoji: "🏠", description: "亲切自然型", speaker: "zh_female_xiaohe_uranus_bigtts" },
  { id: 8, name: "高冷女神", emoji: "❄️", description: "冷艳疏离型", speaker: "zh_female_vv_uranus_bigtts" },
];

// 预设声音角色 - 男声
export const VOICE_ROLES_MALE = [
  { id: 101, name: "阳光男孩", emoji: "🌞", description: "温暖阳光型", speaker: "zh_male_m191_uranus_bigtts" },
  { id: 102, name: "磁性低音", emoji: "🎸", description: "低沉磁性型", speaker: "zh_male_taocheng_uranus_bigtts" },
  { id: 103, name: "温柔暖男", emoji: "☕", description: "体贴暖心型", speaker: "zh_male_dayi_saturn_bigtts" },
  { id: 104, name: "儒雅绅士", emoji: "🎩", description: "温文尔雅型", speaker: "zh_male_ruyayichen_saturn_bigtts" },
];

// 合并所有声音角色
export const VOICE_ROLES = [...VOICE_ROLES_FEMALE, ...VOICE_ROLES_MALE];

export type GenderRole = "boyfriend" | "girlfriend";

export interface GameScenario {
  scenario: string;
  playerRole: GenderRole;
  partnerName: string;
  partnerPersonality: string;
  initialAnger: number;
  initialHappiness: number;
  initialEmotion: string;
  voiceRoleId?: number;
}

export interface GameOption {
  id: number;
  text: string;
  style: string;
  hiddenEffect: {
    angerChange: number;
    happinessChange: number;
    panicChange: number;
    tensionChange: number;
    nervousnessChange: number;
  };
}

export interface ConversationItem {
  speaker: "player" | "girl";
  text: string;
  emotion?: string;
  effect?: {
    angerChange: number;
    happinessChange: number;
  };
  audioUrl?: string;
}

export interface PlayerState {
  panic: number;
  tension: number;
  nervousness: number;
  happiness: number;
}

export interface GameState {
  status: "idle" | "playing" | "ended";
  scenario: GameScenario | null;
  playerState: PlayerState;
  girlState: {
    anger: number;
    happiness: number;
  };
  currentRound: number;
  maxRounds: number;
  options: GameOption[];
  conversation: ConversationItem[];
  lastEffect: {
    angerChange: number;
    happinessChange: number;
    panicChange: number;
    tensionChange: number;
    nervousnessChange: number;
  } | null;
  isLoading: boolean;
  isThinking: boolean;  // 思考中（等选项）
  isGenerating: boolean;  // 生成回复中
  result: "success" | "fail" | null;
}

const initialPlayerState: PlayerState = {
  panic: 30,
  tension: 40,
  nervousness: 50,
  happiness: 70,
};

const initialGirlState = {
  anger: 85,
  happiness: 15,
};

export function useGame(onGameEnd?: (result: { success: boolean; score: number; scenario: string }) => void) {
  const [gameState, setGameState] = useState<GameState>({
    status: "idle",
    scenario: null,
    playerState: { ...initialPlayerState },
    girlState: { ...initialGirlState },
    currentRound: 0,
    maxRounds: 10,
    options: [],
    conversation: [],
    lastEffect: null,
    isLoading: false,
    isThinking: false,
    isGenerating: false,
    result: null,
  });

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showEffect, setShowEffect] = useState(false);

  // 使用 ref 存储最新的 onGameEnd 回调，避免闭包问题
  const onGameEndRef = useRef(onGameEnd);
  useEffect(() => {
    onGameEndRef.current = onGameEnd;
  }, [onGameEnd]);

  // 使用 ref 存储最新的 gameState，避免闭包问题
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // 监听游戏结束状态，触发回调
  const prevResultRef = useRef<string | null>(null);
  useEffect(() => {
    const currentResult = gameStateRef.current.result;
    if (currentResult && currentResult !== prevResultRef.current) {
      prevResultRef.current = currentResult;
      const isSuccess = currentResult === "success";
      const state = gameStateRef.current;
      if (onGameEndRef.current) {
        onGameEndRef.current({
          success: isSuccess,
          score: state.girlState.happiness,
          scenario: state.scenario?.scenario || "未知场景"
        });
      }
    }
  }, [gameState.result]);

  // generateOptions 需要在 initGame 之前定义
  const generateOptions = useCallback(
    async (scenario: string, partnerName: string, partnerPersonality: string, round: number, playerRole?: GenderRole) => {
      try {
        const response = await fetch("/api/game/options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario, partnerName, partnerPersonality, currentRound: round, playerRole }),
        });

        const result = await response.json();

        if (result.success) {
          setGameState((prev) => ({
            ...prev,
            options: result.data.options,
            isThinking: false, // 思考结束
            isGenerating: false,
          }));
        }
      } catch (error) {
        console.error("Generate options error:", error);
        setGameState((prev) => ({ ...prev, isThinking: false, isGenerating: false }));
      }
    },
    []
  );

  const initGame = useCallback(async (role?: GenderRole, topicId?: number, voiceRoleId?: number) => {
    setGameState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch("/api/game/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, topicId, voiceRoleId }),
      });

      const result = await response.json();

      if (result.success) {
        const { data } = result;
        const initialAudioUrl = resolveAudioUrl(data.initialAudioUrl, data.initialAudioData);

        // 创建第一条场景消息（带语音）
        const initialMessage = {
          speaker: "girl" as const,
          text: data.scenario,
          emotion: data.initialEmotion,
          audioUrl: initialAudioUrl,
        };
        
        // 直接使用 init API 返回的选项，不需要单独请求
        setGameState((prev) => ({
          ...prev,
          status: "playing",
          scenario: {
            scenario: data.scenario,
            playerRole: data.playerRole,
            partnerName: data.partnerName,
            partnerPersonality: data.partnerPersonality,
            initialAnger: data.initialAnger,
            initialHappiness: data.initialHappiness,
            initialEmotion: data.initialEmotion,
            voiceRoleId: data.voiceRoleId,
          },
          playerState: { ...initialPlayerState },
          girlState: {
            anger: data.initialAnger,
            happiness: data.initialHappiness,
          },
          currentRound: 1,
          conversation: [initialMessage],
          lastEffect: null,
          isLoading: false,
          isThinking: false, // 加载完成
          isGenerating: false,
          result: null,
          options: data.initialOptions || [], // 直接使用返回的选项
        }));
        
        // 设置初始语音并播放
        if (initialAudioUrl) {
          setAudioUrl(initialAudioUrl);
        }
      }
    } catch (error) {
      console.error("Init game error:", error);
      setGameState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [generateOptions]);

  const selectOption = useCallback(
    async (option: GameOption) => {
      // 使用 ref 获取最新状态，避免闭包问题
      const currentState = gameStateRef.current;
      
      // 防止重复点击
      if (!currentState.scenario || currentState.isThinking) return;

      // 先添加玩家消息，清空选项，显示加载状态
      const playerMessage: ConversationItem = {
        speaker: "player",
        text: option.text,
      };
      
      setGameState((prev) => ({
        ...prev,
        options: [], // 清空选项
        isThinking: true, // 开始加载
        isGenerating: true,
        conversation: [...prev.conversation, playerMessage], // 先添加玩家消息
      }));

      try {
        // 第一步：先加载回复内容（包含 TTS）
        const replyResponse = await fetch("/api/game/reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: currentState.scenario.scenario,
            partnerName: currentState.scenario.partnerName,
            partnerPersonality: currentState.scenario.partnerPersonality,
            currentRound: currentState.currentRound,
            selectedOption: option.text,
            currentAnger: currentState.girlState.anger,
            currentHappiness: currentState.girlState.happiness,
            conversationHistory: currentState.conversation,
            playerRole: currentState.scenario.playerRole,
          }),
        });

        if (!replyResponse.ok) {
          throw new Error(`Reply API error: ${replyResponse.status}`);
        }

        const replyResult = await replyResponse.json();

        if (!replyResult.success) {
          throw new Error("Reply generation failed");
        }

        const { data: replyData } = replyResult;

        // 生成 TTS 语音（不依赖 abort controller，独立请求）
        let newAudioUrl: string | null = null;
        try {
          const ttsResponse = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: replyData.reply,
              emotion: replyData.emotion,
              voiceRoleId: currentState.scenario.voiceRoleId,
              playerRole: currentState.scenario.playerRole
            }),
          });
          const ttsResult = await ttsResponse.json();
          if (ttsResult.success) {
            newAudioUrl = resolveAudioUrl(ttsResult.audioUrl, ttsResult.audioData) || null;
          }
        } catch (ttsError) {
          console.error("TTS error:", ttsError);
        }

        // 第二步：等回复和语音都准备好后，再加载下一轮选项
        const optionsResponse = await fetch("/api/game/options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: currentState.scenario.scenario,
            partnerName: currentState.scenario.partnerName,
            partnerPersonality: currentState.scenario.partnerPersonality,
            currentRound: currentState.currentRound + 1,
            playerRole: currentState.scenario.playerRole,
          }),
        });

        if (!optionsResponse.ok) {
          throw new Error(`Options API error: ${optionsResponse.status}`);
        }

        const optionsResult = await optionsResponse.json();

        // 计算新的状态值
        const combinedEffects = {
          angerChange: (replyData.effects.angerChange + option.hiddenEffect.angerChange) / 2,
          happinessChange: (replyData.effects.happinessChange + option.hiddenEffect.happinessChange) / 2,
          panicChange: option.hiddenEffect.panicChange,
          tensionChange: option.hiddenEffect.tensionChange,
          nervousnessChange: option.hiddenEffect.nervousnessChange,
        };

        const newGirlAnger = Math.max(0, Math.min(100, currentState.girlState.anger + combinedEffects.angerChange));
        const newGirlHappiness = Math.max(0, Math.min(100, currentState.girlState.happiness + combinedEffects.happinessChange));
        const newPanic = Math.max(0, Math.min(100, currentState.playerState.panic + combinedEffects.panicChange));
        const newTension = Math.max(0, Math.min(100, currentState.playerState.tension + combinedEffects.tensionChange));
        const newNervousness = Math.max(0, Math.min(100, currentState.playerState.nervousness + combinedEffects.nervousnessChange));

        const newRound = currentState.currentRound + 1;
        const isSuccess = newGirlAnger <= 10 && newGirlHappiness >= 90;
        const isFail = newRound > currentState.maxRounds && !isSuccess;

        // 对方回复
        const girlReply: ConversationItem = {
          speaker: "girl",
          text: replyData.reply,
          emotion: replyData.emotion,
          effect: {
            angerChange: combinedEffects.angerChange,
            happinessChange: combinedEffects.happinessChange,
          },
          audioUrl: newAudioUrl || undefined,
        };

        // 设置音频并播放
        setAudioUrl(newAudioUrl);
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 2000);

        // 一次性更新所有内容：回复、选项、状态 - 确保同时出现
        setGameState((prev) => ({
          ...prev,
          girlState: {
            anger: newGirlAnger,
            happiness: newGirlHappiness,
          },
          playerState: {
            panic: newPanic,
            tension: newTension,
            nervousness: newNervousness,
            happiness: prev.playerState.happiness + combinedEffects.happinessChange / 2,
          },
          currentRound: newRound,
          conversation: [...prev.conversation, girlReply],
          lastEffect: combinedEffects,
          options: isSuccess || isFail ? [] : (optionsResult.success ? optionsResult.data.options : []),
          isThinking: false,
          isGenerating: false,
          status: isFail ? "ended" : isSuccess ? "ended" : "playing",
          result: isSuccess ? "success" : isFail ? "fail" : null,
        }));
      } catch (error: unknown) {
        const errorName = error instanceof Error ? error.name : undefined;
        const errorMessage = error instanceof Error ? error.message : undefined;

        // 判断是否是中止错误
        const isAbortError = errorName === 'AbortError' ||
                             errorMessage?.includes('abort') ||
                             errorMessage?.includes('cancelled');

        // 判断是否是网络错误（网络断开、CORS等）
        const isNetworkError = errorMessage?.includes('Failed to fetch') ||
                              errorMessage?.includes('NetworkError') ||
                              errorMessage?.includes('Network request failed');
        
        if (isAbortError) {
          console.log("Request cancelled, ignoring...");
          return;
        }
        
        console.error("Request error:", error);
        
        // 网络错误时回滚：移除玩家消息
        if (isNetworkError) {
          setGameState((prev) => ({ 
            ...prev, 
            isThinking: false, 
            isGenerating: false,
            // 移除最后一条玩家消息
            conversation: prev.conversation.filter(
              (msg, idx) => idx !== prev.conversation.length - 1 || msg.speaker !== 'player'
            )
          }));
        } else {
          // 其他错误，保持玩家消息但清除加载状态
          setGameState((prev) => ({ 
            ...prev, 
            isThinking: false, 
            isGenerating: false
          }));
        }
      }
    },
    []
  );

  const restartGame = useCallback(async () => {
    setGameState({
      status: "idle",
      scenario: null,
      playerState: { ...initialPlayerState },
      girlState: { ...initialGirlState },
      currentRound: 0,
      maxRounds: 10,
      options: [],
      conversation: [],
      lastEffect: null,
      isLoading: false,
      isThinking: false,
      isGenerating: false,
      result: null,
    });
    setAudioUrl(null);
    setShowEffect(false);
    await initGame();
  }, [initGame]);

  return {
    gameState,
    audioUrl,
    showEffect,
    initGame,
    selectOption,
    restartGame,
  };
}
