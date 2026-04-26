import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const escapedUserName = escapeHtml(userName)

  return resend.emails.send({
    from: '哄哄模拟器 <noreply@ai-smilion.tech>',
    to: userEmail,
    subject: '你好呀，我是你的恋爱模拟器',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Hi ${escapedUserName}，欢迎来到哄哄模拟器！</h2>
        <p>从现在起，我就是你的专属恋爱训练师。</p>
        <p>有什么心事随时来找我聊，我会一直在这里等你。</p>
        <p>明天早上我会给你发一条早安消息，记得查收哦。</p>
        <br/>
        <p>—— 你的恋爱模拟器</p>
      </div>
    `,
  })
}
