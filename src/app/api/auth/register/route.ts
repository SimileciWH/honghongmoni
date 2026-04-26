import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  const { username, password, turnstileToken } = await request.json();

  if (!turnstileToken) {
    return NextResponse.json(
      { success: false, error: "请先完成人机验证" },
      { status: 400 }
    );
  }

  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || "",
        response: turnstileToken,
        remoteip: request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || ""
      })
    }
  );

  const verifyData = await verifyResponse.json();

  if (!verifyData.success) {
    return NextResponse.json(
      { success: false, error: "人机验证失败，请重试" },
      { status: 400 }
    );
  }

  // 验证输入
  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "用户名和密码不能为空" },
      { status: 400 }
    );
  }

  if (username.length < 3 || username.length > 20) {
    return NextResponse.json(
      { success: false, error: "用户名长度需在3-20个字符之间" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { success: false, error: "密码长度至少6个字符" },
      { status: 400 }
    );
  }

  // 只允许字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return NextResponse.json(
      { success: false, error: "用户名只能包含字母、数字和下划线" },
      { status: 400 }
    );
  }

  const client = getSupabaseClient();

  // 检查用户名是否已存在
  const { data: existingUser, error: checkError } = await client
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (checkError) {
    console.error("检查用户名失败:", checkError);
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }

  if (existingUser) {
    return NextResponse.json(
      { success: false, error: "用户名已存在" },
      { status: 409 }
    );
  }

  // 哈希密码
  const hashedPassword = await hash(password, 10);

  // 创建用户
  const { data, error } = await client
    .from("users")
    .insert({
      username,
      password: hashedPassword
    })
    .select("id, username")
    .single();

  if (error) {
    console.error("创建用户失败:", error);
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 }
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
