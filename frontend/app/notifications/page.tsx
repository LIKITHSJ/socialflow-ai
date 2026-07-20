"use client";

import React from "react";
import { Bell, CheckCircle, AlertTriangle, Clock } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "success",
    message: "Your Instagram post has been scheduled successfully.",
    time: "5 minutes ago",
  },
  {
    id: 2,
    type: "warning",
    message: "Your YouTube token is expiring soon. Reconnect your account.",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "info",
    message: "New followers gained across all platforms.",
    time: "2 hours ago",
  },
  {
    id: 4,
    type: "error",
    message: "Failed to publish X (Twitter) post.",
    time: "Yesterday",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  success: <CheckCircle className="text-green-600" />,
  warning: <AlertTriangle className="text-yellow-600" />,
  info: <Bell className="text-blue-600" />,
  error: <AlertTriangle className="text-red-600" />,
};

export default function NotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Notifications</h1>

      <div className="space-y-4">
        {notifications.map((note) => (
          <div
            key={note.id}
            className="p-4 rounded-xl flex items-start gap-4 bg-white dark:bg-neutral-900 shadow"
          >
            <div className="text-xl">{iconMap[note.type]}</div>

            <div className="flex-1">
              <p className="font-medium">{note.message}</p>
              <p className="text-sm text-gray-500 mt-1">{note.time}</p>
            </div>

            <Clock className="text-gray-400 w-4 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
