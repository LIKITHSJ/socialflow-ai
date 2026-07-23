"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Bell, Users, BarChart3, Calendar, PlusCircle } from "lucide-react";

const chartData = [
  { name: "Mon", value: 120 },
  { name: "Tue", value: 200 },
  { name: "Wed", value: 150 },
  { name: "Thu", value: 300 },
  { name: "Fri", value: 250 },
  { name: "Sat", value: 400 },
  { name: "Sun", value: 350 },
];

const STAT_CARDS = [
  { label: "Followers", value: "12.4k", change: "+3.8% this week", icon: Users, gradient: "from-blue-500 to-blue-700", tint: "text-blue-100" },
  { label: "Engagement", value: "8.2%", change: "+1.1% this week", icon: BarChart3, gradient: "from-purple-500 to-purple-700", tint: "text-purple-100" },
  { label: "Posts", value: "482", change: "+14 new this week", icon: PlusCircle, gradient: "from-green-500 to-green-700", tint: "text-green-100" },
  { label: "Scheduled", value: "24", change: "2 upcoming today", icon: Calendar, gradient: "from-orange-500 to-orange-700", tint: "text-orange-100" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <Bell className="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map(({ label, value, change, icon: Icon, gradient, tint }) => (
          <Card
            key={label}
            className={`p-6 bg-gradient-to-br ${gradient} text-white shadow-sm rounded-xl border-0 flex flex-col justify-between min-h-[152px]`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-white/90">{label}</h2>
              <Icon className="w-6 h-6 opacity-80" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold leading-none">{value}</p>
              <p className={`text-sm ${tint}`}>{change}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 shadow-sm rounded-xl dark:bg-neutral-900">
        <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Weekly Performance</h2>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={13} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={13} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}