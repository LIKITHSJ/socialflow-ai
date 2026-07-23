
"use client";
import "./globals.css";
import { useState } from "react";
import Navbar from "./components/ui/Navbar";
import Sidebar from "./components/ui/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <html lang="en">
      <body className="flex">

        {/* MOBILE SIDEBAR OVERLAY */}
        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <div
          className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform lg:transform-none lg:static transition-transform duration-300 
            ${open ? "translate-x-0" : "-translate-x-full"} 
            w-64`}
        >
          <Sidebar />
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-h-screen ml-0 lg:ml-64">

          {/* NAVBAR */}
          <div className="flex items-center justify-between bg-white shadow px-6 h-16">

            {/* Hamburger menu for mobile */}
            <button
              className="text-3xl lg:hidden"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>

            <Navbar />
          </div>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
