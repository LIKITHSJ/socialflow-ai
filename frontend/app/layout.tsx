"use client";
import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "./components/ui/Navbar";
import Sidebar from "@/components/ui/sidebar";
import { AuthProvider } from "@/lib/authContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/register";

  if (isAuthPage) {
    return (
      <html lang="en">
        <body>
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex">
        <AuthProvider>
          <div className="w-64 h-full bg-white shadow-lg flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col min-h-screen">
            <div className="flex items-center justify-between bg-white shadow px-6 h-16">
              <Navbar />
            </div>
            <main className="p-6">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}