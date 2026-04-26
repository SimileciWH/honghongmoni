import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { db } from "@/storage/database/db";
import { users } from "@/storage/database/shared/schema";
import { hash } from "bcryptjs";
import { eq, or } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const { username, email, password, turnstileToken } = await request.json();

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
  if (!username || !email || !password) {
    return NextResponse.json(
      { success: false, error: "用户名、邮箱和密码不能为空" },
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, error: "邮箱格式不正确" },
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

  try {
    const [existingUser] = await db
      .select({ username: users.username, email: users.email })
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
      .limit(1);

    if (existingUser?.username === username) {
      return NextResponse.json(
        { success: false, error: "用户名已存在" },
        { status: 409 }
      );
    }

    if (existingUser?.email === email) {
      return NextResponse.json(
        { success: false, error: "邮箱已被注册" },
        { status: 409 }
      );
    }

    // 哈希密码
    const hashedPassword = await hash(password, 10);

    // 创建用户
    const [data] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
      });

    try {
      await sendWelcomeEmail(data.email ?? email, data.username);
    } catch (emailError) {
      console.error("欢迎邮件发送失败:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        username: data.username,
        email: data.email
      }
    });
  } catch (error) {
    console.error("创建用户失败:", error);
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
