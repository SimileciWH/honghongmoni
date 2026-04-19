"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Medal, Crown, ArrowLeft, User, Star, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
  scenario: string;
  playedAt: string;
}

interface UserInfo {
  id: number;
  username: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserInfo | null>(null);

  // 获取当前登录用户
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 获取排行榜数据
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const response = await fetch("/api/leaderboard");
        const data = await response.json();
        
        if (data.success) {
          setLeaderboard(data.data);
        } else {
          setError(data.error || "加载失败");
        }
      } catch (err) {
        setError("网络错误，请稍后重试");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center text-gray-500 font-bold">{rank}</span>;
    }
  };

  // 获取排名背景色
  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-100 to-amber-50 border-yellow-300";
      case 2:
        return "bg-gradient-to-r from-gray-100 to-slate-50 border-gray-300";
      case 3:
        return "bg-gradient-to-r from-amber-100 to-orange-50 border-amber-300";
      default:
        return "bg-white border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-pink-500" />
            <h1 className="text-lg font-bold text-gray-800">排行榜</h1>
          </div>
        </div>
      </header>

      {/* 排行榜内容 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 提示信息 */}
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-pink-700">
              <p className="font-medium mb-1">排行榜规则</p>
              <ul className="list-disc list-inside space-y-1 text-pink-600">
                <li>只显示通关记录，每个用户取最高分</li>
                <li>前20名可上榜</li>
                <li>登录用户的成绩才会被记录</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 排行榜列表 */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无排行榜数据</p>
                <p className="text-gray-400 text-sm mt-1">成为第一个上榜的玩家吧！</p>
              </div>
            ) : (
              leaderboard.map((entry) => (
                <Card
                  key={`${entry.userId}-${entry.rank}`}
                  className={`
                    p-4 transition-all duration-300
                    ${getRankBgColor(entry.rank)}
                    ${entry.userId === user?.id ? "ring-2 ring-pink-500 shadow-lg" : ""}
                    ${entry.rank <= 3 ? "shadow-md" : "shadow-sm hover:shadow-md"}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* 排名 */}
                    <div className="flex-shrink-0 w-10">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* 用户信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium truncate ${entry.userId === user?.id ? "text-pink-600" : "text-gray-800"}`}>
                          {entry.username}
                          {entry.userId === user?.id && (
                            <span className="ml-2 text-xs text-pink-500 font-normal">(你)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.playedAt)}
                      </div>
                    </div>

                    {/* 分数 */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-2xl font-bold ${entry.rank <= 3 ? "text-pink-600" : "text-gray-700"}`}>
                        {entry.score}
                      </div>
                      <div className="text-xs text-gray-500">分</div>
                    </div>
                  </div>

                  {/* 场景标签 */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">
                      {entry.scenario}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* 底部提示 */}
        {!isLoading && !error && leaderboard.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>榜单每10分钟更新一次</p>
          </div>
        )}
      </main>
    </div>
  );
}
