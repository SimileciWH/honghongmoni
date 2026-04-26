import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '哄哄模拟器',
    template: '%s | 哄哄模拟器',
  },
  description: '一款帮助练习恋爱沟通的 AI 模拟器。',
  keywords: [
    '哄哄模拟器',
    '恋爱沟通',
    'AI 模拟器',
    '情侣沟通',
  ],
  authors: [{ name: '哄哄模拟器' }],
  generator: 'Next.js',
  openGraph: {
    title: '哄哄模拟器',
    description: '一款帮助练习恋爱沟通的 AI 模拟器。',
    siteName: '哄哄模拟器',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
