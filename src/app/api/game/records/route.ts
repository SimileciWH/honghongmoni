import { NextRequest, NextResponse } from "next/server";
import { db } from "@/storage/database/db";
import { gameRecords } from "@/storage/database/shared/schema";
import { desc, eq } from "drizzle-orm";

// GET: 获取用户的游戏记录
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json(
      { success: false, error: "缺少用户ID" },
      { status: 400 }
    );
  }

  try {
    const data = await db
      .select({
        id: gameRecords.id,
        scenario: gameRecords.scenario,
        finalScore: gameRecords.finalScore,
        result: gameRecords.result,
        playedAt: gameRecords.playedAt,
      })
      .from(gameRecords)
      .where(eq(gameRecords.userId, parseInt(user_id, 10)))
      .orderBy(desc(gameRecords.playedAt));

    return NextResponse.json({
      success: true,
      data: data.map((record) => ({
        id: record.id,
        scenario: record.scenario,
        finalScore: record.finalScore,
        result: record.result,
        playedAt: record.playedAt
      }))
    });
  } catch (error) {
    console.error("获取游戏记录失败:", error);
    return NextResponse.json(
      { success: false, error: "获取失败" },
      { status: 500 }
    );
  }
}

// POST: 保存游戏记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, scenario, final_score, result } = body;

    if (!user_id || !scenario) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const [data] = await db
      .insert(gameRecords)
      .values({
        userId: user_id,
        scenario,
        finalScore: final_score || 0,
        result: result || "未知",
        playedAt: new Date().toISOString()
      })
      .returning({
        id: gameRecords.id,
        scenario: gameRecords.scenario,
        finalScore: gameRecords.finalScore,
        result: gameRecords.result,
        playedAt: gameRecords.playedAt,
      });

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        scenario: data.scenario,
        finalScore: data.finalScore,
        result: data.result,
        playedAt: data.playedAt
      }
    });
  } catch (err) {
    console.error("保存游戏记录异常:", err);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
