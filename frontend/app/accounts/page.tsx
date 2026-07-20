"use client";

import { Card } from "@/components/ui/card";
import { Instagram, Youtube, Twitter } from "lucide-react";

export default function AccountsPage() {
  const platforms = [
    {
      name: "Instagram",
      color: "from-pink-500 to-pink-600",
      icon: <Instagram className="w-12 h-12" />,
      buttonColor: "bg-pink-600 hover:bg-pink-700",
    },
    {
      name: "YouTube",
      color: "from-red-500 to-red-600",
      icon: <Youtube className="w-12 h-12" />,
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    {
      name: "X (Twitter)",
      color: "from-gray-900 to-gray-700",
      icon: <Twitter className="w-12 h-12" />,
      buttonColor: "bg-black hover:bg-gray-900",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-4">Connected Accounts</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <Card
            key={platform.name}
            className={`p-6 rounded-2xl text-white shadow-xl bg-gradient-to-br ${platform.color} hover:scale-[1.03] transition`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="opacity-90">{platform.icon}</div>

              <h2 className="text-2xl font-bold">{platform.name}</h2>

              <button
                className={`px-5 py-2 rounded-lg font-medium text-white transition shadow-md ${platform.buttonColor}`}
              >
                Connect {platform.name}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
