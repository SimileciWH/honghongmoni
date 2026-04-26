import { NextResponse } from "next/server";
import { db } from "@/storage/database/db";
import { gameRecords, users } from "@/storage/database/shared/schema";
import { desc, eq } from "drizzle-orm";

// GET: 获取排行榜（每个用户取最高分）
export async function GET() {
  try {
    // 查询每个用户的最高分记录，按分数降序排列
    const data = await db
      .select({
        id: gameRecords.id,
        userId: gameRecords.userId,
        username: users.username,
        scenario: gameRecords.scenario,
        finalScore: gameRecords.finalScore,
        playedAt: gameRecords.playedAt,
      })
      .from(gameRecords)
      .leftJoin(users, eq(gameRecords.userId, users.id))
      .where(eq(gameRecords.result, "通关"))
      .orderBy(desc(gameRecords.finalScore))
      .limit(100); // 先多取一些，后面去重

    // 去重：每个用户只保留最高分记录
    const userBestMap = new Map<number, typeof data[0]>();
    for (const record of data) {
      const existing = userBestMap.get(record.userId);
      if (!existing || record.finalScore > existing.finalScore) {
        userBestMap.set(record.userId, record);
      }
    }

    // 转换为排行榜格式并排序
    const leaderboard = Array.from(userBestMap.values())
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 20) // 只取前20名
      .map((record, index) => ({
        rank: index + 1,
        userId: record.userId,
        username: record.username || "匿名用户",
        score: record.finalScore,
        scenario: record.scenario,
        playedAt: record.playedAt
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
