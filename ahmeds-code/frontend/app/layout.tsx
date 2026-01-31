import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit — Space-themed hiring",
  description: "Guided conversational hiring experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-[#e8e6e3] antialiased">
        {children}
      </body>
    </html>
  );
}
