
       "use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/authContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PlatformConnection = {
  id: string;
  platform: string;
  account_name?: string;
};

export default function CreatePostPage() {
  const { token } = useAuth();

  const [content, setContent] = useState("");
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [submitting, setSubmitting] = useState<"publish" | "schedule" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/platform-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: PlatformConnection[] = await res.json();
        setConnections(data);
        if (data.length > 0) setSelectedConnectionId(data[0].id);
      }
    } catch {
      // silent — dropdown just stays empty
    }
  }, [token]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const buildPayload = (status: "pending", scheduledTimeIso: string) => {
    const selectedConn = connections.find((c) => c.id === selectedConnectionId);
    // NOTE: real media upload isn't wired yet — file name used as placeholder media_url
    return {
      platform: selectedConn?.platform || "",
      platform_connection_id: selectedConnectionId,
      content,
      media_urls: file ? [file.name] : [],
      scheduled_time: scheduledTimeIso,
      status,
      ai_generated: false,
    };
  };

  const submitPost = async (mode: "publish" | "schedule") => {
    setMessage(null);

    if (!content.trim()) {
      setMessage({ type: "error", text: "Content can't be empty." });
      return;
    }
    if (!selectedConnectionId) {
      setMessage({ type: "error", text: "Connect an account first." });
      return;
    }

    let scheduledTimeIso: string;
    if (mode === "publish") {
      scheduledTimeIso = new Date().toISOString();
    } else {
      if (!scheduleDate || !scheduleTime) {
        setMessage({ type: "error", text: "Pick a date and time to schedule." });
        return;
      }
      scheduledTimeIso = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }

    const payload = buildPayload("pending", scheduledTimeIso);

    setSubmitting(mode);
    try {
      const res = await fetch(`${API_BASE}/posts/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Backend not ready yet (${res.status})`);
      setMessage({
        type: "success",
        text: mode === "publish" ? "Post published!" : "Post scheduled!",
      });
      setContent("");
      setFile(null);
      setScheduleDate("");
      setScheduleTime("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit post.",
      });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create Post</h1>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Compose Post</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
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
            <label className="block text-sm mb-2">Write your content</label>
            <Textarea
              placeholder="Write something..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-32"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Upload media</label>
            <Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label className="block text-sm mb-2">Select Account</label>
            <select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-neutral-900"
            >
              {connections.length === 0 && <option value="">No connected accounts</option>}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Schedule Date</label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Schedule Time</label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => submitPost("publish")}
              disabled={submitting !== null}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting === "publish" ? "Publishing..." : "Publish Now"}
            </Button>
            <Button
              onClick={() => submitPost("schedule")}
              disabled={submitting !== null}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {submitting === "schedule" ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
