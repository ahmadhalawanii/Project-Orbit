import "./globals.css";

export const metadata = {
  title: "Project Orbit",
  description: "Conversational guide for candidates and new hires"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
