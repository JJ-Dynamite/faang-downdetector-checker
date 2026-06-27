import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Check if any site is down',
  description: 'Check if any site is down - Built with Rust + Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
