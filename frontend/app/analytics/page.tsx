"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const chartData = [
  { name: "Mon", value: 320 },
  { name: "Tue", value: 500 },
  { name: "Wed", value: 420 },
  { name: "Thu", value: 610 },
  { name: "Fri", value: 750 },
  { name: "Sat", value: 830 },
  { name: "Sun", value: 910 },
];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("7d");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Analytics Overview</h1>

      <div className="flex gap-3">
        {["7d", "30d", "90d", "1y"].map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`px-4 py-2 rounded-lg border transition font-medium ${
              selectedRange === range
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg rounded-xl">
          <p className="text-sm opacity-80">Total Reach</p>
          <h2 className="text-4xl font-bold mt-2">123,400</h2>
          <p className="text-sm mt-1">+18.2% this week</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg rounded-xl">
          <p className="text-sm opacity-80">Engagement</p>
          <h2 className="text-4xl font-bold mt-2">9,530</h2>
          <p className="text-sm mt-1">+4.7% this week</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg rounded-xl">
          <p className="text-sm opacity-80">Profile Visits</p>
          <h2 className="text-4xl font-bold mt-2">22,890</h2>
          <p className="text-sm mt-1">-3.2% this week</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-lg rounded-xl">
          <p className="text-sm opacity-80">Followers</p>
          <h2 className="text-4xl font-bold mt-2">1,240</h2>
          <p className="text-sm mt-1">+120 this week</p>
        </Card>
      </div>

      <Card className="p-6 shadow rounded-xl dark:bg-neutral-900">
        <h2 className="text-xl font-semibold mb-4">Engagement Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 shadow rounded-xl dark:bg-neutral-900">
        <h2 className="text-xl font-semibold mb-4">Top Performing Posts</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((post) => (
            <div
              key={post}
              className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:scale-[1.02] transition shadow"
            >
              <div className="w-full h-40 bg-gray-300 dark:bg-neutral-700 rounded mb-3"></div>
              <p className="font-medium">Post #{post} — 12.4k views</p>
              <p className="text-sm text-gray-500">1.2k likes · 250 comments</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
