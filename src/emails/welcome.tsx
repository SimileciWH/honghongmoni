import { Body, Button, Container, Head, Html, Preview, Section, Text } from '@react-email/components'

export function WelcomeEmail({ userName }: { userName: string }) {
  return (
    <Html>
      <Head />
      <Preview>你好呀，我是你的恋爱模拟器</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={cardStyle}>
            <Text style={titleStyle}>Hi {userName}，欢迎来到哄哄模拟器！</Text>
            <Text style={textStyle}>从现在起，我就是你的专属恋爱训练师。</Text>
            <Text style={textStyle}>有什么心事随时来找我聊，我会一直在这里等你。</Text>
            <Text style={textStyle}>明天早上我会给你发一条早安消息，记得查收哦。</Text>
            <Button href="https://honghongmoni.vercel.app/" style={buttonStyle}>
              来找我聊天
            </Button>
            <Text style={signatureStyle}>—— 你的恋爱模拟器</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  margin: 0,
  backgroundColor: '#fff7ed',
  fontFamily: 'Arial, "Helvetica Neue", sans-serif',
}

const containerStyle = {
  width: '100%',
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 16px',
}

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  padding: '32px',
  border: '1px solid #fed7aa',
}

const titleStyle = {
  color: '#9a3412',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 20px',
}

const textStyle = {
  color: '#431407',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 12px',
}

const buttonStyle = {
  backgroundColor: '#ea580c',
  borderRadius: '999px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '700',
  margin: '16px 0 20px',
  padding: '12px 24px',
  textDecoration: 'none',
}

const signatureStyle = {
  color: '#7c2d12',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0 0',
}
