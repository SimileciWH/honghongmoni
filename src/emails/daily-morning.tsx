import { Body, Button, Container, Head, Html, Preview, Section, Text } from '@react-email/components'

type DailyMorningEmailProps = {
  userName: string
  previewText: string
  morningMessage: string
  ctaUrl: string
}

export function DailyMorningEmail({
  userName,
  previewText,
  morningMessage,
  ctaUrl,
}: DailyMorningEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={cardStyle}>
            <Text style={eyebrowStyle}>今天的哄哄练习提醒</Text>
            <Text style={titleStyle}>早安 {userName}，今天也来练练沟通吧</Text>
            <Text style={textStyle}>{morningMessage}</Text>
            <Button href={ctaUrl} style={buttonStyle}>
              来练一局
            </Button>
            <Text style={hintStyle}>用几分钟练一次表达，也许下一次重要对话就会更从容。</Text>
            <Text style={signatureStyle}>—— 你的哄哄模拟器</Text>
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

const eyebrowStyle = {
  color: '#ea580c',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 12px',
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
  margin: '0 0 16px',
  whiteSpace: 'pre-line' as const,
}

const buttonStyle = {
  backgroundColor: '#ea580c',
  borderRadius: '999px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '700',
  margin: '12px 0 20px',
  padding: '12px 24px',
  textDecoration: 'none',
}

const hintStyle = {
  color: '#9a3412',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const signatureStyle = {
  color: '#7c2d12',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0 0',
}
