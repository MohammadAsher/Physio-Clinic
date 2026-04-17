import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Premium Physio Clinic',
  description: 'Modern clinic management system with premium experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
