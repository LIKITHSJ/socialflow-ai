// app/layout.tsx
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "SocialFlow AI",
  description: "AI-powered social media management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </body>
    </html>
  );
}