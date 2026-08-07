import React from 'react';
import './globals.css';

export const metadata = {
  title: 'HEGEMA — AI Search & Rescue Dashboard',
  description: 'AI-Powered Heatmap Geo Mapping for Disaster Search & Rescue',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-slate-100 font-sans min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
