import { NextRequest, NextResponse } from 'next/server'
import { and, isNotNull, ne } from 'drizzle-orm'
import { sendDailyMorningEmail } from '@/lib/email'
import { createAIProvider } from '@/lib/ai'
import { db } from '@/storage/database/db'
import { users } from '@/storage/database/shared/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type DailyMorningContent = {
  subject: string
  previewText: string
  morningMessage: string
}

type Recipient = {
  id: number
  username: string
  email: string | null
}

const fallbackContent: DailyMorningContent = {
  subject: '早安，今天也来练练沟通吧',
  previewText: '哄哄模拟器给你准备了一次轻松的今日练习。',
  morningMessage:
    '早安呀。今天可以花几分钟练一局：试着把“我不是这个意思”换成“我想好好解释给你听”。表达变温柔一点，很多对话都会更容易继续下去。',
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const recipients = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
      })
      .from(users)
      .where(and(isNotNull(users.email), ne(users.email, '')))

    const content = await generateDailyMorningContent()
    const results = await sendToRecipients(recipients, content)
    const failed = results.filter((result) => !result.success)

    return NextResponse.json({
      success: true,
      total: recipients.length,
      sent: results.length - failed.length,
      failed: failed.length,
      failures: failed,
    })
  } catch (error) {
    console.error('每日早安邮件任务失败:', error)

    return NextResponse.json(
      { success: false, error: '每日早安邮件任务失败' },
      { status: 500 }
    )
  }
}

async function generateDailyMorningContent(): Promise<DailyMorningContent> {
  try {
    const aiProvider = createAIProvider('siliconflow')
    const response = await aiProvider.chat(
      [
        {
          role: 'user',
          content: `请为“哄哄模拟器”生成一封早安召回邮件的内容。

产品背景：哄哄模拟器是一个帮助用户练习亲密关系沟通、哄人表达和冲突修复的互动练习应用。

要求：
- 使用中文。
- 语气温暖、轻松、有一点恋爱感，但不要油腻。
- 目标是提醒用户今天回来练一局。
- 不要使用“纸片人男友”。
- 不要承诺医疗、心理治疗或关系修复效果。
- 正文控制在 80 字以内。
- 只返回 JSON，不要 Markdown，不要代码块。

JSON 格式：
{
  "subject": "邮件标题",
  "previewText": "邮件预览文案",
  "morningMessage": "邮件正文"
}`,
        },
      ],
      { temperature: 0.8 }
    )

    return parseDailyMorningContent(response.content)
  } catch (error) {
    console.error('每日早安邮件 AI 文案生成失败，使用默认文案:', error)
    return fallbackContent
  }
}

function parseDailyMorningContent(content: string): DailyMorningContent {
  try {
    const parsed = JSON.parse(content) as Partial<DailyMorningContent>

    if (
      typeof parsed.subject === 'string' &&
      typeof parsed.previewText === 'string' &&
      typeof parsed.morningMessage === 'string'
    ) {
      return {
        subject: parsed.subject.slice(0, 80),
        previewText: parsed.previewText.slice(0, 120),
        morningMessage: parsed.morningMessage.slice(0, 500),
      }
    }
  } catch {
  }

  return fallbackContent
}

async function sendToRecipients(recipients: Recipient[], content: DailyMorningContent) {
  const results: Array<{ userId: number; success: boolean; error?: string }> = []
  const batchSize = 5

  for (let index = 0; index < recipients.length; index += batchSize) {
    const batch = recipients.slice(index, index + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (recipient) => {
        if (!recipient.email) {
          return { userId: recipient.id, success: false, error: 'Missing email' }
        }

        try {
          await sendDailyMorningEmail(recipient.email, recipient.username, content)
          return { userId: recipient.id, success: true }
        } catch (error) {
          console.error(`给用户 ${recipient.id} 发送每日早安邮件失败:`, error)
          return {
            userId: recipient.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    results.push(...batchResults)
  }

  return results
}
