
// app/posts/schedule/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/authContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PlatformConnection = {
  id: string;
  platform: string;
  account_name?: string;
};

// Shape matches scheduled_posts table columns
type ScheduledPostPayload = {
  platform: string;
  platform_connection_id: string;
  content: string;
  media_urls: string[];
  scheduled_time: string; // ISO string
  status: "pending"; // new posts always start pending
  ai_generated: boolean;
};

export default function SchedulePostPage() {
  const { token } = useAuth();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [content, setContent] = useState("");
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/platform-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setConnections(await res.json());
    } catch {
      // silent — connections list just stays empty, dropdown shows nothing to pick
    }
  }, [token]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    setMessage(null);

    if (!content.trim()) {
      setMessage({ type: "error", text: "Post content can't be empty." });
      return;
    }
    if (!selectedConnectionId) {
      setMessage({ type: "error", text: "Select a platform to post to." });
      return;
    }
    if (!scheduledTime) {
      setMessage({ type: "error", text: "Pick a date and time to schedule."});
      return;
    }

    const selectedConn = connections.find((c) => c.id === selectedConnectionId);

    // NOTE: real media upload (e.g. to Supabase storage) isn't wired yet —
    // placeholder file names used as stand-in media_urls until upload endpoint exists
    const payload: ScheduledPostPayload = {
      platform: selectedConn?.platform || "",
      platform_connection_id: selectedConnectionId,
      content,
      media_urls: mediaFiles.map((f) => f.name),
      scheduled_time: new Date(scheduledTime).toISOString(),
      status: "pending",
      ai_generated: false,
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/posts/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      // expected to 404 until backend route exists — handled gracefully below
      if (!res.ok) throw new Error(`Backend not ready yet (${res.status})`);
      setMessage({ type: "success", text: "Post scheduled!" });
      setContent("");
      setSelectedConnectionId("");
      setScheduledTime("");
      setMediaFiles([]);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to schedule post.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl space-y-5">
      <h1 className="text-2xl font-semibold">Schedule a Post</h1>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Content</label>
        <textarea
          className="w-full mt-1 px-3 py-2 border rounded-md min-h-[120px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you want to post?"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Post to</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={selectedConnectionId}
          onChange={(e) => setSelectedConnectionId(e.target.value)}
        >
          <option value="">Select a connected account</option>
          {connections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.platform} {c.account_name ? `(${c.account_name})` : ""}
            </option>
          ))}
        </select>
        {connections.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            No connected accounts yet — connect one first.
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Media (optional)</label>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="w-full mt-1 text-sm"
        />
        {mediaFiles.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {mediaFiles.map((f) => f.name).join(", ")}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Schedule for</label>
        <input
          type="datetime-local"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-md font-medium transition"
      >
        {submitting ? "Scheduling..." : "Schedule Post"}
      </button>
    </div>
  );
}
