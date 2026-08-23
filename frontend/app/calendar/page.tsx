"use client";
import { useState, useEffect, useCallback } from "react";

type ScheduledPost = {
  id: string;
  platform: string;
  content: string;
  media_urls: string[] | null;
  scheduled_time: string;
  status: "pending" | "published" | "failed" | "cancelled";
  ai_generated: boolean;
  error_message?: string | null;
};

const STATUS_STYLES: Record<ScheduledPost["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700",
  published: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
  cancelled: "bg-gray-100 text-gray-500",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CalendarPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please log in to see your scheduled posts.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-800 mb-2">Calendar</h1>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500 text-sm">No scheduled posts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{post.platform}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[post.status]}`}>
                  {post.status}
                </span>
              </div>
              <p className="text-sm text-gray-700">{post.content}</p>
              {post.media_urls && post.media_urls.length > 0 && (
                <p className="text-xs text-muted-foreground">📎 {post.media_urls.join(", ")}</p>
              )}
              {post.error_message && (
                <p className="text-xs text-red-500">Error: {post.error_message}</p>
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