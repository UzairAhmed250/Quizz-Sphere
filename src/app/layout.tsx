import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "QuizzSphere — Adaptive Online Learning Platform",
    template: "%s | QuizzSphere",
  },
  description:
    "Interactive online learning platform with role-based workspaces for students, teachers, and administrators.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
