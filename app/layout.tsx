import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Kevin Lin',
  description: 'Software Engineer, Digital Creative',
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
