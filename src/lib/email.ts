import { DailyMorningEmail } from '@/emails/daily-morning'
import { WelcomeEmail } from '@/emails/welcome'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://honghongmoni.vercel.app/'

type DailyMorningContent = {
  subject: string
  previewText: string
  morningMessage: string
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  return resend.emails.send({
    from: '哄哄模拟器 <noreply@ai-smilion.tech>',
    to: userEmail,
    subject: '你好呀，我是你的恋爱模拟器',
    react: WelcomeEmail({ userName }),
  })
}

export async function sendDailyMorningEmail(
  userEmail: string,
  userName: string,
  content: DailyMorningContent
) {
  return resend.emails.send({
    from: '哄哄模拟器 <noreply@ai-smilion.tech>',
    to: userEmail,
    subject: content.subject,
    react: DailyMorningEmail({
      userName,
      previewText: content.previewText,
      morningMessage: content.morningMessage,
      ctaUrl: appUrl,
    }),
  })
}
