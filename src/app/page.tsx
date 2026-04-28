"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGame, PRESET_TOPICS, VOICE_ROLES_FEMALE, VOICE_ROLES_MALE, GenderRole } from "@/hooks/useGame";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Angry, AlertTriangle, Thermometer, Smile, Frown, Music, RotateCcw, Users, MessageSquare, Mic, Loader2, BookOpen, User, LogOut, CheckCircle, Trophy, Mail } from "lucide-react";

interface UserInfo {
  id: number;
  username: string;
}

// 生成名字首字母头像的颜色
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-pink-500", "bg-rose-500", "bg-purple-500", "bg-blue-500",
    "bg-cyan-500", "bg-teal-500", "bg-green-500", "bg-yellow-500",
    "bg-orange-500", "bg-red-500"
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// 头像组件
const Avatar = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
  const initial = name.charAt(0);
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };
  
  return (
    <div className={`${sizeClasses[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-bold shadow-sm`}>
      {initial}
    </div>
  );
};

export default function GamePage() {
  const router = useRouter();
  const [showSaveTip, setShowSaveTip] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  // 游戏结束时的回调
  const handleGameEnd = useCallback((result: { success: boolean; score: number; scenario: string }) => {
    console.log("游戏结束回调触发:", result);
    const storedUser = localStorage.getItem("user");
    console.log("当前登录状态:", storedUser ? "已登录" : "未登录");
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log("用户ID:", userData.id);
      // 已登录用户，保存记录
      fetch("/api/game/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userData.id,
          scenario: result.scenario,
          final_score: result.score,
          result: result.success ? "通关" : "失败"
        })
      }).then(res => res.json()).then(data => {
        console.log("保存结果:", data);
        if (data.success) {
          setSaveMessage("✓ 您的游戏记录已经保存");
        } else {
          setSaveMessage("游戏结束！");
        }
      }).catch((err) => {
        console.error("保存失败:", err);
        setSaveMessage("游戏结束！");
      });
    } else {
      // 未登录用户
      setSaveMessage("登录后可保存您的游戏记录");
    }
    setShowSaveTip(true);
    console.log("提示已显示:", showSaveTip);
    // 5秒后自动关闭
    setTimeout(() => {
      setShowSaveTip(false);
    }, 5000);
  }, []);
  
  const { gameState, audioUrl, showEffect, initGame, selectOption, restartGame } = useGame(handleGameEnd);
  const [selectedRole, setSelectedRole] = useState<GenderRole>("boyfriend");
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<number | null>(null);
  const [showSelection, setShowSelection] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 检查登录状态
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 自动播放语音
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  }, [audioUrl]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState.conversation, gameState.isThinking]);

  const handleStartGame = async () => {
    setShowSelection(false);
    await initGame(selectedRole, selectedTopic || undefined, selectedVoice || undefined);
  };

  const handleBackToSelection = () => {
    setShowSelection(true);
    setSelectedTopic(null);
  };

  // 获取玩家和伴侣的名称
  const playerName = gameState.scenario?.playerRole === "girlfriend" ? "我" : "阿宇";
  const partnerName = gameState.scenario?.partnerName || "小雨";

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* 顶部状态栏 - 固定在顶部 */}
      {gameState.status !== "idle" && !showSelection && (
        <header className="bg-[#f8f8f8] border-b border-gray-200 p-3 flex-shrink-0 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto">
            {/* 回合信息 */}
            <div className="flex justify-between items-center mb-2">
              <Badge variant="outline" className="text-xs bg-white">
                第 {gameState.currentRound} / {gameState.maxRounds} 轮
              </Badge>
              {gameState.scenario && (
                <span className="text-sm text-gray-600">
                  {gameState.scenario.partnerName}
                </span>
              )}
            </div>

            {/* 状态条 - 紧凑布局 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-1.5 shadow-sm">
                <div className="flex items-center gap-1">
                  <Angry className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-gray-500">愤怒</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${gameState.girlState.anger}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-1.5 shadow-sm">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-500" />
                  <span className="text-xs text-gray-500">幸福</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${gameState.girlState.happiness}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 胜利条件提示 */}
            <div className="mt-2 text-xs text-gray-400 text-center">
              目标：愤怒 ≤ 10 且 幸福 ≥ 90
            </div>
          </div>
        </header>
      )}

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center p-0">
        {/* 选择界面 */}
        {showSelection && (
          <div className="w-full max-w-2xl overflow-y-auto flex-1 p-3 space-y-3 [-webkit-overflow-scrolling:touch]">
            <div className="text-center space-y-2">
              <div className="text-4xl">💕</div>
              <h1 className="text-xl font-bold text-gray-800">哄哄模拟器</h1>
              <p className="text-gray-600 text-xs">
                情侣沟通的安全演练场
              </p>
              {/* 用户状态 */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {user ? (
                  <div className="flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-full">
                    <User className="w-4 h-4 text-pink-500" />
                    <span className="text-sm text-pink-600 font-medium">{user.username}</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem("user");
                        setUser(null);
                      }}
                      className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="退出登录"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-pink-500">
                        登录
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="ghost" size="sm" className="text-pink-500">
                        注册
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 角色选择 */}
            <Card className="p-4 bg-white">
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-500" />
                选择你要扮演的角色
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedRole("boyfriend")}
                  className={`p-2 rounded-xl border-2 transition-all cursor-pointer select-none touch-manipulation min-h-[60px] active:scale-95 ${
                    selectedRole === "boyfriend"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 active:border-blue-300"
                  }`}
                >
                  <div className="text-2xl mb-1" suppressHydrationWarning>👦</div>
                  <div className="font-medium text-xs">男朋友</div>
                </button>
                <button
                  onClick={() => setSelectedRole("girlfriend")}
                  className={`p-2 rounded-xl border-2 transition-all cursor-pointer select-none touch-manipulation min-h-[60px] active:scale-95 ${
                    selectedRole === "girlfriend"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 active:border-pink-300"
                  }`}
                >
                  <div className="text-2xl mb-1" suppressHydrationWarning>👧</div>
                  <div className="font-medium text-xs">女朋友</div>
                </button>
              </div>
            </Card>

            {/* 话题选择 */}
            <Card className="p-4 bg-white">
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-pink-500" />
                选择吵架话题
              </h2>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                    className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer select-none touch-manipulation min-h-[50px] active:scale-95 ${
                      selectedTopic === topic.id
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 active:border-pink-300"
                    }`}
                  >
                    <div className="text-lg" suppressHydrationWarning>{topic.emoji}</div>
                    <div className="text-xs font-medium truncate">{topic.title}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* 声音角色选择 - 根据扮演角色显示对应声音 */}
            <Card className="p-4 bg-white">
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4 text-pink-500" />
                选择{selectedRole === "boyfriend" ? "女朋友" : "男朋友"}的声音
              </h2>
              {selectedRole === "boyfriend" ? (
                /* 女声角色 - 模拟女朋友 */
                <div className="grid grid-cols-4 gap-1.5">
                  {VOICE_ROLES_FEMALE.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(selectedVoice === voice.id ? null : voice.id)}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer select-none touch-manipulation min-h-[50px] active:scale-95 ${
                        selectedVoice === voice.id
                          ? "border-pink-500 bg-pink-50 ring-2 ring-pink-300"
                          : "border-gray-200 active:border-pink-300"
                      }`}
                    >
                      <div className="text-xl" suppressHydrationWarning>{voice.emoji}</div>
                      <div className="text-xs font-medium truncate">{voice.name}</div>
                    </button>
                  ))}
                </div>
              ) : (
                /* 男声角色 - 模拟男朋友 */
                <div className="grid grid-cols-4 gap-1.5">
                  {VOICE_ROLES_MALE.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(selectedVoice === voice.id ? null : voice.id)}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer select-none touch-manipulation min-h-[50px] active:scale-95 ${
                        selectedVoice === voice.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                          : "border-gray-200 active:border-blue-300"
                      }`}
                    >
                      <div className="text-xl" suppressHydrationWarning>{voice.emoji}</div>
                      <div className="text-xs font-medium truncate">{voice.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* 开始按钮 */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <Button 
                onClick={handleStartGame}
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-8"
                disabled={gameState.isLoading}
              >
                {gameState.isLoading ? "加载中..." : "开始游戏"}
              </Button>
              <p className="text-xs text-gray-400">
                {selectedTopic 
                  ? `将模拟"${PRESET_TOPICS.find(t => t.id === selectedTopic)?.title}"场景`
                  : "将随机生成吵架场景"
                }
              </p>
              
              {/* 恋爱攻略入口 */}
              <Link href="/blog" className="w-full mt-3">
                <Button 
                  variant="outline"
                  size="lg" 
                  className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  恋爱攻略
                </Button>
              </Link>

              {/* 排行榜入口 */}
              <Link href="/leaderboard" className="w-full mt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  排行榜
                </Button>
              </Link>

              <Link href="/contact" className="w-full mt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  联系我们
                </Button>
              </Link>

              <p className="text-xs text-gray-400 text-center leading-relaxed pt-1">
                有问题或建议？请通过“联系我们”页面复制邮箱地址。
              </p>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {!showSelection && gameState.isLoading && (
          <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                {/* 外圈旋转 */}
                <div className="absolute inset-0 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                {/* 内圈反向旋转 */}
                <div className="absolute inset-2 border-4 border-rose-200 border-b-rose-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                {/* 中心点 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 font-medium">正在加载游戏...</p>
            </div>
          </div>
        )}

            {/* 微信风格聊天界面 */}
            {gameState.status === "playing" && !showSelection && (
              <div className="w-full max-w-2xl flex-1 flex flex-col relative min-h-0">
                {/* 聊天消息区域 */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 [-webkit-overflow-scrolling:touch]">
                  {/* 对话历史 */}
                  {gameState.conversation.map((item, index) => {
                const isPlayer = item.speaker === "player";
                const speakerName = isPlayer ? playerName : partnerName;
                const speakerAvatar = isPlayer ? playerName : partnerName;
                
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 ${isPlayer ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar name={speakerAvatar} size="md" />
                    <div className={`max-w-[75%] ${isPlayer ? "items-end" : ""}`}>
                      <div className={`text-xs text-gray-500 mb-1 mx-1 ${isPlayer ? "text-right" : ""}`}>
                        {speakerName}
                      </div>
                      <div className={`inline-block p-3 rounded-2xl shadow-sm break-words max-w-full ${
                        isPlayer
                          ? "bg-[#95ec69] text-gray-800 rounded-tr-sm"
                          : "bg-white rounded-tl-sm"
                      }`}>
                        <p className="text-sm break-words">{item.text}</p>
                        {!isPlayer && item.audioUrl && (
                          <button
                            className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 mt-1"
                            onClick={() => {
                              const audio = new Audio(item.audioUrl);
                              audio.play().catch(console.error);
                            }}
                          >
                            <Music className="w-3 h-3" /> 播放语音
                          </button>
                        )}
                      </div>
                      {!isPlayer && item.emotion && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                            {item.emotion}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />

              {/* 居中的加载动画 - 固定在视口中央，不随滚动移动 */}
              {(gameState.isThinking || gameState.isGenerating) && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10">
                  <div className="flex flex-col items-center bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-5 shadow-xl border border-gray-100">
                    <div className="relative w-14 h-14">
                      {/* 外圈旋转 */}
                      <div className={`absolute inset-0 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin ${gameState.isGenerating ? 'opacity-50' : ''}`}></div>
                      {/* 内圈反向旋转 */}
                      <div className="absolute inset-3 border-4 border-rose-200 border-b-rose-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                      {/* 中心点 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-700 font-medium">
                      {gameState.isThinking ? '正在思考...' : '正在生成回复...'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 选项区域 - 固定在底部 */}
            <div className="bg-[#f8f8f8] border-t border-gray-200 p-2 flex-shrink-0 max-h-[40vh] overflow-y-auto touch-pan-y">
              {gameState.options.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs text-gray-400 text-center">选择你的回复</div>
                  <div className="grid gap-1.5">
                    {gameState.options.map((option) => (
                      <button
                        key={option.id}
                        disabled={gameState.isThinking}
                        className={`h-auto py-2 px-3 text-left border rounded-lg transition-all text-sm break-words min-h-[44px] ${
                          gameState.isThinking 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                            : 'bg-white hover:bg-pink-50 border-gray-200 hover:border-pink-300 active:bg-pink-100 cursor-pointer'
                        }`}
                        onClick={() => selectOption(option)}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 游戏结束 */}
        {gameState.status === "ended" && !showSelection && (
          <div className="w-full max-w-2xl p-4 flex-1 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <div className={`text-5xl mb-3 ${gameState.result === "success" ? "animate-bounce" : ""}`}>
                {gameState.result === "success" ? "🎉" : "😢"}
              </div>
              <h1 className={`text-2xl font-bold ${gameState.result === "success" ? "text-green-600" : "text-red-600"}`}>
                {gameState.result === "success" ? "恭喜成功！" : "挑战失败..."}
              </h1>
              <p className="text-gray-600 text-sm">
                {gameState.result === "success" 
                  ? "你成功哄好了ta！学会了情绪优先的沟通方式。"
                  : "这次没能让ta消气... 再试试吧！"}
              </p>
              <div className="bg-white rounded-xl p-4 shadow-sm space-y-1">
                <p className="text-sm text-gray-500">最终状态</p>
                <p className="text-sm">
                  <span className="text-red-500">愤怒 {Math.round(gameState.girlState.anger)}</span>
                  <span className="text-gray-300 mx-2">|</span>
                  <span className="text-pink-500">幸福 {Math.round(gameState.girlState.happiness)}</span>
                </p>
                <p className="text-xs text-gray-400">用了 {gameState.currentRound - 1} 轮</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button 
                  onClick={() => {
                    setShowSaveTip(false);
                    setSaveMessage("");
                    restartGame();
                  }}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  再来一局
                </Button>
                <Button 
                  onClick={() => {
                    setShowSaveTip(false);
                    setSaveMessage("");
                    handleBackToSelection();
                  }}
                  variant="outline"
                >
                  重新选择话题
                </Button>
              </div>

              {/* 保存记录提示 - 固定在屏幕顶部，避免被遮挡 */}
              {showSaveTip && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 animate-bounce">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span className="font-medium text-base">{saveMessage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
