import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  // 验证输入
  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "用户名和密码不能为空" },
      { status: 400 }
    );
  }

  const client = getSupabaseClient();

  // 查找用户
  const { data, error } = await client
    .from("users")
    .select("id, username, password")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("查询用户失败:", error);
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { success: false, error: "用户名或密码错误" },
      { status: 401 }
    );
  }

  // 验证密码
  const isValidPassword = await compare(password, data.password);

  if (!isValidPassword) {
    return NextResponse.json(
      { success: false, error: "用户名或密码错误" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: data.id,
      username: data.username
    }
  });
}
