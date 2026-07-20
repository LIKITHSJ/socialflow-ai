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

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300 cursor-pointer" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Followers</h2>
            <Users className="w-7 h-7 opacity-80" />
          </div>
          <p className="text-4xl font-bold mt-3">12.4k</p>
          <p className="text-sm mt-1 text-blue-100">+3.8% this week</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Engagement</h2>
            <BarChart3 className="w-7 h-7 opacity-80" />
          </div>
          <p className="text-4xl font-bold mt-3">8.2%</p>
          <p className="text-sm mt-1 text-purple-100">+1.1% this week</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Posts</h2>
            <PlusCircle className="w-7 h-7 opacity-80" />
          </div>
          <p className="text-4xl font-bold mt-3">482</p>
          <p className="text-sm mt-1 text-green-100">+14 new this week</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-lg rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Scheduled</h2>
            <Calendar className="w-7 h-7 opacity-80" />
          </div>
          <p className="text-4xl font-bold mt-3">24</p>
          <p className="text-sm mt-1 text-orange-100">2 upcoming today</p>
        </Card>

      </div>

      <Card className="p-6 shadow rounded-xl dark:bg-neutral-900">
        <h2 className="text-xl font-semibold mb-4">Weekly Performance</h2>

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

    </div>
  );
}
