import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { LLMClient, Config } from "coze-coding-dev-sdk";

// GET: 获取文章列表
export async function GET() {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from("blog_posts")
    .select("id, title, summary, created_at")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("获取文章列表失败:", error);
    return NextResponse.json(
      { success: false, error: "获取文章列表失败" },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: data.map((article: { id: number; title: string; summary: string; created_at: string }) => ({
      slug: article.id.toString(),
      title: article.title,
      summary: article.summary
    }))
  });
}

// POST: 获取文章详情或生成新文章
export async function POST(request: NextRequest) {
  const { slug, action } = await request.json();
  const client = getSupabaseClient();
  
  // 生成新文章
  if (action === "generate") {
    return generateNewArticle(client);
  }
  
  // 获取文章详情
  if (!slug) {
    return NextResponse.json(
      { success: false, error: "缺少文章标识" },
      { status: 400 }
    );
  }
  
  const articleId = parseInt(slug, 10);
  if (isNaN(articleId)) {
    return NextResponse.json(
      { success: false, error: "无效的文章标识" },
      { status: 400 }
    );
  }
  
  const { data, error } = await client
    .from("blog_posts")
    .select("id, title, content, created_at")
    .eq("id", articleId)
    .maybeSingle();
  
  if (error) {
    console.error("获取文章详情失败:", error);
    return NextResponse.json(
      { success: false, error: "获取文章详情失败" },
      { status: 500 }
    );
  }
  
  if (!data) {
    return NextResponse.json(
      { success: false, error: "文章不存在" },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: {
      slug: data.id.toString(),
      title: data.title,
      content: data.content,
      publishedAt: data.created_at
    }
  });
}

// 生成新文章
async function generateNewArticle(client: ReturnType<typeof getSupabaseClient>) {
  // 随机选择一个主题
  const topics = [
    {
      title: "情侣吵架的五大雷区",
      prompt: `请为"情侣吵架的五大雷区"这个主题写一篇300-500字的博客文章。

要求：
1. 风格轻松幽默，像朋友聊天
2. 列出5个常见的吵架雷区
3. 每个雷区给出具体案例和改进建议
4. 适合在情侣沟通APP中展示

请直接输出文章内容，不要加标题符号和多余的格式。`
    },
    {
      title: "如何优雅地表达不满",
      prompt: `请为"如何优雅地表达不满"这个主题写一篇300-500字的博客文章。

要求：
1. 风格轻松幽默，像朋友聊天
2. 给出具体可操作的表达技巧
3. 包含一些有趣的场景示例
4. 适合在情侣沟通APP中展示

请直接输出文章内容，不要加标题符号和多余的格式。`
    },
    {
      title: "冷战终结指南",
      prompt: `请为"冷战终结指南"这个主题写一篇300-500字的博客文章。

要求：
1. 风格轻松幽默，像朋友聊天
2. 分析冷战的原因和危害
3. 给出打破冷战的实用技巧
4. 适合在情侣沟通APP中展示

请直接输出文章内容，不要加标题符号和多余的格式。`
    },
    {
      title: "恋爱中的边界感",
      prompt: `请为"恋爱中的边界感"这个主题写一篇300-500字的博客文章。

要求：
1. 风格轻松幽默，像朋友聊天
2. 解释边界感的重要性
3. 给出建立健康边界的建议
4. 适合在情侣沟通APP中展示

请直接输出文章内容，不要加标题符号和多余的格式。`
    },
    {
      title: "让感情升温的小动作",
      prompt: `请为"让感情升温的小动作"这个主题写一篇300-500字的博客文章。

要求：
1. 风格轻松幽默，像朋友聊天
2. 列举5-8个日常小动作
3. 说明这些动作为什么有效
4. 适合在情侣沟通APP中展示

请直接输出文章内容，不要加标题符号和多余的格式。`
    }
  ];
  
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  try {
    const config = new Config();
    const llmClient = new LLMClient(config);
    
    const messages = [
      { role: "user" as const, content: randomTopic.prompt }
    ];
    
    const response = await llmClient.invoke(messages, {
      temperature: 0.8
    });
    
    // 生成摘要（取前100字）
    const summary = response.content.split("\n")[0].slice(0, 100) + "...";
    
    // 保存到数据库
    const { data, error } = await client
      .from("blog_posts")
      .insert({
        title: randomTopic.title,
        summary: summary,
        content: response.content
      })
      .select("id, title, content, created_at")
      .single();
    
    if (error) {
      console.error("保存文章失败:", error);
      return NextResponse.json(
        { success: false, error: "保存文章失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        slug: data.id.toString(),
        title: data.title,
        content: data.content,
        publishedAt: data.created_at
      }
    });
  } catch (error) {
    console.error("生成文章失败:", error);
    return NextResponse.json(
      { success: false, error: "生成文章失败" },
      { status: 500 }
    );
  }
}
