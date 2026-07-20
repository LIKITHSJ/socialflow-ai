"use client";

import { Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full px-6 py-4 bg-white dark:bg-neutral-900 shadow flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 outline-none"
        />
      </div>

      <Bell className="w-6 h-6 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-500 transition" />
    </header>
  );
}
