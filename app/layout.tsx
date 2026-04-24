import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: '텍스트 이미지 생성기',
  description: '텍스트를 이미지 파일로 렌더링하고 다운로드 받는 도구입니다.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
