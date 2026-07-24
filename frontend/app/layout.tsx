"use client";
import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "./components/ui/Navbar";
import Sidebar from "./components/ui/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex">
        <div className="w-64 h-full bg-white shadow-lg flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-screen">
          {/* NAVBAR */}
          <div className="flex items-center justify-between bg-white shadow px-6 h-16">
            <Navbar />
          </div>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}