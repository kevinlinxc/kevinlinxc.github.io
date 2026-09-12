import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Kevin Lin', description: 'Software Engineer, Digital Creative' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
