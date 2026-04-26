# 哄哄模拟器

哄哄模拟器是一个基于 Next.js 16 的互动练习应用，用来模拟亲密关系中的对话场景。用户可以选择角色、话题和语音，和 AI 生成的伴侣情绪场景进行多轮对话，系统会记录分数并提供排行榜。

## 功能概览

- 互动式哄人对话游戏
- 角色、话题、语音选择
- AI 生成开场、回复和选项
- TTS 语音播放
- 用户注册 / 登录
- 游戏记录保存
- 排行榜展示
- Cloudflare Turnstile 注册人机验证，防止脚本批量注册消耗试用额度

## 技术栈

- Next.js 16.1.1 + App Router
- React 19
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Supabase 数据访问
- Drizzle Kit / Drizzle ORM 迁移配置
- Cloudflare Turnstile
- pnpm 9+

## 本地运行

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

本地使用 `.env.local`。至少需要根据实际功能配置以下变量：

```bash
# 数据库 / Neon
NEON_DATABASE_URL=

# AI / TTS
SILICONFLOW_API_KEY=
SILICONFLOW_LLM_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_LLM_MODEL=deepseek-ai/DeepSeek-V3.2
SILICONFLOW_BASE_URL=https://api.siliconflow.cn
SILICONFLOW_TTS_MODEL=fnlp/MOSS-TTSD-v0.5

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

Turnstile 注意事项：

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 是前端公开 site key。
- `TURNSTILE_SECRET_KEY` 只能放服务端环境变量。
- Cloudflare Turnstile widget 的 Allowed hostnames 需要包含 `localhost` 和线上域名。

### 启动开发服务

```bash
pnpm dev
```

默认端口是 `5002`：

```text
http://localhost:5002
```

### 构建

```bash
pnpm build
```

### 启动构建后的服务

```bash
pnpm start
```

生产启动脚本同样默认使用 `5002` 端口。可以通过 `DEPLOY_RUN_PORT` 覆盖：

```bash
DEPLOY_RUN_PORT=5002 pnpm start
```

### 类型检查

```bash
pnpm ts-check
```

### Lint

```bash
pnpm lint
```

当前项目中仍有一些历史 lint 问题，提交前至少应保证新增代码通过 TypeScript 检查。

## 主要目录

```text
src/
├── app/
│   ├── page.tsx                    # 游戏首页
│   ├── (auth)/login/page.tsx        # 登录页
│   ├── (auth)/register/page.tsx     # 注册页，包含 Turnstile 组件
│   ├── leaderboard/page.tsx         # 排行榜
│   ├── blog/                        # 博客页面
│   └── api/
│       ├── auth/                    # 登录 / 注册 API
│       ├── game/                    # 游戏初始化、回复、记录 API
│       ├── leaderboard/             # 排行榜 API
│       └── tts/                     # 语音 API
├── components/ui/                   # shadcn/ui 基础组件
├── hooks/                           # 游戏状态 Hook
├── lib/                             # AI、工具函数等
├── storage/database/                # Supabase / 数据库访问
└── server.ts                        # 自定义 Next.js HTTP 服务入口

drizzle/                             # Drizzle 迁移文件
scripts/                             # dev / build / start 脚本
```

## 注册人机验证流程

注册流程使用 Cloudflare Turnstile 做双端校验：

1. 注册页渲染 Turnstile 组件。
2. 用户验证成功后，前端拿到 `turnstileToken`。
3. 注册请求把 `username`、`password` 和 `turnstileToken` 一起提交到 `/api/auth/register`。
4. 后端调用 Cloudflare `siteverify` 接口验证 token。
5. 验证通过后，才继续用户名查重、密码 hash 和用户创建。

相关文件：

- `src/app/(auth)/register/page.tsx`
- `src/app/api/auth/register/route.ts`

## 数据库迁移

Drizzle 配置位于 `drizzle.config.ts`，schema 位于：

```text
src/storage/database/shared/schema.ts
```

迁移输出目录：

```text
drizzle/
```

## 开发约定

- 使用 pnpm，不使用 npm / yarn。
- 默认服务端口使用 `5002`。
- 前端公开环境变量必须以 `NEXT_PUBLIC_` 开头。
- Secret key 只放服务端环境变量，不要写入客户端代码。
- 优先复用 `src/components/ui/` 下的 shadcn/ui 基础组件。
- 数据库迁移优先使用当前 Drizzle / Neon 方案。
