import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Body Experts - Premium Physiotherapy',
  description: 'Modern clinic management system with premium experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans antialiased">
      <body>{children}</body>
    </html>
  );
}
