"use client";

import { useState } from "react";
import { getMockScheduledPosts, ScheduledPost } from "@/lib/mockScheduledPosts";

const STATUS_STYLES: Record<ScheduledPost["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700",
  published: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
};

export default function CalendarPage() {
  const [posts] = useState<ScheduledPost[]>(getMockScheduledPosts());

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-800 mb-2">Calendar</h1>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500 text-sm">No scheduled posts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {post.platform} {post.account_name ? `· ${post.account_name}` : ""}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[post.status]}`}>
                  {post.status}
                </span>
              </div>
              <p className="text-sm text-gray-700">{post.content}</p>
              {post.media_urls.length > 0 && (
                <p className="text-xs text-muted-foreground">📎 {post.media_urls.join(", ")}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(post.scheduled_time).toLocaleString()}
                {post.ai_generated && " · AI-generated"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}