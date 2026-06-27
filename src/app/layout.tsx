import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DropPin — Discover what\'s happening anywhere',
  description: 'Drop a pin anywhere and instantly see what\'s popular, trending, and happening in that exact area. Food, events, hidden gems, and more.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'DropPin',
    description: 'Drop a pin. Discover what\'s happening there.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-brand-bg text-brand-text antialiased">
        {children}
      </body>
    </html>
  );
}
