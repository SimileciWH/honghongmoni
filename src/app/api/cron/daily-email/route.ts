import { sendDailyMorningEmailToAll } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 })
  }

  try {
    const result = await sendDailyMorningEmailToAll()

    return NextResponse.json({
      success: true,
      message: '每日提醒邮件发送完成',
      time: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    console.error('每日提醒邮件发送失败：', error)

    return NextResponse.json({ error: '发送失败' }, { status: 500 })
  }
}
