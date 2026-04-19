import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { LLMClient, Config } from "coze-coding-dev-sdk";

// 预置文章内容
const INITIAL_ARTICLES = [
  {
    title: "吵架之后的黄金30分钟",
    summary: "吵架后千万别急着道歉或解释，这个时间窗口处理不好，反而会让情况更糟。想知道该怎么做吗？",
    content: `有没有发现，每次吵完架的半小时，空气里都飘着尴尬的小泡泡？你坐在沙发抠手指，他盯着天花板假装研究吊灯构造，心里却都在疯狂OS："他怎么还不来哄我？""我刚才是不是话说重了？"

听我的，这半小时可是修复关系的黄金窗口，千万别浪费！

教你几个亲测有效的小操作：首先别端着，找个超蠢的台阶下，比如突然指着他喊"哎！你昨天藏的薯片是不是被你偷吃了？"他绝对瞬间懵圈，火气直接消一半；要是拉不下脸，就用"递东西"战术，把遥控器、水杯往他手里塞，顺便瞪他一眼，懂的都懂这是求和信号；最绝的是"反向撒娇"，比如抱着胳膊说"我不管，刚才吵架震得我耳朵疼，你得给我揉五分钟"，铁汉都得败给这招。

其实啊，哪有那么多原则性的大矛盾，无非是你觉得他不够在意，他觉得你有点较真。这半小时里，别纠结谁对谁错，先把"我"换成"我们"——"我们刚才都有点激动"比"你刚才太过分了"管用一万倍。

毕竟能吵起来的都是因为在乎，那些没说出口的委屈，其实都是想被对方看见的小情绪。趁着这半小时的余热，赶紧把别扭揉开，毕竟晚上还要挤在一张床上抢被子呢，对吧？`
  },
  {
    title: "为什么「你说得对」是最烂的回复",
    summary: "你以为说「你说得对」就能平息战火？太天真了！这句看似万能的回复，可能是引爆下一轮争吵的导火索。",
    content: `有没有发现，"你说得对"简直是情侣沟通里的"隐形炸药"？前一秒你还在兴致勃勃吐槽今天遇到的糟心事，或者认认真真跟他掰扯家务分工，他轻飘飘一句"你说得对"甩过来，瞬间就像被泼了冷水，火气直接窜到天灵盖有没有！

为啥这话这么气人？因为它根本不是"同意"，而是"敷衍"！潜台词分明是"我不想听了，你赶紧闭嘴吧"。你掏心掏肺想跟他共情唠嗑，结果他把话茬直接焊死，连个眼神交流都欠奉，那感觉就像你演了半天独角戏，观众却在低头刷手机，能不气吗？

听我的，别再用这句"死亡回复"了！试试这些替代款：要是对方在吐槽，就说"这也太气人了！换我早炸了"，精准接住情绪；要是在聊正经事，就说"你说得有道理，那咱们接下来这么安排咋样？"，把话题推进下去；哪怕真的不知道咋接，也可以说"我有点没太get到，你再跟我说说？"，态度摆出来，比啥都强。

毕竟情侣之间，要的从来不是一句"正确答案"，而是你在认真听我说话的心意呀！`
  },
  {
    title: "道歉的正确打开方式",
    summary: "道歉不是简单说句「对不起」就能完事的。姿势不对，努力白费，甚至可能越道歉越糟糕。",
    content: `宝子们，咱就是说，道歉这事儿真的是情侣相处里的"保命技能"，但好多人都把它玩成了"送命题"！今天就来唠唠道歉的正确打开方式，保证让你把另一半的火气给灭得明明白白。

首先上正确步骤：第一步，精准认错！别整"我错了行了吧"这种敷衍话，得具体到"我不该刚才打游戏没回你消息，让你等那么久"，精准戳中问题，对方才会觉得你真的在听。第二步，共情！比如"换作是我等你半天没动静，我也会气得想掀桌"，站在对方角度想问题，瞬间就拉近距离了。第三步，给解决方案！别光说"我下次不会了"，得说"以后我打游戏前先跟你报备，看到消息立马回"，给对方实实在在的安全感。

再说说绝对不能踩的雷区！第一，甩锅式道歉："谁让你刚才也没理我，我才打游戏的"，这哪是道歉，分明是拱火！第二，卖惨式道歉："我都道歉了你还想咋样，我也很委屈啊"，大哥，现在是你犯错，不是比谁更惨好吗？第三，转移话题式道歉："别生气了，我给你买杯奶茶"，奶茶虽好，但问题没解决，下次还得炸！

就说我那冤种朋友，上次跟对象吵架，一开始嘴硬"我没错"，结果对象直接冷战三天，后来他按照步骤来："我错了宝贝，不该跟你杠电影里的主角，你吐槽的时候我应该认真听的，换作我跟你分享喜欢的东西被杠，我也会难受，以后你说啥我都先点头，实在有不同意见再温柔跟你说"，最后再配上一杯芋泥啵啵，直接把对象哄得喜笑颜开。

所以啊，道歉不是走流程，是让对方感受到你的在乎，学会这几招，情侣吵架再也不怕啦！`
  }
];

// 初始化数据库中的文章
async function initializeArticles() {
  const client = getSupabaseClient();
  
  // 检查是否已有文章
  const { data: existingArticles, error } = await client
    .from("blog_posts")
    .select("id")
    .limit(1);
  
  if (error) {
    console.error("检查文章失败:", error);
    return;
  }
  
  // 如果没有文章，插入预置内容
  if (!existingArticles || existingArticles.length === 0) {
    const { error: insertError } = await client
      .from("blog_posts")
      .insert(INITIAL_ARTICLES);
    
    if (insertError) {
      console.error("初始化文章失败:", insertError);
    } else {
      console.log("成功初始化3篇预置文章");
    }
  }
}

// 在模块加载时初始化文章
initializeArticles();

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
      { role: "user", content: randomTopic.prompt }
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
