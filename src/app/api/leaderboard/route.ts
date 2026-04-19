import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// GET: 获取排行榜（每个用户取最高分）
export async function GET(request: NextRequest) {
  const client = getSupabaseClient();

  try {
    // 查询每个用户的最高分记录，按分数降序排列
    const { data, error } = await client
      .from("game_records")
      .select(`
        id,
        user_id,
        scenario,
        final_score,
        result,
        played_at,
        users (
          username
        )
      `)
      .eq("result", "通关") // 只显示通关记录
      .order("final_score", { ascending: false })
      .limit(100); // 先多取一些，后面去重

    if (error) {
      console.error("获取排行榜失败:", error);
      return NextResponse.json(
        { success: false, error: "获取排行榜失败" },
        { status: 500 }
      );
    }

    // 去重：每个用户只保留最高分记录
    const userBestMap = new Map<number, typeof data[0]>();
    for (const record of data || []) {
      const existing = userBestMap.get(record.user_id);
      if (!existing || record.final_score > existing.final_score) {
        userBestMap.set(record.user_id, record);
      }
    }

    // 转换为排行榜格式并排序
    const leaderboard = Array.from(userBestMap.values())
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, 20) // 只取前20名
      .map((record, index) => ({
        rank: index + 1,
        userId: record.user_id,
        username: (record as typeof record & { users?: { username: string } }).users?.username || "匿名用户",
        score: record.final_score,
        scenario: record.scenario,
        playedAt: record.played_at
      }));

    return NextResponse.json({
      success: true,
      data: leaderboard
    });
  } catch (err) {
    console.error("获取排行榜异常:", err);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
