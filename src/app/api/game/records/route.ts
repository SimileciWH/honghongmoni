import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

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

  const client = getSupabaseClient();

  const { data, error } = await client
    .from("game_records")
    .select("id, scenario, final_score, result, played_at")
    .eq("user_id", parseInt(user_id, 10))
    .order("played_at", { ascending: false });

  if (error) {
    console.error("获取游戏记录失败:", error);
    return NextResponse.json(
      { success: false, error: "获取失败" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: data.map((record: { id: number; scenario: string; final_score: number; result: string; played_at: string }) => ({
      id: record.id,
      scenario: record.scenario,
      finalScore: record.final_score,
      result: record.result,
      playedAt: record.played_at
    }))
  });
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

    const client = getSupabaseClient();

    const { data, error } = await client
      .from("game_records")
      .insert({
        user_id,
        scenario,
        final_score: final_score || 0,
        result: result || "未知",
        played_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("保存游戏记录失败:", error);
      return NextResponse.json(
        { success: false, error: "保存失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        scenario: data.scenario,
        finalScore: data.final_score,
        result: data.result,
        playedAt: data.played_at
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
